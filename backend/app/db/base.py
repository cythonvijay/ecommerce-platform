"""Declarative base shared by every model module. Kept free of model
imports to avoid circular imports (models import Base from here). See
app/db/all_models.py for the metadata-registration import hub."""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
