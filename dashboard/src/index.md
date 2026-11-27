---
title: Overview
toc: false
---

# Extreme Years
Exploring the diversity of planetary year lengths and stellar irradiation among confirmed exoplanets.

```js
const planets = FileAttachment("data/planets_story.csv").csv({typed: true});
```

<!-- <div class="grid grid-cols-3">
  <div class="card"><h2>Confirmed planets analysed</h2><span class="big">${planets.length.toLocaleString("en-US")}</span></div>
  <div class="card"><h2>Brief bursts</h2><span class="big">${planets.filter(d => d.exposure === "burst").length.toLocaleString("en-US")}</span></div>
  <div class="card"><h2>Measured eccentricity</h2><span class="big">${planets.filter(d => d.e_quality === "measured").length.toLocaleString("en-US")}</span></div>
</div> -->

<div class="grid grid-cols-4">
  <a class="card" href="./q1-q2"><h2>Q1–Q2</h2>How different can planetary years be, and which change the most?</a>
  <a class="card" href="./q3"><h2>Eccentricity & starlight</h2>How does eccentricity affect the starlight a planet receives?</a>
  <a class="card" href="./q4"><h2>Bursts or prolonged exposure</h2>Are extreme years brief bursts of intense irradiation or prolonged exposure?</a>
  <a class="card" href="./q5-q6"><h2>Q5–Q6</h2>Which characteristics relate to extremes, and which five years are wildest?</a>
</div>
