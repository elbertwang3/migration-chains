<script>
  import Copy from "./Copy.svelte";
  import Scroller from "./Scroller.svelte";
  import Slope from "./JoyPlotContainer.svelte";
  import text from "./data/text.json";
  import JoyPlotContainer from "./JoyPlotContainer.svelte";

  console.log(Scroller);
  const elements = {
    text: Copy,
    scroller: Scroller,
    "joyplot-container": JoyPlotContainer,
  };
</script>

<style>
  :global(p) {
    margin: 0;
  }

  h1 {
    max-width: 600px;
    margin: 0 auto 1rem auto;
  }
  h4 {
    max-width: 600px;
    margin: 0 auto 1rem auto;
  }
</style>

<main>
  <h1 class="post-title entry-title">{text.hed}</h1>
  <h4 class="post-kicker">{text.dek}</h4>
  <article>
    {#each text.content as { type, value }, i}
      <svelte:component this={elements[type]} {value} />
    {/each}
  </article>
</main>
