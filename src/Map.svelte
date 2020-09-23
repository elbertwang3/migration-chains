<script>
  import { feature, mesh } from "topojson";
  import { geoPath } from "d3-geo";
  import { geoConicConformal } from "d3-geo";
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
  import { sum, max, group } from "d3-array";
  // import { nest } from "d3-collection";

  export let width = 200;
  export let height = 200;
  export let metroData;
  export let round;
  export let projection;
  const { chains, tracts, census } = metroData;

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;

  let features = feature(
    tracts,
    tracts.objects[Object.keys(tracts.objects)[0]]
  );
  $: projection = projection.fitExtent(
    [
      [margin.left, margin.top],
      [chartWidth + margin.right, height + margin.bottom],
    ],
    features
  );
  $: svgPath = geoPath().projection(projection);

  // let censusDict = census.reduce((obj, item) => {
  //   obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
  //     item.med_hh_inc;
  //   return obj;
  // }, {});

  let colorScale = scaleQuantile()
    .domain(Object.values(census))
    .range(schemeBrBG[11].slice(3, 8));

  $: heightScale = scaleLinear()
    .domain([0, max(Object.values(chains[`c0`]))])
    .range([0, chartHeight / 2]);

  // function handleClick(d) {
  //   console.log("click!");
  //   if (c0tracts.includes(d.properties.GEOID)) {
  //     console.log(d.properties.GEOID);
  //     initialTract = d.properties.GEOID;
  //   }
  // }
</script>

<style>
  /* your styles go here */
  svg {
    overflow: visible;
  }
  .tract {
    stroke: white;
    stroke-width: 0.1;
    fill-opacity: 1;
  }
  .c0-tract {
    stroke: red;
    stroke-width: 1;
  }

  .migration-triangle {
    fill: url(#triangleGradient);
    stroke: #cc0000;
  }
</style>

<svg {width} {height}>
  <defs>
    <linearGradient id="triangleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#f2f2f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#cc0000;stop-opacity:1" />
    </linearGradient>
    <linearGradient
      id="triangleStrokeGradient"
      x1="0%"
      y1="100%"
      x2="0%"
      y2="0%">
      <stop offset="0%" style="stop-color:#e00;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#600;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g class="g-tracts">
      {#if features && census}
        {#each features.features as d}
          <path
            class={`tract`}
            d={svgPath(d)}
            stroke="#e0e0e0"
            fill={census[d.properties.GEOID] ? colorScale(census[d.properties.GEOID]) : '#d3d3d3'} />
        {/each}
      {/if}
    </g>
    <g class="g-migrations">
      {#if features}
        {#each features.features as d}
          {#if chains[`c${round}`][d.properties.GEOID]}
            <!-- content here -->
            <g
              class="g-migration-triangle"
              transform={`translate(${svgPath.centroid(d)})`}>
              <path
                class="migration-triangle"
                d={`M ${-chartWidth / 200},0 L 0,${-heightScale(chains[`c${round}`][d.properties.GEOID])} ${chartWidth / 200},0 `} />
            </g>
          {/if}
        {/each}
      {/if}
    </g>
  </g>
</svg>
