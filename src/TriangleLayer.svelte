<script>
  import { feature } from "topojson";
  export let tracts;
  export let migrationData;
  let features = feature(
    tracts,
    tracts.objects[Object.keys(tracts.objects)[0]]
  );
</script>

<g class="g-migrations">
  {#each features.features as d}
    {#if migrationData[d.properties.GEOID]}
      <!-- content here -->
      <g
        class="g-migration-triangle"
        transform={`translate(${svgPath.centroid(d)})`}>
        <path
          class="migration-triangle"
          d={`M ${-chartWidth / 200},0 L 0,${-heightScale(migrationData[d.properties.GEOID])} ${chartWidth / 200},0 `} />
      </g>
    {/if}
  {/each}
</g>
