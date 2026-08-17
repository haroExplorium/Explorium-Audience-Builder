#!/usr/bin/env python3
"""Classify each Russell 1000 company as B2C, B2B or Both, then write the
consumer-facing subset (B2C + Both) used as the audience seed list.

Method: every company inherits its sector's default posture, and companies that
break from that default are listed explicitly in OVERRIDES. This guarantees full
coverage (no company can be missed) and keeps every non-obvious judgement visible
in one place.

Classification rule is by END MARKET — who ultimately buys the product:
  B2C  sells to individual consumers
  B2B  sells only to businesses, institutions or governments
  Both meaningful revenue from consumers and from businesses

Per the brief, any company that sells to consumers at all counts as consumer-facing,
including retail banks, so B2C and Both are both kept in the output.

A consumer-brand manufacturer that reaches shoppers through retailers or dealers is
B2C (Whirlpool, Mattel). A component maker selling into someone else's product is
B2B (Aptiv, Lear, BorgWarner). A REIT is classified by who occupies the property:
apartments, self-storage and hotels serve consumers; offices, industrial and
net-lease serve businesses.

Usage: python3 scripts/classify_b2c.py
"""
import csv
import pathlib

DATA_DIR = pathlib.Path(__file__).resolve().parents[1] / "data"
SOURCE = DATA_DIR / "russell-1000-companies.csv"
ALL_OUT = DATA_DIR / "russell-1000-classified.csv"
B2C_OUT = DATA_DIR / "russell-1000-consumer-facing.csv"

SECTOR_DEFAULT = {
    "Consumer Discretionary": "B2C",
    "Consumer Staples": "B2C",
    "Communication": "Both",
    "Utilities": "Both",
    "Financials": "Both",
    "Energy": "B2B",
    "Materials": "B2B",
    "Real Estate": "B2B",
    "Health Care": "B2B",
    "Industrials": "B2B",
    "Information Technology": "B2B",
}

# Companies that depart from their sector default.
OVERRIDES = {}


def _add(cls, tickers):
    for t in tickers.split():
        assert t not in OVERRIDES, f"duplicate override {t}"
        OVERRIDES[t] = cls


# --- Consumer Discretionary (default B2C) ---------------------------------
# Components sold into OEM vehicles / trade-only distribution.
_add("B2B", "BWA APTV LEA GNTX QS POOL")
# Consumer brands that also carry a large trade, dealer or institutional channel.
_add("Both", "MHK LKQ GPC SGI BFAM ADT LOPE PAG ARMK BC ORLY AZO FND WHR")

# --- Consumer Staples (default B2C) ---------------------------------------
# Foodservice distributors and agricultural / ingredient processors.
_add("B2B", "SYY USFD PFGC ADM BG INGR DAR SEB")
# Consumer brands with substantial foodservice / private-label volume.
_add("Both", "PPC JBS TSN LW CART PRMB")

# --- Communication (default Both) -----------------------------------------
# Ad tech, agencies and wholesale carriers — the customer is a business.
_add("B2B", "APP OMC ASTS TTD NIQ")
# Pure consumer subscription / entertainment.
_add("B2C", "NFLX TTWO LYV RBLX MTCH MSGS SIRI")

# --- Utilities (default Both: regulated utilities serve households) --------
# Merchant generation and yieldcos selling wholesale power only.
_add("B2B", "TLN OKLO BEPC CWEN")

# --- Energy (default B2B) -------------------------------------------------
# Integrated majors and refiners with branded consumer fuel retail.
_add("Both", "XOM CVX MPC VLO PSX DINO")

# --- Materials (default B2B) ----------------------------------------------
_add("B2C", "SMG")
# Paints and building products sold through consumer retail as well as trade.
_add("Both", "SHW PPG RPM JHX")

