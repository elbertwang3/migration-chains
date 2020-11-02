const d3 = require("d3");

module.exports = {
  files: [
    {
      fileId: "1sYdUMD7Gw0vZng6Pq1Z-eNN1j7lzVe0z0MMAkk40pKE",
      type: "doc",
      name: "text",
      dataDir: "src/data/",
    },
    {
      fileId: "12h26xeeykmi379AvbsJn5Og9LxNT9DXAAbxHkrMFXi0",
      type: "sheet",
      name: "data",
      dataDir: "censusdata",
    },
  ],
  /**
   * The dataMutators option makes it possible to modify what's returned by
   * the data fetchers. This is a good place to restructure the raw data, or
   * to do joins with other data you may have.
   */
  dataMutators: {
    // the function name should match one of the `name` values in `files`
    // data(originalData) {
    //   const sf = originalData.census.filter(
    //     (d) => d.state_fips == "06" && d.county_fips == "075"
    //   );
    //   const dict = sf.reduce((obj, item) => {
    //     obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
    //       item.med_hh_inc;
    //     return obj;
    //   }, {});
    //   originalData.census = dict;
    //   return originalData;
    // },
  },
  //dataDir: 'inset',

  /**
   * `createAPI` makes it possible to bake out a series of JSON files that get
   * deployed with your project. This is a great way to break up data that users
   * only need a small slice of based on choices they make. The toolkit expects
   * this to return an array of objects. Each object should have a "key" and
   * a "value" - the "key" determines the URL, the "value" is what is saved at
   * that URL.
   */
  apis: [
    {
      inputDir: "censusdata",
      outputDir: "./public/data/census",
      createAPI: function (data) {
        const groupByMetro = Array.from(
          d3.group(data.data.census, (d) => d.msa),
          ([key, values]) => ({ key, values })
        );
        groupByMetro.forEach((d) => {
          d.values = d.values.reduce((obj, item) => {
            obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
              item.med_hh_inc;
            return obj;
          }, {});
        });
        return groupByMetro;
      },
    },
    {
      inputDir: "mapdata",
      outputDir: "./public/data/maps",
      createAPI: function (data) {
        const acc = {};
        for (const file in data) {
          const metro = file.slice(0, -3);
          const round = file.slice(-2);
          if (acc[metro]) {
            acc[metro][round] = data[file].reduce((obj, item) => {
              obj[item.GEOID] = +item.n;
              return obj;
            }, {});
          } else {
            acc[metro] = {};
            acc[metro][round] = data[file].reduce((obj, item) => {
              obj[item.GEOID] = +item.n;
              return obj;
            }, {});
          }
        }
        return Object.keys(acc).map((d) => {
          return { key: d, values: acc[d] };
        });
      },
    },
    {
      inputDir: "ipc",
      outputDir: "./src/data",
      createAPI: function (data) {
        const acc = {};
        for (const file in data) {
          const cleanedFile = file.replace("_kde_inc_pc", "");
          const metro = cleanedFile.slice(0, -3);
          const round = cleanedFile.slice(-2);
          if (acc[metro]) {
            acc[metro][round] = data[file].map((d) => {
              for (key in d) {
                if (key.includes("grid")) {
                  d["rv"] = +d[key];
                  delete d[key];
                } else {
                  d["p"] = +d[key];
                  delete d[key];
                }
              }
              return d;
            });
          } else {
            acc[metro] = {};
            acc[metro][round] = data[file].map((d) => {
              for (key in d) {
                if (key.includes("grid")) {
                  d["rv"] = +d[key];
                  delete d[key];
                } else {
                  d["p"] = +d[key];
                  delete d[key];
                }
              }
              return d;
            });
          }
        }
        Object.keys(acc).forEach((metro) => {
          const sorted = {};
          sorted[metro] = Object.keys(acc[metro])
            .sort()
            .forEach((round) => {
              sorted[round] = acc[metro][round];
            });

          acc[metro] = Object.keys(sorted).map((d) => {
            return { key: d, values: sorted[d] };
          });
        });
        return [
          {
            key: "ipc",
            values: acc,
          },
        ];
      },
    },
    {
      inputDir: "hhinc",
      outputDir: "./src/data",
      createAPI: function (data) {
        const acc = {};
        for (const file in data) {
          const cleanedFile = file.replace("_kde_med_hh_inc", "");
          const metro = cleanedFile.slice(0, -3);
          const round = cleanedFile.slice(-2);
          if (acc[metro]) {
            acc[metro][round] = data[file].map((d) => {
              for (key in d) {
                if (key.includes("grid")) {
                  d["rv"] = +d[key];
                  delete d[key];
                } else {
                  d["p"] = +d[key];
                  delete d[key];
                }
              }
              return d;
            });
          } else {
            acc[metro] = {};
            acc[metro][round] = data[file].map((d) => {
              for (key in d) {
                if (key.includes("grid")) {
                  d["rv"] = +d[key];
                  delete d[key];
                } else {
                  d["p"] = +d[key];
                  delete d[key];
                }
              }
              return d;
            });
          }
        }
        Object.keys(acc).forEach((metro) => {
          const sorted = {};
          sorted[metro] = Object.keys(acc[metro])
            .sort()
            .forEach((round) => {
              sorted[round] = acc[metro][round];
            });
          acc[metro] = Object.keys(sorted).map((d) => {
            return { key: d, values: sorted[d] };
          });
        });
        return [
          {
            key: "hhinc",
            values: acc,
          },
        ];
      },
    },
    // {
    //   inputDir: "chartdata",
    //   outputDir: "charts",
    //   createAPI: function (data) {
    //     const acc = {};
    //     for (const file in data) {
    //       const metro = file.slice(0, -5);
    //       const round = file.slice(-4);
    // console.log(metro);
    // console.log(round);
    // console.log(data[file]);
    // if (acc[metro]) {
    //   acc[metro][round] = data[file].reduce((obj, item) => {
    //     obj[item.GEOID] = +item.n;
    //     return obj;
    //   }, {});
    // } else {
    //   acc[metro] = {};
    //   acc[metro][round] = data[file].reduce((obj, item) => {
    //     obj[item.GEOID] = +item.n;
    //     return obj;
    //   }, {});
    // }
    //}
    // return Object.keys(acc).map((d) => {
    //   return { key: d, values: acc[d] };
    // });
    // },
    //},
  ],
};
