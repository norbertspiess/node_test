assert = require('assert');
var expect  = require('chai').expect;
var request = require('request');

const citiesUrl = 'http://localhost:8080/cities?';

describe('service: /cities', function() {

    describe('400 response check on missing parameters', function() {
        it('should get a 400 response', function(done) {
            var params = '';
            request(citiesUrl + params, function(error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on missing latitude parameter', function() {
        it('should get a 400 response', function(done) {
            var params = 'lon=0.1';
            request(citiesUrl + params, function(error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });

    describe('400 response check on missing longitude parameter', function() {
        it('should get a 400 response', function(done) {
            var params = 'lat=0.1';
            request(citiesUrl + params, function(error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });
    describe('400 response check on invalid longitude parameter', function() {
        it('should get a 400 response', function(done) {
            var params = 'lat=0.1&lon=foo';
            request(citiesUrl + params, function(error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });
    describe('400 response check on missing longitude parameter', function() {
        it('should get a 400 response', function(done) {
            var params = 'lat=foo&lon=0.1';
            request(citiesUrl + params, function(error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(JSON.parse(body).message).to.equal('lat/lng required');
                done();
            });
        });
    });
});