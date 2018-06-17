var BadRequestError = require('restify-errors').BadRequestError;
var NotFoundError = require('restify-errors').NotFoundError;
var request = require('request');
var sprintf = require('sprintf-js').sprintf;
var openWeatherConfig = require('./openWeatherConfig');

const route = '/cities/:city_id/weather';

function getCityWeather(req, res, next) {
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

            res.send(extractWeatherData(body));
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

function extractWeatherData(responseBody) {
    responseBody = JSON.parse(responseBody);
    return {
        "type": responseBody.weather[0].main,
        "type_description": responseBody.weather[0].description,
        "sunrise": utcTimeToDateISO(responseBody.sys.sunrise),
        "sunset": utcTimeToDateISO(responseBody.sys.sunset),
        "temp": kelvinToCelsius(responseBody.main.temp),
        "temp_min": kelvinToCelsius(responseBody.main.temp_min),
        "temp_max": kelvinToCelsius(responseBody.main.temp_max),
        "pressure": responseBody.main.pressure,
        "humidity": responseBody.main.humidity,
        "clouds_percent": responseBody.clouds.all,
        "wind_speed": responseBody.wind.speed
    };
}

function utcTimeToDateISO(value) {
    return new Date(value * 1000).toISOString();
}

function kelvinToCelsius(value) {
    return Math.round((value - 273.15) * 100) / 100;
}

module.exports = {
    route,
    getCityWeather
};