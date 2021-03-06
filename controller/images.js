const getImage = require("../classes/Images/Images").getImage
const utils = require('../utils')

exports.getImageBlob = async (req, res, next) => {
    return await getImage()
}