#!/usr/bin/env python3
"""Add a `company_url` column to the Russell 1000 company files.

Domains come from data/company-domains.csv (hand-verified for the consumer-facing
set, and used to pin Explorium company matching) plus data/company-domains-extra.csv
(the remaining constituents, resolved from Explorium firmographics).

Companies with more than one listed share class share a single website, so a class
whose ticker has no domain of its own inherits it from its sibling.

Usage: python3 scripts/add_company_url.py
"""
import csv
import pathlib

DATA = pathlib.Path(__file__).resolve().parents[1] / "data"
FILES = [
    "russell-1000-companies.csv",
    "russell-1000-classified.csv",
    "russell-1000-consumer-facing.csv",
]

# Secondary share class -> the class carrying the domain.
SHARE_CLASS_SIBLING = {
    "GOOG": "GOOGL", "BFA": "BFB", "FOX": "FOXA", "LBRDA": "LBRDK",
    "LBTYK": "LBTYA", "LLYVA": "LLYVK", "FWONA": "FWONK", "NWS": "NWSA",
    "UHALB": "UHAL", "ZG": "Z", "LENB": "LEN",
}


def load_domains() -> dict:
    domains = {}
    for name in ("company-domains.csv", "company-domains-extra.csv"):
        path = DATA / name
        if not path.exists():
            continue
        for row in csv.DictReader(path.open()):
            if row.get("domain"):
                domains.setdefault(row["ticker"], row["domain"].strip().lower())
    for secondary, primary in SHARE_CLASS_SIBLING.items():
        if primary in domains:
            domains.setdefault(secondary, domains[primary])
    return domains


def main() -> None:
    domains = load_domains()
    for name in FILES:
        path = DATA / name
        rows = list(csv.DictReader(path.open()))
        fields = [f for f in rows[0].keys() if f != "company_url"]
        # Sit the URL next to the company name rather than at the end.
        insert_at = fields.index("company_name") + 1
        fields = fields[:insert_at] + ["company_url"] + fields[insert_at:]

        missing = []
        for row in rows:
            domain = domains.get(row["ticker"])
            row["company_url"] = f"https://{domain}" if domain else ""
            if not domain:
                missing.append(row["ticker"])

        with path.open("w", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)

        filled = len(rows) - len(missing)
        print(f"{name}: {filled}/{len(rows)} URLs" + (f" | missing: {missing}" if missing else ""))


if __name__ == "__main__":
    main()
