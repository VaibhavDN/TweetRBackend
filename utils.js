/**
 * Takes the data and reformats it into the standard format.
 * Used to return data from the classes
 * @param {Boolean} success 
 * @param {Object} data 
 * @param {String} err 
 */
exports.classResponse = (success, data, err) => {
    data = JSON.parse(JSON.stringify(data))
    return {
        success: success,
        data: data,
        err: err
    }
}

/**
 * Takes the data and reformats it into the standard format.
 * Used to send data from the server
 * @param {Boolean} success 
 * @param {Object} data 
 * @param {String} err 
 */
exports.sendResponse = (success, data, err) => {
    return {
        "success": success,
        "data": data,
        "err": err,
    }
}

/**
 * Cleans up JSON data from sequelize
 * removes dataValues, _previousValues etc
 * @param {JSON} data 
 */
exports.jsonSafe = (data) => {
    return JSON.parse(JSON.stringify(data))
}
