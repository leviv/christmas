var ghpages = require("gh-pages");

ghpages.publish(
  "public", // path to public directory
  {
    branch: "gh-pages",
    repo: "https://github.com/leviv/christmas",
    user: {
      name: "Levi Villarreal",
      email: "villarreallevi@gmail.com",
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);
