angular.module('climatizr', ['climatizr.services', 'climatizr.controllers', 'ngResource', 'localytics.directives', 'ngCookies'])
  .config(['chosenProvider', function (chosenProvider) {
    chosenProvider.setOption({
      no_results_text: 'Sem resultados!',
      placeholder_text: 'Escolha uma cidade'
    });
  }]);;