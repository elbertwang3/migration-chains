<script>
  import { feature, mesh } from "topojson";
  import { geoPath } from "d3-geo";
  import { geoConicConformal } from "d3-geo";
  import { scaleQuantile, scaleSqrt, scaleLinear } from "d3-scale";
  import { schemePurples } from "d3-scale-chromatic";
  import { max, group } from "d3-array";
  import { nest } from "d3-collection";

  const rounds = ["c0c1", "c1c2", "c2c3", "c3c4"];
  export let width = 200;
  export let height = 200;
  export let data;
  export let round;
  console.log(round);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  $: chartWidth = width - margin.left - margin.right;
  $: chartHeight = height - margin.top - margin.bottom;

  let initialTract = "53033004100";
  let selectedTracts = {};
  // let selectedTracts = { c0c1: ["53033004100"] };
  let features;
  let svgPath;
  let colorScale;
  let radiusScale;
  let strokeScale;
  let censusDict;
  let chainDict;
  let connections = {};

  let centroids;
  // let selectedChain = {
  //   c0c1: "06075061500",
  //   c1c2: "06075017601",
  //   c2c3: "06001425104",
  //   c3c4: "06001406000",
  // };

  $: if (data && checkProps(data)) {
    console.log("i am getting run again on state change");
    const { chains, tracts, census, projection } = data;
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

    censusDict = census.reduce((obj, item) => {
      obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
        item.med_hh_inc;
      return obj;
    }, {});
    colorScale = scaleQuantile()
      .domain(Object.values(censusDict))
      .range(schemePurples[7]);
    // chainDict = group(chains[round], (d) => d[round.substring(0, 2)]);
    // chainDict = nest()
    //   .key((d) => `${d[round.substring(2, 4)]}`)
    //   .rollup((v) => v.length)
    //   .entries(
    //     chains[round].filter((d) =>
    //       selectedTracts[round].includes(d[round.substring(0, 2)])
    //     )
    //   );
    rounds.forEach((round, i) => {
      //selectedTracts[round] = chainDict.map((d) => d.key);
      selectedTracts[round] = nest()
        .key((d) => `${d[round.substring(2, 4)]}`)
        .rollup((v) => v.length)
        .entries(
          chains[round].filter((d) => {
            if (round == "c0c1") {
              return d[round.substring(0, 2)] == initialTract;
            } else {
              return selectedTracts[rounds[i - 1]]
                .map((d) => d.key)
                .includes(d[round.substring(0, 2)]);
            }
          })
        );
    });
    // console.log(incomingTracts);
    console.log(selectedTracts);

    radiusScale = scaleSqrt()
      .domain([1, max(selectedTracts[round], (d) => d.value)])
      .range([2, 6]);
    // rounds.forEach((round) => {
    //   connections[round] = nest()
    //     .key((d) => `${d[round.substring(0, 2)]}-${d[round.substring(2, 4)]}`)
    //     .rollup((v) => v.length)
    //     .entries(chains[round])
    //     .filter((d) => d.key.split("-")[0] == selectedChain[round]);
    // });

    // connections["c3c4"].forEach((connection) => {
    //   console.log(centroids);
    //   console.log(connection.key.split("-")[1]);
    //   console.log(centroids[connection.key.split("-")[1]]);
    //   console.log(centroids[connection.key.split("-")[0]][0]);
    //   console.log(centroids[connection.key.split("-")[0]][1]);
    //   console.log(centroids[connection.key.split("-")[1]][0]);
    //   console.log(centroids[connection.key.split("-")[1]][1]);
    // });

    // strokeScale = scaleLinear()
    //   .domain([0, max(connections, (d) => d.value)])
    //   .range([0.5, 4]);
  }

  function handleMouseOver(d) {
    //   console.log(d.properties.GEOID);
    //   console.log(censusDict[d.properties.GEOID]);
    //   selectedChain[data.round] = d.properties.GEOID;
  }
  function handleMouseOut(d) {
    //   selectedChain = {
    //     c0c1: "06075061500",
    //     c1c2: "06075017601",
    //     c2c3: "06001425104",
    //     c3c4: "06001406000",
    //   };
  }

  function checkProps(obj) {
    for (var key in obj) {
      if (obj[key] == null) return false;
    }
    return true;
  }
</script>

<style>
  /* your styles go here */
  .tract {
    stroke: white;
    stroke-width: 0.1;
    fill-opacity: 1;
    /* fill: none; */
    /* stroke: #333;
    stroke-width: 0.5; */
  }

  .tract:hover {
    stroke: #333;
    stroke-width: 0.5;
  }
  .migration-circle {
    fill: #ff9400;
    fill-opacity: 0.5;
    /* mix-blend-mode: multiply; */
  }
  .g-connection-round {
    opacity: 0;
  }
  .g-connection-round.active {
    opacity: 1;
  }
  .g-connection-round.background {
    opacity: 0.4;
  }
  .connection {
    stroke: #333;
    stroke-width: 1;
    pointer-events: none;
  }
</style>

<svg {width} {height}>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g class="g-tracts">
      {#if features && censusDict}
        {#each features.features as d}
          <path
            class="tract"
            d={svgPath(d)}
            stroke="#e0e0e0"
            fill={censusDict[d.properties.GEOID] ? colorScale(censusDict[d.properties.GEOID]) : '#d3d3d3'}
            on:mouseover={() => handleMouseOver(d)}
            on:mouseout={() => handleMouseOut(d)} />
          <!-- {#if chainDict.get(d.properties.GEOID)}
            <circle
              class="migration"
              transform={`translate(${svgPath.centroid(d)})`}
              r={radiusScale(chainDict.get(d.properties.GEOID).length)} />
          {/if} -->
        {/each}
      {/if}
    </g>
    {#if selectedTracts[round]}
      <g class="g-migrations">
        {#each selectedTracts[round] as d}
          <circle
            class="migration-circle"
            r={radiusScale(d.value)}
            transform={`translate(${centroids[d.key]})`} />
        {/each}
      </g>
    {/if}

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
    <!-- <g class="g-connections">
      {#each Object.entries(connections) as [round, connections]}
        <g
          class={`g-connection-round${data.round == round ? ' active' : ''}${data.round > round ? ' background' : ''}`}>
          {#each connections as connection}
            {#if centroids[connection.key.split('-')[1]]}
              <line
                class="connection"
                x1={centroids[connection.key.split('-')[0]][0]}
                y1={centroids[connection.key.split('-')[0]][1]}
                x2={centroids[connection.key.split('-')[1]][0]}
                y2={centroids[connection.key.split('-')[1]][1]} />
            {/if}
          {/each}
        </g>
      {/each}
    </g> -->

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
