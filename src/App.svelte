<script>
  import { onMount } from "svelte";

  let seasonsGreetings;
  let audio;
  onMount(() => {
    // when the audio binding is ready set the volume
    audio.volume = 0;
    console.log(audio.play);
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

  let mouseDistance = { x: 0, y: 0 };
  const handleMousemove = (e) => {
    mouseDistance.x = e.clientX - seasonsGreetings.offsetLeft;
    mouseDistance.y = seasonsGreetings.offsetTop - e.clientY;
  };

  //draw background snowflakes
  window.onload = function () {
    drawSnowflakes();
  };

  function drawSnowflakes() {
    let background = document.getElementsByClassName("background")[0];
    let rows = [];

    for (let i = 0; i <= window.innerHeight / 50; i++) {
      let row = document.createElement("div");
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
          img.style.height = "30px";
          img.style.transform =
            "rotate(" + Math.floor(Math.random() * 360) + "deg)";
          img.src = "https://i.imgur.com/ftJAqny.png";
          rows[i].append(img);
        }
      } else {
        for (let k = 0; k <= window.innerWidth / 50; k++) {
          let img = document.createElement("img");
          img.classList.add("snowflake");
          img.classList.add("snowflake-2");
          img.style.padding = "20px";
          img.style.width = "30px";
          img.style.height = "30px";

          img.style.transform =
            "rotate(" + Math.floor(Math.random() * 360) + "deg)";
          img.src = "https://i.imgur.com/ftJAqny.png";
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

<svelte:body on:mousemove={handleMousemove} />

<main>
  <div class="background" />
  <h2 class="time-left text-box">
    <span>{daysUntilChristmas}</span> day{daysUntilChristmas !== 1 ? "s" : ""}
    <span>{hoursUntilChristmas}</span>
    hour{hoursUntilChristmas !== 1 ? "s" : ""}
    <span>{minutesUntilChristmas}</span>
    minute{minutesUntilChristmas !== 1 ? "s" : ""} and
    <span>{secondsUntilChristmas}</span>
    second{secondsUntilChristmas !== 1 ? "s" : ""} until christmas!!
  </h2>

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
  <audio bind:this={audio} autoplay>
    <source src={"./song.mp3"} type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>

  <img
    src="./assets/album_cover.png"
    alt="Mariah Carey merry Christmas II you album cover"
    style="opacity: {audioVolume};"
    class="album"
  />

  <div>
    <h1 class="text-box seasons-greetings" bind:this={seasonsGreetings}>
      merry christmas
      {#each { length: Math.min(daysUntilChristmas + 1, 50) } as _, i}
        <span
          class="eve"
          style="bottom:{(mouseDistance.y / daysUntilChristmas) *
            (i + 1)}px;left:{(mouseDistance.x / daysUntilChristmas) *
            (i + 1)}px"
        >
          {#if i === daysUntilChristmas}
            eve!!!
          {:else}
            eve
          {/if}
        </span>
      {/each}
      <span>eve</span>
    </h1>
  </div>
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
    overflow: hidden;
    font-family: "Fuzzy Bubbles", cursive;
    font-weight: 400;
    padding: 60px;
    max-width: 240px;
    margin: 0 auto;
    position: relative;
    height: calc(100vh - 120px);
    z-index: 1;
  }

  .background {
    position: absolute;
    transform: translateX(-30px);
    left: 0px;
    top: 0px;
    width: 200vw;
    height: 200vh;
  }

  .text-box {
    background-color: transparent;
    background-size: 100% 100%;
    font-size: 1.2em;
    padding: 14px 30px;
    border: none;
    display: block;
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
    background-image: url(../assets/border1.svg);

    &:before {
      background-image: url(../assets/border_transparent1.svg);
    }
  }

  .volume {
    background-image: url(../assets/border2.svg);
    cursor: pointer;
    margin-top: 35px;

    &:before {
      background-image: url(../assets/border_transparent2.svg);
    }
  }

  .seasons-greetings {
    background-image: url(../assets/border3.svg);
    position: absolute;
    bottom: 60px;

    &:before {
      background-image: url(../assets/border_transparent3.svg);
    }

    /* .eve:first-child {
      position: relative !important;
    } */

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
    }
  }

  .album {
    position: absolute;
    transform: rotate(-20deg) scale(1.15);
    bottom: 0%;
    right: 0%;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  h2 {
    font-weight: 400;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
