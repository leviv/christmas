<script>
  export let audioVolume;

  // Album size can range from 0-window.innerWidth * 0.7
  let albumSize = audioVolume * (window.innerWidth * 0.7);
  let albumLeft = getRandomArbitrary(0, window.innerWidth - albumSize);
  let albumTop = getRandomArbitrary(0, window.innerHeight - albumSize);

  let album_rotation = Math.floor(Math.random() * 360);

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
</script>

<img
  src="./assets/album_cover.png"
  alt="Mariah Carey merry Christmas II you album cover"
  style="left:{albumLeft + 'px'}; top:{albumTop +
    'px'}; transform: rotate({album_rotation + 'deg'}); width: {albumSize +
    'px'}; "
  class="album"
/>

<style lang="scss">
  .album {
    position: absolute;
    z-index: -2;
  }
</style>
