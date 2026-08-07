"""Generic repository pattern: base CRUD operations shared by every module's
repository so services never touch the ORM Session directly for basic ops."""
from typing import Generic, TypeVar, Type, Optional, List, Sequence

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def get(self, id_: int) -> Optional[ModelType]:
        return self.db.get(self.model, id_)

    def list(self, skip: int = 0, limit: int = 20) -> Sequence[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        return self.db.execute(stmt).scalars().all()

    def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        return self.db.execute(stmt).scalar_one()

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelType, data: dict) -> ModelType:
        for key, value in data.items():
            if value is not None:
                setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.commit()
