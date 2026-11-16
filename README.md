# Extreme Years: Exploring Exoplanetary Orbits and Irradiation

## Project Overview

**Extreme Years** is an information visualization project developed by Team Vizards as part of the Information Visualization course at New York University.

The project explores the diversity of planetary year lengths and stellar irradiation patterns among confirmed exoplanets. Using data from the NASA Exoplanet Archive, it investigates how orbital eccentricity, planetary characteristics, and stellar properties relate to variations in irradiation throughout a planetary year.

The project uses D3.js and Observable to develop interactive visualizations that support exploratory analysis, comparison, and identification of extreme planetary conditions.

## Dataset

**Source:** [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)

**Dataset:** Planetary Systems Composite Parameters (PSCompPars)

The project uses a shared snapshot of the NASA Exoplanet Archive, with preprocessing performed using Python and Pandas in Google Colab.

## Data Preprocessing

Data preprocessing is performed using Python and Pandas in Google Colab, using the NASA Planetary Systems Composite Parameters (PSCompPars) dataset.

The preprocessing pipeline includes:

- **Data cleaning:** Excluding controversial planetary records and validating orbital parameters.
- **Irradiation contrast:** Calculating the ratio of maximum to minimum stellar irradiation from orbital eccentricity.
- **Missing-value estimation:** Estimating missing orbital semi-major axes using Kepler's third law and stellar insolation using the inverse-square law, while recording the source of each value.
- **Eccentricity classification:** Categorizing eccentricity values as measured, recorded zero, or unusable.
- **Peak irradiation:** Calculating maximum stellar irradiation at closest orbital approach.
- **Exposure duration:** Estimating the fraction and number of days spent above half of peak irradiation.
- **Exposure classification:** Categorizing irradiation patterns as brief bursts or prolonged exposure using a 25% orbital-duration threshold.

The resulting dataset retains 6,393 non-controversial planetary records and preserves the original NASA attributes alongside derived metrics. Visualization-specific filtering, ranking, and binning are performed separately in Observable.

## Visualizations

The project combines histograms, scatter plots, ranked comparisons, orbital light curves, beeswarm plots, box plots and heatmaps to explore exoplanetary orbital behavior and irradiation extremes.

The visualizations examine planetary year-length distributions, irradiation contrast, the influence of orbital eccentricity, peak irradiation and exposure duration and relationships between planetary and stellar characteristics.

The project also includes comparative visualizations of the five most extreme planetary years, incorporating uncertainty estimates and orbital geometry.

Interactive features are designed to support linked exploration, parameter adjustment, filtering, and comparison across visualizations. Implementation details and progress are documented in the project milestones.

## Repository Structure

```text
ExtremeYears/
├── README.md
├── data/
│   ├── raw/
│   └── processed/
├── preprocessing/
└── milestones/

```

| Directory | Description |
|---|---|
| `data/` | Original NASA dataset snapshot and processed datasets |
| `preprocessing/` | Google Colab notebooks for data cleaning, transformation, and feature derivation |
| `milestones/` | Project milestone reports and deliverables |

## Technologies

- **D3.js** — Data visualization and interactive chart development
- **Observable** — Development and execution of D3 visualizations
- **Python / Pandas** — Data preprocessing and analysis
- **Google Colab** — Collaborative preprocessing environment
- **NASA Exoplanet Archive** — Exoplanetary data source

## Project Resources

- **GitHub Repository:** [ExtremeYears](https://github.com/Apoorva-Menon/ExtremeYears)
- **Data Preprocessing Notebook:** [Google Colab](https://colab.research.google.com/drive/1qrz063Ggl2ubwh1NG1slJKJ1rrTny_qo?usp=sharing)
- **Observable Notebooks:** Links to be added

## Running the Visualizations

The D3 visualizations are developed in Observable notebooks.

1. Open the relevant Observable notebook.
2. Ensure the corresponding processed dataset is accessible.
3. Run the notebook cells to render and interact with the visualizations.

The preprocessing workflow is available through the linked Google Colab notebook.

## Team

**Team Vizards**

- Apoorva Menon
- Anna Susan Cherian
- Mitran Ramesh Kumar

**Course:** Information Visualization

Detailed domain questions, visualization designs, preprocessing decisions and evaluation are documented in the project milestone reports.