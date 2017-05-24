angular
  .module('climatizr')
  .factory('WeatherFactory', WeatherFactory);

function WeatherFactory($q, $resource, $http, $sce) {
  var baseUrl = 'https://api.darksky.net/forecast/';
  var key = 'd2deeb708d6b5a2f85682a02f40a8d9d';

  var functions = {
    weatherByLocation: weatherByLocation
  }

  return functions;

  function weatherByLocation(lat,lng) {
    var defer = $q.defer(),
        urlstring = [baseUrl, key, '/', lat, ',', lng, '?units=si&lang=pt&callback=JSON_CALLBACK'].join(''),
        url = $sce.trustAsResourceUrl(urlstring);

    $http.jsonp(urlstring)
      .then( function(success) {
        defer.resolve(success.data);
      })
      .catch( function(data, status, headers, config) {
        defer.reject(status);
      });

    return defer.promise;
  }
}