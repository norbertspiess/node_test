var BadRequestError = require('restify-errors').BadRequestError;
var NotFoundError = require('restify-errors').NotFoundError;
var InternalServerError = require('restify-errors').InternalServerError;
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

    new Promise(function (resolve, reject) {
        var operation = sprintf('weather/?id=%s&appid=%s', cityId, openWeatherConfig.apiKey);

        request.get(openWeatherConfig.url + operation, function (error, response, body) {
            if (error || response.statusCode != 200) {
                switch (response.statusCode) {
                    case 404:
                        console.log('404 from open weather api, returning 404');
                        resolve(new NotFoundError('not found'));
                        return;
                    case 400:
                        console.log('400 from open weather api, returning 400');
                        resolve(new BadRequestError('invalid city id'));
                        return;
                    default:
                        reject('error on api call. ' + sprintf('%d: %s', response.statusCode, body));
                        return;
                }
            }

            var city = extractCity(body);

            resolve(city);
        });
    })
        .then(response => {
            res.send(response);
            next();
        })
        .catch(e => {
            console.error(e);
            res.send(new InternalServerError('internal error'));
            next();
        });
}

function extractCity(responseBody) {
    responseBody = JSON.parse(responseBody);
    return {
        "id": responseBody.id,
        "name": responseBody.name,
        "lat": responseBody.coord.lat,
        "lon": responseBody.coord.lon
    };
}

module.exports = {
    route,
    getCity
};