# --- Financials (default Both: banks and insurers serve retail customers) --
# Market infrastructure, ratings, index and data providers.
_add("B2B", "SPGI MCO MSCI CME ICE NDAQ CBOE MKTX TW VIRT FDS")
# Alternative asset managers raising institutional capital.
_add("B2B", "KKR APO ARES CG OWL TPG BAM HLNE")
# Custody banks, advisor platforms and advisory-only investment banks.
_add("B2B", "STT BNY LPLA EVR LAZ HLI JEF")
# Merchant acquiring, payment processing and core banking software.
_add("B2B", "FISV FIS GPN JKHY WEX CPAY FOUR TOST")
# Reinsurers, excess and surplus, and commercial-only carriers.
_add("B2B", "RGA EG RNR WRB MKL AXS KNSL RLI CNA WTM AGO MTG")
# Commercial insurance brokers.
_add("B2B", "RYAN AON MRSH WTW")
# Mortgage REITs and wholesale-channel lenders.
_add("B2B", "AGNC NLY RITM STWD UWMC")
# Institutional crypto venues.
_add("B2B", "BLSH GLXY")
# Direct-to-consumer brokerages, neobanks, insurers and lenders.
_add("B2C", "HOOD CHYM NU XP FRHC PGR ALL GL PRI BHF SLM OMF WU RKT")

# --- Real Estate (default B2B: commercial landlords) ----------------------
# Residential, self-storage and hotel REITs — the occupant is a consumer.
_add("B2C", "PSA EXR CUBE AVB EQR ESS MAA UDR CPT INVH AMH SUI ELS HST JAN")
# Marketplaces serving both consumers and agents, and senior-housing operators.
_add("Both", "Z ZG CSGP HHH WELL VTR")

# --- Health Care (default B2B: sells to providers, payers, distributors) --
# Health plans, care delivery and consumer-facing diagnostics or devices.
_add(
    "Both",
    "UNH ELV CI HUM CNC MOH CVS HCA THC UHS EHC ENSG DVA CHE LH DGX "
    "ALGN DXCM PODD RMD ELAN VTRS NTRA GH COO",
)

# --- Industrials (default B2B) --------------------------------------------
_add("B2C", "LYFT UHAL UHALB")
# Passenger transport, parcel, residential services and consumer-brand tools.
_add(
    "Both",
    "UBER DAL UAL LUV AAL ALK UPS FDX FDXF WM RSG GFL ROL CAR GNRC "
    "MAS SWK TTC AOS OC TREX EFX TRU HAYW FBIN LII CARR TT CPRT DE "
    "MMM ALLE PNR MIDD",
)

# --- Information Technology (default B2B) ---------------------------------
_add("B2C", "GEN")
# Personal devices, retail components and prosumer / individual subscriptions.
_add(
    "Both",
    "AAPL MSFT INTC AMD NVDA MU WDC SNDK HPQ ZM ADBE INTU GDDY DBX "
    "DOCU ENPH UI DLB FICO",
)

# --- Sector reported as "Other" upstream ----------------------------------
_add("Both", "DELL")  # sells to consumers via Dell.com and to enterprise IT


def classify(row: dict) -> str:
    ticker = row["ticker"]
    if ticker in OVERRIDES:
        return OVERRIDES[ticker]
    default = SECTOR_DEFAULT.get(row["sector"])
    if default is None:
        raise KeyError(f"no default for sector {row['sector']!r} ({ticker})")
    return default


def main() -> None:
    rows = list(csv.DictReader(SOURCE.open()))
    known = {r["ticker"] for r in rows}
    unknown = set(OVERRIDES) - known
    if unknown:
        raise SystemExit(f"overrides reference tickers not in the index: {sorted(unknown)}")

    fields = list(rows[0].keys()) + ["audience_type"]
    for row in rows:
        row["audience_type"] = classify(row)

    with ALL_OUT.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    consumer = [r for r in rows if r["audience_type"] in ("B2C", "Both")]
    for i, row in enumerate(consumer, start=1):
        row["rank"] = i
    with B2C_OUT.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(consumer)

    counts = {c: sum(1 for r in rows if r["audience_type"] == c) for c in ("B2C", "Both", "B2B")}
    print(f"Classified {len(rows)} companies: {counts}")
    print(f"Wrote {ALL_OUT} (all) and {B2C_OUT} ({len(consumer)} consumer-facing)")


if __name__ == "__main__":
    main()
