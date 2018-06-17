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



    new Promise(function (resolve, reject) {
        var operation = sprintf('weather/?id=%s&appid=%s', cityId, openWeatherConfig.apiKey);

        request.get(openWeatherConfig.url + operation, function (error, response, body) {
            if (error || response.statusCode != 200) {
                if (response.statusCode == 404) {
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

            var city = extractCity(body);

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