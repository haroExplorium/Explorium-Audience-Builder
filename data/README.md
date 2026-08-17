# Reference data

## `russell-1000-companies.csv`

Every company in the Russell 1000, one row per company.

| Column | Description |
| --- | --- |
| `rank` | Position by index weight, 1 = largest |
| `ticker` | Exchange ticker symbol |
| `company_name` | Issuer name as published by the source |
| `company_url` | Company website, `https://<domain>` |
| `sector` | GICS-style sector |
| `exchange` | Listing venue |
| `location` | Country of domicile |
| `index_weight_pct` | Weight in the index, percent |

**Source:** the daily holdings file for the iShares Russell 1000 ETF (IWB),
`https://www.ishares.com/us/products/239707/ishares-russell-1000-etf/latest-holdings.csv`.
FTSE Russell does not publish the constituent list for free, so the matching iShares
holdings file is the standard public proxy for it.

**Snapshot:** holdings as of Aug 13, 2026 — 1,021 companies.

### Caveats

- The index is named for 1,000 companies but rarely holds exactly that many.
  Membership drifts between the annual June reconstitution and quarterly IPO
  additions as constituents are acquired or delisted. Companies with multiple share
  classes (Alphabet, Fox, Liberty entities) appear once per listed class.
- Cash, money market, collateral and futures lines from the fund are excluded, as
  are zero-weight residual positions from completed acquisitions (contingent value
  rights, escrow entries, unlisted vesting tranches). They are fund artifacts, not
  constituents.
- `sector` is passed through verbatim from the source. One row (DELL) is reported
  upstream as `Other`.
- `company_url` is present for 1,014 of 1,021 companies (454 of 455 in the
  consumer-facing file). See "Company URLs" below.

### Regenerating

```bash
python3 scripts/fetch_russell.py 1000   # or 2000 for the Russell 2000
```

Rerun after the June reconstitution, or any time a current snapshot is needed.

---

## `russell-1000-classified.csv`

All 1,021 companies with an added `audience_type` column: `B2C`, `B2B` or `Both`.

## `russell-1000-consumer-facing.csv`

The 455 companies whose `audience_type` is `B2C` or `Both` — B2B-only companies
filtered out. `rank` is renumbered 1..455; every other column matches the classified
file.

### Method

Classification is by **end market** — who ultimately buys the product:

| Value | Meaning |
| --- | --- |
| `B2C` | Sells to individual consumers |
| `B2B` | Sells only to businesses, institutions or governments |
| `Both` | Meaningful revenue from consumers and from businesses |

Every company inherits a default posture from its sector, and companies that break
from that default are listed explicitly as overrides in
`scripts/classify_b2c.py`. This guarantees full coverage — no company can be missed —
and keeps every non-obvious judgement visible and reviewable in one place.

Judgement calls worth knowing about:

- A consumer-brand manufacturer that reaches shoppers through retailers or dealers
  counts as consumer-facing (Whirlpool, Mattel, Thor). A component maker selling into
  someone else's finished product does not (Aptiv, Lear, BorgWarner, Gentex).
- REITs are classified by who occupies the property. Apartments, self-storage,
  manufactured housing and hotels serve consumers; office, industrial, net-lease and
  healthcare-facility REITs serve businesses.
- Retail and regional banks are consumer-facing, per the brief. Market
  infrastructure, ratings agencies, alternative asset managers, custody banks,
  reinsurers and commercial insurance brokers are not.
- Regulated utilities are `Both` — they bill households and businesses. Merchant
  generators and yieldcos selling only wholesale power are `B2B`.
- Integrated oil majors and refiners with branded consumer fuel retail are `Both`;
  pure exploration and production is `B2B`.
- Pharmaceutical and medtech manufacturers are `B2B` (they sell to providers, payers
  and distributors) even where they advertise to patients. Health plans, care
  delivery and patient-purchased devices are `Both`.

### Distribution

| Sector | B2C | Both | B2B |
| --- | ---: | ---: | ---: |
| Communication | 7 | 36 | 5 |
| Consumer Discretionary | 95 | 14 | 6 |
| Consumer Staples | 43 | 6 | 8 |
| Energy | 0 | 6 | 29 |
| Financials | 14 | 88 | 57 |
| Health Care | 0 | 25 | 79 |
| Industrials | 3 | 34 | 158 |
| Information Technology | 1 | 19 | 130 |
| Materials | 1 | 4 | 48 |
| Real Estate | 15 | 6 | 42 |
| Utilities | 0 | 37 | 4 |
| Other | 0 | 1 | 0 |
| **Total** | **179** | **276** | **566** |

### Regenerating

```bash
python3 scripts/classify_b2c.py
```

---

## `russell-1000-consumer-marketing-contacts.csv`

