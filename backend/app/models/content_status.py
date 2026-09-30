from enum import Enum


class ContentStatus(str, Enum):
    """
    Standard content lifecycle status for publishable entities.
    Enforces consistent draft -> publish -> archive workflow.
    """
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
