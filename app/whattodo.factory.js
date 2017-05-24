angular
  .module('climatizr')
  .factory('WhatToDoFactory', WhatToDoFactory);

function WhatToDoFactory() {
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
  
  var functions = {
    hint: hint,
  }

  return functions;

  // Gives me a hint on what to do pending on climate
  function hint(id, time) {
    var date = new Date(time);
    var day = date.getDay();

    var libToUse = (day == 0 || day == 6) ? tipsLibrary[id].weekend : tipsLibrary[id].weekday;

    var libLength = libToUse.length;
    var rand = Math.round(Math.random() * (libLength - 1));

    return libToUse[rand];
  }
}