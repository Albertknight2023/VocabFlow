import argparse
import math
import re
from dataclasses import dataclass

import requests
from sqlalchemy import func

from app.models.word import Word
from app.models.wordbook import Wordbook
from app.utils.database import SessionLocal


PUBLIC_WORD_SOURCES = {
    "google-10000": "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt",
}

SHORT_WORD_ALLOWLIST = {
    "a",
    "am",
    "an",
    "as",
    "at",
    "be",
    "by",
    "do",
    "go",
    "he",
    "if",
    "in",
    "is",
    "it",
    "me",
    "my",
    "no",
    "of",
    "on",
    "or",
    "so",
    "to",
    "up",
    "us",
    "we",
}

NOISE_WORD_BLACKLIST = {
    "nj",
    "hr",
    "jr",
    "sr",
    "etc",
    "eg",
    "ie",
}

WORD_RE = re.compile(r"^[a-z][a-z\-']*$")


@dataclass
class ExpandResult:
    book_name: str
    before_count: int
    after_count: int
    inserted: int
    skipped_existing: int
    skipped_invalid: int
    batches: int


def load_words_from_source(source: str) -> list[str]:
    url = PUBLIC_WORD_SOURCES.get(source, source)
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    words: list[str] = []
    seen: set[str] = set()
    for raw in response.text.splitlines():
        word = raw.strip().lower()
        if not word:
            continue
        if not word.replace("-", "").isalpha():
            continue
        if word in seen:
            continue
        seen.add(word)
        words.append(word)

    return words


def is_candidate_word(token: str) -> bool:
    word = token.strip().lower()
    if not word:
        return False
    if word in NOISE_WORD_BLACKLIST:
        return False
    if not WORD_RE.fullmatch(word):
        return False

    if len(word) <= 2:
        return word in SHORT_WORD_ALLOWLIST

    # Filter short all-consonant abbreviations (e.g. nj, hr, ppl-like noise).
    if len(word) <= 4 and not any(ch in "aeiouy" for ch in word):
        return False

    return True


def ensure_wordbook(db, book_name: str, category: str) -> Wordbook:
    book = db.query(Wordbook).filter(Wordbook.is_system.is_(True), Wordbook.name == book_name).first()
    if book:
        return book

    book = Wordbook(
        name=book_name,
        category=category,
        description="公开词频词表扩容导入",
        is_system=True,
        owner_id=None,
    )
    db.add(book)
    db.flush()
    return book


def expand_book(
    db,
    book_name: str,
    category: str,
    words: list[str],
    target_count: int,
    batch_size: int,
    start_index: int,
) -> ExpandResult:
    book = ensure_wordbook(db, book_name, category)
    existing_keys = {w.text.strip().lower() for w in book.words}

    before_count = len(existing_keys)
    if before_count >= target_count:
        return ExpandResult(
            book_name=book_name,
            before_count=before_count,
            after_count=before_count,
            inserted=0,
            skipped_existing=0,
            skipped_invalid=0,
            batches=0,
        )

    need = target_count - before_count
    inserted = 0
    skipped_existing = 0
    skipped_invalid = 0

    candidates = words[start_index:]
    for token in candidates:
        if inserted >= need:
            break

        key = token.strip().lower()
        if not is_candidate_word(key):
            skipped_invalid += 1
            continue

        if key in existing_keys:
            skipped_existing += 1
            continue

        word_record = db.query(Word).filter(func.lower(Word.text) == key).first()
        if not word_record:
            word_record = Word(
                text=key,
                part_of_speech=None,
                phonetic=None,
                meaning="高频英语词（公开词表导入）",
                example="common English word from a public frequency list",
                audio_url=None,
                image_url=None,
            )
            db.add(word_record)
            db.flush()
        else:
            if not word_record.meaning:
                word_record.meaning = "高频英语词（公开词表导入）"
            if not word_record.example:
                word_record.example = "common English word from a public frequency list"

        book.words.append(word_record)
        existing_keys.add(key)
        inserted += 1

    db.commit()

    batches = int(math.ceil(inserted / batch_size)) if inserted > 0 else 0
    return ExpandResult(
        book_name=book_name,
        before_count=before_count,
        after_count=len(existing_keys),
        inserted=inserted,
        skipped_existing=skipped_existing,
        skipped_invalid=skipped_invalid,
        batches=batches,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Expand system wordbooks from a public word list")
    parser.add_argument("--book", required=True, help="Target system wordbook name")
    parser.add_argument("--category", default="Frequency", help="Target wordbook category")
    parser.add_argument("--source", default="google-10000", help="Built-in source key or URL")
    parser.add_argument("--target-count", type=int, default=2000, help="Target word count in the wordbook")
    parser.add_argument("--batch-size", type=int, default=400, help="Logical batch size used for reporting")
    parser.add_argument("--start-index", type=int, default=0, help="Start index in source word list")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    words = load_words_from_source(args.source)

    db = SessionLocal()
    try:
        result = expand_book(
            db=db,
            book_name=args.book,
            category=args.category,
            words=words,
            target_count=args.target_count,
            batch_size=args.batch_size,
            start_index=max(args.start_index, 0),
        )
    finally:
        db.close()

    print(
        {
            "book": result.book_name,
            "before_count": result.before_count,
            "after_count": result.after_count,
            "inserted": result.inserted,
            "batch_size": args.batch_size,
            "batches": result.batches,
            "skipped_existing": result.skipped_existing,
            "skipped_invalid": result.skipped_invalid,
            "source": args.source,
            "start_index": args.start_index,
        }
    )


if __name__ == "__main__":
    main()
