import os
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from models import (
    db, User, Project, Milestone, Escrow,
    TokenHolding, Transaction, MarketplaceListing
)
from utils import create_jwt, get_auth_user, generate_tx_hash
from seed import seed_data
from pdf_utils import generate_certificate_pdf

load_dotenv()

app = Flask(__name__)

# ✅ CORS
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

# ✅ DB
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///infrabondx.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ✅ Upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)


# ✅ INIT DB + SEED ONCE
def init_db_once():
    with app.app_context():
        db.create_all()
        seed_data()


init_db_once()


# ---------- ROOT ----------
@app.get("/")
def root():
    return jsonify({
        "message": "InfraBondX Backend running ✅",
        "try": ["/api/health", "/api/projects"]
    })


# ---------- HEALTH ----------
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "app": "InfraBondX Backend"})


# ---------- AUTH ----------
@app.post("/api/auth/login")
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_jwt(user.id, user.role)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    })


@app.get("/api/auth/me")
def me():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": user.id, "name": user.name, "email": user.email, "role": user.role})


# ---------- FILE UPLOAD ----------
@app.post("/api/upload")
def upload_file():
    """
    ✅ Frontend should send multipart/form-data with key: "file"
    Returns proof_url that can be stored inside Milestone.proof_url
    """
    if "file" not in request.files:
        return jsonify({"error": "No file key found"}), 400

    f = request.files["file"]
    if not f or f.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(f.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    # ✅ unique file name (remove 0x from hash for clean filename)
    unique_id = generate_tx_hash().replace("0x", "")
    unique_name = f"{unique_id}_{filename}"

    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    f.save(save_path)

    return jsonify({
        "message": "uploaded",
        "filename": unique_name,
        "proof_url": f"/uploads/{unique_name}",
        "proof_full_url": f"http://127.0.0.1:5000/uploads/{unique_name}"
    })


@app.get("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    safe_name = secure_filename(filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_name)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(app.config["UPLOAD_FOLDER"], safe_name, as_attachment=False)


# ---------- PROJECTS (Investor Marketplace) ----------
@app.get("/api/projects")
def list_projects():
    projects = Project.query.filter(Project.status == "ACTIVE").all()

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "category": p.category,
        "location": p.location,
        "description": p.description,
        "funding_target": p.funding_target,
        "funding_raised": p.funding_raised,
        "token_price": p.token_price,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_level": p.risk_level,
        "risk_score": p.risk_score,
        "status": p.status
    } for p in projects])


@app.get("/api/projects/<int:project_id>")
def project_details(project_id):
    p = Project.query.get_or_404(project_id)

    if p.status == "FROZEN":
        return jsonify({"error": "Project unavailable"}), 403

    return jsonify({
        "id": p.id,
        "title": p.title,
        "category": p.category,
        "location": p.location,
        "description": p.description,
        "funding_target": p.funding_target,
        "funding_raised": p.funding_raised,
        "token_price": p.token_price,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_level": p.risk_level,
        "risk_score": p.risk_score,
        "status": p.status
    })


@app.get("/api/projects/<int:project_id>/milestones")
def project_milestones(project_id):
    milestones = (
        Milestone.query
        .filter_by(project_id=project_id)
        .order_by(Milestone.id.asc())
        .all()
    )
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "escrow_release_percent": m.escrow_release_percent,
        "status": m.status,
        "proof_url": m.proof_url
    } for m in milestones])


@app.get("/api/projects/<int:project_id>/transparency")
def transparency(project_id):
    escrow = Escrow.query.filter_by(project_id=project_id).first()
    if not escrow:
        return jsonify({"locked": 0, "released": 0})

    return jsonify({
        "locked": escrow.total_locked,
        "released": escrow.total_released
    })


# ---------- INVEST ----------
@app.post("/api/investor/invest")
def invest():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "INVESTOR":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    project_id = data.get("project_id")
    amount = int(data.get("amount", 0))

    p = Project.query.get_or_404(project_id)

    if p.status != "ACTIVE":
        return jsonify({"error": "Project is not available for investment"}), 400

    tokens = amount // p.token_price
    if tokens <= 0:
        return jsonify({"error": "Amount too low"}), 400

    tx_hash = generate_tx_hash()

    # project funding
    p.funding_raised += amount

    # escrow
    escrow = Escrow.query.filter_by(project_id=p.id).first()
    if not escrow:
        escrow = Escrow(project_id=p.id, total_locked=0, total_released=0)
        db.session.add(escrow)

    escrow.total_locked += amount

    # holding
    holding = TokenHolding.query.filter_by(
        user_id=auth_user["user_id"],
        project_id=p.id
    ).first()

    if not holding:
        holding = TokenHolding(
            user_id=auth_user["user_id"],
            project_id=p.id,
            token_count=0,
            avg_buy_price=0
        )
        db.session.add(holding)

    old_total = holding.token_count * holding.avg_buy_price
    new_total = old_total + (tokens * p.token_price)
    holding.token_count += tokens
    holding.avg_buy_price = new_total / holding.token_count

    # tx
    tx = Transaction(
        tx_hash=tx_hash,
        user_id=auth_user["user_id"],
        project_id=p.id,
        tx_type="MINT",
        amount=amount,
        token_count=tokens,
        status="SUCCESS"
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        "message": "Investment successful",
        "tx_hash": tx_hash,
        "tokens_issued": tokens
    })


