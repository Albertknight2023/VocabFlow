from pydantic import BaseModel, Field


class ProgressRecordIn(BaseModel):
    word_id: int
    status: str = Field(pattern="^(mastered|reviewing|new)$")
    is_correct: bool = True


class SpellingCheckIn(BaseModel):
    word_id: int
    input_text: str


class SpellingCheckOut(BaseModel):
    correct: bool
    expected: str
    input_text: str
