<script>
  import { onMount } from "svelte";
  import TimeLeft from "./TimeLeft.svelte";
  import Eve from "./Eve.svelte";
  import Help from "./Help.svelte";
  import Album from "./Album.svelte";
  import Snowflakes from "./Snowflakes.svelte";

  let audio;
  onMount(() => {
    // when the audio binding is ready set the volume
    audio.volume = 0;
  });

  /**
   * Number of MS until 12/25
   */
  const getMillisecondsUntilChristmas = () => {
    const today = new Date();
    const christmas = new Date(today.getFullYear(), 11, 25);

    // If we're in december
    if (today.getMonth() == 11 && today.getDate() > 25) {
      christmas.setFullYear(christmas.getFullYear() + 1);
    }

    // It is Christmas!
    if (today.getMonth() == 11 && today.getDate() === 25) {
      return 0;
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
  const getMillisecondsSinceThanksgiving = () => {
    const today = new Date();
    let day = getThanksgivingDay(today.getFullYear());
    let thanksgiving = new Date(today.getFullYear(), 10, day);

    if (today.getTime() > thanksgiving.getTime()) {
      day = getThanksgivingDay(today.getFullYear() - 1);
      thanksgiving = new Date(today.getFullYear(), 10, day);
    }

    return today.getTime() - thanksgiving.getTime();
  };

  /**
   * Audio volume increases linearly from 0-15% 12/26-thanksgiving
   * Then 15-100% thanksgiving-12/25
   */
  const getAudioVolume = () => {
    const SPLIT = 0.15;
    const today = new Date();
    let dayAfterChristmas = new Date(today.getFullYear(), 11, 26);
    let day = getThanksgivingDay(today.getFullYear());
    let thanksgiving = new Date(today.getFullYear(), 10, day);

    if (today > thanksgiving && today < dayAfterChristmas) {
      return (
        (getMillisecondsSinceThanksgiving() /
          (getMillisecondsSinceThanksgiving() +
            getMillisecondsUntilChristmas())) *
          (1 - SPLIT) +
        SPLIT
      );
    } else {
      if (today > thanksgiving) {
        day = getThanksgivingDay(today.getFullYear() + 1);
        thanksgiving = new Date(today.getFullYear() + 1, 10, day);
      }

      if (today < dayAfterChristmas) {
        dayAfterChristmas = new Date(today.getFullYear() - 1, 11, 26);
      }

      const millisecondsUntilThanksgiving =
        thanksgiving.getTime() - today.getTime();
      const millisecondsSinceChristmas =
        today.getTime() - dayAfterChristmas.getTime();

      return (
        (millisecondsSinceChristmas /
          (millisecondsSinceChristmas + millisecondsUntilThanksgiving)) *
        SPLIT
      );
    }
  };

  /**
   * Get the custom image cursor path depending on chrismas proximity
   */
  const getCursor = (volume) => {
    if (volume > 0.5) {
      return "../assets/hat.png";
    } else if (volume > 0.12) {
      return "../assets/close.png";
    } else {
      return "../assets/sad.png";
    }
  };

  let millisecondsUntilChristmas = getMillisecondsUntilChristmas();
  let audioVolume = getAudioVolume();
  const title = document.title;
  let cursorImage = getCursor(audioVolume);

  /**
   * Get the number of days, hours, and seconds until xmas
   */
  const updateTimes = () => {
    millisecondsUntilChristmas = getMillisecondsUntilChristmas();
    if (audio) {
      audioVolume = getAudioVolume();
      audio.volume = audioVolume;
    }
    document.title = `${Math.round(audioVolume * 10000) / 100}% - ${title}`;
  };

  // Update every second
  updateTimes();
  setInterval(() => updateTimes(), 1_000);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Fuzzy+Bubbles:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main style="--cursor-image: url({cursorImage})">
  <Snowflakes />
  <TimeLeft {millisecondsUntilChristmas} />

  <button
    class="volume text-box"
    on:click={() => (audio.paused ? audio.play() : audio.pause())}
  >
    {#if !audio || audio.paused}
      <span>play music</span>
    {:else}
      volume: <span>{Math.round(audioVolume * 10000) / 100}%</span>
    {/if}
  </button>
  <audio bind:this={audio} autoplay loop>
    <source src={"./song.mp3"} type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>

  <Album {audioVolume} />
  <Eve {millisecondsUntilChristmas} />
  <Help />
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
    cursor: var(--cursor-image), auto;
    overflow: hidden;
    font-family: "Fuzzy Bubbles", cursive;
    font-weight: 400;
    padding: 30px;
    margin: 0 auto;
    position: relative;
    height: calc(100vh - 60px);
    z-index: 1;

    @media (max-width: 680px) {
      padding: 30px;
    }
  }

  :global(.text-box) {
    background-color: transparent;
    background-size: 100% 100%;
    font-size: 1.2em !important;
    padding: 14px 20px;
    border: none;
    display: block;
    position: relative;
    width: -moz-fit-content;
    width: fit-content;

    &:hover {
      &:before {
        top: 19px;
        left: 19px;
      }
    }

    &:before {
      background-size: 100% 100%;
      content: " ";
      display: block;
      height: 100%;
      left: 15px;
      position: absolute;
      top: 15px;
      transition: all 0.2s;
      width: 100%;
      z-index: -1;
    }

    :global(span) {
      color: var(--secondary-color);
      font-weight: 800;
    }
  }

  .volume {
    cursor: pointer;
    margin-top: 35px;
    background-image: url(../assets/border2.svg);
    &:before {
      background-image: url(../assets/border_transparent2.svg);
    }
  }
</style>
