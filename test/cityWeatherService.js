var expect = require('chai').expect;
var request = require('request');
var sinon = require('sinon');

const cityWeatherUrl = 'http://localhost:8080/cities/any/weather';

describe('service: /cities/{city_id}/weather', function () {

    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('404 response on open weather API call', function () {
        it('should get a 404 response', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 404 },
                    JSON.stringify({"cod": "404", "message": "city not found"})
                );
            });
            request(cityWeatherUrl, function (error, response, body) {
                expect(response.statusCode).to.equal(404);
                expect(JSON.parse(body).message).to.equal('not found');
                done();
            });
        });
    });
    
    describe('400 response on open weather API call', function () {
        it('should get a 400 response', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 400 },
                    JSON.stringify({"cod": "400", "message": "any is invalid city"})
                );
            });
            request(cityWeatherUrl, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('invalid city id');
                done();
            });
        });
    });
    
    describe('200 response on open weather API call', function () {
        it('should get a 200 response', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 200 },
                    JSON.stringify({
                        "weather": [{
                            "main": "Rain",
                            "description": "shower rain",
                        }],
                        "main": {
                            "temp": 289.45,
                            "pressure": 1017,
                            "humidity": 77,
                            "temp_min": 287.15,
                            "temp_max": 291.15
                        },
                        "clouds": {
                            "all": 75
                        },
                        "wind": {
                            "speed": 7.7,
                        },
                        "sys": {
                            "sunrise": 1529207126,
                            "sunset": 1529266877
                        }
                    })
                );
            });
            request(cityWeatherUrl, function (error, response, cityWeather) {
                expect(response.statusCode).to.equal(200);
                
                cityWeather = JSON.parse(cityWeather);
                expect(cityWeather.type).to.equal('Rain');
                expect(cityWeather.type_description).to.equal('shower rain');
                expect(cityWeather.sunrise).to.equal('2018-06-17T03:45:26.000Z');
                expect(cityWeather.sunset).to.equal('2018-06-17T20:21:17.000Z');
                expect(cityWeather.temp).to.equal(16.3);
                expect(cityWeather.temp_min).to.equal(14);
                expect(cityWeather.temp_max).to.equal(18);
                expect(cityWeather.pressure).to.equal(1017);
                expect(cityWeather.humidity).to.equal(77);
                expect(cityWeather.clouds_percent).to.equal(75);
                expect(cityWeather.wind_speed).to.equal(7.7);

                done();
            });
        });
    });

});