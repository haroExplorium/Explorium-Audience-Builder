#!/usr/bin/env python3
"""Merge the per-round Explorium exports into one contact file.

Each round's CSV is joined back to its Russell 1000 ticker, de-duplicated by
prospect, ranked by seniority within each company, and written to
data/russell-1000-consumer-marketing-contacts.csv.

Usage: python3 scripts/merge_contacts.py <dir-of-round-csvs> [business-id-map.csv]

The optional business-id map (ticker,business_id) is only needed for rounds that
were fetched with an explicit business_id filter rather than a match reference
table; rows from those rounds carry no `business_input` column to join on.
"""
import csv
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = DATA / "russell-1000-consumer-marketing-contacts.csv"

# Names sent to Explorium that differ from the index file's company_name.
NAME_OVERRIDES = {
    "SERVICE CORPORATION INTERNATIONAL": "SCI",
    "GFL ENVIRONMENTAL": "GFL",
    "NEWS CORP CLASS A": "NWSA",
    "PEOPLE INC": "PPLI",
    "THE COOPER COMPANIES": "COO",
    "CELSIUS HOLDINGS": "CELH",
    "BOK FINANCIAL": "BOKF",
}

# Ordered most senior first; first pattern that matches wins.
SENIORITY = [
    (1, "C-level", r"\bchief\b|\bcmo\b|\bceo\b|\bcoo\b|\bcro\b"),
    (2, "President", r"(?<!vice )(?<!vice-)\bpresident\b"),
    (3, "EVP", r"\bevp\b|executive vice president"),
    (4, "SVP", r"\bsvp\b|senior vice president"),
    (5, "VP", r"\bvp\b|vice president"),
    (6, "Head of", r"\bhead of\b|\bglobal head\b|\bhead,\b"),
    (7, "Senior Director", r"senior director|sr\.? director|executive director"),
    (8, "Director", r"\bdirector\b"),
    (9, "Senior Manager", r"senior .*manager|sr\.? manager|general manager|senior manger"),
    (10, "Manager", r"\bmanager\b|\blead\b"),
]

COLUMNS = [
    "company_rank", "ticker", "company_name", "sector", "audience_type",
    "seniority_rank", "seniority_band", "person_rank_in_company",
    "full_name", "job_title", "email", "professional_email", "email_status",
    "mobile_phone", "other_phones", "country", "region", "city", "linkedin",
    "prospect_id",
]


def seniority(title: str):
    t = (title or "").lower()
    for rank, band, pattern in SENIORITY:
        if re.search(pattern, t):
            return rank, band
    return 99, "Other"


def first_value(raw: str) -> str:
    """Contact columns arrive as JSON lists or bare strings; take the first entry."""
    if not raw:
        return ""
    raw = raw.strip()
    if raw.startswith("["):
        try:
            vals = [str(v) for v in json.loads(raw) if v]
            return vals[0] if vals else ""
        except (ValueError, TypeError):
            return raw.strip("[]\"' ")
    return raw


def rest_values(raw: str) -> str:
    if not raw or not raw.strip().startswith("["):
        return ""
    try:
        vals = [str(v) for v in json.loads(raw) if v]
    except (ValueError, TypeError):
        return ""
    return "; ".join(vals[1:])


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    csv_dir = pathlib.Path(sys.argv[1])
    id_map_path = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None

    companies = list(csv.DictReader((DATA / "russell-1000-consumer-facing.csv").open()))
    by_name = {c["company_name"].strip().upper(): c for c in companies}
    by_ticker = {c["ticker"]: c for c in companies}

    bid_to_ticker = {}
    if id_map_path and id_map_path.exists():
        for row in csv.DictReader(id_map_path.open()):
            bid_to_ticker[row["business_id"]] = row["ticker"]

    rows, seen, unresolved = [], set(), set()
    for path in sorted(csv_dir.glob("r*.csv")):
        for r in csv.DictReader(path.open()):
            pid = r.get("prospect_id", "")
            if pid in seen:
                continue

            company = None
            raw_input = r.get("business_input")
            if raw_input:
                try:
                    name = json.loads(raw_input).get("name", "").strip().upper()
                except (ValueError, TypeError):
                    name = ""
                if name in NAME_OVERRIDES:
                    company = by_ticker.get(NAME_OVERRIDES[name])
                else:
                    company = by_name.get(name)
            if company is None:
                t = bid_to_ticker.get(r.get("business_id", ""))
                company = by_ticker.get(t) if t else None
            if company is None:
                unresolved.add(raw_input or r.get("business_id", "?"))
                continue

            seen.add(pid)
            rank, band = seniority(r.get("prospect_job_title", ""))
            rows.append({
                "company_rank": int(company["rank"]),
                "ticker": company["ticker"],
                "company_name": company["company_name"],
                "sector": company["sector"],
                "audience_type": company["audience_type"],
                "seniority_rank": rank,
                "seniority_band": band,
                "person_rank_in_company": 0,
                "full_name": r.get("prospect_full_name", ""),
                "job_title": r.get("prospect_job_title", ""),
                "email": first_value(r.get("contact_emails", "")),
                "professional_email": first_value(r.get("contact_professional_email", "")),
                "email_status": first_value(r.get("contact_professional_email_status", "")),
                "mobile_phone": first_value(r.get("contact_mobile_phone", "")),
                "other_phones": rest_values(r.get("contact_phone_numbers", ""))
                                or first_value(r.get("contact_phone_numbers", "")),
                "country": r.get("prospect_country_name", ""),
                "region": r.get("prospect_region_name", ""),
                "city": r.get("prospect_city", ""),
                "linkedin": r.get("prospect_linkedin", ""),
                "prospect_id": pid,
            })

    # Most senior first within each company; companies in index-weight order.
    rows.sort(key=lambda x: (x["company_rank"], x["seniority_rank"], x["full_name"]))
    counter = {}
    for row in rows:
        n = counter.get(row["ticker"], 0) + 1
        counter[row["ticker"]] = n
        row["person_rank_in_company"] = n

    with OUT.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} contacts across {len(counter)} companies to {OUT}")
    if unresolved:
        print(f"WARNING: {len(unresolved)} unresolved company keys: {sorted(unresolved)[:5]}")


if __name__ == "__main__":
    main()
