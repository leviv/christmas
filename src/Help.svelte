<script>
  let showIcon = true;
</script>

<div
  class="help"
  on:mouseenter={() => {
    showIcon = false;
  }}
  on:mouseleave={() => {
    showIcon = true;
  }}
>
  <img
    src="./assets/help.svg"
    alt="Circle with question mark"
    style="display:{showIcon ? 'block' : 'none'};"
  />

  <div class="made-by text-box" style="display:{showIcon ? 'none' : 'block'};">
    Made by
    <a href="https://levi.me">
      <img src="./assets/levi.png" alt="Levi" />
    </a>
    &
    <a href="https://amandayeh.com/">
      <img src="./assets/amanda.png" alt="Amanda" />
    </a>
  </div>
</div>

<style lang="scss">
  .help {
    position: absolute;
    bottom: 60px;
    right: 60px;

    @media (max-width: 680px) {
      right: auto;
    }
  }

  .made-by {
    background-image: url(../assets/border2.svg);
    font-size: 18px;

    img {
      border-radius: 50%;
      display: inline-block;
      height: 20px;
      margin: 0;
      align-items: center;
      justify-content: center;
    }

    &:before {
      background-image: url(../assets/border_transparent2.svg);
    }
  }
</style>
