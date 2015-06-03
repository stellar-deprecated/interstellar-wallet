let formWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-stellar-wallet/form-widget"
  }
};

module.exports = function(mod) {
  mod.directive("form", formWidget);
};