@app.get("/api/investor/portfolio")
def portfolio():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    holdings = TokenHolding.query.filter_by(user_id=auth_user["user_id"]).all()
    res = []

    for h in holdings:
        p = Project.query.get(h.project_id)
        if not p:
            continue

        res.append({
            "project_id": p.id,
            "project_title": p.title,
            "tokens": h.token_count,
            "avg_buy_price": h.avg_buy_price,
            "token_price": p.token_price,
            "roi_percent": p.roi_percent,
            "tenure_months": p.tenure_months
        })

    return jsonify(res)


@app.get("/api/investor/transactions")
def investor_transactions():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    txs = (
        Transaction.query
        .filter_by(user_id=auth_user["user_id"])
        .order_by(Transaction.created_at.desc())
        .all()
    )

    result = []
    for t in txs:
        p = Project.query.get(t.project_id) if t.project_id else None
        result.append({
            "tx_hash": t.tx_hash,
            "type": t.tx_type,
            "amount": t.amount,
            "token_count": t.token_count,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "project_id": t.project_id,
            "project_title": p.title if p else "Infrastructure Project"
        })

    return jsonify(result)


# ---------- SECONDARY MARKET ----------
@app.post("/api/marketplace/list")
def list_tokens_for_sale():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    project_id = data.get("project_id")
    token_count = int(data.get("token_count", 0))
    price_per_token = int(data.get("price_per_token", 0))

    if token_count <= 0 or price_per_token <= 0:
        return jsonify({"error": "Invalid listing inputs"}), 400

    holding = TokenHolding.query.filter_by(
        user_id=auth_user["user_id"],
        project_id=project_id
    ).first()

    if not holding or holding.token_count < token_count:
        return jsonify({"error": "Not enough tokens"}), 400

    listing = MarketplaceListing(
        seller_id=auth_user["user_id"],
        project_id=project_id,
        token_count=token_count,
        price_per_token=price_per_token,
        status="ACTIVE"
    )
    db.session.add(listing)
    db.session.commit()

    return jsonify({"message": "Listing created", "listing_id": listing.id})


@app.get("/api/marketplace/listings")
def marketplace_listings():
    listings = MarketplaceListing.query.filter_by(status="ACTIVE").all()
    result = []

    for l in listings:
        p = Project.query.get(l.project_id)
        seller = User.query.get(l.seller_id)
        if not p or not seller:
            continue

        if p.status != "ACTIVE":
            continue

        result.append({
            "id": l.id,
            "project_id": p.id,
            "project_title": p.title,
            "seller_name": seller.name,
            "token_count": l.token_count,
            "price_per_token": l.price_per_token,
            "status": l.status
        })

    return jsonify(result)


