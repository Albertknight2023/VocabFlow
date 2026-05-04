from datetime import datetime

from pydantic import BaseModel, Field


class WordCreate(BaseModel):
    text: str = Field(min_length=1, max_length=100)
    part_of_speech: str | None = Field(default=None, max_length=50)
    phonetic: str | None = Field(default=None, max_length=100)
    meaning: str | None = None
    english_definition: str | None = None


class WordUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=100)
    part_of_speech: str | None = Field(default=None, max_length=50)
    phonetic: str | None = Field(default=None, max_length=100)
    meaning: str | None = None
    example: str | None = None
    audio_url: str | None = None
    image_url: str | None = None


class WordResponse(BaseModel):
    id: int
    text: str
    part_of_speech: str | None
    phonetic: str | None
    meaning: str
    example: str | None
    audio_url: str | None
    image_url: str | None
    created_at: datetime | None

    class Config:
        from_attributes = True


class WordPreviewResponse(BaseModel):
    text: str
    phonetic: str | None
    part_of_speech: str | None
    meaning: str
    english_definition: str
