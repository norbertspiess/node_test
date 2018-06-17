var restify = require('restify');
var citiesService = require('./citiesService');

var server = restify.createServer();
server.use(restify.plugins.queryParser());

server.get(citiesService.route, citiesService.getCities)

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});