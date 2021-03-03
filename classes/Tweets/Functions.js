const text = require("../../text")
const constants = require("./Constants")

/**
 * Checks if email is valid using regex
 * @param {String} email 
 */
exports.isEmailValid = (email) => {
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
exports.isPhoneValid = (phone) => {
    let regex = /^[6-9]\d{9}$/
    if (regex.test(phone) === false && phone != null) {
        return false
    }

    return true
}

const countLikeType = (likeArray, likeTypeObjKeys) => {
    let likeCount = {
        [likeTypeObjKeys[0]]: constants.INITIALCOUNT,
        [likeTypeObjKeys[1]]: constants.INITIALCOUNT,
        [likeTypeObjKeys[2]]: constants.INITIALCOUNT,
        [likeTypeObjKeys[3]]: constants.INITIALCOUNT,
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


const extractTweets = (tweet, name, loginid, userId) => {
    let likeTypeObjKeys = Object.keys(constants.LIKETYPES)

    let likeCountObj = countLikeType(tweet.Likes, likeTypeObjKeys)

    let data = {
        'id': tweet.id,
        'name': name,
        'loginid': loginid,
        'userId': tweet.userId,
        'tweet': tweet.tweet,
        'likeCount': tweet.Likes.length,
        'selfLike': false,
        'myLikeType': text.TEXT.unliked,
        'createdAt': tweet.createdAt,
        'updatedAt': tweet.updatedAt,
        'type': constants.TWEETTYPE.friend,
        //'like': tweet.Likes,
        'likeCountObj': likeCountObj,
    }

    for (let itr = 0; itr < tweet.Likes.length; itr++) {
        if (tweet.Likes[itr].userId == userId) {
            data['selfLike'] = true
            data['myLikeType'] = likeTypeObjKeys[tweet.Likes[itr].likeType]
            break
        }
    }

    return data
}

exports.reformatFriendTweetData = (friendsTweetsData, userId) => {
    let reformatedData = []
    for (let itr = 0; itr < friendsTweetsData.length; itr++) {
        let data = friendsTweetsData[itr]
        data.Tweets.forEach((item) => {
            reformatedData.push(extractTweets(item, data.name, data.loginid, userId))
        })
    }
    return reformatedData
}

exports.reformatPublicTweetData = (publicTweetsData, userId) => {
    let reformatedData = []

    let likeTypeObjKeys = Object.keys(constants.LIKETYPES)

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
            'type': constants.TWEETTYPE.public,
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
exports.getFriendsArray = (friendListData, userId) => {
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
