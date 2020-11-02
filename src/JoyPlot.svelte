<script>
  import { onMount } from "svelte";
  import { select } from "d3-selection";
  import { scaleQuantile, scaleSqrt, scaleLinear } from "d3-scale";
  import {
    schemePurples,
    schemeSpectral,
    schemeYlGnBu,
    schemeYlGn,
    schemeBlues,
    schemeRdYlGn,
    schemeRdYlBu,
    schemeBrBG,
  } from "d3-scale-chromatic";
  import { sum, max, group, extent } from "d3-array";
  import { axisBottom } from "d3-axis";
  import { format } from "d3-format";
  // import { nest } from "d3-collection";

  export let width = 200;
  export let height = 200;
  console.log(height);
  export let metroData;
  console.log(metroData);
  const { chains, census } = metroData;
  console.log(chains);
  console.log(census);

  const margin = { top: 0, right: 0, bottom: 35, left: 0 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;

  const formatIncome = format("$,");

  let colorScale = scaleQuantile()
    .domain(Object.values(census))
    .range(schemeBrBG[11].slice(3, 8));

  console.log(extent(Object.values(census)));
  $: xScale = scaleLinear()
    .domain([0, max(Object.values(census))])
    .range([0, chartWidth]);
  $: xAxis = axisBottom(xScale).tickFormat(formatIncome);
  let xAxisG;

  // $: heightScale = scaleLinear()
  //   .domain([0, max(Object.values(chains[`c0`]))])
  //   .range([0, chartHeight / 2]);

  // onMount(() => {
  //   console.log(xAxisG);
  //   select(xAxisG).call(xAxis);
  // });
</script>

<style>
  /* your styles go here */
  svg {
    overflow: visible;
  }
</style>

<svg {width} {height}>
  <defs />
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g class="g-axis">
      <g
        class="g-x-axis"
        bind:this={xAxisG}
        transform={`translate(${0}, ${chartHeight})`} />
    </g>
    <g class="g-areas">
      {#each Object.keys(chains) as round}
        <g class={`g-area-${round}`} />
      {/each}
    </g>
  </g>
</svg>
