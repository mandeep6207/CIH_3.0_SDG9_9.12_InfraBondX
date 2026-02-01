from models import db, User, Project, Milestone, Escrow
from werkzeug.security import generate_password_hash


def seed_data():
    # do not seed again if users already exist
    if User.query.first():
        return

    # ---------------- USERS ----------------
    admin = User(
        name="Admin",
        email="admin@infrabondx.com",
        password_hash=generate_password_hash("admin123"),
        role="ADMIN"
    )

    issuer = User(
        name="Raipur Smart Infra Dept",
        email="issuer@infrabondx.com",
        password_hash=generate_password_hash("issuer123"),
        role="ISSUER"
    )

    investor = User(
        name="Mandeep Kumar",
        email="investor@infrabondx.com",
        password_hash=generate_password_hash("investor123"),
        role="INVESTOR"
    )

    db.session.add_all([admin, issuer, investor])
    db.session.commit()

    # ---------------- PROJECTS (MOCK DATA) ----------------
    projects = [
        # ACTIVE
        Project(
            issuer_id=issuer.id,
            title="Raipur Smart Road Phase-2",
            category="Road",
            location="Raipur, Chhattisgarh",
            description="Upgrading 12km road with smart streetlights, drainage and safety upgrades.",
            funding_target=5000000,
            funding_raised=1250000,
            token_price=100,
            roi_percent=11.5,
            tenure_months=24,
            risk_level="MEDIUM",
            risk_score=58,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Bilaspur Bridge Strengthening Program",
            category="Bridge",
            location="Bilaspur, Chhattisgarh",
            description="Structural strengthening of an old bridge and monitoring improvements.",
            funding_target=8000000,
            funding_raised=2800000,
            token_price=100,
            roi_percent=12.8,
            tenure_months=36,
            risk_level="LOW",
            risk_score=42,
            status="ACTIVE"
        ),

        # ACTIVE - Other states
        Project(
            issuer_id=issuer.id,
            title="Mumbai Coastal Drainage Upgrade",
            category="Drainage",
            location="Mumbai, Maharashtra",
            description="Stormwater drainage modernization for monsoon resilience.",
            funding_target=15000000,
            funding_raised=7200000,
            token_price=100,
            roi_percent=12.2,
            tenure_months=30,
            risk_level="MEDIUM",
            risk_score=55,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Bengaluru Smart Streetlight Network",
            category="Energy",
            location="Bengaluru, Karnataka",
            description="LED smart streetlights with remote monitoring and energy analytics.",
            funding_target=9000000,
            funding_raised=4100000,
            token_price=100,
            roi_percent=11.2,
            tenure_months=24,
            risk_level="LOW",
            risk_score=40,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Ahmedabad EV Charging Corridors",
            category="Transport",
            location="Ahmedabad, Gujarat",
            description="Deployment of EV charging points across city corridors and highways.",
            funding_target=12000000,
            funding_raised=5900000,
            token_price=100,
            roi_percent=13.2,
            tenure_months=36,
            risk_level="MEDIUM",
            risk_score=60,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Hyderabad Water Pipeline Rehabilitation",
            category="Water",
            location="Hyderabad, Telangana",
            description="Pipeline leak reduction + sensor monitoring for urban water supply.",
            funding_target=11000000,
            funding_raised=3500000,
            token_price=100,
            roi_percent=11.0,
            tenure_months=30,
            risk_level="LOW",
            risk_score=44,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Jaipur Heritage Zone Road Resurfacing",
            category="Road",
            location="Jaipur, Rajasthan",
            description="Resurfacing + pedestrian safety upgrades in heritage zones.",
            funding_target=6000000,
            funding_raised=2400000,
            token_price=100,
            roi_percent=10.8,
            tenure_months=24,
            risk_level="LOW",
            risk_score=38,
            status="ACTIVE"
        ),
        Project(
            issuer_id=issuer.id,
            title="Kolkata Riverfront Safety Barriers",
            category="Safety",
            location="Kolkata, West Bengal",
            description="Safety barrier installations and lighting along riverfront stretches.",
            funding_target=7000000,
            funding_raised=3200000,
            token_price=100,
            roi_percent=12.0,
            tenure_months=24,
            risk_level="MEDIUM",
            risk_score=50,
            status="ACTIVE"
        ),

        # PENDING (admin approval demo)
        Project(
            issuer_id=issuer.id,
            title="Lucknow Smart Traffic Signal System",
            category="Smart City",
            location="Lucknow, Uttar Pradesh",
            description="Adaptive traffic signals with AI-based congestion control.",
            funding_target=9500000,
            funding_raised=0,
            token_price=100,
            roi_percent=12.5,
            tenure_months=30,
            risk_level="MEDIUM",
            risk_score=52,
            status="PENDING"
        ),
        Project(
            issuer_id=issuer.id,
            title="Chennai Flood-Resilient Underpass Upgrade",
            category="Drainage",
            location="Chennai, Tamil Nadu",
            description="Underpass drainage strengthening and water pump automation.",
            funding_target=13000000,
            funding_raised=0,
            token_price=100,
            roi_percent=14.2,  # ✅ fraud alert trigger
            tenure_months=36,
            risk_level="HIGH",
            risk_score=70,
            status="PENDING"
        ),
        Project(
            issuer_id=issuer.id,
            title="Indore Smart Waste Processing Plant",
            category="Waste Management",
            location="Indore, Madhya Pradesh",
            description="Waste-to-energy processing and automated segregation facilities.",
            funding_target=14000000,
            funding_raised=0,
            token_price=100,
            roi_percent=12.9,
            tenure_months=36,
            risk_level="MEDIUM",
            risk_score=57,
            status="PENDING"
        ),
        Project(
            issuer_id=issuer.id,
            title="Bhopal Lake Water Quality Sensors",
            category="Water",
            location="Bhopal, Madhya Pradesh",
            description="Real-time lake water quality sensors + dashboard monitoring.",
            funding_target=4000000,
            funding_raised=0,
            token_price=100,
            roi_percent=10.5,
            tenure_months=18,
            risk_level="LOW",
            risk_score=33,
            status="PENDING"
        ),
    ]

    db.session.add_all(projects)
    db.session.commit()

    # ---------------- ESCROW + MILESTONES ----------------
    escrows = []
    milestones_all = []

    for p in projects:
        escrows.append(
            Escrow(project_id=p.id, total_locked=p.funding_raised, total_released=0)
        )

        milestones_all.extend([
            Milestone(project_id=p.id, title="Tender Approved", escrow_release_percent=20, status="COMPLETED"),
            Milestone(project_id=p.id, title="Construction Started", escrow_release_percent=20, status="COMPLETED"),
            Milestone(project_id=p.id, title="25% Completion Proof", escrow_release_percent=20, status="PENDING"),
            Milestone(project_id=p.id, title="50% Completion Proof", escrow_release_percent=20, status="PENDING"),
            Milestone(project_id=p.id, title="Audit & Completion Report", escrow_release_percent=20, status="PENDING"),
        ])

    db.session.add_all(escrows)
    db.session.add_all(milestones_all)
    db.session.commit()
