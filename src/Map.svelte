<script>
  import { feature, mesh } from "topojson";
  import { geoPath } from "d3-geo";
  import { geoConicConformal } from "d3-geo";
  import { scaleQuantile, scaleSqrt, scaleLinear } from "d3-scale";
  import { schemeBrBG } from "d3-scale-chromatic";
  import { max, group } from "d3-array";
  import { nest } from "d3-collection";

  export let width = 200;
  export let height = 200;
  export let chains;
  export let tracts;
  export let census;
  export let projection;
  export let round;
  console.log(round);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;

  let selectedTract = null;
  let features;
  let svgPath;
  let colorScale;
  let radiusScale;
  let strokeScale;
  let censusDict;
  let chainDict;
  let connections;
  let filteredConnections;
  let centroids;

  $: if (chains && tracts && census) {
    // console.log(tracts);
    // console.log(tracts);
    features = feature(tracts, tracts.objects[Object.keys(tracts.objects)[0]]);
    projection.fitExtent(
      [
        [margin.left, margin.top],
        [chartWidth + margin.right, height + margin.bottom],
      ],
      features
    );
    svgPath = geoPath().projection(projection);
    centroids = features.features.reduce((obj, item) => {
      obj[item.properties.GEOID] = svgPath.centroid(item);
      return obj;
    }, {});
    console.log(centroids);

    censusDict = census.reduce((obj, item) => {
      obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
        item.med_hh_inc;
      return obj;
    }, {});
    colorScale = scaleQuantile()
      .domain(Object.values(censusDict))
      .range(schemeBrBG[6]);

    chainDict = group(chains, (d) => d[round.substring(0, 2)]);
    console.log(censusDict);
    console.log(chainDict);

    radiusScale = scaleSqrt()
      .domain([0, max(Array.from(chainDict.values()), (d) => d.length)])
      .range([0, chartWidth / 10]);

    connections = nest()
      .key((d) => `${d[round.substring(0, 2)]}-${d[round.substring(2, 4)]}`)
      .rollup((v) => v.length)
      .entries(chains)
      .filter((d) => d.key.split("-")[0] == "06075016200");
    console.log(connections);

    strokeScale = scaleLinear()
      .domain([0, max(connections, (d) => d.value)])
      .range([0.5, 4]);
  }

  function handleMouseOver(d) {
    //console.log(d);
    // console.log(
    //   census[
    //     `${d.properties.STATEFP}${d.properties.COUNTYFP}${d.properties.TRACTCE}`
    //   ]
    // );
    // selectedNabe = d;
  }
</script>

<style>
  /* your styles go here */
  .tract {
    stroke: white;
    stroke-width: 0.1;
    /* fill: none; */
    /* stroke: #333;
    stroke-width: 0.5; */
  }

  .migration {
    stroke: #333;
    fill: none;
  }

  .connection {
    stroke: #333;
    stroke-width: 1;
  }
</style>

<svg {width} {height}>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g class="g-tracts">
      {#if features && censusDict}
        {#each features.features as d}
          <path
            class="tract"
            class:active={selectedTract && selectedTract.properties.name === d.properties.name}
            d={svgPath(d)}
            stroke="#e0e0e0"
            fill={censusDict[d.properties.GEOID] ? colorScale(censusDict[d.properties.GEOID]) : 'none'}
            on:mouseover={() => handleMouseOver(d)} />
          <!-- {#if chainDict.get(d.properties.GEOID)}
            <circle
              class="migration"
              transform={`translate(${svgPath.centroid(d)})`}
              r={radiusScale(chainDict.get(d.properties.GEOID).length)} />
          {/if} -->
        {/each}
      {/if}
    </g>

    <!-- <g class="g-migrations">
      {#if chainDict}
        {#each features.features as d}
          {#if chainDict.get(d.properties.GEOID)}
            <circle
              class="migration"
              transform={`translate(${svgPath.centroid(d)})`}
              r={radiusScale(chainDict.get(d.properties.GEOID).length)} />
          {/if}
        {/each}
      {/if}
    </g> -->
    <g class="g-connections">
      {#if connections}
        {#each connections as connection}
          <line
            class="connection"
            x1={centroids[connection.key.split('-')[0]][0]}
            y1={centroids[connection.key.split('-')[0]][1]}
            x2={centroids[connection.key.split('-')[1]][0]}
            y2={centroids[connection.key.split('-')[1]][1]} />
        {/each}
      {/if}
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
