import csv, sys

SOURCE = "../data/processed/planets_processed.csv"

# Only the columns the charts use. Add a column here if your chart needs one.
COLUMNS = [
    "pl_name",
    # Q1/Q2
    "pl_orbper", "pl_orbeccen", "irradiation_ratio",
    # Q5/Q6
    "pl_bmasse", "pl_bmassprov", "pl_rade", "st_mass", "pl_orbsmax",
    "pl_orbeccenerr1", "pl_orbeccenerr2", "sy_snum", "days_bright",
    "q56_eligible", "lum_solar", "R_lower", "R_upper",
]

with open(SOURCE, newline="") as f:
    reader = csv.DictReader(f)
    missing = [c for c in COLUMNS if c not in reader.fieldnames]
    if missing:
        sys.exit(f"Missing columns in {SOURCE}: {missing}")
    writer = csv.DictWriter(sys.stdout, fieldnames=COLUMNS, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(reader)