@app.post("/api/marketplace/buy")
def buy_listing():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    listing_id = data.get("listing_id")

    listing = MarketplaceListing.query.get_or_404(listing_id)
    if listing.status != "ACTIVE":
        return jsonify({"error": "Listing not available"}), 400

    buyer_id = auth_user["user_id"]
    if buyer_id == listing.seller_id:
        return jsonify({"error": "Cannot buy your own listing"}), 400

    p = Project.query.get(listing.project_id)
    if not p:
        return jsonify({"error": "Project not found"}), 404

    if p.status != "ACTIVE":
        return jsonify({"error": "Project not active"}), 400

    tx_hash = generate_tx_hash()

    seller_h = TokenHolding.query.filter_by(
        user_id=listing.seller_id,
        project_id=p.id
    ).first()

    if not seller_h or seller_h.token_count < listing.token_count:
        return jsonify({"error": "Seller has insufficient tokens"}), 400

    seller_h.token_count -= listing.token_count

    buyer_h = TokenHolding.query.filter_by(user_id=buyer_id, project_id=p.id).first()
    if not buyer_h:
        buyer_h = TokenHolding(
            user_id=buyer_id,
            project_id=p.id,
            token_count=0,
            avg_buy_price=listing.price_per_token
        )
        db.session.add(buyer_h)

    buyer_h.token_count += listing.token_count
    buyer_h.avg_buy_price = listing.price_per_token

    listing.status = "SOLD"

    tx = Transaction(
        tx_hash=tx_hash,
        user_id=buyer_id,
        project_id=p.id,
        tx_type="TRANSFER",
        amount=listing.token_count * listing.price_per_token,
        token_count=listing.token_count,
        status="SUCCESS"
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({"message": "Purchase successful", "tx_hash": tx_hash})


# ---------- PDF CERTIFICATE ----------
@app.get("/api/investor/certificate/<int:project_id>")
def download_certificate(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    project = Project.query.get_or_404(project_id)

    holding = TokenHolding.query.filter_by(user_id=user.id, project_id=project.id).first()
    if not holding or holding.token_count <= 0:
        return jsonify({"error": "No tokens found for this project"}), 400

    tx = (
        Transaction.query
        .filter_by(user_id=user.id, project_id=project.id)
        .order_by(Transaction.created_at.desc())
        .first()
    )
    tx_hash = tx.tx_hash if tx else generate_tx_hash()

    pdf_data = {
        "investor_name": user.name,
        "project_title": project.title,
        "amount_invested": int(holding.token_count * project.token_price),
        "tokens_issued": holding.token_count,
        "token_price": project.token_price,
        "roi_percent": project.roi_percent,
        "tenure_months": project.tenure_months,
        "tx_hash": tx_hash
    }

    os.makedirs("generated_pdfs", exist_ok=True)
    file_path = f"generated_pdfs/certificate_{user.id}_{project.id}.pdf"
    generate_certificate_pdf(pdf_data, file_path)

    return send_file(file_path, as_attachment=True)


# ---------- ISSUER: CREATE PROJECT ----------
@app.post("/api/issuer/projects")
def issuer_create_project():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}

    title = (data.get("title", "") or "").strip()
    category = data.get("category", "Road")
    location = (data.get("location", "") or "").strip()
    description = (data.get("description", "") or "").strip()

    funding_target = int(data.get("funding_target", 0))
    token_price = int(data.get("token_price", 100))
    roi_percent = float(data.get("roi_percent", 10))
    tenure_months = int(data.get("tenure_months", 60))

    if not title or not location or not description:
        return jsonify({"error": "Missing fields"}), 400
    if funding_target <= 0 or token_price <= 0:
        return jsonify({"error": "Invalid funding_target/token_price"}), 400

    # simple risk scoring
    risk_score = 45
    if roi_percent >= 13:
        risk_score = 70
    elif roi_percent <= 10:
        risk_score = 35

    project = Project(
        issuer_id=auth_user["user_id"],
        title=title,
        category=category,
        location=location,
        description=description,
        funding_target=funding_target,
        funding_raised=0,
        token_price=token_price,
        roi_percent=roi_percent,
        tenure_months=tenure_months,
        risk_level="MEDIUM",
        risk_score=risk_score,
        status="PENDING"
    )
    db.session.add(project)
    db.session.commit()

    # escrow
    escrow = Escrow(project_id=project.id, total_locked=0, total_released=0)
    db.session.add(escrow)

    # milestones
    milestones = data.get("milestones", [])
    if isinstance(milestones, list) and len(milestones) > 0:
        for m in milestones:
            m_title = (m.get("title") or "").strip()
            m_percent = int(m.get("escrow_release_percent") or 0)
            if m_title and m_percent > 0:
                db.session.add(
                    Milestone(
                        project_id=project.id,
                        title=m_title,
                        escrow_release_percent=m_percent,
                        status="PENDING",
                        proof_url=""
                    )
                )
    else:
        default_ms = [
            {"title": "Tender Approved", "escrow_release_percent": 20},
            {"title": "Construction Started", "escrow_release_percent": 20},
            {"title": "25% Completion Proof", "escrow_release_percent": 20},
            {"title": "50% Completion Proof", "escrow_release_percent": 20},
            {"title": "Audit & Completion Report", "escrow_release_percent": 20},
        ]
        for m in default_ms:
            db.session.add(
                Milestone(
                    project_id=project.id,
                    title=m["title"],
                    escrow_release_percent=m["escrow_release_percent"],
                    status="PENDING",
                    proof_url=""
                )
            )

    db.session.commit()

    return jsonify({
        "message": "Project created (pending admin approval)",
        "project_id": project.id,
        "status": project.status
    })


# ---------- ISSUER: LIST PROJECTS ----------
@app.get("/api/issuer/projects")
def issuer_projects():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    projects = (
        Project.query
        .filter_by(issuer_id=auth_user["user_id"])
        .order_by(Project.id.desc())
        .all()
    )

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "location": p.location,
        "funding_raised": p.funding_raised,
        "funding_target": p.funding_target,
        "token_price": p.token_price,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_score": p.risk_score,
        "status": p.status
    } for p in projects])


