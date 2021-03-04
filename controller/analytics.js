const constants = require("../classes/Users/Constants")
const utils = require("../utils")
const error = require("../errorConstants")

exports.deviceAnalytics = (req, res, next) => {
    let analyticsObject = req.body.analyticsObject || {}
    analyticsObject = utils.jsonSafe(analyticsObject)

    if(Object.keys(analyticsObject).length === 0) {
        console.log("Sorry, analyticsObject was empty")
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.error_data_field)
    }

    console.log(analyticsObject)
    return utils.sendResponse(res, true, constants.PLACEHOLDER.empty_response, constants.PLACEHOLDER.empty_string)
}