<script>
  import Scroller from "@newswire/scroller";
  import Select from "svelte-select";
  import Copy from "./Copy.svelte";
  import Map from "./Map.svelte";
  // import Slope from "./Slope.svelte";
  import { geoConicConformal } from "d3-geo";
  import { census } from "./data/census.json";
  import sf from "./data/sf.json";

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

  const rounds = [
    {
      label: "first",
      value: "c0c1",
    },
    {
      label: "second",
      value: "c1c2",
    },
    {
      label: "third",
      value: "c2c3",
    },
    {
      label: "fourth",
      value: "c3c4",
    },
    {
      label: "fifth",
      value: "c4c5",
    },
    {
      label: "sixth",
      value: "c5c6",
    },
    {
      label: "seventh",
      value: "c6c7",
    },
  ];

  const metros = [
    {
      label: "Atlanta",
      value: "atl",
    },
    {
      label: "Boston",
      value: "bos",
    },
    {
      label: "Chicago",
      value: "chi",
    },
    {
      label: "Dallas",
      value: "dfw",
    },
    {
      label: "Washington, D.C.",
      value: "dc",
    },
    {
      label: "Denver",
      value: "den",
    },
    {
      label: "Houston",
      value: "hou",
    },
    {
      label: "Minneapolis",
      value: "min",
    },
    {
      label: "New York City",
      value: "nyc",
    },
    {
      label: "Philadelphia",
      value: "phil",
    },
    {
      label: "Seattle",
      value: "sea",
    },
    {
      label: "San Francisco",
      value: "sf",
    },
  ];

  const projections = {
    sf: geoConicConformal()
      .parallels([37 + 4 / 60, 38 + 26 / 60])
      .rotate([120 + 30 / 60], 0),
  };

  // const projection = geoConicConformal()
  //   .parallels([37 + 4 / 60, 38 + 26 / 60])
  //   .rotate([120 + 30 / 60], 0);
  const scroller = new Scroller({
    scenes: document.querySelectorAll(".scene"),
  });
  console.log(scroller);
  console.log(document.querySelectorAll(".scene"));

  // Scroller has a tiny event emitter embedded in it!

  // the `enter` event is triggered every time a scene crosses the threshold
  scroller.on("scene:enter", (d) => {
    console.log("entering");
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
</script>

<style>
  .scroller {
    background-color: white;
    margin: 3rem auto;
    position: relative;
    /* display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    grid-gap: 4rem; */
  }
  .scroll-scenes {
    /* grid-column-start: 1;
    grid-row-start: 1; */
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
  }

  .input-text {
    text-align: center;
    font-size: 1.25rem;
    position: relative;
    margin: auto;
    padding: 1rem 0 0 0;
  }
  .dropdown {
    max-width: 400px;
    margin: 0 auto 4rem auto;
    text-align: start;
  }

  /* .dropdown-round {
    width: 120px;
  }

  .dropdown-metro {
    width: 200px;
  } */

  .dropdown-title {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .chart-title {
  }

  .graphic {
    /* display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
    grid-gap: 4rem; */
  }
  .map {
    max-width: 100%;
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
    width: 100%;
  }
</style>

<!-- <div class="scroller">
  <div class="scroll-graphic"> -->
<div class="dropdown">
  <div class="dropdown-title">Select a metro area</div>
  <div class="dropdown dropdown-metro">
    <Select items={metros} bind:selectedValue={selectedMetro} />
  </div>
</div>
<div class="graphic">
  <!-- <div class="map" bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
    <Map
      width={mapWidth}
      height={mapWidth}
      tracts={sf}
      {census}
      projection{projections[selectedMetro.value]} />
  </div> -->
  <div
    class="slope"
    bind:clientWidth={slopeWidth}
    bind:clientHeight={slopeHeight}>
    <!-- <Slope {width} {height} /> -->
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
</div>

<!-- </div> -->
<!-- <div class="scroll-scenes">
    {#each value.scenes as scene}
      <div class="scene">
        <div class="scene-wrapper">
          {#each scene.value as { type, value }, i}
            <svelte:component this={elements[type]} {value} />
          {/each}
        </div>
      </div>
    {/each} -->
<!-- </div>
</div> -->
