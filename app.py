from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from email.message import EmailMessage
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow CORS (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Request Models ==========

class EmailRequest(BaseModel):
    emails: List[EmailStr]

class WarningItem(BaseModel):
    email: EmailStr
    reason: Optional[str] = "Incorrect or mismatched document details"

class WarningRequest(BaseModel):
    warnings: List[WarningItem]

# ========== Routes ==========

@app.post("/send-reminder")
def send_reminder(request: EmailRequest):
    sender_email = os.getenv("GMAIL_USER")
    sender_password = os.getenv("GMAIL_PASS")

    if not sender_email or not sender_password:
        raise HTTPException(status_code=500, detail="Email credentials not set.")

    subject = "Reminder: Please Submit Your Internship Documents"
    body = (
        "Hi,\n\n"
        "Our records show that you haven't submitted all required internship documents.\n"
        "Please do so as soon as possible to avoid issues with verification.\n\n"
        "Thanks,\nInternship Coordinator"
    )

    for recipient in request.emails:
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = sender_email
            msg["To"] = recipient
            msg.set_content(body)

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(sender_email, sender_password)
                smtp.send_message(msg)
        except Exception as e:
            print(f"Failed to send email to {recipient}: {e}")
            continue

    return {"message": f"Reminders sent to {len(request.emails)} students."}


@app.post("/send-warning")
def send_warning(request: WarningRequest):
    sender_email = os.getenv("GMAIL_USER")
    sender_password = os.getenv("GMAIL_PASS")

    if not sender_email or not sender_password:
        raise HTTPException(status_code=500, detail="Email credentials not set.")

    for warning in request.warnings:
        try:
            subject = "Important: Internship Document Rejected"
            body = (
                f"Hi,\n\n"
                f"Your internship document was rejected due to the following reason:\n"
                f"{warning.reason}\n\n"
                f"Please correct the issue and re-upload your document.\n\n"
                f"Thanks,\nInternship Coordinator"
            )

            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = sender_email
            msg["To"] = warning.email
            msg.set_content(body)

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(sender_email, sender_password)
                smtp.send_message(msg)
        except Exception as e:
            print(f"Failed to send warning to {warning.email}: {e}")
            continue

    return {"message": f"Warnings sent to {len(request.warnings)} students."}

# uvicorn app:app --host 0.0.0.0 --port 8001 --reload
