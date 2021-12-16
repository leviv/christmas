<script>
  export let millisecondsUntilChristmas;

  let seasonsGreetings;
  let eve;

  let mouseDistance = { x: 0, y: 0 };
  const handleMousemove = (e) => {
    mouseDistance.x =
      e.clientX -
      seasonsGreetings.offsetLeft -
      seasonsGreetings.offsetWidth +
      eve.offsetWidth / 2;
    mouseDistance.y =
      seasonsGreetings.offsetTop - e.clientY - eve.offsetHeight / 2;
  };

  const dayMilliseconds = 1000 * 60 * 60 * 24;
  $: daysUntilChristmas = Math.floor(
    millisecondsUntilChristmas / dayMilliseconds
  );
</script>

<svelte:body on:mousemove={handleMousemove} />

<h1 class="text-box seasons-greetings" bind:this={seasonsGreetings}>
  merry christmas
  <span style="position: relative; width: 0; height: 0">
    {#each { length: Math.min(daysUntilChristmas, 50) } as _, i}
      <span
        class="eve"
        style="bottom:{(mouseDistance.y / daysUntilChristmas) *
          (i + 1)}px;left:{(mouseDistance.x / daysUntilChristmas) * (i + 1)}px"
        bind:this={eve}
      >
        {#if i === daysUntilChristmas - 1}
          eve!!!
        {:else}
          eve
        {/if}
      </span>
    {/each}
  </span>
  <span>
    {#if daysUntilChristmas > 0}
      eve
    {/if}
  </span>
</h1>

<style lang="scss">
  .seasons-greetings {
    background-image: url(../assets/border3.svg);
    bottom: 60px;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    position: absolute;

    @media (max-width: 680px) {
      bottom: 130px;
    }

    &:before {
      background-image: url(../assets/border_transparent3.svg);
    }

    .eve:nth-child(odd) {
      color: var(--main-bg-color);
      -webkit-text-stroke: 1.5px #000;
    }

    .eve:nth-child(even) {
      -webkit-text-stroke: 1.5px var(--secondary-color);
    }

    .eve {
      color: #fff;
      font-weight: 700;
      position: absolute;
      user-select: none;
    }
  }
</style>
