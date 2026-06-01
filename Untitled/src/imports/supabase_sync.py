import pandas as pd
import requests

from config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_USER_ID,
    SUPABASE_PURCHASE_ID,
    log,
)
from db import load_sent_emails


def _enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and SUPABASE_USER_ID)


def _headers() -> dict[str, str]:
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY or "",
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }


def _latest_purchase_id() -> str | None:
    if SUPABASE_PURCHASE_ID:
        return SUPABASE_PURCHASE_ID

    if not _enabled():
        return None

    url = (
        f"{SUPABASE_URL.rstrip('/')}/rest/v1/purchases"
        f"?user_id=eq.{SUPABASE_USER_ID}&status=eq.active&select=id&order=purchase_date.desc&limit=1"
    )
    res = requests.get(url, headers=_headers(), timeout=20)
    res.raise_for_status()
    purchases = res.json()
    if not purchases:
        return None
    return purchases[0].get("id")


def sync_leads(db: pd.DataFrame) -> None:
    purchase_id = _latest_purchase_id()

    if not _enabled() or not purchase_id:
        log("Supabase lead sync skipped; missing Supabase env values.", level="debug")
        return

    rows = []
    for _, lead in db.iterrows():
        rows.append({
            "purchase_id": purchase_id,
            "user_id": SUPABASE_USER_ID,
            "business_name": lead.get("name") or "Unknown Business",
            "business_type": lead.get("business_type") or "General",
            "phone": None if pd.isna(lead.get("phone")) else lead.get("phone"),
            "email": None if pd.isna(lead.get("email")) else lead.get("email"),
            "website": None if pd.isna(lead.get("website")) else lead.get("website"),
            "has_website": not pd.isna(lead.get("website")),
            "place_id": None if pd.isna(lead.get("place_id")) else lead.get("place_id"),
            "profit_score": None if pd.isna(lead.get("profit_score")) else int(lead.get("profit_score")),
            "ranking": None if pd.isna(lead.get("profit_score")) else int(lead.get("profit_score")),
            "status": lead.get("status") or "new",
            "notes": None if pd.isna(lead.get("notes")) else lead.get("notes"),
        })

    if not rows:
        return

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/leads?on_conflict=place_id"
    res = requests.post(url, headers=_headers(), json=rows, timeout=20)
    res.raise_for_status()
    log(f"Synced {len(rows)} leads to Supabase.")


def sync_sent_emails() -> None:
    if not _enabled():
        log("Supabase sent email sync skipped; missing Supabase env values.", level="debug")
        return

    sent_emails = load_sent_emails()
    if not sent_emails:
        return

    rows = [
        {
            "user_id": SUPABASE_USER_ID,
            "email_address": email,
            "email_type": "initial",
        }
        for email in sent_emails
    ]

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/sent_emails?on_conflict=user_id,email_address,email_type"
    res = requests.post(url, headers=_headers(), json=rows, timeout=20)
    res.raise_for_status()
    log(f"Synced {len(rows)} sent email records to Supabase.")
