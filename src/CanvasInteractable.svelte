<script>
  import { onMount, onDestroy } from "svelte";
  import { zoom } from "./stores/zoom";
  import { position } from "./stores/position";
  import panzoom from "panzoom";
  import { dragging } from "./stores/dragging";
  import { linking } from "./stores/linking";

  export let panzoomOptions = {
    maxZoom: 5,
    minZoom: 0.2,
    initialZoom: 1,
    zoomDoubleClickSpeed: 1,
    bounds: true,
    boundsPadding: 0.01,
    // beforeMouseDown: (e) => {
    //   return !e.altKey;
    // },
  };

  export let x = 1000;
  export let y = 1000;

  let canvasElt = null;
  export let panzoomInstance = null;

  onMount(() => {
    panzoomInstance = panzoom(canvasElt, panzoomOptions);
    // panzoomInstance.moveTo(centerX, centerY);

    panzoomInstance.on("transform", (e) => {
      // keep track of the element's scale so we can adjust dragging to match
      if (canvasElt) {
        const level = parseFloat(
          canvasElt.style.transform.split(",")[0].replace("matrix(", "")
        );
        zoom.set(level);
        position.set(canvasElt.style.transform);
      }
    });
  });

  $: {
    if ($dragging.id || $linking.start) {
      panzoomInstance.pause();
    } else if (panzoomInstance) {
      panzoomInstance.resume();
    }
  }

  onDestroy(() => {
    panzoomInstance.dispose();
  });
</script>

<div class="canvas-container">
  <div style="height: {y}px; width: {x}px;" bind:this={canvasElt}>
    <slot name="content" />
  </div>
  <slot name="controls" />
</div>

<style>
  div {
    height: 100%;
  }

  .canvas-container {
    position: relative;
  }
</style>
