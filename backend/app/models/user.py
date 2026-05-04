from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.utils.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    wordbooks = relationship("Wordbook", back_populates="owner", cascade="all, delete-orphan")
    subscribed_system_wordbooks = relationship(
        "Wordbook",
        secondary="user_system_wordbooks",
        back_populates="subscribers",
    )
    progress_records = relationship("UserWordProgress", back_populates="user", cascade="all, delete-orphan")
    practice_records = relationship("PracticeRecord", back_populates="user", cascade="all, delete-orphan")
