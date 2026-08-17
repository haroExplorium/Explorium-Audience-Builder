# Reference data

## `russell-2000-companies.csv`

Every company in the Russell 2000, one row per company.

| Column | Description |
| --- | --- |
| `rank` | Position by index weight, 1 = largest |
| `ticker` | Exchange ticker symbol |
| `company_name` | Issuer name as published by the source |
| `sector` | GICS-style sector |
| `exchange` | Listing venue |
| `location` | Country of domicile |
| `index_weight_pct` | Weight in the index, percent |

**Source:** the daily holdings file for the iShares Russell 2000 ETF (IWM),
`https://www.ishares.com/us/products/239710/ishares-russell-2000-etf/latest-holdings.csv`.
FTSE Russell does not publish the constituent list for free, so the IWM holdings
file is the standard public proxy for it.

**Snapshot:** holdings as of Aug 13, 2026 — 1,956 companies.

### Caveats

- The index is named for 2,000 companies but rarely holds exactly that many.
  Membership drifts between the annual June reconstitution and quarterly IPO
  additions as constituents are acquired or delisted.
- Cash, money market, collateral and futures lines from the fund are excluded, as
  are zero-weight residual positions from completed acquisitions (contingent value
  rights, escrow entries, unlisted vesting tranches). They are fund artifacts, not
  constituents.
- Weights sum to ~99.6%; the remainder is the fund's cash and futures overlay.

### Regenerating

```bash
python3 scripts/fetch_russell_2000.py
```

Rerun after the June reconstitution, or any time a current snapshot is needed.
