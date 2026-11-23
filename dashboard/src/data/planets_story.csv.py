# Framework runs this when the site builds, with dashboard/ as the working directory.
# Whatever it prints becomes data/planets_story.csv.
import shutil, sys

SOURCE = "../data/processed/planets_story.csv"

with open(SOURCE, newline="") as f:
    shutil.copyfileobj(f, sys.stdout)
