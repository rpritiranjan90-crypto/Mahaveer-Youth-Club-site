import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, distinct, func

from backend.app.core.database import get_db
from backend.app.models.update import Update
from backend.app.models.activity import Activity
from backend.app.models.gallery import GalleryItem
from backend.app.models.member import Member
from backend.app.models.site_asset import SiteAsset
from backend.app.schemas.content import (
    PaginatedResponse,
    UpdatePublicResponse,
    ActivityPublicResponse,
    GalleryItemPublicResponse,
    GalleryYearsResponse,
    GalleryCategoriesResponse,
    MemberPublicResponse,
)
from backend.app.schemas.asset import SiteAssetPublicResponse

router = APIRouter()


# =============================================================================
# 1. Public Updates Endpoints
# =============================================================================
@router.get(
    "/updates",
    response_model=PaginatedResponse[UpdatePublicResponse],
    summary="List Published Updates",
)
def get_public_updates(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, max_length=100, description="Search by title/excerpt"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[UpdatePublicResponse]:
    """
    Returns only published circulars and updates, ordered by newest published date.
    Draft and archived items are strictly excluded.
    """
    query = db.query(Update).filter(Update.status == "published")

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Update.title.ilike(search_pattern)) | (Update.excerpt.ilike(search_pattern))
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(Update.published_at), desc(Update.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[UpdatePublicResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/updates/{slug}",
    response_model=UpdatePublicResponse,
    summary="Get Published Update by Slug",
)
def get_public_update_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> UpdatePublicResponse:
    """
    Fetches a single published update by unique slug.
    Draft or archived updates return 404.
    """
    item = db.query(Update).filter(Update.slug == slug, Update.status == "published").first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found or not published.",
        )
    return UpdatePublicResponse.model_validate(item)


# =============================================================================
# 2. Public Activities Endpoints
# =============================================================================
@router.get(
    "/activities",
    response_model=PaginatedResponse[ActivityPublicResponse],
    summary="List Published Activities",
)
def get_public_activities(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, max_length=100, description="Filter by category"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ActivityPublicResponse]:
    """
    Returns only published welfare and club activities, ordered by date.
    Draft and archived items are strictly excluded.
    """
    query = db.query(Activity).filter(Activity.status == "published")

    if category and category.lower() != "all":
        query = query.filter(Activity.category.ilike(category.strip()))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(Activity.date), desc(Activity.published_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[ActivityPublicResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/activities/{slug}",
    response_model=ActivityPublicResponse,
    summary="Get Published Activity by Slug",
)
def get_public_activity_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> ActivityPublicResponse:
    """
    Fetches a single published activity by unique slug.
    Draft or archived activities return 404.
    """
    item = db.query(Activity).filter(Activity.slug == slug, Activity.status == "published").first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found or not published.",
        )
    return ActivityPublicResponse.model_validate(item)


# =============================================================================
# 3. Public Gallery Endpoints
# =============================================================================
@router.get(
    "/gallery",
    response_model=PaginatedResponse[GalleryItemPublicResponse],
    summary="List Published Gallery Photos",
)
def get_public_gallery(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    year: Optional[str] = Query(None, max_length=10, description="Filter by festival year"),
    category: Optional[str] = Query(None, max_length=100, description="Filter by category"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[GalleryItemPublicResponse]:
    """
    Returns published gallery photos filtered by dynamic year and category.
    Draft and archived photos are strictly excluded.
    """
    query = db.query(GalleryItem).filter(GalleryItem.status == "published")

    if year and year.lower() != "all":
        query = query.filter(GalleryItem.year == year.strip())

    if category and category.lower() != "all":
        query = query.filter(GalleryItem.category.ilike(category.strip()))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(GalleryItem.year), desc(GalleryItem.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[GalleryItemPublicResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/gallery/years",
    response_model=GalleryYearsResponse,
    summary="Get Available Gallery Years",
)
def get_gallery_years(db: Session = Depends(get_db)) -> GalleryYearsResponse:
    """
    Dynamically returns all distinct years present in published gallery items,
    sorted in descending order. Never hardcoded.
    """
    years = (
        db.query(distinct(GalleryItem.year))
        .filter(GalleryItem.status == "published")
        .order_by(desc(GalleryItem.year))
        .all()
    )
    year_list = [y[0] for y in years if y[0]]
    return GalleryYearsResponse(years=year_list)


@router.get(
    "/gallery/categories",
    response_model=GalleryCategoriesResponse,
    summary="Get Available Gallery Categories",
)
def get_gallery_categories(db: Session = Depends(get_db)) -> GalleryCategoriesResponse:
    """
    Dynamically returns all distinct categories present in published gallery items.
    """
    categories = (
        db.query(distinct(GalleryItem.category))
        .filter(GalleryItem.status == "published")
        .order_by(GalleryItem.category.asc())
        .all()
    )
    category_list = [c[0] for c in categories if c[0]]
    return GalleryCategoriesResponse(categories=category_list)


# =============================================================================
# 4. Public Members Roster Endpoint
# =============================================================================
@router.get(
    "/members",
    response_model=PaginatedResponse[MemberPublicResponse],
    summary="List Public Members",
)
def get_public_members(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=200, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[MemberPublicResponse]:
    """
    Returns active members sorted by display_order.
    PRIVACY ENFORCED: Exposes ONLY safe public profile fields (name, designation, optional bio, display_order, photo_url).
    Zero private contact details, emails, phones, addresses, internal storage paths, or audit records.
    """
    query = db.query(Member).filter(Member.is_active == True)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(Member.display_order.asc(), Member.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[MemberPublicResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# =============================================================================
# 5. Public Managed Assets Endpoints
# =============================================================================
@router.get(
    "/assets/logo",
    response_model=SiteAssetPublicResponse,
    summary="Get Active Official Logo",
)
def get_public_logo(db: Session = Depends(get_db)) -> SiteAssetPublicResponse:
    """
    Returns the currently active official club logo metadata.
    Returns 404 if no logo has been uploaded.
    """
    asset = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "LOGO", SiteAsset.is_active == True)
        .order_by(desc(SiteAsset.created_at))
        .first()
    )
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Official logo not found or not uploaded yet.",
        )
    return SiteAssetPublicResponse.model_validate(asset)


@router.get(
    "/assets/ganesh/current",
    response_model=SiteAssetPublicResponse,
    summary="Get Active Current-Year Ganesh Image",
)
def get_public_current_ganesh(db: Session = Depends(get_db)) -> SiteAssetPublicResponse:
    """
    Returns the currently active current-year Ganesh Puja image metadata.
    Returns 404 if no image has been uploaded for the current year.
    """
    asset = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "GANESH_CURRENT", SiteAsset.is_active == True)
        .order_by(desc(SiteAsset.created_at))
        .first()
    )
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current-year Ganesh image not found or not uploaded yet.",
        )
    return SiteAssetPublicResponse.model_validate(asset)

