angular
  .module('climatizr')
  .factory('CitiesFactory', CitiesFactory);

function CitiesFactory($q, RequestFactory) {
  var statesStorage = [];
  var statesDataStorage = [];

  var mapsUrl = '//maps.google.com/maps/api/geocode/json';

  var service = {
    initialize: initialize,
    states: states,
    statesData: statesData,
    cityData: cityData,
  }

  return service;
  
  function initialize() {
    var defer = $q.defer();

    if (statesDataStorage.length == 0) {
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
        statesDataStorage = sc_data.data.estados;

        for (i in statesDataStorage) {
          statesStorage.push(statesDataStorage[i].sigla);
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
  }

  function states() {
    return statesStorage;
  }

  function statesData() {
    return statesDataStorage;
  }
   
  function cityData(state,city) {
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