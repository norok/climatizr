angular
  .module('climatizr')
  .factory('RequestFactory', RequestFactory);

function RequestFactory($q, $http) {
  var functions = {
    request: request,
  }

  return functions;

  function request(params) {
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