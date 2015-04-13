let formWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "mcs-login/form-widget"
  }
};

module.exports = function(mod) {
  mod.directive("form", formWidget);
};
