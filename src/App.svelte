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
      const vol =
        millisecondsSinceThanksgiving() /
        (millisecondsSinceThanksgiving() + millisecondsUntilChristmas());
      audio.volume = vol;
    }
  };

  // Update every second
  updateTimes();
  setInterval(() => updateTimes(), 1_000);

  const getSeasonsGreetings = () => {
    let seasonsGreetings = "Merry Christmas";
    for (let i = 0; i < daysUntilChristmas + 1; i++) {
      seasonsGreetings += " eve";
    }
    seasonsGreetings += "!!!";

    return seasonsGreetings;
  };
</script>

<main>
  <h1>{getSeasonsGreetings()}</h1>
  <h2>
    {daysUntilChristmas} days {hoursUntilChristmas} hours {minutesUntilChristmas}
    minutes and {secondsUntilChristmas} seconds until christmas!
  </h2>
  <audio autoplay loop bind:this={audio}>
    <source src={"./song.mp3"} type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>

  <img
    src="./album_cover.jpg"
    alt="Mariah Carey merry Christmas II you album cover"
    class="album"
  />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  .album {
    animation: spin 60s linear infinite;
    transform: rotate(0deg) scale(0.4);
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
