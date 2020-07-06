<script>
  import { onMount, beforeUpdate, afterUpdate } from "svelte";
  import Scroller from "@newswire/scroller";
  import Select from "svelte-select";
  import Copy from "./Copy.svelte";
  import Map from "./Map.svelte";
  // import Slope from "./Slope.svelte";
  import { geoConicConformal, geoTransverseMercator } from "d3-geo";
  import { metros, rounds } from "./data/data.json";

  // import sf from "./data/sf.json";
  // console.log(metros);
  // console.log(rounds);
  let chainData = null;
  let tractData = null;
  let censusData = null;

  const elements = {
    text: Copy,
  };

  export let value;
  let mapWidth;
  let mapHeight;
  let slopeWidth;
  let slopeHeight;

  let selectedRound = {
    label: "first",
    value: "c0c1",
  };
  let selectedMetro = {
    label: "San Francisco",
    value: "sf",
  };
  let currMetro = {
    label: "San Francisco",
    value: "sf",
  };
  console.log(selectedMetro);

  const projections = {
    atlanta: geoTransverseMercator().rotate([84 + 10 / 60, -30]),
    boston: geoConicConformal()
      .parallels([41 + 17 / 60, 41 + 29 / 60])
      .rotate([70 + 30 / 60, 0]),
    illinois: geoTransverseMercator().rotate([88 + 20 / 60, -36 - 40 / 60]),
    dallas: geoConicConformal()
      .parallels([32 + 8 / 60, 33 + 58 / 60])
      .rotate([98 + 30 / 60, 0]),
    dc_metro: geoConicConformal()
      .parallels([38 + 18 / 60, 39 + 27 / 60])
      .rotate([77, 0]),
    denver: geoConicConformal()
      .parallels([38 + 27 / 60, 39 + 45 / 60])
      .rotate([105 + 30 / 60, 0]),
    houston: geoConicConformal()
      .parallels([28 + 23 / 60, 30 + 17 / 60])
      .rotate([99, 0]),
    miami: geoTransverseMercator().rotate([81, -24 - 20 / 60]),
    mpls: geoConicConformal()
      .parallels([43 + 47 / 60, 45 + 13 / 60])
      .rotate([94, 0]),
    nyc: geoConicConformal()
      .parallels([40 + 40 / 60, 41 + 2 / 60])
      .rotate([74, 0]),
    philadelphia: geoConicConformal()
      .parallels([39 + 56 / 60, 40 + 58 / 60])
      .rotate([77 + 45 / 60, 0]),
    seattle: geoConicConformal()
      .parallels([47 + 30 / 60, 48 + 44 / 60])
      .rotate([120 + 50 / 60, 0]),
    sf: geoConicConformal()
      .parallels([37 + 4 / 60, 38 + 26 / 60])
      .rotate([120 + 30 / 60], 0),
  };
  let currProjection = projections.sf;

  // const projection = geoConicConformal()
  //   .parallels([37 + 4 / 60, 38 + 26 / 60])
  //   .rotate([120 + 30 / 60], 0);

  function setupScroller() {
    const scroller = new Scroller({
      container: document.querySelector(".scroll-scenes"),
      scenes: document.querySelectorAll(".scene"),
      offset: 0,
    });

    // the `enter` event is triggered every time a scene crosses the threshold
    scroller.on("scene:enter", (d) => {
      console.log("entering");
      console.log(d);
      selectedRound = rounds[d.index];
      d.element.classList.add("active");
    });

    // the `exit` event is triggered every time a scene exits the threshold
    scroller.on("scene:exit", (d) => {
      d.element.classList.remove("active");
    });

    scroller.on("init", () => {
      console.log("Everything is ready to go!");
    });

    // starts up the IntersectionObserver
    scroller.init();
  }

  async function fetchData() {
    const chains = await fetch(`./data/chains/${selectedMetro.value}.json`);
    chainData = await chains.json();
    const tracts = await fetch(`./data/tracts/${selectedMetro.value}.json`);
    tractData = await tracts.json();
    const census = await fetch(`./data/census/${selectedMetro.value}.json`);
    censusData = await census.json();
    currProjection = projections[selectedMetro.value];
    //await tick();
  }

  onMount(async () => {
    console.log("on mount");
    setupScroller();
    await fetchData();
  });
  afterUpdate(async () => {
    if (selectedMetro.value != currMetro.value) {
      console.log("new metro");
      await fetchData();
      currMetro = selectedMetro;
    }
  });
</script>

<style>
  .scroller {
    background-color: white;
    margin: 1rem auto 2rem auto;
    position: relative;
  }
  .scroll-scenes {
    /* grid-column-start: 1;
    grid-row-start: 1; */
    position: relative;
    width: 300px;
    margin: auto;
    z-index: 2;
  }

  .scene {
    padding-bottom: 100vh;
  }

  .scene-wrapper {
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #d3d3d3;
    border-radius: 5px;
    padding: 1rem;
  }

  .scroll-graphic {
    position: sticky;
    top: 0rem;
    height: 100vh;
    display: grid;
    grid-template-rows: 86px minmax(0, 1fr);
    grid-gap: 1rem;
  }

  .input-text {
    text-align: center;
    font-size: 1.25rem;
    position: relative;
    margin: auto;
  }
  .dropdown {
    display: inline-block;
    text-align: start;
  }
  .dropdown-round {
    width: 120px;
  }
  .dropdown-metro {
    width: 200px;
  }

  .graphic {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    grid-gap: 1rem;
    /* display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
    grid-gap: 4rem; */
  }
  .map {
    /* width: 200px;
    margin: 0 auto 1rem auto; */
    /* position: absolute;
    top: 0;
    left: 0; 
    z-index: 2;
    width: 100px;
    height: 100px; */
  }

  .slope {
    width: 100%;
    /* height: 700px; */
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .title {
    text-align: center;
    font-weight: 600;
  }
  .arc {
    display: grid;
    place-items: center;
  }
  img {
    width: 100%;
    margin: auto;
  }
</style>

<div class="scroller">
  <div class="scroll-graphic">
    <div class="input-text">
      This is the
      <div class="dropdown dropdown-round">
        <Select items={rounds} bind:selectedValue={selectedRound} />
      </div>
      round of the migration chain for
      <div class="dropdown dropdown-metro">
        <Select items={metros} bind:selectedValue={selectedMetro} />
      </div>
      .
    </div>
    <div class="graphic">
      <div
        class="map"
        bind:clientWidth={mapWidth}
        bind:clientHeight={mapHeight}>
        <Map
          width={mapWidth}
          height={mapHeight}
          chains={chainData && chainData[selectedRound.value]}
          tracts={tractData}
          census={censusData}
          projection={currProjection}
          round={selectedRound.value} />
      </div>
      <div class="arc">
        <img src="arc.png" />
      </div>
    </div>

  </div>
  <div class="scroll-scenes">
    {#each value.scenes as scene}
      <div class="scene">
        <div class="scene-wrapper">
          {#each scene.value as { type, value }, i}
            <svelte:component this={elements[type]} {value} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
