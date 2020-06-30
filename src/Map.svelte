<script>
  import { feature, mesh } from "topojson";
  import { geoPath } from "d3-geo";
  import { geoConicConformal } from "d3-geo";
  import { scaleQuantile } from "d3-scale";
  import { schemeBrBG } from "d3-scale-chromatic";

  export let width = 200;
  export let height = 200;
  export let tracts;
  export let census;
  // export let projection;

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;

  let selectedTract = null;
  const features = feature(tracts, tracts.objects["tl_2019_06_tract"]);

  $: projection = geoConicConformal()
    .parallels([37 + 4 / 60, 38 + 26 / 60])
    .rotate([120 + 30 / 60], 0)
    .fitExtent(
      [
        [margin.left, margin.top],
        [chartWidth + margin.right, height + margin.bottom],
      ],
      features
    );
  $: svgPath = geoPath().projection(projection);

  const colorScale = scaleQuantile()
    .domain(Object.values(census))
    .range(schemeBrBG[6]);

  function handleMouseOver(d) {
    console.log(d);
    console.log(
      census[
        `${d.properties.STATEFP}${d.properties.COUNTYFP}${d.properties.TRACTCE}`
      ]
    );
    // selectedNabe = d;
  }

  const d = features.features[0];
</script>

<style>
  /* your styles go here */
  .tract {
    stroke: white;
    stroke-width: 0.25;
    /* stroke: #333;
    stroke-width: 0.5; */
  }
</style>

<svg {width} {height}>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g class="g-tracts">
      {#each features.features as d}
        <path
          class="tract"
          class:active={selectedTract && selectedTract.properties.name === d.properties.name}
          d={svgPath(d)}
          stroke="#e0e0e0"
          fill={colorScale(census[`${d.properties.STATEFP}${d.properties.COUNTYFP}${d.properties.TRACTCE}`])}
          on:mouseover={() => handleMouseOver(d)} />
      {/each}
    </g>
    <!-- 
    {#if selectedNabe}
      <text
        class="selected-nabe"
        transform={`translate(${svgPath.centroid(selectedNabe)})`}>
        {selectedNabe.properties.name}
      </text>
    {/if} -->
  </g>
</svg>
