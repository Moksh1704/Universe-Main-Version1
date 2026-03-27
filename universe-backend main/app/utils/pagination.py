from typing import TypeVar, Generic, List, Type
from pydantic import BaseModel
from sqlalchemy.orm import Query

T = TypeVar("T")


def paginate(query: Query, page: int, page_size: int):
    """Apply pagination to a SQLAlchemy query and return items + total."""
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def paginated_response(items: list, total: int, page: int, page_size: int) -> dict:
    """Build a standardized paginated response dict."""
    import math
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": math.ceil(total / page_size) if total > 0 else 0,
    }
