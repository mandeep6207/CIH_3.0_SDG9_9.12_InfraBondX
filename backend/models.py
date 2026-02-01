from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(255))
    role = db.Column(db.String(20))  # INVESTOR / ISSUER / ADMIN
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # issuer linkage
    issuer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    title = db.Column(db.String(200))
    category = db.Column(db.String(50))
    location = db.Column(db.String(120))
    description = db.Column(db.Text)

    funding_target = db.Column(db.Integer)
    funding_raised = db.Column(db.Integer, default=0)

    token_price = db.Column(db.Integer, default=100)
    roi_percent = db.Column(db.Float, default=12.0)
    tenure_months = db.Column(db.Integer, default=24)

    risk_level = db.Column(db.String(20), default="MEDIUM")
    risk_score = db.Column(db.Integer, default=55)

    # PENDING / ACTIVE / FROZEN
    status = db.Column(db.String(30), default="PENDING")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Milestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"))

    title = db.Column(db.String(200))
    escrow_release_percent = db.Column(db.Integer, default=20)

    # PENDING / COMPLETED
    status = db.Column(db.String(30), default="PENDING")

    # proof file url/path
    proof_url = db.Column(db.String(500), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Escrow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), unique=True)
    total_locked = db.Column(db.Integer, default=0)
    total_released = db.Column(db.Integer, default=0)


class TokenHolding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"))
    token_count = db.Column(db.Integer, default=0)
    avg_buy_price = db.Column(db.Float, default=0.0)


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tx_hash = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"))
    tx_type = db.Column(db.String(30))  # MINT / TRANSFER etc.
    amount = db.Column(db.Integer, default=0)
    token_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(30), default="SUCCESS")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MarketplaceListing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"))
    token_count = db.Column(db.Integer)
    price_per_token = db.Column(db.Integer)
    status = db.Column(db.String(30), default="ACTIVE")  # ACTIVE/SOLD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
