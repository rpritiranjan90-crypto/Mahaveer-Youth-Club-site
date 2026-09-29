from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.club import ClubSettings
from backend.app.models.update import Update
from backend.app.models.gallery import Gallery
from backend.app.models.activity import Activity
from backend.app.models.history import History
from backend.app.models.donation import DonationSetting

from backend.app.schemas.club import ClubSettingsResponse
from backend.app.schemas.update import UpdateResponse
from backend.app.schemas.gallery import GalleryResponse
from backend.app.schemas.activity import ActivityResponse
from backend.app.schemas.history import HistoryResponse
from backend.app.schemas.donation import DonationSettingResponse

router = APIRouter()


@router.get("/club", response_model=ClubSettingsResponse, summary="Get Public Club Info")
def get_public_club_info(db: Session = Depends(get_db)) -> ClubSettings:
    """
    Returns public club information and contact details.
    """
    club = db.query(ClubSettings).first()
    if not club:
        # Create initial default if not exists
        club = ClubSettings(
            name="Mahaveer Youth Club",
            tagline="Celebrating Faith, Tradition & Community",
            description="A community-driven non-profit youth organization established in 1998.",
            location="Mahaveer Youth Club Ground, Ward No. 12",
            address="Main Pandal Ground, Near Community Hall, Ward No. 12",
            landmark="Near Community Hall",
            phone="+91 XXXXX XXXXX",
            email="contact@mahaveeryouthclub.org",
            registration_number="MYC/SOC/1998/412",
            instagram_url="https://instagram.com/mahaveeryouthclub",
            facebook_url="https://facebook.com/mahaveeryouthclub",
            youtube_url="https://youtube.com/@mahaveeryouthclub",
        )
        db.add(club)
        db.commit()
        db.refresh(club)
    return club


@router.get("/updates", response_model=List[UpdateResponse], summary="List Published Updates")
def get_public_updates(
    category: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
) -> List[Update]:
    """
    Returns published announcements and notices.
    """
    query = db.query(Update).filter(Update.published == True)
    if category and category.lower() != "all":
        query = query.filter(Update.category.ilike(f"%{category}%"))
    return query.order_by(Update.published_at.desc(), Update.id.desc()).limit(limit).all()


@router.get("/updates/{slug}", response_model=UpdateResponse, summary="Get Published Update by Slug")
def get_public_update_by_slug(slug: str, db: Session = Depends(get_db)) -> Update:
    """
    Returns single published announcement by slug.
    """
    update = db.query(Update).filter(Update.slug == slug, Update.published == True).first()
    if not update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found.",
        )
    return update


@router.get("/gallery", response_model=List[GalleryResponse], summary="List Published Gallery Photos")
def get_public_gallery(
    category: Optional[str] = None,
    year: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Gallery]:
    """
    Returns published gallery photos sorted by sort order and creation time.
    """
    query = db.query(Gallery).filter(Gallery.published == True)
    if category and category.lower() != "all":
        query = query.filter(Gallery.category.ilike(f"%{category}%"))
    if year and year.lower() != "all":
        query = query.filter(Gallery.year == year)
    return query.order_by(Gallery.sort_order.asc(), Gallery.created_at.desc()).all()


@router.get("/activities", response_model=List[ActivityResponse], summary="List Published Activities")
def get_public_activities(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Activity]:
    """
    Returns published festival rituals, welfare events, and sports activities.
    """
    query = db.query(Activity).filter(Activity.published == True)
    if category and category.lower() != "all":
        query = query.filter(Activity.category.ilike(f"%{category}%"))
    return query.order_by(Activity.id.asc()).all()


@router.get("/history", response_model=List[HistoryResponse], summary="List Published History Timeline")
def get_public_history(db: Session = Depends(get_db)) -> List[History]:
    """
    Returns published club history milestones in chronological order.
    """
    return (
        db.query(History)
        .filter(History.published == True)
        .order_by(History.sort_order.asc(), History.year.asc())
        .all()
    )


@router.get("/donation", response_model=DonationSettingResponse, summary="Get Public Donation Info")
def get_public_donation_info(db: Session = Depends(get_db)) -> DonationSetting:
    """
    Returns public donation settings (official club name, UPI ID, suggested amounts).
    """
    setting = db.query(DonationSetting).first()
    if not setting:
        setting = DonationSetting(
            club_name="Mahaveer Youth Club",
            upi_id="mahaveeryouthclub@upi",
            description="Your voluntary contribution directly powers our daily Maha Bhog, Vedic pandal construction, and annual blood donation camps.",
            suggested_amounts="101,501,1001,2001",
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting
