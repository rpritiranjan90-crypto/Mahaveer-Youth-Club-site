import re
import unicodedata
from typing import Optional, Type
from sqlalchemy.orm import Session
from sqlalchemy import select


def slugify(text: str) -> str:
    """
    Normalizes string, removes non-alphanumeric characters,
    and converts spaces/underscores to hyphens.
    """
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "item"


def generate_unique_slug(
    db: Session,
    model_class: Type,
    base_title: str,
    current_id: Optional[int] = None,
) -> str:
    """
    Generates a unique slug for a given SQLAlchemy model.
    If the slug already exists on a different row, appends a counter (-2, -3, etc.).
    """
    base_slug = slugify(base_title)
    candidate_slug = base_slug
    counter = 1

    while True:
        query = db.query(model_class).filter(model_class.slug == candidate_slug)
        if current_id is not None:
            query = query.filter(model_class.id != current_id)
        
        exists = query.first()
        if not exists:
            return candidate_slug
        
        counter += 1
        candidate_slug = f"{base_slug}-{counter}"
