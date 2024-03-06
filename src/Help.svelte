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
    <a href="https://leviv.cool" target="_blank">
      <img src="./assets/levi.png" alt="Levi" />
    </a>
    &
    <a href="https://amandayeh.com/" target="_blank">
      <img src="./assets/amanda.png" alt="Amanda" />
    </a>
  </div>
</div>

<style lang="scss">
  .help {
    position: absolute;
    bottom: 35px;
    right: 30px;

    @media (max-width: 450px) {
      right: auto;
    }
  }

  .made-by {
    background-image: url(../assets/border3.svg);
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
      background-image: url(../assets/border_transparent3.svg);
    }
  }
</style>
