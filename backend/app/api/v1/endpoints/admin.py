import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_admin
from backend.app.models.user import User
from backend.app.models.club import ClubSettings
from backend.app.models.update import Update
from backend.app.models.gallery import Gallery
from backend.app.models.activity import Activity
from backend.app.models.history import History
from backend.app.models.donation import DonationSetting
from backend.app.services.storage import storage_service

from backend.app.schemas.club import ClubSettingsResponse, ClubSettingsUpdate
from backend.app.schemas.update import UpdateResponse, UpdateCreate, UpdateUpdate
from backend.app.schemas.gallery import GalleryResponse, GalleryCreate, GalleryUpdate
from backend.app.schemas.activity import ActivityResponse, ActivityCreate, ActivityUpdate
from backend.app.schemas.history import HistoryResponse, HistoryCreate, HistoryUpdate
from backend.app.schemas.donation import DonationSettingResponse, DonationSettingUpdate
from backend.app.schemas.upload import FileUploadResponse

router = APIRouter()


def generate_slug(title: str) -> str:
    """Generates a clean URL slug from title."""
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s[:100] or "update"


# -----------------------------------------------------------------------------
# 1. Admin Dashboard Stats
# -----------------------------------------------------------------------------
@router.get("/stats", summary="Admin Dashboard Statistics")
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> dict:
    """
    Returns total counts and statistics for content items.
    """
    total_updates = db.query(Update).count()
    published_updates = db.query(Update).filter(Update.published == True).count()
    total_gallery = db.query(Gallery).count()
    total_activities = db.query(Activity).count()
    total_history = db.query(History).count()

    recent_updates = (
        db.query(Update)
        .order_by(Update.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "counts": {
            "total_updates": total_updates,
            "published_updates": published_updates,
            "total_gallery": total_gallery,
            "total_activities": total_activities,
            "total_history": total_history,
        },
        "recent_updates": [
            {
                "id": u.id,
                "title": u.title,
                "category": u.category,
                "published": u.published,
                "date": u.published_at.strftime("%Y-%m-%d"),
            }
            for u in recent_updates
        ],
    }


# -----------------------------------------------------------------------------
# 2. Updates Management
# -----------------------------------------------------------------------------
@router.get("/updates", response_model=List[UpdateResponse], summary="List All Updates (Admin)")
def list_admin_updates(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[Update]:
    return db.query(Update).order_by(Update.id.desc()).all()


@router.post("/updates", response_model=UpdateResponse, status_code=status.HTTP_201_CREATED, summary="Create Update")
def create_update(
    update_in: UpdateCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Update:
    slug = update_in.slug or generate_slug(update_in.title)
    # Ensure unique slug
    existing = db.query(Update).filter(Update.slug == slug).first()
    if existing:
        slug = f"{slug}-{int(datetime.now(timezone.utc).timestamp())}"

    update = Update(
        title=update_in.title,
        slug=slug,
        excerpt=update_in.excerpt,
        content=update_in.content,
        image_url=update_in.image_url,
        category=update_in.category,
        published=update_in.published,
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return update


@router.patch("/updates/{id}", response_model=UpdateResponse, summary="Update Notice")
def update_notice(
    id: int,
    update_in: UpdateUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Update:
    update = db.query(Update).filter(Update.id == id).first()
    if not update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(update, field, val)

    db.commit()
    db.refresh(update)
    return update


@router.delete("/updates/{id}", summary="Delete Notice")
def delete_notice(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> dict:
    update = db.query(Update).filter(Update.id == id).first()
    if not update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    db.delete(update)
    db.commit()
    return {"message": "Update deleted successfully.", "id": id}


# -----------------------------------------------------------------------------
# 3. Gallery Management
# -----------------------------------------------------------------------------
@router.get("/gallery", response_model=List[GalleryResponse], summary="List All Gallery Items (Admin)")
def list_admin_gallery(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[Gallery]:
    return db.query(Gallery).order_by(Gallery.sort_order.asc(), Gallery.id.desc()).all()


@router.post("/gallery", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED, summary="Create Gallery Photo")
def create_gallery_item(
    item_in: GalleryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Gallery:
    item = Gallery(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/gallery/{id}", response_model=GalleryResponse, summary="Update Gallery Photo")
def update_gallery_item(
    id: int,
    item_in: GalleryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Gallery:
    item = db.query(Gallery).filter(Gallery.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    for field, val in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/gallery/{id}", summary="Delete Gallery Photo")
def delete_gallery_item(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> dict:
    item = db.query(Gallery).filter(Gallery.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    if item.image_url and item.image_url.startswith("/uploads/"):
        storage_service.delete_image(item.image_url)

    db.delete(item)
    db.commit()
    return {"message": "Gallery item deleted successfully.", "id": id}


# -----------------------------------------------------------------------------
# 4. Activities Management
# -----------------------------------------------------------------------------
@router.get("/activities", response_model=List[ActivityResponse], summary="List All Activities (Admin)")
def list_admin_activities(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[Activity]:
    return db.query(Activity).order_by(Activity.id.asc()).all()


@router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Activity")
def create_activity(
    item_in: ActivityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Activity:
    activity = Activity(**item_in.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/activities/{id}", response_model=ActivityResponse, summary="Update Activity")
def update_activity(
    id: int,
    item_in: ActivityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Activity:
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    for field, val in item_in.model_dump(exclude_unset=True).items():
        setattr(activity, field, val)

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/activities/{id}", summary="Delete Activity")
def delete_activity(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> dict:
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully.", "id": id}


# -----------------------------------------------------------------------------
# 5. History Milestones Management
# -----------------------------------------------------------------------------
@router.get("/history", response_model=List[HistoryResponse], summary="List All History Items (Admin)")
def list_admin_history(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[History]:
    return db.query(History).order_by(History.sort_order.asc(), History.year.asc()).all()


@router.post("/history", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED, summary="Create History Milestone")
def create_history_item(
    item_in: HistoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> History:
    history = History(**item_in.model_dump())
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


@router.patch("/history/{id}", response_model=HistoryResponse, summary="Update History Milestone")
def update_history_item(
    id: int,
    item_in: HistoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> History:
    history = db.query(History).filter(History.id == id).first()
    if not history:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History milestone not found.")

    for field, val in item_in.model_dump(exclude_unset=True).items():
        setattr(history, field, val)

    db.commit()
    db.refresh(history)
    return history


@router.delete("/history/{id}", summary="Delete History Milestone")
def delete_history_item(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> dict:
    history = db.query(History).filter(History.id == id).first()
    if not history:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History milestone not found.")

    db.delete(history)
    db.commit()
    return {"message": "History milestone deleted successfully.", "id": id}


# -----------------------------------------------------------------------------
# 6. Club Information & Settings
# -----------------------------------------------------------------------------
@router.get("/club", response_model=ClubSettingsResponse, summary="Get Club Settings (Admin)")
def get_admin_club_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ClubSettings:
    club = db.query(ClubSettings).first()
    if not club:
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


@router.patch("/club", response_model=ClubSettingsResponse, summary="Update Club Settings")
def update_admin_club_settings(
    club_in: ClubSettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ClubSettings:
    club = db.query(ClubSettings).first()
    if not club:
        club = ClubSettings(
            name="Mahaveer Youth Club",
            tagline="Celebrating Faith, Tradition & Community",
            description="A community-driven non-profit youth organization established in 1998.",
            location="Mahaveer Youth Club Ground, Ward No. 12",
            address="Main Pandal Ground, Near Community Hall, Ward No. 12",
            phone="+91 XXXXX XXXXX",
            email="contact@mahaveeryouthclub.org",
        )
        db.add(club)

    for field, val in club_in.model_dump(exclude_unset=True).items():
        setattr(club, field, val)

    db.commit()
    db.refresh(club)
    return club


# -----------------------------------------------------------------------------
# 7. Donation Settings
# -----------------------------------------------------------------------------
@router.get("/donation", response_model=DonationSettingResponse, summary="Get Donation Settings (Admin)")
def get_admin_donation_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> DonationSetting:
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


@router.patch("/donation", response_model=DonationSettingResponse, summary="Update Donation Settings")
def update_admin_donation_settings(
    donation_in: DonationSettingUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> DonationSetting:
    setting = db.query(DonationSetting).first()
    if not setting:
        setting = DonationSetting(
            club_name="Mahaveer Youth Club",
            upi_id="mahaveeryouthclub@upi",
            suggested_amounts="101,501,1001,2001",
        )
        db.add(setting)

    for field, val in donation_in.model_dump(exclude_unset=True).items():
        setattr(setting, field, val)

    db.commit()
    db.refresh(setting)
    return setting


# -----------------------------------------------------------------------------
# 8. Secure Media Upload Endpoint
# -----------------------------------------------------------------------------
@router.post("/upload", response_model=FileUploadResponse, summary="Secure Image Upload")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
) -> FileUploadResponse:
    """
    Validates and stores an uploaded image file. Returns the public URL path.
    """
    stored_name, public_url, file_size = await storage_service.save_image(file)
    return FileUploadResponse(
        filename=stored_name,
        url=public_url,
        content_type=file.content_type or "image/jpeg",
        size_bytes=file_size,
    )
