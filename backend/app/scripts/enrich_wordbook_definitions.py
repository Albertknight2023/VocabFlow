import argparse
import time
from dataclasses import dataclass

from app.models.wordbook import Wordbook
from app.services.dictionary import DictionaryLookupError, lookup_english_word, translate_to_chinese
from app.utils.database import SessionLocal

PLACEHOLDER_MEANING = "高频英语词（公开词表导入）"
PLACEHOLDER_EXAMPLE = "common English word from a public frequency list"
FALLBACK_MEANING_PREFIX = "待补充释义："


@dataclass
class EnrichResult:
    book_name: str
    inspected: int
    updated: int
    skipped_ready: int
    failed: int
    fallback_used: int
    elapsed_seconds: float


def needs_enrich(word, meaning_only: bool, retry_fallback: bool) -> bool:
    meaning = (word.meaning or "").strip()
    example = (word.example or "").strip()

    if not meaning or meaning == PLACEHOLDER_MEANING:
        return True
    if retry_fallback and meaning.startswith(FALLBACK_MEANING_PREFIX):
        return True
    if meaning_only:
        return False
    if not example or example == PLACEHOLDER_EXAMPLE:
        return True
    return False


def enrich_wordbook(
    book_name: str,
    max_updates: int,
    offset: int,
    commit_every: int,
    sleep_ms: int,
    max_seconds: int,
    meaning_only: bool,
    retry_fallback: bool,
) -> EnrichResult:
    started_at = time.perf_counter()

    db = SessionLocal()
    try:
        book = db.query(Wordbook).filter(Wordbook.is_system.is_(True), Wordbook.name == book_name).first()
        if not book:
            raise ValueError(f"System wordbook not found: {book_name}")

        # Stable order for resumable chunk processing.
        words = sorted(book.words, key=lambda item: item.id)
        pending = [word for word in words if needs_enrich(word, meaning_only, retry_fallback)]

        if offset > 0:
            pending = pending[offset:]

        inspected = 0
        updated = 0
        skipped_ready = 0
        failed = 0
        fallback_used = 0

        for word in pending:
            if updated >= max_updates:
                break

            if max_seconds > 0 and (time.perf_counter() - started_at) >= max_seconds:
                break

            inspected += 1

            if not needs_enrich(word, meaning_only, retry_fallback):
                skipped_ready += 1
                continue

            if meaning_only:
                try:
                    translated = translate_to_chinese(word.text)
                except DictionaryLookupError:
                    translated = f"待补充释义：{word.text}"
                    failed += 1

                word.meaning = translated
                updated += 1
                fallback_used += 1

                if updated % commit_every == 0:
                    db.commit()
                    print({"book": book.name, "progress": updated, "failed": failed})

                if sleep_ms > 0:
                    time.sleep(sleep_ms / 1000)

                continue

            try:
                entry = lookup_english_word(word.text)
            except DictionaryLookupError:
                try:
                    translated = translate_to_chinese(word.text)
                except DictionaryLookupError:
                    translated = f"待补充释义：{word.text}"
                    failed += 1

                word.meaning = translated
                if not word.example or word.example == PLACEHOLDER_EXAMPLE:
                    word.example = f"auto-generated meaning for {word.text}"
                updated += 1
                fallback_used += 1

                if updated % commit_every == 0:
                    db.commit()
                    print({"book": book.name, "progress": updated, "failed": failed})

                if sleep_ms > 0:
                    time.sleep(sleep_ms / 1000)

                continue

            word.meaning = entry.meaning or word.meaning
            if entry.english_definition:
                word.example = entry.english_definition
            if entry.part_of_speech and not word.part_of_speech:
                word.part_of_speech = entry.part_of_speech
            if entry.phonetic and not word.phonetic:
                word.phonetic = entry.phonetic

            updated += 1

            if updated % commit_every == 0:
                db.commit()
                print({"book": book.name, "progress": updated, "failed": failed})

            if sleep_ms > 0:
                time.sleep(sleep_ms / 1000)

        db.commit()

        elapsed = time.perf_counter() - started_at
        return EnrichResult(
            book_name=book.name,
            inspected=inspected,
            updated=updated,
            skipped_ready=skipped_ready,
            failed=failed,
            fallback_used=fallback_used,
            elapsed_seconds=round(elapsed, 2),
        )
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Enrich system wordbook entries with dictionary definitions")
    parser.add_argument("--book", required=True, help="Target system wordbook name")
    parser.add_argument("--max-updates", type=int, default=400, help="Maximum number of words to enrich")
    parser.add_argument("--offset", type=int, default=0, help="Skip N pending entries before processing")
    parser.add_argument("--commit-every", type=int, default=20, help="Commit frequency for partial progress safety")
    parser.add_argument("--sleep-ms", type=int, default=0, help="Delay between requests in milliseconds")
    parser.add_argument("--max-seconds", type=int, default=120, help="Max runtime seconds for one batch")
    parser.add_argument("--rounds", type=int, default=1, help="How many rounds to run in one command")
    parser.add_argument("--meaning-only", action="store_true", help="Only fill Chinese meanings")
    parser.add_argument("--retry-fallback", action="store_true", help="Retry entries with fallback Chinese meanings")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    total_updated = 0
    total_failed = 0
    rounds = max(1, args.rounds)
    for current_round in range(1, rounds + 1):
        result = enrich_wordbook(
            book_name=args.book,
            max_updates=max(1, args.max_updates),
            offset=max(0, args.offset),
            commit_every=max(1, args.commit_every),
            sleep_ms=max(0, args.sleep_ms),
            max_seconds=max(0, args.max_seconds),
            meaning_only=args.meaning_only,
            retry_fallback=args.retry_fallback,
        )
        total_updated += result.updated
        total_failed += result.failed
        print(
            {
                "book": result.book_name,
                "round": current_round,
                "inspected": result.inspected,
                "updated": result.updated,
                "skipped_ready": result.skipped_ready,
                "failed": result.failed,
                "fallback_used": result.fallback_used,
                "elapsed_seconds": result.elapsed_seconds,
            }
        )

        if result.updated == 0:
            break

    print({"book": args.book, "total_updated": total_updated, "total_failed": total_failed, "rounds": rounds})


if __name__ == "__main__":
    main()
