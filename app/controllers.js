angular.module('climatizr.controllers', [])

.controller('ClimatizrController', function($rootScope, $scope, $filter, $timeout, WeatherFactory, CitiesFactory) {
  $scope.states = [];
  $scope.statesData = [];
  $scope.currentCities = [];

  $scope.currentState = {};
  $scope.currentCity = {};
  $scope.currentDate = Date.now();

  $scope.weatherData = {};
  $scope.currentWeather = {};
  $scope.todayForecast = {};
  $scope.forecast = [];

  $scope.citySelectizeConfig = {
    maxOptions: 30,
    closeAfterSelect: true,
  }

  var citySelectize,
      forecastCarousel,
      skycons = new Skycons({"color": "#FFF"});

  $scope.data = {
    filter: {
      city: 'Blumenau',
      state: 'SC',
    },
    dayClass: 'day',
  };

  CitiesFactory.initialize()
  .then( function() {
    init();
  });

  function init() {
    $scope.states = CitiesFactory.states();
    $scope.statesData = CitiesFactory.statesData();

    updateState();
    setDayTime();

    $scope.getCurrentWeather($scope.data.filter.city);
  }

  $scope.getCurrentWeather = function() {
    if (!!forecastCarousel) {
      forecastCarousel.trigger('destroy.owl.carousel').removeClass('owl-drag owl-loaded');
      forecastCarousel.find('.owl-stage-outer').children().unwrap();
    }

    CitiesFactory.cityData($scope.data.filter.state, $scope.data.filter.city)
    .then( function(data) {
      $scope.currentCity = data;

      var lat = $scope.currentCity.geometry.location.lat;
      var lng = $scope.currentCity.geometry.location.lng;

      WeatherFactory.weatherByLocation(lat,lng)
      .then( function(data) {
        $scope.weatherData = data;

        $scope.currentWeather = data.currently;
        $scope.currentDate = data.currently.time * 1000;

        $scope.todayForecast = data.daily.data[0];
        $scope.forecast = angular.copy(data.daily.data);
        $scope.forecast.shift();

        setIcon('icon-current', data.currently.icon);

        $timeout(function() {
          forecastCarousel = angular.element('#forecast-carousel').owlCarousel({
            responsive: {
              0: {
                items: 2,
              },
              400: {
                items: 4,
              },
              995: {
                items: 6,
              },
              1200: {
                items: 7,
              }
            }
          });

          for (key in $scope.forecast) {
            setIcon('icon-day' + key, $scope.forecast[key].icon);
          }
        },100);
      });
    });

  }

  $scope.changeState = function() {
    $scope.data.filter.city = '';

    updateState();
  }

  $scope.changeCity = function() {
    $scope.getCurrentWeather();
  }

  $scope.setCityState = function(city,state) {
    $scope.data.filter.state = state;
    $scope.changeState();

    $scope.data.filter.city = city;

    $scope.getCurrentWeather();
  }

  function updateState() {
    $scope.currentState = $filter('filter')($scope.statesData, {sigla: $scope.data.filter.state})[0];
    $scope.currentCities = angular.copy($scope.currentState.cidades);
  }

  function setDayTime() {
    var date = new Date($scope.currentDate);
    var hour = date.getHours();

    $scope.data.dayclass = (hour < 18 && hour > 5) ? 'day' : 'night';
  }

  function setIcon(id, iconId) {
    switch (iconId) {
      case 'clear-day':
        skycons.set(id, Skycons.CLEAR_DAY);
        break;
      case 'clear-night':
        skycons.set(id, Skycons.CLEAR_NIGHT);
        break;
      case 'partly-cloudy-day':
        skycons.set(id, Skycons.PARTLY_CLOUDY_DAY);
        break;
      case 'partly-cloudy-night':
        skycons.set(id, Skycons.PARTLY_CLOUDY_NIGHT);
        break;
      case 'cloudy':
        skycons.set(id, Skycons.CLOUDY);
        break;
      case 'rain':
        skycons.set(id, Skycons.RAIN);
        break;
      case 'sleet':
        skycons.set(id, Skycons.SLEET);
        break;
      case 'snow':
        skycons.set(id, Skycons.SNOW);
        break;
      case 'wind':
        skycons.set(id, Skycons.WIND);
        break;
      case 'fog':
        skycons.set(id, Skycons.FOG);
        break;
    }
    skycons.play();
  }
});