/**
 * Cleans up JSON data from sequelize
 * removes dataValues, _previousValues etc
 * @param {JSON} data 
 */
const jsonSafe = (data) => {
    return JSON.parse(JSON.stringify(data))
}

/**
 * Takes the data and reformats it into the standard format.
 * Used to return data from the classes
 * @param {Boolean} success 
 * @param {Object} data 
 * @param {String} err 
 */
const classResponse = (success, data, err) => {
    data = jsonSafe(data)
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
const sendResponse = (res, success, data, err) => {
    return res.send({
        "success": success,
        "data": data,
        "err": err,
    })
}

const checkIsNaN = (...numbers) => {
    for(let itr = 0; itr < numbers.length; itr++) {
        if(isNaN(numbers[itr])) {
            return true
        }
    }

    return false
}

module.exports = {
    jsonSafe,
    classResponse,
    sendResponse,
    checkIsNaN,
}
