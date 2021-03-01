/**
 * Sets the like count and selfLike status
 * Self like: Is the comment liked by the user who is currently viewing
 * @param {Array} comments 
 * @param {Integer} userId 
 */
exports.getCountAndSelfLike = (comments, userId) => {
    for (let index = 0; index < comments.length; index++) {
        let data = comments[index]
        let likeArrayLength = data.CommentLikes.length
        comments[index]['selfLike'] = false

        for (let itr = 0; itr < likeArrayLength; itr++) {
            if (data.CommentLikes[itr].userId == userId) {
                comments[index]['selfLike'] = true
                break
            }
        }

        comments[index]['likeCount'] = likeArrayLength
    }

    return comments
}