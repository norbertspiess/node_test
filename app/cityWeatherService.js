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

    var operation = sprintf('weather/?id=%s&appid=%s', cityId, openWeatherConfig.apiKey);

    new Promise(function (resolve, reject) {
        console.log(openWeatherConfig.url + operation);
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

function extractWeatherData(body) {
    body = JSON.parse(body);
    return {
        "type": body.weather[0].main,
        "type_description": body.weather[0].description,
        "sunrise": new Date(body.sys.sunrise * 1000).toISOString(), // ???
        "sunset": new Date(body.sys.sunset * 1000).toISOString(),
        "temp": Math.round((body.main.temp - 273.15) * 100) / 100,
        "temp_min": Math.round((body.main.temp_min - 273.15) * 100 / 100),
        "temp_max": Math.round((body.main.temp_max - 273.15) * 100 / 100),
        "pressure": body.main.pressure,
        "humidity": body.main.humidity,
        "clouds_percent": body.clouds.all,
        "wind_speed": body.wind.speed
    };
}

module.exports = {
    route,
    getCityWeather
};