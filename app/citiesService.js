var BadRequestError = require('restify-errors').BadRequestError;
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

    var box = calculateBoundingBoxOf10KmAround(latitude, longitude);

    var params = sprintf('box/city?bbox=%f,%f,%f,%f,10&appid=%s',
        box.leftLongitude, box.bottomLatitude, box.rightLongitude, box.topLatitude,
        openWeatherConfig.apiKey);
    
    new Promise(function(resolve, reject) {
        console.log(openWeatherConfig.url + params);
        request.get(openWeatherConfig.url + params, function (error, response, body) {
            if (error || response.statusCode != 200) {
                console.error('error on api call. ' + sprintf('%d: %s', response.statusCode, body));
                reject();
                return;
            }

            console.log("retrieved result: " + body);
            
            var result = [];
            response = JSON.parse(body);
            if (response.hasOwnProperty('list')) {
                response.list.forEach(city => {
                    result.push({
                        "id": city.id,
                        "name": city.name
                    })
                });
            }
    
            res.send(result);
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

function validCoordinates(latitude, longitude) {
    var latitudeValid = latitude <= 90 && latitude >= -90;
    var longitudeValid = longitude <= 180 && longitude >= -180;
    return latitudeValid && longitudeValid;
}

module.exports = {
    route,
    getCities
};