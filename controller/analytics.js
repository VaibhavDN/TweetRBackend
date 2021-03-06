const utils = require("../utils")
const error = require("../errorConstants").ERROR

/**
 * Logs device analytics
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next
 */
exports.deviceAnalytics = (req, res, next) => {
    let analyticsObject = req.body.analyticsObject || {}
    analyticsObject = utils.jsonSafe(analyticsObject)

    if(Object.keys(analyticsObject).length === 0) {
        console.log("Sorry, analyticsObject was empty")
        return utils.sendResponse(res, false, {}, error.error_data_field)
    }

    console.log(analyticsObject)
    return utils.sendResponse(res, true, {}, "")
}