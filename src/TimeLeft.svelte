<script>
  export let millisecondsUntilChristmas;

  const dayMilliseconds = 1000 * 60 * 60 * 24;
  const hourMilliseconds = 1000 * 60 * 60;
  const minuteMilliseconds = 1000 * 60;

  $: daysUntilChristmas = Math.floor(
    millisecondsUntilChristmas / dayMilliseconds
  );
  $: hoursUntilChristmas = Math.floor(
    (millisecondsUntilChristmas - dayMilliseconds * daysUntilChristmas) /
      hourMilliseconds
  );
  $: minutesUntilChristmas = Math.floor(
    (millisecondsUntilChristmas -
      dayMilliseconds * daysUntilChristmas -
      hourMilliseconds * hoursUntilChristmas) /
      minuteMilliseconds
  );
  $: secondsUntilChristmas = Math.floor(
    (millisecondsUntilChristmas -
      dayMilliseconds * daysUntilChristmas -
      hourMilliseconds * hoursUntilChristmas -
      minuteMilliseconds * minutesUntilChristmas) /
      1000
  );
</script>

<h2 class="time-left text-box">
  <span>{daysUntilChristmas}</span> day{daysUntilChristmas !== 1 ? "s" : ""}
  <span>{hoursUntilChristmas}</span>
  hour{hoursUntilChristmas !== 1 ? "s" : ""}
  <span>{minutesUntilChristmas}</span>
  minute{minutesUntilChristmas !== 1 ? "s" : ""} and
  <span>{secondsUntilChristmas}</span>
  second{secondsUntilChristmas !== 1 ? "s" : ""} until christmas!!
</h2>

<style lang="scss">
  .time-left {
    background-image: url(../assets/border1-mobile.svg);
    font-weight: 400;
  }

  .time-left:before {
    background-image: url(../assets/border1_transparent-mobile.svg);
  }

  @media (min-width: 500px) {
    .time-left {
      background-image: url(../assets/border1.svg);

      &:before {
        background-image: url(../assets/border_transparent1.svg);
      }
    }
  }
</style>
