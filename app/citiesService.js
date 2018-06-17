var errors = require('restify-errors');

var route = '/cities';

function getCities(req, res, next) {
    var latitude = req.query.lat;
    var longitude = req.query.lon;

    if (parametersInvalid(latitude, longitude)) {
        console.log('parameters invalid, sending 400');
        res.send(new errors.BadRequestError('lat/lng required'));	
        return next();
    }

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    console.log(latitude + ' - ' + longitude);

    res.send(200);
    return next();
}

function parametersInvalid(latitude, longitude) {
    return typeof latitude != 'number' && typeof longitude != 'number';
}

module.exports = {route, getCities};