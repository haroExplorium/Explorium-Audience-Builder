#!/usr/bin/env python3
"""Regenerate the Russell constituent lists from the matching iShares ETF holdings
file, which BlackRock publishes daily and is the standard public proxy for the
FTSE Russell constituent lists (Russell does not publish them for free).

Usage:
    python3 scripts/fetch_russell.py 1000    # -> data/russell-1000-companies.csv
    python3 scripts/fetch_russell.py 2000    # -> data/russell-2000-companies.csv
"""
import sys
import csv
import io
import pathlib
import urllib.request

INDEXES = {
    "1000": ("239707", "ishares-russell-1000-etf"),
    "2000": ("239710", "ishares-russell-2000-etf"),
}
DATA_DIR = pathlib.Path(__file__).resolve().parents[1] / "data"
COLUMNS = ["rank", "ticker", "company_name", "sector", "exchange", "location", "index_weight_pct"]


def is_stub(ticker: str, name: str, exchange: str) -> bool:
    """True for holdings that are not operating companies.

    The fund carries a handful of zero-weight residual positions left over from
    completed acquisitions: contingent value rights, escrow entries and unlisted
    vesting tranches. They are not Russell 2000 constituents.
    """
    name_u = name.strip().upper()
    return (
        ticker.strip() == "-"
        or "NO MARKET" in exchange.upper()
        or name_u.endswith(" CVR")
        or "ESCROW" in name_u
        or "VESTING" in name_u
    )


def download(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
            "Referer": url.rsplit("/", 1)[0],
        },
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read().decode("utf-8-sig")


def parse(raw: str):
    rows = list(csv.reader(io.StringIO(raw)))
    header_idx = next(i for i, r in enumerate(rows) if r and r[0].strip() == "Ticker")
    as_of = next((r[1] for r in rows[:header_idx] if r and r[0] == "Fund Holdings as of"), "")
    header = [c.strip() for c in rows[header_idx]]
    col = {name: i for i, name in enumerate(header)}

    holdings = []
    for row in rows[header_idx + 1:]:
        if not row or len(row) < len(header) or not row[col["Ticker"]].strip():
            continue
        if row[col["Asset Class"]].strip() != "Equity":
            continue  # drops cash, money market, collateral and futures lines
        if is_stub(row[col["Ticker"]], row[col["Name"]], row[col["Exchange"]]):
            continue
        holdings.append(
            {
                "ticker": row[col["Ticker"]].strip(),
                "company_name": row[col["Name"]].strip(),
                "sector": row[col["Sector"]].strip(),
                "exchange": row[col["Exchange"]].strip(),
                "location": row[col["Location"]].strip(),
                "index_weight_pct": row[col["Weight (%)"]].strip(),
            }
        )

    holdings.sort(key=lambda h: float(h["index_weight_pct"] or 0), reverse=True)
    for i, h in enumerate(holdings, start=1):
        h["rank"] = i
    return as_of, holdings


def main() -> None:
    index = sys.argv[1] if len(sys.argv) > 1 else "1000"
    if index not in INDEXES:
        sys.exit(f"Unknown index {index!r}; choose one of {', '.join(INDEXES)}")
    product_id, slug = INDEXES[index]
    url = f"https://www.ishares.com/us/products/{product_id}/{slug}/latest-holdings.csv"

    as_of, holdings = parse(download(url))
    out = DATA_DIR / f"russell-{index}-companies.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(holdings)
    print(f"Wrote {len(holdings)} companies to {out} (holdings as of {as_of})")


if __name__ == "__main__":
    main()
