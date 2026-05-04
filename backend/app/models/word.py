from sqlalchemy import Column, DateTime, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.utils.database import Base


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(100), index=True, nullable=False)
    part_of_speech = Column(String(50), nullable=True)
    phonetic = Column(String(100), nullable=True)
    meaning = Column(Text, nullable=False)
    example = Column(Text, nullable=True)
    audio_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    wordbooks = relationship("Wordbook", secondary="wordbook_words", back_populates="words")
    progress_records = relationship("UserWordProgress", back_populates="word", cascade="all, delete-orphan")
    practice_records = relationship("PracticeRecord", back_populates="word", cascade="all, delete-orphan")
