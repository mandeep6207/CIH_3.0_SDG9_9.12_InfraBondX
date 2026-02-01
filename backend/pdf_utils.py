from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
from datetime import datetime

def generate_certificate_pdf(data, output_path):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 60, "InfraBondX Investment Certificate")

    c.setFont("Helvetica", 12)
    y = height - 110

    lines = [
        f"Investor Name: {data['investor_name']}",
        f"Project: {data['project_title']}",
        f"Amount Invested: ₹{data['amount_invested']}",
        f"Tokens Issued: {data['tokens_issued']}",
        f"Token Price: ₹{data['token_price']}",
        f"ROI (Simulated): {data['roi_percent']}%",
        f"Tenure: {data['tenure_months']} months",
        f"Transaction Hash: {data['tx_hash']}",
        f"Issued On: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "Disclaimer: This certificate is part of a hackathon MVP simulation.",
        "No real money or regulated securities are involved in this demo.",
    ]

    for line in lines:
        c.drawString(50, y, line)
        y -= 18

    c.showPage()
    c.save()
