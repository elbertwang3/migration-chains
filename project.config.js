const d3 = require("d3");
module.exports = {
  files: [
    {
      fileId: "1sYdUMD7Gw0vZng6Pq1Z-eNN1j7lzVe0z0MMAkk40pKE",
      type: "doc",
      name: "text",
      dataDir: "src",
    },
    // {
    //   fileId: "12h26xeeykmi379AvbsJn5Og9LxNT9DXAAbxHkrMFXi0",
    //   type: "sheet",
    //   name: "data",
    //   dataDir: "censusdata",
    // },
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
      outputDir: "census",
      createAPI: function (data) {
        const groupByMetro = Array.from(
          d3.group(data.data, (d) => d.msa),
          ([key, values]) => ({ key, values })
        );
        groupByMetro.forEach((d) => {
          d.values = d.values.reduce((obj, item) => {
            obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
              item.med_hh_inc;
            return obj;
          }, {});
        });

        // console.log(groupByMetro);

        return groupByMetro;
      },
    },
    {
      inputDir: "mapdata",
      outputDir: "maps",
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
  ],
};
