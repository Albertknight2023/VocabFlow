from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, func
from sqlalchemy.orm import relationship

from app.utils.database import Base


wordbook_words = Table(
    "wordbook_words",
    Base.metadata,
    Column("wordbook_id", Integer, ForeignKey("wordbooks.id", ondelete="CASCADE"), primary_key=True),
    Column("word_id", Integer, ForeignKey("words.id", ondelete="CASCADE"), primary_key=True),
)


user_system_wordbooks = Table(
    "user_system_wordbooks",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("wordbook_id", Integer, ForeignKey("wordbooks.id", ondelete="CASCADE"), primary_key=True),
)


class Wordbook(Base):
    __tablename__ = "wordbooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    is_system = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="wordbooks")
    words = relationship("Word", secondary=wordbook_words, back_populates="wordbooks")
    subscribers = relationship("User", secondary=user_system_wordbooks, back_populates="subscribed_system_wordbooks")