# ---------- ISSUER: SUBMIT MILESTONE PROOF ----------
@app.post("/api/issuer/milestones/<int:milestone_id>/submit")
def issuer_submit_milestone_proof(milestone_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    proof_url = (data.get("proof_url") or "").strip()

    milestone = Milestone.query.get_or_404(milestone_id)
    project = Project.query.get(milestone.project_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if project.issuer_id != auth_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403

    if not proof_url:
        return jsonify({"error": "Proof file not uploaded"}), 400

    if milestone.status == "COMPLETED":
        return jsonify({"message": "Already completed"}), 200

    milestone.status = "COMPLETED"
    milestone.proof_url = proof_url

    escrow = Escrow.query.filter_by(project_id=project.id).first()
    if not escrow:
        escrow = Escrow(project_id=project.id, total_locked=0, total_released=0)
        db.session.add(escrow)

    release_amount = int((escrow.total_locked * milestone.escrow_release_percent) / 100)
    if release_amount > escrow.total_locked:
        release_amount = escrow.total_locked

    escrow.total_locked -= release_amount
    escrow.total_released += release_amount

    db.session.commit()

    return jsonify({
        "message": "Milestone verified & escrow released (simulated)",
        "released_amount": release_amount,
        "proof_url": proof_url
    })


# ---------- ADMIN: LIST PROJECTS ----------
@app.get("/api/admin/projects")
def admin_list_projects():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    status = (request.args.get("status") or "").upper().strip()

    q = Project.query
    if status:
        q = q.filter(Project.status == status)

    projects = q.order_by(Project.id.desc()).all()

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "location": p.location,
        "category": p.category,
        "funding_target": p.funding_target,
        "funding_raised": p.funding_raised,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_score": p.risk_score,
        "status": p.status
    } for p in projects])


# ✅ Admin: Full project details + milestones (ONLY ONE ROUTE)
@app.get("/api/admin/projects/<int:project_id>/details")
def admin_project_details(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    p = Project.query.get_or_404(project_id)
    milestones = (
        Milestone.query
        .filter_by(project_id=p.id)
        .order_by(Milestone.id.asc())
        .all()
    )

    return jsonify({
        "project": {
            "id": p.id,
            "title": p.title,
            "location": p.location,
            "category": p.category,
            "description": p.description,
            "funding_target": p.funding_target,
            "funding_raised": p.funding_raised,
            "token_price": p.token_price,
            "roi_percent": p.roi_percent,
            "tenure_months": p.tenure_months,
            "risk_level": p.risk_level,
            "risk_score": p.risk_score,
            "status": p.status,
            "issuer_id": p.issuer_id
        },
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "escrow_release_percent": m.escrow_release_percent,
                "status": m.status,
                "proof_url": m.proof_url
            }
            for m in milestones
        ]
    })


# ---------- ADMIN: UPDATE PROJECT STATUS ----------
@app.post("/api/admin/projects/<int:project_id>/status")
def admin_update_project_status(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    status = (data.get("status") or "").upper().strip()

    if status not in ["ACTIVE", "FROZEN", "PENDING"]:
        return jsonify({"error": "Invalid status"}), 400

    project = Project.query.get_or_404(project_id)
    project.status = status
    db.session.commit()

    return jsonify({"message": "Project status updated", "status": project.status})


# ---------- ADMIN: FRAUD ALERTS (SIMULATED) ----------
@app.get("/api/admin/fraud-alerts")
def admin_fraud_alerts():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    projects = Project.query.all()
    alerts = []

    for p in projects:
        if p.roi_percent >= 14:
            alerts.append({
                "type": "HIGH_ROI_ALERT",
                "project_id": p.id,
                "project_title": p.title,
                "message": "Unusually high ROI detected (possible risk)",
                "severity": "HIGH"
            })

        if p.funding_target > 0 and (p.funding_raised / p.funding_target) > 0.95:
            alerts.append({
                "type": "FUNDING_SPIKE",
                "project_id": p.id,
                "project_title": p.title,
                "message": "Project nearing full funding rapidly",
                "severity": "MEDIUM"
            })

    return jsonify(alerts)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
