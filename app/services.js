angular.module('climatizr.services', [])

.factory('WeatherFactory', function($q, $resource) {
  var weatherIDResource    = $resource('http://api.openweathermap.org/data/2.5/weather?id=:cid&appid=eb8a795d9750c67ed7fbcc96d3ecd05a&units=metric&lang=pt', {cid: '@cid'});
  var weatherCityResource  = $resource('http://api.openweathermap.org/data/2.5/weather?q=:name&appid=eb8a795d9750c67ed7fbcc96d3ecd05a&units=metric&lang=pt', {name: '@name'});

  var forecastIDResource   = $resource('http://api.openweathermap.org/data/2.5/forecast?id=:cid&appid=eb8a795d9750c67ed7fbcc96d3ecd05a&units=metric&lang=pt', {cid: '@cid'});
  var forecastCityResource = $resource('http://api.openweathermap.org/data/2.5/forecast?q=:name&appid=eb8a795d9750c67ed7fbcc96d3ecd05a&units=metric&lang=pt', {name: '@name'});

  return {
    currentWeatherById: function(id) {
      var defer = $q.defer();

      weatherIDResource.get({cid:id}, 
        function (success) {
          defer.resolve(success);
        }, function (err) {
          defer.reject(err);
        });

      return defer.promise;
    },
    currentWeatherByName: function(name) {
      var defer = $q.defer();

      weatherCityResource.get({name:name}, 
        function (success) {
          defer.resolve(success);
        }, function (err) {
          defer.reject(err);
        });

      return defer.promise;
    },
    forecastById: function(id) {
      var defer = $q.defer();

      forecastIDResource.get({cid:id}, 
        function (success) {
          defer.resolve(success);
        }, function (err) {
          defer.reject(err);
        });

      return defer.promise;
    },
    forecastByName: function(name) {
      var defer = $q.defer();

      forecastCityResource.get({name:name}, 
        function (success) {
          defer.resolve(success);
        }, function (err) {
          defer.reject(err);
        });

      return defer.promise;
    }
  }
})

.factory('CitiesFactory', function($q, RequestFactory) {
  var states = [];
  var statesData = [];

  return {
    initialize: function() {
      var defer = $q.defer();

      if (statesData.length == 0) {
        RequestFactory.request({
          method: 'GET',
          url: '/data/estados-cidades.json',
          data: {},
          params: {},
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then( function(sc_data) {
          statesData = sc_data.data.estados;

          for (i in statesData) {
            states.push(statesData[i].sigla);
          }
          
          defer.resolve(true);
        }, function(err) {
          console.error('States/Cities Data not loaded');
          defer.reject(err);
        });
      }
      else {
        defer.resolve(true);
      }

      return defer.promise;
    },
    states: function() {
      return states;
    },
    statesData: function() {
      return statesData;
    }
  }
})

.factory('RequestFactory', function($q, $http) {
  return {
    request: function(params) {
      var defer = $q.defer();

      params.headers = params.headers || {};

      $http(params)
        .then(function (success) {
          defer.resolve(success);
        }, function (err) {
          defer.reject(err);
        });

      return defer.promise;
    }
  }
});