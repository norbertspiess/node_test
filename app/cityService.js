var BadRequestError = require('restify-errors').BadRequestError;
var NotFoundError = require('restify-errors').NotFoundError;
var request = require('request');
var sprintf = require('sprintf-js').sprintf;
var openWeatherConfig = require('./openWeatherConfig');

const route = '/cities/:city_id';

function getCity(req, res, next) {
    var cityId = req.params.city_id;

    if (!cityId) {
        console.log('parameter invalid, sending 400');
        res.send(new BadRequestError('city Id required'));	
        return next();
    }

    var operation = sprintf('weather/?id=%s&appid=%s', cityId, openWeatherConfig.apiKey);
    
    new Promise(function(resolve, reject) {
        console.log(openWeatherConfig.url + operation);
        request.get(openWeatherConfig.url + operation, function (error, response, body) {
            if (error || response.statusCode != 200) {
                if (response.statusCode == 404){
                    console.log("404 from open weather api, returning 404");
                    res.send(new NotFoundError('not found'));
                    next();
                    resolve();
                    return;
                }

                console.error('error on api call. ' + sprintf('%d: %s', response.statusCode, body));
                reject();
                return;
            }

            console.log("retrieved result: " + body);
            
            response = JSON.parse(body);
            var city = {
                "id": response.id,
                "name": response.name,
                "lat": response.coord.lat,
                "lon": response.coord.lon
            };
    
            res.send(city);
            next();

            resolve();
        });
    })
    .catch(e => {
        console.error(e);
        res.send(new Error('internal error'));
        next();
    });
}

module.exports = {
    route,
    getCity
};