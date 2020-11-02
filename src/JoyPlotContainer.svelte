<script>
  import Select from "svelte-select";
  import JoyPlot from "./Joyplot.svelte";
  import metros from "./data/metros.json";

  let joyplotWidth;
  let joyplotHeight;

  let selectedMetro = {
    label: "Seattle",
    value: "seattle",
  };

  $: metroDataPromise = fetchMetroData(selectedMetro.value);

  async function fetchMetroData(metro) {
    const chains = await fetch(`./data/maps/${metro}.json`);
    const census = await fetch(`./data/census/${metro}.json`);
    const chainData = await chains.json();
    const censusData = await census.json();
    return {
      chains: chainData,
      census: censusData,
    };
  }
</script>

<style>
  .dropdown {
    max-width: 300px;
    margin: auto;
  }
  .dropdown-title {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .joyplot {
    height: 500px;
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

<div class="dropdown">
  <div class="dropdown-title">Select a metro area</div>
  <Select items={metros} bind:selectedValue={selectedMetro} />
</div>
<div
  class="joyplot"
  bind:clientWidth={joyplotWidth}
  bind:clientHeight={joyplotHeight}>
  {#await metroDataPromise}
    <!-- promise is pending -->
  {:then metroData}
    <!-- promise was fulfilled -->
    <JoyPlot width={joyplotWidth} height={joyplotHeight} {metroData} />
  {/await}
</div>