Senior marketing people at the consumer-facing companies, with email and phone.
**12,666 contacts across 434 of the 444 companies**, up to 50 per company, most
senior first.

| Column | Description |
| --- | --- |
| `company_rank` | Company's rank in the consumer-facing list (by index weight) |
| `ticker`, `company_name`, `sector`, `audience_type` | Company identity, joined from the classified list |
| `seniority_rank` | 1 = C-level … 10 = Manager, 99 = other |
| `seniority_band` | C-level, President, EVP, SVP, VP, Head of, Senior Director, Director, Senior Manager, Manager, Other |
| `person_rank_in_company` | 1 = most senior marketer at that company |
| `full_name`, `job_title` | The person |
| `email`, `professional_email`, `email_status` | Contact email; `professional_email` is the verified work address where available |
| `mobile_phone`, `other_phones` | Contact phone numbers |
| `country`, `region`, `city`, `linkedin` | Location and profile |
| `prospect_id` | Explorium prospect identifier |

Rows are ordered by company (largest index weight first), then by seniority within
each company, so the top row for each company is its most senior marketer.

### How it was built

Explorium (Vibe Prospecting) in 25 batched rounds:

1. `match-business` — each company resolved by **name + verified domain**. Domains
   matter: name-only matching mis-resolved 2 of 20 in a control test, so
   `company-domains.csv` pins every company. Resolved IDs are recorded in
   `company-business-ids.csv`.
2. `fetch-entities` — prospects filtered to `job_department = marketing` and
   `job_level` in c-suite, president, vice president, director, senior manager,
   owner, founder, partner. Capped at 50 per company. Worldwide, not US-only.
3. `enrich-prospects` — contact details, both email and phone.
4. `export-to-csv`, then merged by `scripts/merge_contacts.py`.

### Coverage and caveats

- **82% have an email, 65% a phone, 63% both; 16% have neither.** You pay for the
  enrichment attempt whether or not a contact detail comes back, so the 16% are
  rows where Explorium held no contact details.
- **The median company yields 29 contacts, not 50.** 165 companies hit the 50 cap;
  the rest simply do not have 50 marketing people at director level or above in the
  data. 50 is a ceiling, not a quota.
- **10 companies returned no marketing contacts at all**: CHE, LBRDK, MDU, OGE,
  PHM, TFSL, UHS, UI, VSNT, WTRG. Mostly holding companies and utilities with thin
  people data. A recovery pass using alternate legal names and domains rescued 15
  other companies (Disney, Hershey, Reddit, Campbell, Synchrony among them), whose
  brand domains resolved to entities carrying no employee records.
- **Seniority skews mid-level**: ~4,200 Senior Manager and ~4,000 Director versus
  287 C-level. Small marketing organisations rarely carry a CMO in third-party data.
- Contacts are worldwide, so regional brand leads at overseas subsidiaries are
  included.
- Titles and names arrive lower-cased from the source and are left verbatim.

### Regenerating

Re-run the Explorium rounds, then:

```bash
python3 scripts/merge_contacts.py <dir-of-round-csvs> data/company-business-ids.csv
```

---

## Company URLs

`company_url` is added to all three company files by `scripts/add_company_url.py`,
which reads `company-domains.csv` (the hand-verified domains used to pin Explorium
company matching) and `company-domains-extra.csv` (the remaining constituents).

**Coverage: 1,014 of 1,021 companies**, and 454 of the 455 consumer-facing ones.

### How the domains were established

- Domains are the company's own corporate site, hand-verified per company. They are
  not taken wholesale from a data provider: Explorium's firmographics returns a
  `website` field, but it resolved Cisco to `ciscolifeconnections.com` rather than
  `cisco.com`, so it was used only where a company was too new or too obscure to
  identify confidently, and only when the returned record clearly matched the issuer.
- **Every domain is DNS-verified** — all 1,003 resolve. HTTP status is not a usable
  check here: roughly a fifth of these sites return 403/429 to automated clients.
  That sweep caught one real error (Dover is `dovercorporation.com`, not
  `dovercorp.com`) and eight companies whose apex has no A record, which are stored
  with their `www.` prefix.
- Companies with more than one listed share class share one website, so the
  secondary class inherits from its sibling (GOOG from GOOGL, FOX from FOXA, and so
  on).

### The 7 without a URL

`P` (Everpure), `Q` (Qnity Electronics), `MBGL` (Mobility Global), `KRMN` (Karman
Holdings), `MFP` (Midera Food Processing), `JAN` (Janus Living) and `FRMI` (Fermi).
All are recent listings or spin-offs whose corporate site could not be confirmed;
Explorium matched "Everpure" to a restaurant business and "Qnity Electronics" to an
unrelated beauty-education firm. Left blank deliberately — a wrong URL is worse than
an empty cell.

### Regenerating

```bash
python3 scripts/add_company_url.py
```
