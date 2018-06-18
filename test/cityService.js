var expect = require('chai').expect;
var request = require('request');
var sinon = require('sinon');

const cityUrl = 'http://localhost:8080/cities/';

describe('service: /cities/{city_id}', function () {

    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('400 response check on missing parameter', function () {
        it('should get a 400 response', function (done) {
            var params = '';
            request(cityUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('city Id required');
                done();
            });
        });
    });
    
    describe('404 response on open weather API call', function () {
        it('should get a 404 response', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 404 },
                    JSON.stringify({"cod": "404", "message": "city not found"})
                );
            });
            request(cityUrl + 'any', function (error, response, body) {
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
            request(cityUrl + 'any', function (error, response, body) {
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
                    JSON.stringify({"id": "123", "name": "city",
                        "coord": { "lon": 1, "lat": 2}})
                );
            });
            request(cityUrl + 'any', function (error, response, city) {
                expect(response.statusCode).to.equal(200);
                
                city = JSON.parse(city);
                expect(city.id).to.equal("123");
                expect(city.name).to.equal("city");
                expect(city.lat).to.equal(2);
                expect(city.lon).to.equal(1);

                done();
            });
        });
    });

});