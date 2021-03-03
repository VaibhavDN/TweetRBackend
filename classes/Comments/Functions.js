const users = require("../Users/Users")
const { INITIALCOUNT, LIKETYPES, PLACEHOLDER } = require("./Constants")
const utils = require('../../utils')
const { ERROR } = require("../../errorConstants")

const countLikeType = (likeArray, userId) => {
    let likeTypeObjKeys = Object.keys(LIKETYPES)
    let likeCount = {
        [likeTypeObjKeys[0]]: INITIALCOUNT,
        [likeTypeObjKeys[1]]: INITIALCOUNT,
        [likeTypeObjKeys[2]]: INITIALCOUNT,
        [likeTypeObjKeys[3]]: INITIALCOUNT,
    }

    let selfLike = false
    let myLikeType = -1

    for (let itr = 0; itr < likeArray.length; itr++) {
        switch (likeArray[itr].likeType) {
            case '0':
                likeCount[likeTypeObjKeys[0]] += 1
                break
            case '1':
                likeCount[likeTypeObjKeys[1]] += 1
                break
            case '2':
                likeCount[likeTypeObjKeys[2]] += 1
                break
            case '3':
                likeCount[likeTypeObjKeys[3]] += 1
                break
        }

        console.log("likeArray", likeArray[itr])
        if (likeArray[itr].userId == userId) {
            selfLike = true
            myLikeType = likeTypeObjKeys[likeArray[itr].likeType]
        }
    }

    return {
        'likeCount': likeCount,
        'selfLike': selfLike,
        'myLikeType': myLikeType,
    }
}

/**
 * Sets the like count and selfLike status
 * Self like: Is the comment liked by the user who is currently viewing
 * @param {Array} comments 
 * @param {Integer} userId 
 */
exports.getCountAndSelfLike = (comments, userId) => {

    for (let index = 0; index < comments.length; index++) {
        let data = comments[index]
        let _countLikeType = countLikeType(data.Likes, userId)
        let likeArrayLength = data.Likes.length

        comments[index]['likeCountObj'] = _countLikeType.likeCount
        comments[index]['selfLike'] = _countLikeType.selfLike
        comments[index]['myLikeType'] = _countLikeType.myLikeType
        comments[index]['likeCount'] = likeArrayLength
    }

    return comments
}

exports.validateUser = async (res, userId) => {
    let userExistsQuery = await users.findIfUserExists(userId)
    let userExistsQueryStatus = userExistsQuery.success

    if (userExistsQuery.data == null || userExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.user_doesnot_exist))
        return
    }
}
