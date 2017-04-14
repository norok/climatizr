angular.module('climatizr.controllers', [])

.controller('ClimatizrController', function($rootScope, $scope, $filter, $timeout, WeatherFactory, CitiesFactory) {
  $scope.states = [];
  $scope.statesData = [];
  $scope.currentState = {};
  $scope.currentCities = [];

  $scope.weatherData = {};

  $scope.citySelectizeConfig = {
    maxOptions: 30,
    closeAfterSelect: true,
  }

  var citySelectize;

  $scope.data = {
    filter: {
      city: 'Blumenau',
      state: 'SC',
    }
  };

  CitiesFactory.initialize()
  .then( function() {
    init();
  });

  function init() {
    $scope.states = CitiesFactory.states();
    $scope.statesData = CitiesFactory.statesData();

    updateState();

    $scope.getCurrentWeather($scope.data.filter.city);
  }

  $scope.getCurrentWeather = function(name) {
    var query = name + ',br';

    WeatherFactory.currentWeatherByName(query)
    .then( function(data) {
      $scope.weatherData = data;
    });
  }

  $scope.changeState = function() {
    $scope.data.filter.city = '';

    updateState();
  }

  $scope.changeCity = function() {
    $scope.getCurrentWeather($scope.data.filter.city);
  }

  $scope.setCityState = function(city,state) {
    $scope.data.filter.state = state;
    $scope.data.filter.city = city;
  }

  function updateState() {
    $scope.currentState = $filter('filter')($scope.statesData, {sigla: $scope.data.filter.state})[0];
    $scope.currentCities = angular.copy($scope.currentState.cidades);
  }
});