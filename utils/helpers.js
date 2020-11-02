const d3 = require("d3");

module.exports.kernelDensityEstimator = (kernel, n) => {
  return function (V) {
    return n.map(function (x) {
      return [
        x,
        d3.mean(V, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
};

module.exports.kernelEpanechnikov = (k) => {
  return function (v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
};
