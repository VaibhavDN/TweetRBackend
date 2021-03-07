const Users = require('../Users/Users')

const Constants = require('./Constants')
const text = require("../../text")

/**
 * Checks if email is valid using regex
 * @param {String} email 
 */
const isEmailValid = (email) => {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (regex.test(email) === false && email != null) {
        return false
    }

    return true
}

/**
 * Checks if phone number is valid using regex
 * @param {String} phone 
 */
const isPhoneValid = (phone) => {
    let regex = /^[6-9]\d{9}$/
    if (regex.test(phone) === false && phone != null) {
        return false
    }

    return true
}

/**
 * Counts which type of like has been pressed how many times
 * @param {Array} likeArray 
 * @param {Array} likeTypeObjKeys 
 */
const countLikeType = (likeArray, likeTypeObjKeys) => {
    let likeCount = {
        [likeTypeObjKeys[0]]: Constants.INITIALCOUNT,
        [likeTypeObjKeys[1]]: Constants.INITIALCOUNT,
        [likeTypeObjKeys[2]]: Constants.INITIALCOUNT,
        [likeTypeObjKeys[3]]: Constants.INITIALCOUNT,
    }

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
    }

    return likeCount
}

/**
 * Reformats public tweet data before it can be sent to the frontend
 * @param {Array of Objects} publicTweetsData 
 * @param {Integer} userId 
 */
const reformatTweetData = (publicTweetsData, userId, tweetType) => {
    let reformatedData = []

    let likeTypeObjKeys = Object.keys(Constants.LIKETYPES)

    for (let itr = 0; itr < publicTweetsData.length; itr++) {
        let data = publicTweetsData[itr]

        let likeCountObj = countLikeType(data.Likes, likeTypeObjKeys)

        let obj = {
            'id': data.id,
            'name': data.name,
            'loginid': data.loginid,
            'userId': data.userId,
            'tweet': data.tweet,
            'likeCount': data.Likes.length,
            'selfLike': false,
            'myLikeType': text.TEXT.unliked,
            //'like': data.Likes,
            'createdAt': data.createdAt,
            'updatedAt': data.updatedAt,
            'type': tweetType,
            'likeCountObj': likeCountObj,
        }

        for (let itr = 0; itr < data.Likes.length; itr++) {
            if (data.Likes[itr].userId == userId) {
                obj['selfLike'] = true
                obj['myLikeType'] = likeTypeObjKeys[data.Likes[itr].likeType]
                break
            }
        }

        reformatedData.push(obj)
    }

    return reformatedData
}

/**
 * Extracts array of friend's userId from the find all friends query result.
 * @param {Array of Objects} friendListData 
 */
const getFriendsArray = (friendListData, userId) => {
    let friendList = []
    let friendSet = new Set()
    for (let itr = 0; itr < friendListData.length; itr++) {
        let userOneId = friendListData[itr].userOneId
        let userTwoId = friendListData[itr].userTwoId
        if (userOneId != userId) {
            friendSet.add(userOneId)
        }
        else if (userTwoId != userId) {
            friendSet.add(userTwoId)
        }
    }

    friendList = [...friendSet]
    return friendList
}

/**
 * Checks if user with userId exists in the database
 * @param {Object} res 
 * @param {Integer} userId 
 */
const validateUser = async (res, userId) => {
    let userExistsQuery = await Users.findIfUserExists(userId)

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
        return false
    }

    return true
}

module.exports = {
    isEmailValid,
    isPhoneValid,
    reformatTweetData,
    getFriendsArray,
    validateUser,
}
