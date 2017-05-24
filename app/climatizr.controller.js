angular
  .module('climatizr')
  .controller('ClimatizrController', ClimatizrController);

function ClimatizrController($filter, $cookies, $timeout, WeatherFactory, CitiesFactory, WhatToDoFactory) {
  var vm = this;

  vm.states = [];
  vm.currentWeather = {};
  vm.todayForecast = {};
  vm.forecast = [];
  vm.todos = [];
  vm.dayClass = 'day';
  vm.filter = {
    state: 'SC',
    city: 'Blumenau',
  };

  vm.changeState = changeState;
  vm.changeCity = changeCity;
  vm.setCityState = setCityState;
  vm.viewFavorite = viewFavorite;
  vm.favoriteThisCity = favoriteThisCity;
  vm.isFavoriteCity = isFavoriteCity;
  vm.favoriteTooltip = favoriteTooltip;
  vm.isValidCity = isValidCity;

  var citySelectize,
      forecastCarousel,
      forecastChart,
      cookieData,
      favoriteCity = {state:'',city:''},
      skycons = new Skycons({"color": "#FFF"}),
      cookieExpiration = new Date(),
      statesData = [],
      currentCities = [],
      currentState = {},
      currentCity = {},
      currentDate = Date.now();

  cookieExpiration.setTime(Date.now() + (60 * 24 * 3600 * 1000));
  cookieData = $cookies.get('climatizrFavoriteCity');

  // Trigger the init only when the data about cities and states are availible
  CitiesFactory.initialize()
    .then( function() {
      init();
    });

  // Initialize the app
  function init() {
    vm.states = CitiesFactory.states();
    statesData = CitiesFactory.statesData();

    if (!!cookieData && cookieData != '') {
      favoriteCity = JSON.parse(cookieData);
      vm.filter.state = favoriteCity.state;
      vm.filter.city = favoriteCity.city;
    }
    else {
      vm.favoriteThisCity(true);
    }

    updateState();
    setDayTime();

    getCurrentWeather();

    // Chart global config
    Chart.defaults.global.defaultFontFamily = '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
    Chart.defaults.global.defaultFontColor = '#FFF';
    Chart.defaults.global.defaultFontSize = 14;
    Chart.defaults.global.defaultFontStyle = 'bold';

    // Chart building
    forecastChart = new Chart('forecast-chart', {
      type: 'line',
      data: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  // Clear the city field and trigger the update when the state is changed
  function changeState() {
    vm.filter.city = '';

    updateState();
  }

  // Updates the weather automatically when the city is changed
  function changeCity() {
    if (vm.isValidCity()) {
      getCurrentWeather();
    }
    else {
      angular.element('#warning-modal').modal('show');
    }
  }

  // Forces the city and state by given data
  function setCityState(city,state) {
    vm.filter.state = state;
    updateState();

    if (vm.filter.city != city) {
      vm.filter.city = city;

      getCurrentWeather();
    }
  }

  // Get your current favorite city and show the forecast data
  function viewFavorite() {
    vm.filter.state = favoriteCity.state;
    updateState();

    if (vm.filter.city != favoriteCity.city) {
      vm.filter.city = favoriteCity.city;

      getCurrentWeather();
    }
  }

  // Favorite the currently shown city
  function favoriteThisCity(skipValidation) {
    if (vm.isValidCity() || skipValidation) {
      favoriteCity.state = vm.filter.state;
      favoriteCity.city = vm.filter.city;

      var data = {
        state: favoriteCity.state,
        city: favoriteCity.city,
      };
      $cookies.put('climatizrFavoriteCity', JSON.stringify(data), {
        expires: cookieExpiration.toUTCString(),
        path: '/'
      });
    }
    else {
      angular.element('#warning-modal').modal('show');
    }
  }

  // Returns the correct class for the favorite city
  function isFavoriteCity() {
    return favoriteCity.state == vm.filter.state && favoriteCity.city == vm.filter.city;
  }

  // Changes the tooltip if the city is the favorite
  function favoriteTooltip() {
    if (vm.isFavoriteCity()) {
      return 'Esta é sua cidade favorita';
    }
    else {
      return 'Favoritar cidade';
    }
  }

  // Check if city is valid and existent
  function isValidCity() {
    return currentCities.indexOf(vm.filter.city) >= 0;
  }

  // Configurate the availible cities when the state is changed
  function updateState() {
    currentCities = [];
    currentState = $filter('filter')(statesData, {sigla: vm.filter.state})[0];
    currentCities = angular.copy(currentState.cidades);

    angular.element('#form-city').autocomplete({
      source: currentCities,
      select: function(event, ui) {
        // console.log(event,ui);
        // console.log(vm.filter.city);
      },
    });
  }

  // Get thy current weather information and build the chart and carousel
  function getCurrentWeather() {
    if (!!forecastCarousel) {
      // Destroy the owl carousel to build a new one with new data
      forecastCarousel.trigger('destroy.owl.carousel').removeClass('owl-drag owl-loaded');
      forecastCarousel.find('.owl-stage-outer').children().unwrap();
    }

    // Get the city latitude and longitude
    CitiesFactory.cityData(vm.filter.state, vm.filter.city)
    .then( function(data) {
      currentCity = data;

      var lat = currentCity.geometry.location.lat;
      var lng = currentCity.geometry.location.lng;

      // Get the availible weather information
      WeatherFactory.weatherByLocation(lat,lng)
      .then( function(data) {

        vm.currentWeather = data.currently;
        currentDate = data.currently.time * 1000;

        vm.todayForecast = data.daily.data[0];
        vm.forecast = angular.copy(data.daily.data);
        // Remove the current day since it is already shown
        vm.forecast.shift();

        setIcon('icon-current', data.currently.icon);

        // I use the timeout function to prevent rendering the carousel before angular renders the list
        // and to prevent a chart without any data
        $timeout(function() {
          // Build a responsive owl carousel
          forecastCarousel = angular.element('#forecast-carousel').owlCarousel({
            responsive: {
              0: {
                items: 2,
              },
              600: {
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

          var days = [];
          var highs = [];
          var lows = [];

          for (key in vm.forecast) {
            setIcon('icon-day' + key, vm.forecast[key].icon);

            vm.todos.push(WhatToDoFactory.hint(vm.forecast[key].icon, vm.forecast[key].time * 1000));

            // Build data for building the chart
            days.push($filter('date')(vm.forecast[key].time * 1000,'EEE, dd/MM'));
            highs.push($filter('number')(vm.forecast[key].temperatureMax, 0));
            lows.push($filter('number')(vm.forecast[key].temperatureMin, 0));
          }

          // Updates the chart datasets
          forecastChart.data.labels = days;
          forecastChart.data.datasets = [
            {
              label: 'Altas',
              data: highs,
              borderColor: "rgba(192,85,83,1)",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderWidth: 4,
            },
            {
              label: 'Baixas',
              data: lows,
              borderColor: "rgba(83,80,188,1)",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderWidth: 4,
            }
          ];
          forecastChart.update();

          angular.element('[data-toggle="tooltip"]').tooltip();
          angular.element('[data-toggle="popover"]').popover();
        },100);
      });
    });
  }

  // Set the class for showing the background
  function setDayTime() {
    var date = new Date(currentDate);
    var hour = date.getHours();

    vm.dayclass = (hour < 18 && hour > 5) ? 'day' : 'night';
  }

  // Set the skycon according to the given climate type
  function setIcon(id, iconId) {
    if (!id || !iconId) return;

    skycons.set(id, iconId);
    skycons.play();
  }
};