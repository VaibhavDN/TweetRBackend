const { PLACEHOLDER, TWEETTYPE } = require("./Constants")

/**
 * Checks if email is valid using regex
 * @param {String} email 
 */
exports.isEmailValid = (email) => {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if(regex.test(email) === false && email != null) {
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
    if(regex.test(phone) === false && phone != null) {
        return false
    }

    return true
}


const extractTweets = (tweet, name, loginid, userId) => {
    let data = {
        'id': tweet.id,
        'name': name,
        'loginid': loginid,
        'userId': tweet.userId,
        'tweet': tweet.tweet,
        'likeCount': tweet.Likes.length,
        'selfLike': false,
        'createdAt': tweet.createdAt,
        'updatedAt': tweet.updatedAt,
        'type': TWEETTYPE.friend,
    }

    for (let itr = 0; itr < tweet.Likes.length; itr++) {
        if (tweet.Likes[itr].userId == userId) {
            data['selfLike'] = true
            break
        }
    }

    return data
}

exports.reformatFriendTweetData = (friendsTweetsData, userId) => {
    let reformatedData = []
    for(let itr = 0; itr < friendsTweetsData.length; itr++) {
        let data = friendsTweetsData[itr]
        data.Tweets.forEach((item) => {
            reformatedData.push(extractTweets(item, data.name, data.loginid, userId))
        })
    }
    return reformatedData
}

exports.reformatPublicTweetData = (publicTweetsData, userId) => {
    let reformatedData = []

    for(let itr = 0; itr < publicTweetsData.length; itr++) {
        let data = publicTweetsData[itr]

        let obj = {
            'id': data.id,
            'name': data.name,
            'loginid': data.loginid,
            'userId': data.userId,
            'tweet': data.tweet,
            'likeCount': data.Likes.length,
            'selfLike': false,
            'like': data.Likes,
            'createdAt': data.createdAt,
            'updatedAt': data.updatedAt,
            'type': TWEETTYPE.public,
        }
    
        for (let itr = 0; itr < data.Likes.length; itr++) {
            if (data.Likes[itr].userId == userId) {
                obj['selfLike'] = true
                break
            }
        }

        reformatedData.push(obj)
    }

    return reformatedData
}
