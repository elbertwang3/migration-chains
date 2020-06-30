module.exports = {
  files: [
    {
      fileId: "1sYdUMD7Gw0vZng6Pq1Z-eNN1j7lzVe0z0MMAkk40pKE",
      type: "doc",
      name: "text",
      dataDir: "src/data",
    },
    {
      fileId: "12h26xeeykmi379AvbsJn5Og9LxNT9DXAAbxHkrMFXi0",
      type: "sheet",
      name: "census",
      dataDir: "src/data",
    },
    {
      fileId: "1IpL7ggGz0iyGLyHbo99TCihUpIJx_hH_5pM5gPfwIVU",
      type: "sheet",
      name: "sfchains",
      dataDir: "src/data",
    },
  ],
  /**
   * The dataMutators option makes it possible to modify what's returned by
   * the data fetchers. This is a good place to restructure the raw data, or
   * to do joins with other data you may have.
   */
  dataMutators: {
    // the function name should match one of the `name` values in `files`
    census(originalData) {
      const sf = originalData.census.filter(
        (d) => d.state_fips == "06" && d.county_fips == "075"
      );
      const dict = sf.reduce((obj, item) => {
        obj[`${item.state_fips}${item.county_fips}${item.tract_code}`] =
          item.med_hh_inc;
        return obj;
      }, {});
      originalData.census = dict;
      return originalData;
    },
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
  createAPI(data) {
    return null;
  },
};
