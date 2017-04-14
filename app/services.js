angular.module('climatizr.services', [])

.factory('WeatherFactory', function($q, $resource, RequestFactory) {
  var darkSkyUrl = 'https://api.darksky.net/forecast/d2deeb708d6b5a2f85682a02f40a8d9d/';

  return {
    weatherByLocation: function(lat,lng) {
      var defer = $q.defer();

      console.log('Requesting Weather Data')

      RequestFactory.request({
        method: 'GET',
        url: darkSkyUrl + lat + ',' + lng,
        data: {},
        params: {
          units: 'si',
          lang: 'pt'
        },
      })
      .then( function(success) {
        console.log(success);

        defer.resolve(success);
      }, function(err) {
        defer.reject(err);
      });

      return defer.promise;
    }
  }
})

.factory('CitiesFactory', function($q, RequestFactory) {
  var states = [];
  var statesData = [];

  var mapsUrl = '//maps.google.com/maps/api/geocode/json';

  return {
    initialize: function() {
      var defer = $q.defer();

      if (statesData.length == 0) {
        RequestFactory.request({
          method: 'GET',
          url: './data/estados-cidades.json',
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
    },
    cityData: function(state,city) {
      var defer = $q.defer();

      RequestFactory.request({
        method: 'GET',
        url: mapsUrl,
        data: {},
        params: {
          address: state + ',' + city,
          sensor: false
        },
      })
      .then( function(success) {
        defer.resolve(success.data.results[0]);
      }, function(err) {
        defer.reject(err);
      })

      return defer.promise;
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