// Q3–Q4 chart settings and drawing functions, copied from the Milestone #3 Observable notebook.
// The page (src/q3-q4.md) prepares the data and calls these functions.
import * as d3 from "npm:d3";

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const graphConfig = ({
  maxEcc: 0.95,          // largest eccentricity on the slider and histogram
  binWidth: 0.025,       // each histogram bar covers 0.025 of eccentricity
  timeSteps: 400,        // how many moments of the year we calculate for the light curve
  keplerSteps: 50,       // how many times we refine the Kepler guess (more = more exact)
  chartWidth: 640,
  chartHeight: 260,
  margin: { top: 20, right: 20, bottom: 45, left: 55 }
});

export const peakConfig = ({
  minPower: -4,   // peak starlight's smallest value is 10^-4
  maxPower: 5,    // peak starlight's largest value is 10^5
  binWidth: 0.2,
  defaultTopPercent: 20 //slider starts at 'top 20%''
});

export const swarmConfig = {
  burstShare: 0.25,       // below 25% of the year near peak = a "burst" year
  fullYearShare: 0.999,   // at or above this, the planet is near peak all year (counts as 100%)
  dotRadius: 4,           // size of each dot in pixels
  dotPadding: 1,          // extra space between neighbouring dots
  centerPull: 0.05,       // how strongly dots are pulled toward the middle line (0 = not at all, 1 = very strongly)
  simulationSteps: 200,   // how many times the dot-placing simulation runs
  fullYearArea: 140,      // space on the right for the 100% bar and its label
  chartHeight: 300
};

export const heatConfig = {
  minPower: -4,        // x-axis starts at 10^-4 = 0.0001 × Earth
  maxPower: 5,         // x-axis ends at 10^5 = 100,000 × Earth
  xStep: 0.25,         // each column covers 0.25 powers of ten
  yStep: 0.05,         // each row covers 0.05 of eccentricity
  maxEcc: 1,        // top of the y-axis
  curveStep: 0.01,     // how finely we draw the orange boundary curve
  chartHeight: 380
};

// ---------------------------------------------------------------------------
// Q3 — Eccentricity histogram
// ---------------------------------------------------------------------------

