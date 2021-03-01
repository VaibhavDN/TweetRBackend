/**
 * Takes the data and reformats it into the standard format.
 * Used to return data from the classes
 * @param {Boolean} success 
 * @param {Object} data 
 * @param {String} err 
 */
const classResponse = (success, data, err) => {
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
const sendResponse = (success, data, err) => {
    return {
        "success": success,
        "data": data,
        "err": err,
    }
}

module.exports = {
    'classResponse': classResponse,
    'sendResponse': sendResponse,
}

/*
const sendResponse = (req,res,success, data, err) => {
    return res.json({
        "success": success,
        "data": data,
        "err": err,
    })
}
*/