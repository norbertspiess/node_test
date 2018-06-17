var expect = require('chai').expect;
var request = require('request');
var sinon = require('sinon');

const citiesUrl = 'http://localhost:8080/cities?';

describe('service: /cities', function () {

    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('400 response check on missing parameters', function () {
        it('should get a 400 response', function (done) {
            var params = '';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on missing latitude parameter', function () {
        it('should get a 400 response', function (done) {
            var params = 'lon=0.1';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on missing longitude parameter', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=0.1';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid longitude parameter (type)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=0.1&lon=foo';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid latitude parameter (type)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=foo&lon=0.1';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid longitude parameter (too small)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=0&lon=-180.1';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid longitude parameter (too big)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=0&lon=180.1';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid latitude parameter (too small)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=-90.1&lon=0';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on invalid latitude parameter (too big)', function () {
        it('should get a 400 response', function (done) {
            var params = 'lat=90.1&lon=0';
            request(citiesUrl + params, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('500 response check on error on open weather API call', function () {
        it('should get a 500 response', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 500 }, "");
            });

            request(citiesUrl + 'lat=90&lon=0', function (error, response, body) {
                expect(response.statusCode).to.equal(500);
                done();
            });
        });
    });

    describe('200 response check on empty open weather API result', function () {
        it('should get a 200 response with empty array as body', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 200 }, "[]");
            });

            request(citiesUrl + 'lat=90&lon=0', function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal("[]");
                done();
            });
        });
    });

    describe('200 response check on filled open weather API result', function () {
        it('should get a 200 response with a city list', function (done) {
            sandbox.replace(request, 'get', function (url, requestCallback) {
                requestCallback(undefined, { statusCode: 200 },
                    '{"list": [{"id": "123", "name": "Musterstadt"}]}'
                );
            });

            request(citiesUrl + 'lat=90&lon=0', function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal('[{"id":"123","name":"Musterstadt"}]');
                done();
            });
        });
    });
});