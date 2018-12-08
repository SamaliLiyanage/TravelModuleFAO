module.exports.tripType = function(tripType) {
    switch (parseInt(tripType, 10)) {
        case 1: return "City Trip";
        case 2: return "Field Trip";
        case 3: return "Field Day Trip";
        case 4: return "Airport";
        default: return "Undefined";
    }
}