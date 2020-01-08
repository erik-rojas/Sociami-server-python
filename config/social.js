//let _OLD_FACEBOOK_APP_ID_REMOTE = 829265920570128;
//let _OLD_FACEBOOK_APP_SECRET_REMOTE = '3028d3ed775fb99807484d1ce3b5bafc';

let FACEBOOK_APP_ID_REMOTE = 162211384373641;
let FACEBOOK_APP_SECRET_REMOTE = '5603ed7f351e7358ea6ba3b565b31ee1';

let FACEBOOK_APP_ID_FOR_LOCAL_HOST = 375282336236539;
let FACEBOOK_APP_SECRET_FOR_LOCAL_HOST = '7f97c3ff9ee7eb9de98abcc9f7e0e06e';

let FACEBOOK_APP_ID = FACEBOOK_APP_ID_REMOTE;
let FACEBOOK_APP_SECRET = FACEBOOK_APP_SECRET_REMOTE;

let LINKEDIN_CONSUMER_KEY = '787asa9dt1hpsb';
let LINKEDIN_CONSUMER_SECRET = 'LL6RxKhDAKoE1tDI';

let CHATBOT_ACCESS_TOKEN = "37b79396dad143b68e2329263baa93d5";

let ConfigSocial = {
    FacebookAppID : FACEBOOK_APP_ID,
    FacebookAppSecret : FACEBOOK_APP_SECRET,
    LinkedInConsumerKey : LINKEDIN_CONSUMER_KEY,
    LinkedInConsumerSecret : LINKEDIN_CONSUMER_SECRET,
    LinkedInProfileIDs : ['id', 'first-name', 'last-name', 'email-address', 'picture-urls::(original)', 'picture-url::(original)', 'headline', 'specialties', 'industry'],
    //FaceBookProfileIDs : ['email','user_education_history', 'user_work_history', 'user_likes', 'id', 'name']
    FaceBookProfileIDs : ['id','emails', 'name', 'friends', 'displayName', 'picture.type(large)'],
    FacebookGraphApiURL : 'https://graph.facebook.com/v2.11',
    ChatbotAccessToken : CHATBOT_ACCESS_TOKEN
}


module.exports = ConfigSocial;