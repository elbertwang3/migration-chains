<script>
  import { onMount } from "svelte";
  import Scroller from "@newswire/scroller";
  import Select from "svelte-select";
  import Copy from "./Copy.svelte";
  import Map from "./Map.svelte";
  // import Slope from "./Slope.svelte";
  import { geoConicConformal } from "d3-geo";
  import { census, metros, rounds } from "./data/data.json";

  import sf from "./data/sf.json";
  console.log(metros);
  console.log(rounds);

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
  console.log(selectedMetro);

  const projections = {
    sf: geoConicConformal()
      .parallels([37 + 4 / 60, 38 + 26 / 60])
      .rotate([120 + 30 / 60], 0),
  };

  // const projection = geoConicConformal()
  //   .parallels([37 + 4 / 60, 38 + 26 / 60])
  //   .rotate([120 + 30 / 60], 0);

  onMount(() => {
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
    display: grid;
    grid-template-rows: minmax(0, 1fr) 200px;
    grid-gap: 2rem;
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
  img {
    display: block;
    height: 100%;
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
          tracts={sf}
          {census}
          projection{projections[selectedMetro.value]} />
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
