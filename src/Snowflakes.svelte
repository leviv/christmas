<script>
  export let audioVolume;

  const snowflakePath =
    audioVolume < 0.5 ? "./assets/snow-light.svg" : "./assets/snowflake.svg";

  // Draw background snowflakes
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
          img.src = snowflakePath;
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
          img.src = snowflakePath;
          rows[i].append(img);
        }
      }
      background.append(rows[i]);
    }
  }
</script>

<div class="background" />

<style lang="scss">
  .background {
    position: absolute;
    transform: translateX(-30px);
    left: 0px;
    top: 0px;
    width: 200vw;
    height: 200vh;
    z-index: -999;
  }
</style>
