<script>
  import { beforeUpdate } from "svelte";
  import { select } from "d3-selection";
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { axisLeft, axisBottom } from "d3-axis";

  export let width = 100;
  export let height = 100;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;
  $: xScale = scaleOrdinal()
    .domain(["C0", "C1", "C2", "C3", "C4"])
    .range([0, chartWidth]);

  $: yScale = scaleLinear().domain([0, 200000]).range([chartHeight, 0]);
  let xAxisG;
  let yAxisG;
  $: xAxis = axisBottom(xScale);
  $: yAxis = axisLeft(yScale)
    .tickSize(-chartWidth)
    // .tickPadding(tickSize * 1.25)
    .ticks(5);
</script>

<!-- <svg {width} {height}>
  <g transform={`translate(${margin.left},${margin.top})`}>
    <g class="g-axes">
      <g
        class="axis x-axis"
        bind:this={xAxisG}
        transform={`translate(0, ${chartHeight})`} />
      <g class="axis y-axis" bind:this={yAxisG}>
        <!-- <text
          class="y-axis-label"
          transform="translate(0,0.5)"
          text-anchor="start"
          y={-8}
          dy="0.32em">
          social distancing complaints
        </text> -->
      </g>
    </g>
    <g class="g-lines" />
  </g>
</svg> -->
