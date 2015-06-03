let formWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-wallet/form-widget"
  }
};

module.exports = function(mod) {
  mod.directive("form", formWidget);
};
