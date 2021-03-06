const Images = require("../../models/Images").Images

const getImage = async () => {
    return await Images.findOne({
        where: {
            id: 1
        }
    })
}

module.exports = getImage
