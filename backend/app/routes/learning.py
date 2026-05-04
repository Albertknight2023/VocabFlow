from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.models.progress import PracticeRecord, UserWordProgress
from app.models.user import User
from app.models.word import Word
from app.models.wordbook import Wordbook
from app.schemas.learning import ProgressRecordIn, SpellingCheckIn, SpellingCheckOut
from app.schemas.word import WordResponse
from app.utils.database import get_db


router = APIRouter()


def ensure_accessible_wordbook(wordbook_id: int, db: Session, current_user: User) -> Wordbook:
    wordbook = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not wordbook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if wordbook.owner_id != current_user.id and wordbook not in current_user.subscribed_system_wordbooks:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission")

    return wordbook


@router.get("/cards/{wordbook_id}", response_model=list[WordResponse])
def get_cards(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wordbook = ensure_accessible_wordbook(wordbook_id, db, current_user)
    return wordbook.words


@router.get("/review-queue/{wordbook_id}", response_model=list[WordResponse])
def get_review_queue(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wordbook = ensure_accessible_wordbook(wordbook_id, db, current_user)
    now = datetime.now(timezone.utc)
    due_words: list[Word] = []

    for word in wordbook.words:
        progress = (
            db.query(UserWordProgress)
            .filter(UserWordProgress.user_id == current_user.id, UserWordProgress.word_id == word.id)
            .first()
        )
        if not progress or not progress.next_review_at or progress.next_review_at <= now:
            due_words.append(word)

    return due_words


@router.post("/record-progress")
def record_progress(
    payload: ProgressRecordIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word = db.query(Word).filter(Word.id == payload.word_id).first()
    if not word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")

    progress = (
        db.query(UserWordProgress)
        .filter(UserWordProgress.user_id == current_user.id, UserWordProgress.word_id == payload.word_id)
        .first()
    )
    if not progress:
        progress = UserWordProgress(
            user_id=current_user.id,
            word_id=payload.word_id,
            status="new",
            review_count=0,
            correct_count=0,
            wrong_count=0,
        )
        db.add(progress)

    # Defensive normalization: existing rows from older migrations may have NULL counters.
    progress.review_count = progress.review_count or 0
    progress.correct_count = progress.correct_count or 0
    progress.wrong_count = progress.wrong_count or 0

    progress.status = payload.status
    progress.review_count += 1
    progress.last_reviewed_at = datetime.now(timezone.utc)

    if payload.is_correct:
        progress.correct_count += 1
    else:
        progress.wrong_count += 1

    # 简化版间隔复习逻辑: 正确越多间隔越久
    interval_days = min(max(progress.correct_count, 1), 7)
    progress.next_review_at = datetime.now(timezone.utc) + timedelta(days=interval_days)

    db.commit()
    db.refresh(progress)
    return {"message": "Progress recorded", "next_review_at": progress.next_review_at}


@router.post("/spelling-check", response_model=SpellingCheckOut)
def spelling_check(
    payload: SpellingCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word = db.query(Word).filter(Word.id == payload.word_id).first()
    if not word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")

    expected = word.text.strip().lower()
    got = payload.input_text.strip().lower()
    correct = expected == got

    record = PracticeRecord(
        user_id=current_user.id,
        word_id=word.id,
        input_text=payload.input_text,
        is_correct=1 if correct else 0,
        practice_type="spelling",
    )
    db.add(record)
    db.commit()

    return SpellingCheckOut(correct=correct, expected=word.text, input_text=payload.input_text)
