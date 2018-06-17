var restify = require('restify');
var citiesService = require('./citiesService');
var cityService = require('./cityService');

function start() {
  var server = restify.createServer({
    handleUncaughtExceptions: true
  });
  server.use(restify.plugins.queryParser());

  server.get(citiesService.route, citiesService.getCities);
  server.get(cityService.route, cityService.getCity);

  server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}

start();

module.exports = {start};