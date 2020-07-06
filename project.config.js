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
    //   dataDir: "src/data",
    // },
    // {
    //   fileId: "16GBUpb2vZ3lh6ZcWRgG3JyuUZfF1Yb9XwLzGwuw5c9I",
    //   type: "sheet",
    //   name: "atlanta",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1Dlwvp2Dh8mXuntHwi5_aFpaEkTZ1_1n0Ir-d7duQGxQ",
    //   type: "sheet",
    //   name: "boston",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "10F-8abDb6nKNU_sfMr2xb-2zUbf7QMF-KzMbGB6Bx2k",
    //   type: "sheet",
    //   name: "chicago",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1Yd0Z5GPO18vxd5Add7vus_3QR9dXjIc9COBYTvj6a8Y",
    //   type: "sheet",
    //   name: "dallas",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1j5_7OJOp2GLPtkpjQNxR4OGuzJY5eKWJbSA2FHJUZtM",
    //   type: "sheet",
    //   name: "dc_metro",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1Gvv8aQ5RZJguz56XBxLxcxguwN4eUYrM9k9c-0-H5Wc",
    //   type: "sheet",
    //   name: "denver",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1jdpzSX2ck3BuKF120VZRa4crs4oyK7-chT8BF4ETH7E",
    //   type: "sheet",
    //   name: "houston",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1IpL7ggGz0iyGLyHbo99TCihUpIJx_hH_5pM5gPfwIVU",
    //   type: "sheet",
    //   name: "miami",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1K8V5AsFgbKAcir7NNw8nFCi0PXd3L20GCpB8Y8li_ns",
    //   type: "sheet",
    //   name: "mpls",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1vnauq390j7AdKHk3Du3K6HI2jJg2FrstaKRIRMB1ncI",
    //   type: "sheet",
    //   name: "nyc",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1PnItWH5SvB3f3xGle2gQ_rovXPqVsjQwJOx0xJP596s",
    //   type: "sheet",
    //   name: "philadelphia",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1NN3K6ptD5yi1Tt-QS5_7lZ464aOG9qLY7plKAVJqcBc",
    //   type: "sheet",
    //   name: "seattle",
    //   dataDir: "public/data/chains",
    // },
    // {
    //   fileId: "1IpL7ggGz0iyGLyHbo99TCihUpIJx_hH_5pM5gPfwIVU",
    //   type: "sheet",
    //   name: "sf",
    //   dataDir: "public/data/chains",
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
  createAPI(data) {
    const groupByMetro = d3
      .nest()
      .key((d) => d.msa)
      .entries(data.data.census);

    groupByMetro.forEach((d) => {
      d.key = `census/${d.key}`;
    });

    return groupByMetro;
  },
};
