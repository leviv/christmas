<script>
  import { onMount } from "svelte";

  let audio;
  onMount(() => {
    // when the audio binding is ready set the volume
    audio.volume = 0;
  });

  /**
   * Number of MS until 12/25
   */
  const millisecondsUntilChristmas = () => {
    const today = new Date();
    const christmas = new Date(today.getFullYear(), 11, 25);

    // If we're in december
    if (today.getMonth() == 11 && today.getDate() > 25) {
      christmas.setFullYear(christmas.getFullYear() + 1);
    }
    return christmas.getTime() - today.getTime();
  };

  /**
   * Helper method to get the day thanksgiving falls on.
   * Fourth thursday of November
   */
  const getThanksgivingDay = (year) => {
    const octoberFirst = new Date(year, 10, 1);
    const dayOfWeek = octoberFirst.getDay();
    return 22 + ((11 - dayOfWeek) % 7);
  };

  /**
   * Number of MS since the last thanksgiving
   */
  const millisecondsSinceThanksgiving = () => {
    const today = new Date();
    let day = getThanksgivingDay(today.getFullYear());
    let thanksgiving = new Date(today.getFullYear(), 10, day);

    if (today.getTime() > thanksgiving.getTime()) {
      day = getThanksgivingDay(today.getFullYear() - 1);
      thanksgiving = new Date(today.getFullYear(), 10, day);
    }

    return today.getTime() - thanksgiving.getTime();
  };

  let audioVolume =
    millisecondsSinceThanksgiving() /
    (millisecondsSinceThanksgiving() + millisecondsUntilChristmas());
  const dayMilliseconds = 1000 * 60 * 60 * 24;
  const hourMilliseconds = 1000 * 60 * 60;
  const minuteMilliseconds = 1000 * 60;
  let daysUntilChristmas,
    hoursUntilChristmas,
    minutesUntilChristmas,
    secondsUntilChristmas;

  /**
   * Get the number of days, hours, and seconds until xmas
   */
  const updateTimes = () => {
    daysUntilChristmas = Math.floor(
      millisecondsUntilChristmas() / dayMilliseconds
    );
    hoursUntilChristmas = Math.floor(
      (millisecondsUntilChristmas() - dayMilliseconds * daysUntilChristmas) /
        hourMilliseconds
    );
    minutesUntilChristmas = Math.floor(
      (millisecondsUntilChristmas() -
        dayMilliseconds * daysUntilChristmas -
        hourMilliseconds * hoursUntilChristmas) /
        minuteMilliseconds
    );
    secondsUntilChristmas = Math.floor(
      (millisecondsUntilChristmas() -
        dayMilliseconds * daysUntilChristmas -
        hourMilliseconds * hoursUntilChristmas -
        minuteMilliseconds * minutesUntilChristmas) /
        1000
    );

    if (audio) {
      audioVolume =
        millisecondsSinceThanksgiving() /
        (millisecondsSinceThanksgiving() + millisecondsUntilChristmas());
      audio.volume = audioVolume;
    }
  };

  // Update every second
  updateTimes();
  setInterval(() => updateTimes(), 1_000);

  let coordinates = { x: 0, y: 0 };
  const handleMousemove = (e) => {
    coordinates.x = e.clientX;
    coordinates.y = e.clientY;
    console.log(coordinates);
  };
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Fuzzy+Bubbles:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:body on:mousemove={handleMousemove} />

<main>
  <h2 class="time-left text-box">
    <span>{daysUntilChristmas}</span> days <span>{hoursUntilChristmas}</span>
    hours <span>{minutesUntilChristmas}</span>
    minutes and <span>{secondsUntilChristmas}</span> seconds until christmas!
  </h2>
  <h2 class="volume text-box">
    volume: <span>{Math.round(audioVolume * 10000) / 100}%</span>
  </h2>
  <div>
    <h1>
      Merry Christmas
      {#each { length: daysUntilChristmas + 1 } as _, i}
        {#if i === daysUntilChristmas}
          <span class="eve">eve!!!</span>
        {:else}
          <span class="eve">eve</span>
        {/if}
      {/each}
    </h1>
  </div>
  <audio autoplay loop bind:this={audio} controls>
    <source src={"./song.mp3"} type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>

  <img
    src="./album_cover.jpg"
    alt="Mariah Carey merry Christmas II you album cover"
    class="album"
  />
</main>

<style lang="scss">
  :global(body) {
    /* Variables */
    --main-bg-color: #c0f3c5;
    --secondary-color: #ff6c7e;

    margin: 0;
    padding: 0;
  }

  main {
    background-color: var(--main-bg-color);
    font-family: "Fuzzy Bubbles", cursive;
    font-weight: 400;
    padding: 60px;
    max-width: 240px;
    margin: 0 auto;
    position: relative;
    height: calc(100vh - 120px);
    z-index: 1;
  }

  .text-box {
    background-size: 100% 100%;
    font-size: 28px;
    padding: 8px 22px;
    position: relative;
    width: -moz-fit-content;
    width: fit-content;

    &:before {
      background-size: 100% 100%;
      content: " ";
      display: block;
      position: absolute;
      top: 15px;
      left: 15px;
      height: 100%;
      width: 100%;
      z-index: -1;
    }

    span {
      color: var(--secondary-color);
      font-weight: 800;
    }
  }

  .time-left {
    background-image: url(../border1.svg);

    &:before {
      background-image: url(../border_transparent1.svg);
    }
  }

  .volume {
    background-image: url(../border2.svg);

    &:before {
      background-image: url(../border_transparent2.svg);
    }
  }

  .album {
    animation: spin 60s linear infinite;
    transform: rotate(0deg) scale(0.4);
  }

  .eve {
    position: absolute;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
