const requestP = require("request-promise-native");
const {sendJoinMessage} = require('./join/join');

const join_api_key = process.env.JOIN_API_KEY;

async function getRedditPosts({sub,sort,count,time}={}){

    sub = sub!==undefined ? sub : "earthporn";
    sort = sort!==undefined ? sort : "top";
    count = count!==undefined ? count : 20;
    time = time!==undefined ? time : "day";

    const reddit_url = `https://www.reddit.com/r/${sub}/${sort}.json?count=${count}&t=${time}`;
    console.log(JSON.stringify({reddit_url}));
    let result = await requestP(reddit_url);
    result = JSON.parse(result);
    return result.data.children;
}

async function getNewRedditPost(){

    const reddit_posts =  await(async()=>{

        const promise_array = [];

        // promise_array.push( getRedditPosts({sub:"mostbeautiful"}) );
        promise_array.push( getRedditPosts({sub:"earthporn"}) );

        const [mostbeautiful_posts,earthporn_posts] = await Promise.all(promise_array);

        return mostbeautiful_posts.concat(earthporn_posts);
    })();

    console.warn("blindly returning top post at the moment");

    const index = parseInt(Math.random()*reddit_posts.length);

    console.log(`reddit_posts.length=${JSON.stringify(reddit_posts.length)}`)
    console.log(`index=${index}`)
    
    return reddit_posts[index] || "undefined";
}

function getRedditImage( reddit_post ){

    let toReturn;
    
    if( reddit_post==="undefined" || reddit_post===undefined ){
        throw new Error("reddit_post can not be undefined");
    }else if( typeof reddit_post === "object" ){
        toReturn = reddit_post.data.url;
        console.log("got reddit post object");
    }else{
        throw new Error("getRedditImage can not handle post links yet");
        // const post_obj = getRedditPostFromUrl(reddit_post);
        // toReturn = getRedditImage( post_obj );
        // console.log("got reddit post url");
    }

    return toReturn;
}

async function callJoinSetWallpaper( img_url ){
    // const {apikey} = getPerson( person_id ).join;
    
    const deviceId = "group.android";
    const wallpaper = img_url;
    const lockWallpaper = img_url;

    if( join_api_key===undefined ){
        throw new Error("apikey===undefined");
        return "apikey===undefined";
    }

    const join_obj = {
        deviceId,
        wallpaper,
        lockWallpaper
    };

    return await sendJoinMessage( join_obj, join_api_key ).then((r)=>{
        return {
            join_response:JSON.parse(r)
        }
    });
}

(async function main(){
    const reddit_post = await getNewRedditPost()
    const reddit_image = getRedditImage(reddit_post);
    callJoinSetWallpaper(reddit_image);
    
    console.log(reddit_image);
})()