<script>
  import { onMount } from "svelte";
  import TimeLeft from "./TimeLeft.svelte";
  import Eve from "./Eve.svelte";
  import Help from "./Help.svelte";

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

  let millisecondsUntilChristmas = getMillisecondsUntilChristmas();
  let audioVolume =
    millisecondsSinceThanksgiving() /
    (millisecondsSinceThanksgiving() + millisecondsUntilChristmas);
  let albumTop = millisecondsSinceThanksgiving() * -10;
  const title = document.title;
  let album_rotation = Math.floor(Math.random() * 360) + "deg)";
  /**
   * Get the number of days, hours, and seconds until xmas
   */
  const updateTimes = () => {
    millisecondsUntilChristmas = getMillisecondsUntilChristmas();
    if (audio) {
      audioVolume =
        millisecondsSinceThanksgiving() /
        (millisecondsSinceThanksgiving() + millisecondsUntilChristmas);
      audio.volume = audioVolume;
    }
    document.title = `${Math.round(audioVolume * 10000) / 100}% - ${title}`;
  };

  // Update every second
  updateTimes();
  setInterval(() => updateTimes(), 1_000);

  //draw background snowflakes
  window.onload = () => {
    drawSnowflakes();
  };

  window.onresize = () => {
    drawSnowflakes();
  };

  function drawSnowflakes() {
    const background = document.getElementsByClassName("background")[0];
    background.textContent = "";
    let rows = [];

    for (let i = 0; i <= window.innerHeight / 50; i++) {
      let row = document.createElement("div");
      row.style.position = "relative";
      row.style.width = "200vw";
      row.style.zIndex = "-100";
      if (i % 2 == 0) {
        row.style.transform = "translateX(-30px)";
      }
      rows.push(row);
    }

    for (let i = 0; i < rows.length; i++) {
      if (i % 2 == 0) {
        for (let j = 0; j <= window.innerWidth / 50; j++) {
          let img = document.createElement("img");
          img.style.padding = "20px";
          img.style.width = "30px";
          img.style.height = "30px";
          img.style.transform =
            "rotate(" + Math.floor(Math.random() * 360) + "deg)";
          img.src = "./assets/snowflake.svg";
          rows[i].append(img);
        }
      } else {
        for (let k = 0; k <= window.innerWidth / 50; k++) {
          let img = document.createElement("img");
          img.style.padding = "20px";
          img.style.width = "30px";
          img.style.height = "30px";

          img.style.transform =
            "rotate(" + Math.floor(Math.random() * 360) + "deg)";
          img.src = "./assets/snowflake.svg";
          rows[i].append(img);
        }
      }
      background.append(rows[i]);
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Fuzzy+Bubbles:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main>
  <div class="background" />
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

  <img
    src="./assets/album_cover.png"
    alt="Mariah Carey merry Christmas II you album cover"
    style="transform: scale({audioVolume *
      1.2}) rotate({album_rotation}; top:({albumTop};));"
    class="album"
  />
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
    cursor: url("../assets/hat.png"), auto;
    overflow: hidden;
    font-family: "Fuzzy Bubbles", cursive;
    font-weight: 400;
    padding: 30px;
    margin: 0 auto;
    position: relative;
    height: calc(100vh - 60px);
    z-index: 1;

    @media (max-width: 680px) {
      padding: 60px 30px;
    }
  }

  .background {
    position: absolute;
    transform: translateX(-30px);
    left: 0px;
    top: 0px;
    width: 200vw;
    height: 200vh;
    z-index: -999;
  }

  :global(.text-box) {
    background-color: transparent;
    background-size: 100% 100%;
    font-size: 1.2em !important;
    padding: 14px 30px;
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

  .album {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
  }
</style>
