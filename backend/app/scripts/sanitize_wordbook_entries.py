import argparse
import re
from dataclasses import dataclass

from app.models.word import Word
from app.models.wordbook import Wordbook
from app.utils.database import SessionLocal

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
class SanitizeResult:
    book_name: str
    total_words: int
    removed_links: int
    deleted_word_records: int
    sampled_removed: list[str]


def is_valid_book_word(token: str) -> bool:
    word = token.strip().lower()
    if not word:
        return False
    if word in NOISE_WORD_BLACKLIST:
        return False
    if not WORD_RE.fullmatch(word):
        return False

    if len(word) <= 2:
        return word in SHORT_WORD_ALLOWLIST

    if len(word) <= 4 and not any(ch in "aeiouy" for ch in word):
        return False

    return True


def sanitize_wordbook(book_name: str, dry_run: bool) -> SanitizeResult:
    db = SessionLocal()
    try:
        book = db.query(Wordbook).filter(Wordbook.name == book_name, Wordbook.is_system.is_(True)).first()
        if not book:
            raise ValueError(f"System wordbook not found: {book_name}")

        total = len(book.words)
        to_remove = [word for word in book.words if not is_valid_book_word(word.text)]
        sampled = [word.text for word in to_remove[:20]]

        deleted_records = 0
        if not dry_run:
            for word in to_remove:
                book.words.remove(word)
                if not word.wordbooks:
                    db.delete(word)
                    deleted_records += 1
            db.commit()

        return SanitizeResult(
            book_name=book.name,
            total_words=total,
            removed_links=len(to_remove),
            deleted_word_records=deleted_records,
            sampled_removed=sampled,
        )
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sanitize suspicious entries in a system wordbook")
    parser.add_argument("--book", required=True, help="Target system wordbook name")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not write DB")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = sanitize_wordbook(args.book, args.dry_run)
    print(
        {
            "book": result.book_name,
            "total_words": result.total_words,
            "removed_links": result.removed_links,
            "deleted_word_records": result.deleted_word_records,
            "sampled_removed": result.sampled_removed,
            "dry_run": args.dry_run,
        }
    )


if __name__ == "__main__":
    main()
