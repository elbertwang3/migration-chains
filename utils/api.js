const path = require("path");

// packages
const fs = require("fs-extra");
const quaff = require("quaff");

// internal
const { createAPI } = require("../project.config");
// const { isProductionEnv } = require("../env");
// const paths = require("../paths");

async function deployData() {
  console.log("getting inside here");
  // skip this all if there's no createAPI function declared in project config
  if (!createAPI) return;

  const data = await quaff("./src/data");
  const output = createAPI(data);

  // if we get nothing meaningful back, stop here
  if (output == null) return;

  if (!Array.isArray(output)) {
    throw new Error("createAPI needs to return an array");
  }

  //const dir = path.join(isProductionEnv ? "./public" : "./public", "api");
  const dir = "./public/data";

  await Promise.all(
    output.map(({ key, values }) => {
      console.log(path.format({ dir, name: key, ext: ".json" }));
      //console.log(values);
      fs.outputJSON(path.format({ dir, name: key, ext: ".json" }), values);
    })
  );
}

deployData().catch(console.error);