export function drawHistogram(eccs, selectedEcc) {
  const { chartWidth, chartHeight, margin, maxEcc, binWidth } = graphConfig;

  // group eccentricities into bars
  const bins = d3.bin()
    .domain([0, maxEcc])
    .thresholds(d3.range(0, maxEcc, binWidth))
    (eccs);

  //x: 0 to maxEcc - converting data points to pixel points
  const x = d3.scaleLinear()
    .domain([0, maxEcc])
    .range([margin.left, chartWidth - margin.right]);

  //y: 0 to max number of planets in bin
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, bin => bin.length)])
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  //creating empty svg to draw in
  const svg = d3.create("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);

  // leave 1px space between bars
  const barGap = 1;

  //one rectangle per bin
  svg.append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", bin => x(bin.x0) + barGap)  //bin.x0 - where bar stars
      .attr("width", bin => x(bin.x1) - x(bin.x0) - barGap) // bin.x1 - where bar ends
      .attr("y", bin => y(bin.length))
      .attr("height", bin => y(0) - y(bin.length));

  //Axes
  // X-axis
  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Y-axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  //Axis titles
  // X-axis
  svg.append("text")
    .attr("x", (margin.left + chartWidth - margin.right) / 2)
    .attr("y", chartHeight - 8)
    .attr("text-anchor", "middle")
    .text("Eccentricity");

  // Y-axis
  svg.append("text")
    .attr("transform", `translate(14, ${chartHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Number of planets");

  // A red marker to show where the current slider value is
  svg.append("line")
    .attr("x1", x(selectedEcc))
    .attr("x2", x(selectedEcc))
    .attr("y1", margin.top)
    .attr("y2", chartHeight - margin.bottom)
    .attr('stroke', 'crimson')
    .attr('stroke-width', 2);

  return svg.node();
}

// ---------------------------------------------------------------------------
// Q3 — Light curve
// ---------------------------------------------------------------------------

// Kepler's equation: M = E - esinE, which relates time(M) to position on orbit(E)
// Since E cannot be obtained be obtained directly from equation, we guess and improve.
export function solveKepler(meanAnomaly, e){
  //initial guess
  let E = Math.PI;
  for(let step = 0; step < graphConfig.keplerSteps; step++){
    const error = E - e * Math.sin(E) - meanAnomaly;
    E = E - error / (1 - e * Math.cos(E));
  }
  return E;
}

export function relativeStarlight(t, e){
  //Mean anomaly(M): expreses time of the year as angle.
  //For M = 2 * PI * t, when t = 0 and t = 1 will be closest approach.
  //This will cause spike to be on the two ends of the graph, to bring the spike
  //to the middle, we shift the year by 0.5 and %1 ensures it remains within 0 and 2*PI.
  const meanAnomaly = 2 * Math.PI * ((t + 0.5) % 1);
  const E = solveKepler(meanAnomaly, e);
  const distance = 1 - e * Math.cos(E);
  return Math.sqrt(1 - e * e) / (distance * distance);
}

export function drawLightCurve(points){
  const {chartWidth, chartHeight, margin} = graphConfig;
  const xTitleGap = 8;   //distance of x-axis title from the bottom edge
  const yTitleGap = 14;  //distance of y-axis title from the left edge
  const labelGap = 6;

  //highest starlight value in the year
  const peak = d3.max(points, d => d.starlight);

  //x: fraction of the year (0 and 1)
  const x = d3.scaleLinear()
    .domain([0,1])
    .range([margin.left, chartWidth - margin.right]);

  //y: starlight (0 to a bit above the peak)
  const y = d3.scaleLinear()
    .domain([0, peak * 1.1])
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  const svg = d3.create("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);

  const area = d3.area()
    .x(d => x(d.t))
    .y0(y(0))
    .y1(d => y(d.starlight));

  svg.append("path")
    .attr("d", area(points))
    .attr("fill", "orange")
    .attr("fill-opacity", 0.3);

  const line = d3.line()
    .x(d => x(d.t))
    .y(d => y(d.starlight));

  svg.append("path")
    .attr("d", line(points))
    .attr("fill", "none")
    .attr("stroke", "darkorange")
    .attr("stroke-width", 2);

  // average starlight a planet recieves
  const averageLevel = 1;

  svg.append("line")
    .attr("x1", margin.left)
    .attr("x2", chartWidth - margin.right)
    .attr("y1", y(averageLevel))
    .attr("y2", y(averageLevel))
    .attr("stroke", "gray")
    .attr("stroke-dasharray", "4 4");

  svg.append("text")
    .attr("x", chartWidth - margin.right)
    .attr("y", y(averageLevel) - labelGap)
    .attr("text-anchor", "end")
    .attr("fill", "gray")
    .text("year average");

  // x - axis custom tick labels
  const xLabels = {
    0: "farthest",
    0.25: "1/4th year",
    0.5: "closest approach",
    0.75: "3/4th year",
    1: "farthest"
  };

  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues([0, 0.25, 0.5, 0.75, 1])
      .tickFormat(t => xLabels[t]));

  //y - axis ticks
  svg.append('g')
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(value => value + "x"));

  // Axis Titles
  // x - axis
  svg.append("text")
    .attr("x", (margin.left + chartWidth - margin.right) / 2)
    .attr("y", chartHeight - xTitleGap)
    .attr("text-anchor", "middle")
    .text("Time through one year");

  // y - axis
  svg.append("text")
    .attr("transform", `translate(${yTitleGap}, ${chartHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Starlight ÷ year average");

  return svg.node();
}

// ---------------------------------------------------------------------------
// Q4 — Peak starlight histogram
// ---------------------------------------------------------------------------

//Histogram that shows the number of planets for on the different peak starlight values
export function drawPeakHistogram(values, cutoffValue){
  const {chartWidth, chartHeight, margin} = graphConfig;
  const {minPower, maxPower, binWidth} = peakConfig;

  const xTitleGap = 8;
  const yTitleGap = 14;
  const labelGap = 6;

  const minValue = 10 ** minPower;
  const maxValue = 10 ** maxPower;

  const bins = d3.bin()
    .value(value => Math.log10(value))
    .domain([minPower, maxPower])
    .thresholds(d3.range(minPower, maxPower, binWidth))
    (values);

  const x = d3.scaleLog()
    .domain([minValue, maxValue])
    .range([margin.left, chartWidth - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, bin => bin.length)])
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  const svg = d3.create('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);

  //a light shaded rectangle over the extreme values
  svg.append("rect")
    .attr("x", x(cutoffValue))
    .attr("width", x(maxValue) - x(cutoffValue))
    .attr("y", margin.top)
    .attr("height", chartHeight - margin.top - margin.bottom)
    .attr("fill", "orange")
    .attr("fill-opacity", 0.1);

  const barGap = 1;

  //drawing bins
  svg.append('g')
    .selectAll("rect")
    .data(bins)
    .join('rect')
      .attr("x", bin => x(10 ** bin.x0) + barGap)
      .attr("width", bin => x(10 ** bin.x1) - x(10 ** bin.x0) - barGap)
      .attr("y", bin => y(bin.length))
      .attr("height", bin => y(0) - y(bin.length))
      .attr("fill", bin => 10 ** bin.x0 >= cutoffValue ? "darkorange" : "steelblue");

  //cutoff line
  svg.append("line")
    .attr("x1", x(cutoffValue))
    .attr("x2", x(cutoffValue))
    .attr("y1", margin.top)
    .attr("y2", chartHeight - margin.bottom)
    .attr("stroke", "darkorange")
    .attr("stroke-width", 2);

  //cutoff line label
  svg.append("text")
    .attr("x", x(cutoffValue) + labelGap)
    .attr("y", margin.top + labelGap * 2)
    .attr("fill", "darkorange")
    .text(`cut-off: ${d3.format(",.0f")(cutoffValue)} × Earth`);

  //x - axis tick values
  const tickValues = d3.range(minPower, maxPower + 1).map(power => 10 ** power);

  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues(tickValues)
      .tickFormat(d3.format(",")));

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(5));

  //Axis title
  svg.append("text")
    .attr("x", (margin.left + chartWidth - margin.right) / 2)
    .attr("y", chartHeight - xTitleGap)
    .attr("text-anchor", "middle")
    .text("Peak starlight at closest approach (Earth = 1)");

  svg.append("text")
    .attr("transform", `translate(${yTitleGap}, ${chartHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Number of planets");

  return svg.node();
}

// ---------------------------------------------------------------------------
// Q4 — Beeswarm
// ---------------------------------------------------------------------------

export function drawBeeswarm(dotPlanets, fullYearGroup){
  const {chartWidth, margin} = graphConfig;
  const {burstShare, dotRadius, dotPadding, centerPull, simulationSteps, fullYearArea, chartHeight} = swarmConfig;

  const xTitleGap = 8;
  const labelGap = 6;
  const middleY = (margin.top + chartHeight - margin.bottom)/2;

  // define x-axis values
  const x = d3.scaleLinear()
  .domain([0,1])
  .range([margin.left, chartWidth - margin.right - fullYearArea]);

  // creating a mapping to its x and y values
  const nodes = dotPlanets.map(planet => ({
    planet: planet,
    x: x(planet.above_half_peak_time),
    y: middleY
  }));

  const simulation = d3.forceSimulation(nodes)
    //pulls dot towards its true x position
    .force("x", d3.forceX(node => x(node.planet.above_half_peak_time)).strength(1))
    // pulls dot towards the middle line
    .force("y", d3.forceY(middleY).strength(centerPull))
    //pushes overlapping dots apart
    .force("collide", d3.forceCollide(dotRadius + dotPadding))
    .stop();

  simulation.tick(simulationSteps);

  const svg = d3.create("svg")
    .attr("height", chartHeight)
    .attr("width", chartWidth)
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12);

  //shade the burst zone
  svg.append("rect")
    .attr("x", x(0))
    .attr("width", x(burstShare) - x(0))
    .attr("y", margin.top)
    .attr("height", chartHeight - margin.top - margin.bottom)
    .attr("fill", "orange")
    .attr("fill-opacity", 0.1);

  //draw a threshold line
  svg.append("line")
    .attr("x1", x(burstShare))
    .attr("x2", x(burstShare))
    .attr("y1", margin.top)
    .attr("y2", chartHeight - margin.bottom)
    .attr("stroke", "darkorange")
    .attr("stroke-dasharray", "4 4");

  // Counts of planet experiencing burst and prolonged starlight
  const burstCount = dotPlanets.filter(d => d.above_half_peak_time < burstShare).length;
  const prolongedCount = dotPlanets.length - burstCount + fullYearGroup.length;

  svg.append("text")
    .attr("x", x(0) + labelGap)
    .attr("y", margin.top + labelGap * 2)
    .attr("fill", "darkorange")
    .attr("font-weight", "bold")
    .text(`BURSTS = ${burstCount}`);

  svg.append("text")
    .attr("x", x(burstShare) + labelGap)
    .attr("y", margin.top + labelGap * 2)
    .attr("fill", "steelblue")
    .attr("font-weight", "bold")
    .text(`PROLONGED = ${prolongedCount.toLocaleString()}`);

  //drawing each node and also a tooltip for each point
  svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("cx", node => node.x)
      .attr("cy", node => node.y)
      .attr("r", dotRadius)
      .attr("fill", node => node.planet.above_half_peak_time < burstShare ? "darkorange" : "steelblue")
    .append("title")
      .text(node => `${node.planet.pl_name}
      Year: ${d3.format(",.1f")(node.planet.pl_orbper)} days
      Eccentricity: ${node.planet.e}
      Peak starlight: ${d3.format(",.0f")(node.planet.S_peak)} × Earth
      Near peak for ${d3.format(".1%")(node.planet.above_half_peak_time)} of the year`);

  // Many of the planets experience their peak starlight throught their year owing to their eccentricity being 0
  // Group all such planets to a single rectangle at the end of the graph
  const recordedZeroCount = fullYearGroup.filter(d => d.e_quality === "recorded_zero").length;
  const barWidth = dotRadius * 4;
  const barX = x(1) - barWidth / 2;
  const textX = barX + barWidth + labelGap;

  svg.append("rect")
    .attr("x", barX)
    .attr("y", margin.top)
    .attr("width", barWidth)
    .attr("height", chartHeight - margin.top - margin.bottom - 3)
    .attr("fill", "steelblue");

  // text to show how many such planets are included in the rectangle
  svg.append("text")
    .attr("x", textX)
    .attr("y", middleY - labelGap * 2)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("fill", "steelblue")
    .text(fullYearGroup.length.toLocaleString());

  svg.append("text")
    .attr("x", textX)
    .attr("y", middleY + labelGap)
    .text("near peak all year");

  //of those considered to receive 100% peak starlight, how many had their eccentricity recorded 0.
  svg.append("text")
    .attr("x", textX)
    .attr("y", middleY + labelGap * 4)
    .attr("fill", "gray")
    .text(`(${recordedZeroCount} recorded e = 0)`);

  // X-axis ticks
  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x)
      .ticks(10)
      .tickFormat(d3.format(".0%")));

  // X-axis title
  svg.append("text")
    .attr("x", (margin.left + x(1)) / 2)
    .attr("y", chartHeight - xTitleGap)
    .attr("text-anchor", "middle")
    .text("Share of the year spent above half of peak starlight");

  return svg.node();
}

// ---------------------------------------------------------------------------
// Q4 — Heatmap
// ---------------------------------------------------------------------------

export function columnOf(planet){
  return Math.floor((Math.log10(planet.pl_insol) - heatConfig.minPower) / heatConfig.xStep);
}

export function rowOf(planet){
  return Math.floor(planet.e / heatConfig.yStep);
}

export function drawHeatmap(cells, cutoffValue, burstLine){
  const {chartWidth, margin} = graphConfig;
  const {minPower, maxPower, xStep, yStep, maxEcc, curveStep, chartHeight} = heatConfig;

  const xTitleGap = 8;
  const yTitleGap = 14;
  const labelGap = 6;

  //x values
  const x = d3.scaleLog()
    .domain([10**minPower, 10**maxPower])
    .range([margin.left, chartWidth - margin.right]);

  //y values
  const y = d3.scaleLinear()
    .domain([0, maxEcc])
    .range([chartHeight - margin.bottom, margin.top]);

  // the color of the cells
  const color = d3.scaleSequentialLog(d3.interpolateBlues)
    .domain([1, d3.max(cells, cell => cell.count)]);

  const svg = d3.create('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12);

  // creating the cells
  const columnStart = column => 10 ** (minPower + column * xStep);   // starlight at a column's left edge
  const rowStart    = row    => row * yStep;

  svg.append("g")
    .selectAll("rect")
    .data(cells)
    .join("rect")
      .attr("x", cell => x(columnStart(cell.column)))
      .attr("width", cell => x(columnStart(cell.column + 1)) - x(columnStart(cell.column)))
      .attr("y", cell => y(rowStart(cell.row + 1)))
      .attr("height", cell => y(rowStart(cell.row)) - y(rowStart(cell.row + 1)))
      .attr("fill", cell => color(cell.count))
    .append("title")
      .text(cell => `${cell.count} planets`);

  //drawing the burst line
  svg.append("line")
    .attr("x1", margin.left)
    .attr("x2", chartWidth - margin.right)
    .attr("y1", y(burstLine))
    .attr("y2", y(burstLine))
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4 4");

  svg.append("text")
    .attr("x", margin.left + labelGap)
    .attr("y", y(burstLine) - labelGap)
    .attr("font-weight", "bold")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke")
    .text(`Above this line, a year is a burst (e > ${burstLine.toFixed(2)})`);

  // For each eccentricity, the starlight at which the PEAK reaches the cut-off
  const boundaryPoints = d3.range(0, maxEcc + curveStep, curveStep).map(e => ({
    insol: cutoffValue * (1 - e) ** 2,
    e: e
  }));

  svg.append("path")
    .attr("d", d3.line()
      .x(point => x(point.insol))
      .y(point => y(point.e))
      (boundaryPoints))
    .attr("fill", "none")
    .attr("stroke", "darkorange")
    .attr("stroke-width", 2);

  svg.append("text")
    .attr("x", x(cutoffValue) + labelGap)
    .attr("y", y(0) - labelGap)
    .attr("fill", "darkorange")
    .attr("font-weight", "bold")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke")
    .text("extreme peak --> ");

  //label extreme burst corner
  svg.append("text")
    .attr("x", chartWidth - margin.right - labelGap)
    .attr("y", margin.top + labelGap * 2)
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .attr("fill", "darkorange")
    .text("Extreme bursts");

  const tickValues = d3.range(minPower, maxPower + 1).map(power => 10 ** power);

  // x - axis ticks
  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues(tickValues)
      .tickFormat(d3.format(",")));

  // y - axis ticks
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(6));

  //x-axis title
  svg.append("text")
    .attr("x", (margin.left + chartWidth - margin.right) / 2)
    .attr("y", chartHeight - xTitleGap)
    .attr("text-anchor", "middle")
    .text("Starlight at the planet's average distance (Earth = 1)");

  // y-axis title
  svg.append("text")
    .attr("transform", `translate(${yTitleGap}, ${chartHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Eccentricity ");

  return svg.node();
}
