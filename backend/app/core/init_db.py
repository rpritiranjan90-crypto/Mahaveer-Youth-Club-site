from pathlib import Path
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.core.logging import logger

from backend.app.models.user import User
from backend.app.models.club import ClubSettings
from backend.app.models.update import Update
from backend.app.models.gallery import Gallery
from backend.app.models.activity import Activity
from backend.app.models.history import History
from backend.app.models.donation import DonationSetting


def init_db(db: Session) -> None:
    """
    Creates tables and seeds initial default admin user and club configuration.
    """
    # Create all tables on the session's active bind
    Base.metadata.create_all(bind=db.get_bind())

    # Ensure Upload directory exists
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

    # 1. Seed Default Admin User
    admin_user = db.query(User).filter(User.email == "admin@mahaveeryouthclub.org").first()
    if not admin_user:
        admin_user = User(
            name="Club Administrator",
            email="admin@mahaveeryouthclub.org",
            password_hash=get_password_hash("AdminPassword123!"),
            role="admin",
            is_active=True,
        )
        db.add(admin_user)
        logger.info("Seeded default admin user: admin@mahaveeryouthclub.org")

    # 2. Seed Default Club Settings
    club = db.query(ClubSettings).first()
    if not club:
        club = ClubSettings(
            name="Mahaveer Youth Club",
            tagline="Celebrating Faith, Tradition & Community",
            description="A community-driven non-profit youth organization established in 1998, dedicated to organizing the annual Ganesh Utsav festival and spearheading social welfare initiatives.",
            location="Mahaveer Youth Club Ground, Ward No. 12",
            address="Main Pandal Ground, Near Community Hall, Ward No. 12",
            landmark="Near Community Hall & Ward 12 Main Park",
            phone="+91 XXXXX XXXXX",
            email="contact@mahaveeryouthclub.org",
            registration_number="MYC/SOC/1998/412",
            instagram_url="https://instagram.com/mahaveeryouthclub",
            facebook_url="https://facebook.com/mahaveeryouthclub",
            youtube_url="https://youtube.com/@mahaveeryouthclub",
        )
        db.add(club)

    # 3. Seed Default Donation Settings
    donation_setting = db.query(DonationSetting).first()
    if not donation_setting:
        donation_setting = DonationSetting(
            club_name="Mahaveer Youth Club",
            upi_id="mahaveeryouthclub@upi",
            description="Your voluntary contribution directly powers our daily Maha Bhog, Vedic pandal construction, and annual blood donation camps.",
            suggested_amounts="101,501,1001,2001",
        )
        db.add(donation_setting)

    # 4. Seed Initial Updates if empty
    if db.query(Update).count() == 0:
        db.add_all([
            Update(
                title="Ganesh Utsav 2026: Vedic Palace Pandal Concept Unveiled",
                slug="ganesh-utsav-2026-vedic-palace-pandal-concept-unveiled",
                excerpt="The executive committee has officially announced this year’s theme celebrating ancient Indian Vedic architectural heritage.",
                content="Our master artisans have commenced structural work for the Vedic Palace Pandal. Constructed using bamboo, natural clay, coir, and eco-friendly pigments, this year’s pandal promises to be an architectural marvel designed to inspire cultural pride and environmental consciousness.",
                category="Pandal & Decor",
                published=True,
            ),
            Update(
                title="Volunteer Intake Roster Open for Devotee Crowd Management",
                slug="volunteer-intake-roster-open-for-devotee-crowd-management",
                excerpt="Youth club members and neighborhood volunteers are invited to register for duty shifts across Prasad distribution and queue assistance.",
                content="To ensure a seamless, disciplined experience for all visiting devotees, the youth executive committee is mobilizing 120+ active volunteers. Training sessions will be held at the club office this Saturday.",
                category="Volunteers",
                published=True,
            ),
            Update(
                title="Digital UPI QR Contribution Portal Live for Remote Devotees",
                slug="digital-upi-qr-contribution-portal-live-for-remote-devotees",
                excerpt="Devotees living across other cities and overseas can now contribute directly via the official club UPI QR code.",
                content="We have upgraded our online contribution process to be completely transparent. Devotees can scan our official UPI QR and enter their reference number for receipt tracking.",
                category="Donations",
                published=True,
            ),
        ])

    # 5. Seed Initial Activities if empty
    if db.query(Activity).count() == 0:
        db.add_all([
            Activity(
                title="Murti Sthapana & Vedic Prana Pratishtha",
                category="Ritual",
                date="Day 1 • 28 Sept 2026",
                time="8:00 AM – 11:30 AM",
                location="Main Sanctum, Mahaveer Pandal Ground",
                description="Auspicious installation of our eco-friendly clay Ganesha with traditional Vedic chants, 108 coconut offerings, and holy Kalash Sthapana.",
                featured=True,
                published=True,
            ),
            Activity(
                title="Daily Morning & Evening Maha Aarti",
                category="Ritual",
                date="Daily (All 10 Days)",
                time="7:30 AM & 8:00 PM",
                location="Main Sanctum, Mahaveer Pandal Ground",
                description="Grand community Aarti with traditional Dhaak drums, conch blowing, and sacred Deeparadhana. Devotees receive holy Charanamrit.",
                featured=True,
                published=True,
            ),
            Activity(
                title="Annual Voluntary Blood Donation Camp",
                category="Welfare",
                date="Day 4 • 1 Oct 2026",
                time="9:00 AM – 4:00 PM",
                location="Club Community Hall",
                description="Our signature philanthropic initiative in partnership with the State Red Cross Blood Bank.",
                featured=True,
                published=True,
            ),
        ])

    # 6. Seed Initial History if empty
    if db.query(History).count() == 0:
        db.add_all([
            History(
                year="1998",
                title="Club Foundation & First Neighborhood Puja",
                description="Mahaveer Youth Club was founded by 15 dedicated local youths with a small traditional clay idol and a commitment to neighborhood unity.",
                tag="Founding Year",
                sort_order=1,
                published=True,
            ),
            History(
                year="2004",
                title="Inauguration of Annual Blood Donation Camp",
                description="The club broadened its mission beyond festivities to year-round social welfare, launching its flagship voluntary blood donation camp.",
                tag="Social Welfare",
                sort_order=2,
                published=True,
            ),
            History(
                year="2010",
                title="Pioneering 100% Eco-Friendly Biodegradable Murtis",
                description="Taking a firm stance on environmental conservation, the club transitioned exclusively to natural river clay and organic herbal colors.",
                tag="Eco Pioneer",
                sort_order=3,
                published=True,
            ),
            History(
                year="2026",
                title="28th Annual Ganesh Utsav & Digital Portal Launch",
                description="Celebrating over 28 years of unbroken tradition, cultural heritage, and youth empowerment with our official transparent digital portal.",
                tag="Present Era",
                sort_order=4,
                published=True,
            ),
        ])

    db.commit()
    logger.info("Database schema initialized and baseline data seeded successfully.")
