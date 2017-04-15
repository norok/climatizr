angular.module('climatizr.controllers', [])

.controller('ClimatizrController', function($rootScope, $scope, $filter, $cookies, $timeout, WeatherFactory, CitiesFactory) {
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

  $scope.todos = [];

  $scope.validCityTooltip = '';

  $scope.data = {
    filter: {
      state: 'SC',
      city: 'Blumenau',
    },
    dayClass: 'day',
  };

  var citySelectize,
      forecastCarousel,
      forecastChart,
      cookieData,
      favoriteCity = {state:'',city:''},
      skycons = new Skycons({"color": "#FFF"}),
      cookieExpiration = new Date();

  cookieExpiration.setTime(Date.now() + (60 * 24 * 3600 * 1000));
  cookieData = $cookies.get('climatizrFavoriteCity');

  // Trigger the init only when the data about cities and states are availible
  CitiesFactory.initialize()
  .then( function() {
    init();
  });

  // Initialize the app
  function init() {
    $scope.states = CitiesFactory.states();
    $scope.statesData = CitiesFactory.statesData();

    if (!!cookieData && cookieData != '') {
      favoriteCity = JSON.parse(cookieData);
      $scope.data.filter.state = favoriteCity.state;
      $scope.data.filter.city = favoriteCity.city;
    }
    else {
      $scope.favoriteThisCity();
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
  $scope.changeState = function() {
    $scope.data.filter.city = '';

    updateState();
  }

  // Updates the weather automatically when the city is changed
  $scope.changeCity = function() {
    if ($scope.isValidCity()) {
      getCurrentWeather();
    }
    else {
      angular.element('#warning-modal').modal('show');
    }
  }

  // Forces the city and state by given data
  $scope.setCityState = function(city,state) {
    $scope.data.filter.state = state;
    updateState();

    if ($scope.data.filter.city != city) {
      $scope.data.filter.city = city;

      getCurrentWeather();
    }
  }

  // Get your current favorite city and show the forecast data
  $scope.viewFavorite = function() {
    $scope.data.filter.state = favoriteCity.state;
    updateState();

    if ($scope.data.filter.city != favoriteCity.city) {
      $scope.data.filter.city = favoriteCity.city;

      getCurrentWeather();
    }
  }

  // Favorite the currently shown city
  $scope.favoriteThisCity = function() {
    if ($scope.isValidCity()) {
      favoriteCity.state = $scope.data.filter.state;
      favoriteCity.city = $scope.data.filter.city;

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
  $scope.isFavoriteCity = function() {
    return favoriteCity.state == $scope.data.filter.state && favoriteCity.city == $scope.data.filter.city;
  }

  $scope.favoriteTooltip = function() {
    if ($scope.isFavoriteCity()) {
      return 'Esta é sua cidade favorita';
    }
    else {
      return 'Favoritar cidade';
    }
  }

  $scope.isValidCity = function() {
    return $scope.currentCities.indexOf($scope.data.filter.city) >= 0;
  }

  // Configurate the availible cities when the state is changed
  function updateState() {
    $scope.currentCities = [];
    $scope.currentState = $filter('filter')($scope.statesData, {sigla: $scope.data.filter.state})[0];
    $scope.currentCities = angular.copy($scope.currentState.cidades);

    angular.element('#form-city').autocomplete({
      source: $scope.currentCities,
      select: function(event, ui) {
        console.log(event,ui);
        console.log($scope.data.filter.city)
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
    CitiesFactory.cityData($scope.data.filter.state, $scope.data.filter.city)
    .then( function(data) {
      $scope.currentCity = data;

      var lat = $scope.currentCity.geometry.location.lat;
      var lng = $scope.currentCity.geometry.location.lng;

      // Get the availible weather information
      WeatherFactory.weatherByLocation(lat,lng)
      .then( function(data) {
        $scope.weatherData = data;

        $scope.currentWeather = data.currently;
        $scope.currentDate = data.currently.time * 1000;

        $scope.todayForecast = data.daily.data[0];
        $scope.forecast = angular.copy(data.daily.data);
        // Remove the current day since it is already shown
        $scope.forecast.shift();

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

          var todos = [];
          var days = [];
          var highs = [];
          var lows = [];

          for (key in $scope.forecast) {
            setIcon('icon-day' + key, $scope.forecast[key].icon);

            $scope.todos.push(whatToDo($scope.forecast[key].icon, $scope.forecast[key].time * 1000));

            // Build data for building the chart
            days.push($filter('date')($scope.forecast[key].time * 1000,'EEE, dd/MM'));
            highs.push($filter('number')($scope.forecast[key].temperatureMax, 0));
            lows.push($filter('number')($scope.forecast[key].temperatureMin, 0));
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
    var date = new Date($scope.currentDate);
    var hour = date.getHours();

    $scope.data.dayclass = (hour < 18 && hour > 5) ? 'day' : 'night';
  }

  // Set the skycon according to the given climate type
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

  // Gives me a hint on what to do pending on climate
  function whatToDo(id, time) {
    var date = new Date(time);
    var day = date.getDay();

    var tipsLibrary = {
      'clear-day': {
        weekend: [
          'O dia estará bom para um passeio ao ar livre.',
          'Que tal visitar um parque?',
        ],
        weekday: [
          'Não se preocupe com o guarda-chuvas, o dia estará limpo.',
          'Já que não chove, que tal ir a pé ou de bicicleta ao trabalho?'
        ],
      },
      'clear-night': {
        weekend: [
          'Uma noite limpa pode ser boa para sair com os amigos!',
          'Que tal ir a um bar ou restaurante com os amigos?'
        ],
        weekday: [
          'Uma noite limpa pode ser uma boa oportunidade para um happy hour!',
          'Que tal um pouco de exercícios durante a noite? Aproveite o tempo limpo!'
        ],
      },
      'partly-cloudy-day': {
        weekend: [
          'Com o dia parcialmente nublado, pode ser uma boa oportunidade para uma caminhada mais longa.',
          'Que tal passear com a família em algum parque?'
        ],
        weekday: [
          'Já que não chove, que tal ir a pé ou de bicicleta ao trabalho?',
        ],
      },
      'partly-cloudy-night': {
        weekend: [
          'Com o dia parcialmente nublado, pode ser uma boa oportunidade para uma caminhada mais longa.',
          'Que tal passear com a família em algum parque?'
        ],
        weekday: [
          'Já que não chove, que tal ir a pé ou de bicicleta ao trabalho?',
        ],
      },
      'cloudy': {
        weekend: [
          'Já que o sol não sai hoje, que tal aproveitar para visitar algum museu?',
          'Que tal aproveitar para fazer as compras da semana?',
        ],
        weekday: [
          'Com o dia nublado as temperaturas podem cair, esteja preparado!',
          'Cuidado com as roupas no varal! Dias nublados podem trazer chuvas inesperadas.'
        ],
      },
      'rain': {
        weekend: [
          'Com essa chuva toda, que tal ficar em casa e assistir a um filme ou seriado?',
          'Pode ser uma boa oportunidade para ir a um shopping ou ao cinema!'
        ],
        weekday: [
          'Tire as roupas do varal!',
          'Leve o guarda-chuvas e cuidado com alagamentos e trânsito. Saia mais cedo para evitar atrasos.'
        ],
      },
      'sleet': {
        weekend: [
          'Cuidado ao sair de casa! Talvez seja uma boa ficar e colocar seu seriado em dia.'
        ],
        weekday: [
          'Tome muito cuidado ao sair de casa!'
        ],
      },
      'snow': {
        weekend: [
          'Se for sair, se agasalhe bastante!'
        ],
        weekday: [
          'Saia bem agasalhado e preparado para enfrentar a neve.'
        ],
      },
      'wind': {
        weekend: [
          'Que tal aproveitar para empinar uma pipa?',
          'Evite levar seu drone para um passeio'
        ],
        weekday: [
          'Cuidado com as roupas no varal!',
          'Cuidado com o vento! Ao sair fique atento a objetos que podem voar a sua direção.'
        ],
      },
      'fog': {
        weekend: [
          'Não estrague seu fim de semana! Se sair de carro, fique atento ao trânsito.'
        ],
        weekday: [
          'Cuidado ao sair com seu carro! Redobre a atenção no trânsito!'
        ],
      }
    };

    var libToUse = (day == 0 || day == 6) ? tipsLibrary[id].weekend : tipsLibrary[id].weekday;

    var libLength = libToUse.length;
    var rand = Math.round(Math.random() * (libLength - 1));

    return libToUse[rand];
  }
});