const ghpages = require("gh-pages");

ghpages.publish(
  "public", // <-- replace yourproject with your repo name
  {
    branch: "gh-pages",
    repo: "https://github.com/elbertwang3/migration-chains.git",
    user: {
      name: "Your name",
      email: "Your Email address",
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);
