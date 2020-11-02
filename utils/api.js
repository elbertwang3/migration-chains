const path = require("path");

// packages
const fs = require("fs-extra");
const quaff = require("quaff");
const config = require("../project.config");
const { apis } = config;

// const { isProductionEnv } = require("../env");
// const paths = require("../paths");

async function deployData(api) {
  // skip this all if there's no createAPI function declared in project config
  const { inputDir, outputDir, createAPI } = api;
  if (!createAPI) return;

  const data = await quaff(inputDir);
  const output = createAPI(data);

  // if we get nothing meaningful back, stop here
  if (output == null) return;

  if (!Array.isArray(output)) {
    throw new Error("createAPI needs to return an array");
  }

  //const dir = path.join(isProductionEnv ? "./public" : "./public", "api");
  // const dir = `./public/data/${outputDir}`;

  await Promise.all(
    output.map(({ key, values }) => {
      // console.log(
      //   `path: ${path.format({ dir: outputDir, name: key, ext: ".json" })}`
      // );
      fs.outputJSON(
        path.format({ dir: outputDir, name: key, ext: ".json" }),
        values
      );
    })
  );
}

if (Array.isArray(apis) && apis.length >= 1) {
  apis.forEach((d) => {
    deployData(d).catch(console.error);
  });
} else {
  console.log("not an array");
  return;
}
