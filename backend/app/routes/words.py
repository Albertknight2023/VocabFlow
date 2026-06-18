from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.models.user import User
from app.models.word import Word
from app.models.wordbook import Wordbook
from app.schemas.word import WordCreate, WordPreviewResponse, WordResponse, WordUpdate
from app.services.dictionary import DictionaryLookupError, lookup_english_word
from app.utils.database import get_db


router = APIRouter()


def contains_chinese(text: str | None) -> bool:
    if not text:
        return False
    return any("\u4e00" <= ch <= "\u9fff" for ch in text)


def normalize_word_for_cn_with_status(word: Word) -> str:
    """Backfill old records: move English definition to example and put Chinese translation into meaning.

    Returns: updated | skipped | failed
    """
    if contains_chinese(word.meaning):
        return "skipped"

    try:
        entry = lookup_english_word(word.text)
    except DictionaryLookupError:
        return "failed"

    if not entry.meaning:
        return "failed"

    old_meaning = word.meaning
    word.meaning = entry.meaning
    if not word.example:
        word.example = entry.english_definition or old_meaning
    if not word.part_of_speech and entry.part_of_speech:
        word.part_of_speech = entry.part_of_speech
    return "updated"


def normalize_word_for_cn(word: Word) -> bool:
    return normalize_word_for_cn_with_status(word) == "updated"


def ensure_accessible_wordbook(wordbook_id: int, db: Session, current_user: User) -> Wordbook:
    wordbook = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not wordbook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if wordbook.owner_id != current_user.id and wordbook not in current_user.subscribed_system_wordbooks:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission")

    return wordbook


@router.get("/wordbook/{wordbook_id}", response_model=list[WordResponse])
def list_words(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wordbook = ensure_accessible_wordbook(wordbook_id, db, current_user)
    return wordbook.words


@router.post("/migrate-cn")
def migrate_words_to_chinese(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    own_books = [book for book in current_user.wordbooks if not book.is_system]
    words_by_id: dict[int, Word] = {}
    for book in own_books:
        for word in book.words:
            words_by_id[word.id] = word

    stats = {
        "total": len(words_by_id),
        "updated": 0,
        "skipped": 0,
        "failed": 0,
    }

    for word in words_by_id.values():
        result = normalize_word_for_cn_with_status(word)
        stats[result] += 1

    if stats["updated"] > 0:
        db.commit()

    return {
        "message": "Migration finished",
        **stats,
    }


@router.api_route("/preview", methods=["GET", "POST"], response_model=WordPreviewResponse)
def preview_word(
    text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ = db
    _ = current_user

    try:
        entry = lookup_english_word(text)
    except DictionaryLookupError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return WordPreviewResponse(
        text=entry.text,
        phonetic=entry.phonetic,
        part_of_speech=entry.part_of_speech,
        meaning=entry.meaning,
        english_definition=entry.english_definition,
    )


@router.post("/wordbook/{wordbook_id}", response_model=WordResponse, status_code=status.HTTP_201_CREATED)
def create_word(
    wordbook_id: int,
    payload: WordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wordbook = ensure_accessible_wordbook(wordbook_id, db, current_user)
    if wordbook.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify system wordbook")

    normalized_text = payload.text.strip()
    if not normalized_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="单词不能为空")

    existing_in_book = (
        db.query(Word)
        .join(Word.wordbooks)
        .filter(
            Wordbook.id == wordbook.id,
            func.lower(Word.text) == normalized_text.lower(),
        )
        .first()
    )
    if existing_in_book:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="该单词已存在于当前词书")

    entry = None
    if not payload.meaning or not payload.english_definition:
        try:
            entry = lookup_english_word(normalized_text)
        except DictionaryLookupError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    meaning = payload.meaning or (entry.meaning if entry else None)
    english_definition = payload.english_definition or (entry.english_definition if entry else None)
    part_of_speech = payload.part_of_speech or (entry.part_of_speech if entry else None)
    phonetic = payload.phonetic or (entry.phonetic if entry else None)

    if not meaning or not english_definition:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="单词信息不完整，请先联网补全")

    reusable_word = (
        db.query(Word)
        .filter(func.lower(Word.text) == normalized_text.lower())
        .first()
    )

    if reusable_word:
        if not reusable_word.part_of_speech and part_of_speech:
            reusable_word.part_of_speech = part_of_speech
        if not reusable_word.phonetic and phonetic:
            reusable_word.phonetic = phonetic
        if not contains_chinese(reusable_word.meaning):
            reusable_word.meaning = meaning
        if not reusable_word.example and english_definition:
            reusable_word.example = english_definition

        wordbook.words.append(reusable_word)
        db.commit()
        db.refresh(reusable_word)
        return reusable_word

    word = Word(
        text=normalized_text,
        part_of_speech=part_of_speech,
        phonetic=phonetic,
        meaning=meaning,
        example=english_definition,
        audio_url=None,
        image_url=None,
    )
    db.add(word)
    db.flush()

    wordbook.words.append(word)
    db.commit()
    db.refresh(word)
    return word


@router.put("/{word_id}", response_model=WordResponse)
def update_word(
    word_id: int,
    payload: WordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")

    user_has_word = any((book.owner_id == current_user.id and not book.is_system) for book in word.wordbooks)
    if not user_has_word:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(word, key, value)

    db.commit()
    db.refresh(word)
    return word


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")

    editable_books = [book for book in word.wordbooks if book.owner_id == current_user.id and not book.is_system]
    if not editable_books:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission")

    for book in editable_books:
        book.words.remove(word)

    if not word.wordbooks:
        db.delete(word)

    db.commit()
    return None
