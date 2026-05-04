from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.models.user import User
from app.models.wordbook import Wordbook
from app.schemas.wordbook import WordbookCreate, WordbookResponse, WordbookUpdate
from app.utils.database import get_db


router = APIRouter()


def can_access_wordbook(book: Wordbook, current_user: User) -> bool:
    if book.owner_id == current_user.id:
        return True
    if book in current_user.subscribed_system_wordbooks:
        return True
    return False


def can_subscribe_wordbook(book: Wordbook, current_user: User) -> bool:
    if book.owner_id == current_user.id:
        return False
    return book.is_system or book.is_published


@router.get("/", response_model=list[WordbookResponse])
def list_wordbooks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    own_books = db.query(Wordbook).filter(Wordbook.owner_id == current_user.id).all()
    system_books = list(current_user.subscribed_system_wordbooks)

    merged = {book.id: book for book in [*own_books, *system_books]}
    return list(merged.values())


@router.get("/marketplace", response_model=list[WordbookResponse])
def list_marketplace_wordbooks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _ = current_user
    return (
        db.query(Wordbook)
        .filter(or_(Wordbook.is_system.is_(True), Wordbook.is_published.is_(True)))
        .all()
    )


@router.get("/system", response_model=list[WordbookResponse])
def list_system_wordbooks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _ = current_user
    return db.query(Wordbook).filter(Wordbook.is_system.is_(True)).all()


@router.post("/system/{wordbook_id}/subscribe", response_model=WordbookResponse)
def subscribe_system_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if not can_subscribe_wordbook(book, current_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="该词书不可下载")

    if book not in current_user.subscribed_system_wordbooks:
        current_user.subscribed_system_wordbooks.append(book)
        db.commit()
        db.refresh(book)

    return book


@router.post("/{wordbook_id}/subscribe", response_model=WordbookResponse)
def subscribe_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if not can_subscribe_wordbook(book, current_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="该词书不可下载")

    if book not in current_user.subscribed_system_wordbooks:
        current_user.subscribed_system_wordbooks.append(book)
        db.commit()
        db.refresh(book)

    return book


@router.delete("/system/{wordbook_id}/unsubscribe", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe_system_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if book in current_user.subscribed_system_wordbooks:
        current_user.subscribed_system_wordbooks.remove(book)
        db.commit()

    return None


@router.delete("/{wordbook_id}/unsubscribe", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if book in current_user.subscribed_system_wordbooks:
        current_user.subscribed_system_wordbooks.remove(book)
        db.commit()

    return None


@router.post("/{wordbook_id}/publish", response_model=WordbookResponse)
def publish_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id, Wordbook.owner_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if book.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="系统词书无需上传")

    book.is_published = True
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{wordbook_id}/publish", response_model=WordbookResponse)
def unpublish_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id, Wordbook.owner_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if book.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="系统词书无需下架")

    book.is_published = False
    db.commit()
    db.refresh(book)
    return book


@router.post("/", response_model=WordbookResponse, status_code=status.HTTP_201_CREATED)
def create_wordbook(
    payload: WordbookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = Wordbook(
        name=payload.name,
        description=payload.description,
        category=payload.category,
        owner_id=current_user.id,
        is_system=False,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("/{wordbook_id}", response_model=WordbookResponse)
def get_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if not can_access_wordbook(book, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission")

    return book


@router.put("/{wordbook_id}", response_model=WordbookResponse)
def update_wordbook(
    wordbook_id: int,
    payload: WordbookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id, Wordbook.owner_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    if payload.name is not None:
        book.name = payload.name
    if payload.description is not None:
        book.description = payload.description
    if payload.category is not None:
        book.category = payload.category

    db.commit()
    db.refresh(book)
    return book


@router.delete("/{wordbook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wordbook(
    wordbook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = db.query(Wordbook).filter(Wordbook.id == wordbook_id, Wordbook.owner_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wordbook not found")

    db.delete(book)
    db.commit()
    return None
