// native
const path = require("path");
const fs = require("fs-extra");
const parse = require("csv-parse");
const { promisify } = require("util");
if (typeof fetch !== "function") {
  global.fetch = require("node-fetch-polyfill");
}
// const { csvParse } = require("d3-dsv");
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

// const data = require("../public/data/maps/sf_c7.csv");
// console.log(data);

// async function testCsv() {
//   const fileData = await readFile("public/data/maps/sf_c7.csv");
//   await parse(fileData, {
//     columns: true,
//     trim: true,
//   }).then((rows) => {
//     console.log(rows);
//     acc[metro][round] = rows;
//   });
// }
// testCsv();

// packages
const colors = require("ansi-colors");

// internal
const { google } = require("googleapis");
const { docToArchieML } = require("@newswire/doc-to-archieml");
const { sheetToData } = require("@newswire/sheet-to-data");
const config = require("../project.config");

async function getData() {
  console.log("get data getting called");
  const auth = await google.auth.getClient({
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });
  const { dataMutators, files } = config;
  for (const file of files) {
    const filepath = path.join(file.dataDir, `${file.name}.json`);
    const mutator =
      dataMutators && dataMutators[file.name]
        ? dataMutators[file.name]
        : (d) => d;

    let data;
    let color;

    switch (file.type) {
      case "doc":
        data = await docToArchieML({ documentId: file.fileId, auth });
        color = "magenta";
        break;
      case "sheet":
        data = await sheetToData({ auth, spreadsheetId: file.fileId });
        color = "cyan";
        break;
      default:
        throw new Error(
          `No data fetching method found for type "${file.type}"`
        );
    }

    data = mutator(data);
    await fs.outputJson(filepath, data, { spaces: 2 });

    logDownload(file.name, file.fileId, color);
  }
}

function logDownload(fileName, fileId, color) {
  console.log(colors[color](`Downloaded \`${fileName}\` (${fileId})`));
}

// const getAllCsvs = () => {
//   const dir = "mapdata/";
//   const fileExtWhitelist = [".csv"];
//   return readdir(dir).then((files) => {
//     return files.reduce((acc, fileName) => {
//       const filePath = `${dir}${fileName}`;
//       const fileExt = path.extname(fileName);
//       return fileExtWhitelist.includes(fileExt)
//         ? acc.concat({ filePath, fileName })
//         : acc;
//     }, []);
//   });
// };

// const acc = {};
// async function addToDict(file) {
//   const { filePath, fileName } = file;
//   const metro = path.basename(fileName, ".csv").slice(0, -3);
//   const round = path.basename(fileName, ".csv").slice(-2);
//   console.log(metro);
//   console.log(round);
//   if (acc[metro]) {
//     const fileData = await readFile(filePath);
//     parse(
//       fileData,
//       {
//         columns: true,
//         trim: true,
//       },
//       (err, rows) => {
//         acc[metro][round] = rows.reduce((obj, item) => {
//           obj[item.GEOID] = +item.n;
//           return obj;
//         }, {});
//       }
//     );
//   } else {
//     acc[metro] = {};
//     const fileData = await readFile(filePath);
//     parse(
//       fileData,
//       {
//         columns: true,
//         trim: true,
//       },
//       (err, rows) => {
//         acc[metro][round] = rows.reduce((obj, item) => {
//           obj[item.GEOID] = +item.n;
//           return obj;
//         }, {});
//       }
//     );
//   }
// }

// async function buildDict(csvs) {
//   for (const csv of csvs) {
//     await addToDict(csv);
//   }
//   console.log("Done!");
//   return acc;
// }

// async function outputCsvs(dict) {
//   for (const metro in dict) {
//     await fs.outputJson(`public/data/maps/${metro}.json`, dict[metro], {
//       spaces: 2,
//     });
//   }
// }

getData().catch(console.error);
// getAllCsvs().then(buildDict).then(outputCsvs);
