from datetime import datetime

from pydantic import BaseModel, Field


class WordbookCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)


class WordbookUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)


class WordbookResponse(BaseModel):
    id: int
    name: str
    description: str | None
    category: str | None
    is_system: bool
    is_published: bool
    owner_id: int | None
    created_at: datetime | None

    class Config:
        from_attributes = True
