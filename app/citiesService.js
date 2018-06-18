var BadRequestError = require('restify-errors').BadRequestError;
var InternalServerError = require('restify-errors').InternalServerError;
var request = require('request');
var sprintf = require('sprintf-js').sprintf;
var openWeatherConfig = require('./openWeatherConfig');

const route = '/cities';

function getCities(req, res, next) {
    var latitude = parseFloat(req.query.lat);
    var longitude = parseFloat(req.query.lon);

    if (!validCoordinates(latitude, longitude)) {
        console.log('parameters invalid, sending 400');
        res.send(new BadRequestError('lat/lng required'));
        return next();
    }

    new Promise(function (resolve, reject) {
        var box = calculateBoundingBoxOf10KmAround(latitude, longitude);
        var params = sprintf('box/city?bbox=%f,%f,%f,%f,10&appid=%s',
            box.leftLongitude, box.bottomLatitude, box.rightLongitude, box.topLatitude,
            openWeatherConfig.apiKey);

        request.get(openWeatherConfig.url + params, function (error, response, body) {
            if (error || response.statusCode != 200) {
                reject('error on api call. ' + sprintf('%d: %s', response.statusCode, body));
                return;
            }

            var cities = extractCities(body);
            resolve(cities);
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

function validCoordinates(latitude, longitude) {
    var latitudeValid = latitude <= 90 && latitude >= -90;
    var longitudeValid = longitude <= 180 && longitude >= -180;
    return latitudeValid && longitudeValid;
}

function calculateBoundingBoxOf10KmAround(latitude, longitude) {
    let earthRadius = 40075;
    let latitudeModifier = 5 * (360 / earthRadius);
    let longitudeModifier = 5 * (360 / (Math.cos(latitude) * earthRadius));
    return {
        leftLongitude: longitude - longitudeModifier,
        rightLongitude: longitude + longitudeModifier,
        topLatitude: latitude + latitudeModifier,
        bottomLatitude: latitude - latitudeModifier
    };
}

function extractCities(responseBody) {
    var cities = [];
    responseBody = JSON.parse(responseBody);
    if (responseBody.hasOwnProperty('list')) {
        responseBody.list.forEach(city => {
            cities.push({
                "id": city.id,
                "name": city.name
            })
        });
    }
    return cities;
}

module.exports = {
    route,
    getCities
};