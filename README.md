# InfraBondX Infrastructure Bonds Tokenization Funding System

**InfraBondX** is a transparency-first platform designed to improve trust, accountability, and accessibility in infrastructure bond funding. It helps track infrastructure bond allocations, project progress, and fund utilization through a clean dashboard experience with secure authentication and structured reporting.

---

## 🚀 Overview

Infrastructure development often faces challenges like lack of transparency, delayed reporting, and limited retail participation. InfraBondX addresses these issues by offering a centralized system where stakeholders can monitor fund flow and project updates more efficiently.

---

## 🎯 Problem Statement

Infrastructure funding and reporting still suffers from:

* **Lack of trust** in infrastructure funding mechanisms
* **Fund misuse and delays** due to limited transparency
* **Limited access** to infrastructure bonds for retail investors
* **Manual verification and fragmented reporting**, making monitoring very slow

---

## ✅ Key Features

* **Role-based Authentication** (Admin / Investor / Authority)
* **Infrastructure Bond Tracking**

  * Bond listings and details
  * Investor participation tracking
* **Project Monitoring Dashboard**

  * Progress updates
  * Utilization records
* **Transparent Reporting Workflow**

  * Structured logs for fund distribution and usage
  * Faster visibility for stakeholders
* **Secure Backend APIs**

  * JWT-based authentication
  * Environment-based configuration

---

## 🧱 Tech Stack

### Frontend

* **React (Vite)**
* **Tailwind CSS**
* **Axios**

### Backend

* **Flask / Node (as implemented in your repo)**
* **JWT Authentication**
* **SQLite Database**

### Database

* **SQLite** (local development)

---

## 📂 Project Structure

> Structure may vary based on your repo organization.

```
InfraBondX/
│── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
│── backend/
│   ├── app.py / server.js
│   ├── routes/
│   ├── models/
│   ├── requirements.txt / package.json
│   └── infrabondx.db
│
│── .env
│── README.md
└── LICENSE
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (or backend folder as required):

```
SECRET_KEY=supersecretkey
DATABASE_URL=sqlite:///infrabondx.db
VITE_BACKEND_URL=http://localhost:5000
```

**Notes:**

* `VITE_BACKEND_URL` is used by the frontend to connect with backend APIs.
* `DATABASE_URL` points to the local SQLite database.

---

## 🛠️ Installation & Setup

### 1) Clone the Repository

```bash
git clone <repo-link>
cd InfraBondX
```

---

### 2) Backend Setup

> Run these commands inside the `backend/` folder.

#### If backend is Flask

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend will run on:

```
http://localhost:5000
```

---

### 3) Frontend Setup

> Run these commands inside the `frontend/` folder.

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🔌 API Connectivity

Frontend uses:

```js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
```

Make sure `.env` is configured correctly and the backend is running.

---

## 📊 Use Cases

* **Investors** can explore and monitor infrastructure bond opportunities.
* **Admins/Authorities** can update project progress and maintain funding records.
* **Stakeholders** gain visibility into fund allocation and project status.

---

## 🔐 Security Considerations

* Use strong values for `SECRET_KEY` in production.
* Avoid committing `.env` files to GitHub.
* Enable proper validation, rate limiting, and access control in deployment.

---

## 📌 Future Enhancements

* Blockchain-based immutable transaction audit trail
* Smart contract based fund release triggers
* Real-time notifications and anomaly detection
* KYC integration for investors
* Advanced analytics dashboard (project delays, fund leakage trends)

---

## 🤝 Contributing

Contributions are always welcome.

1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit changes
4. Push to your fork
5. Create a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Mandeep Kumar**

Username:- @mandeep6207

If you found this project useful, consider giving it a ⭐ on GitHub.
