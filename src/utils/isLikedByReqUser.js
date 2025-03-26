export const isLikedByReqUser = ( reqUserId, post) => {
    for(let user of post.likedBy){
        if(reqUserId === user.id){
            return true;    
        }
    }
    return false;
}