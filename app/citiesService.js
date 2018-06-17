var apiErrors = require('restify-errors');
var coordinateService = require('./coordinateService');

const route = '/cities';

function getCities(req, res, next) {
    var latitude = req.query.lat;
    var longitude = req.query.lon;

    if (areParametersInvalid(latitude, longitude)) {
        console.log('parameters invalid, sending 400');
        res.send(new apiErrors.BadRequestError('lat/lng required'));	
        return next();
    }

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    var box = coordinateService.calculateBoundingBoxOf10KmAround(latitude, longitude);


    res.send(200);
    return next();
}

function areParametersInvalid(latitude, longitude) {
    var typeInvalid = typeof latitude != 'number' && typeof longitude != 'number';
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    return typeInvalid || !coordinateService.validCoordinates(latitude, longitude);
}

module.exports = {
    route,
    getCities
};