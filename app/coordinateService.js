function calculateBoundingBoxOf10KmAround(latitude, longitude) {
    let earthRadius = 40075;
    let latitudeModifier = 5 * (360 / earthRadius);
    let longitudeModifier = 5 * (360 / (Math.cos(latitude) * earthRadius));
    return {
        leftLongitude: longitude - longitudeModifier,
        rightLongitude: longitude + longitudeModifier,
        topLatitude: latitude - latitudeModifier,
        bottomLatitude: latitude + latitudeModifier
    };
}

function validCoordinates(latitude, longitude) {
    var latitudeValid = latitude <= 90 && latitude >= -90;
    var longitudeValid = longitude <= 180 && longitude >= -180;
    return latitudeValid && longitudeValid;
}

module.exports = {
    calculateBoundingBoxOf10KmAround,
    validCoordinates
};