from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from app.config import settings
from app.data.system_wordbooks import SYSTEM_WORDBOOK_PRESETS
from app.models import user, word, wordbook, progress  # noqa: F401
from app.models.word import Word
from app.models.wordbook import Wordbook
from app.routes import auth, users, wordbooks, words, learning
from app.utils.database import Base, SessionLocal, engine


app = FastAPI(title=settings.app_name)


def ensure_word_columns() -> None:
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("words")}
    if "part_of_speech" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE words ADD COLUMN part_of_speech VARCHAR(50)"))


def ensure_wordbook_columns() -> None:
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("wordbooks")}
    if "is_published" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE wordbooks ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE"))


def seed_system_wordbooks(db: Session) -> None:
    for preset in SYSTEM_WORDBOOK_PRESETS:
        book = (
            db.query(Wordbook)
            .filter(Wordbook.is_system.is_(True), Wordbook.name == preset["name"])
            .first()
        )

        if not book:
            book = Wordbook(
                name=preset["name"],
                category=preset.get("category"),
                description=preset.get("description"),
                is_system=True,
                owner_id=None,
            )
            db.add(book)
            db.flush()
        else:
            book.category = preset.get("category")
            book.description = preset.get("description")

        existing_words = {w.text.strip().lower(): w for w in book.words}

        for item in preset.get("words", []):
            normalized_text = item["text"].strip()
            key = normalized_text.lower()
            if key in existing_words:
                continue

            word_record = (
                db.query(Word)
                .filter(func.lower(Word.text) == key)
                .first()
            )

            if not word_record:
                word_record = Word(
                    text=normalized_text,
                    part_of_speech=item.get("part_of_speech"),
                    phonetic=item.get("phonetic"),
                    meaning=item.get("meaning") or "",
                    example=item.get("example"),
                    audio_url=None,
                    image_url=None,
                )
                db.add(word_record)
                db.flush()
            else:
                if not word_record.part_of_speech and item.get("part_of_speech"):
                    word_record.part_of_speech = item.get("part_of_speech")
                if not word_record.phonetic and item.get("phonetic"):
                    word_record.phonetic = item.get("phonetic")
                if not word_record.example and item.get("example"):
                    word_record.example = item.get("example")

            book.words.append(word_record)
            existing_words[key] = word_record

    legacy_mappings = {
        "CET4 核心词汇": "CET4 基础大纲词",
        "CET6 核心词汇": "CET6 基础大纲词",
    }

    for legacy_name, source_name in legacy_mappings.items():
        legacy_book = (
            db.query(Wordbook)
            .filter(Wordbook.is_system.is_(True), Wordbook.name == legacy_name)
            .first()
        )
        source_book = (
            db.query(Wordbook)
            .filter(Wordbook.is_system.is_(True), Wordbook.name == source_name)
            .first()
        )

        if not legacy_book or not source_book:
            continue

        legacy_keys = {w.text.strip().lower() for w in legacy_book.words}
        for source_word in source_book.words:
            key = source_word.text.strip().lower()
            if key in legacy_keys:
                continue
            legacy_book.words.append(source_word)
            legacy_keys.add(key)

    db.commit()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_word_columns()
    ensure_wordbook_columns()
    db = SessionLocal()
    try:
        seed_system_wordbooks(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(wordbooks.router, prefix="/api/wordbooks", tags=["Wordbooks"])
app.include_router(words.router, prefix="/api/words", tags=["Words"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])
