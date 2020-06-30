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

<style>
  .slope {
    width: 100%;
    /* height: 700px; */
    margin: 3rem auto;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .title {
    text-align: center;
    font-weight: 600;
  }
  img {
    width: 100%;
  }
</style>

<!-- <svg {width} {height}>
  <g transform={`translate(${margin.left},${margin.top})`}>
    <g class="g-axes">
      <g
        class="axis x-axis"
        bind:this={xAxisG}
        transform={`translate(0, ${chartHeight})`} />
      <g class="axis y-axis" bind:this={yAxisG}>
      </g>
    </g>
    <g class="g-lines" />
  </g>
</svg> -->

<div class="slope">
  <div class="image">
    <div class="title">C0-C1</div>
    <img src="slope.png" />
  </div>
  <div class="image">
    <div class="title">C1-C2</div>
    <img src="slope.png" />
  </div>
  <div class="image">
    <div class="title">C2-C3</div>
    <img src="slope.png" />
  </div>
  <div class="image">
    <div class="title">C3-C4</div>
    <img src="slope.png" />
  </div>
</div>
