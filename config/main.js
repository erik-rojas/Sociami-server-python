const APP_URL_REMOTE_PROD = "https://api.soqqle.com";
const APP_URL_REMOTE_STAGING = "https://stgapi.soqqle.com";

const APP_FRONTEND_URL_REMOTE_PROD = "http://soqqle.com";
const APP_FRONTEND_URL_REMOTE_STAGING = "http://stg.soqqle.com";

const APP_URL_LOCAL = "http://localhost:3001";
const APP_FRONTEND_URL_LOCAL = "http://localhost:3000";

const DB_NAME_LOCAL  = "test";
const DB_NAME_STAGING = "test";
const DB_NAME_PROD = "soqqle_prod";

let ConfigMain = {
    getThisUrl : function() {
        let url = "";

        if (process.env.dev_env =="local") {
            url = APP_URL_LOCAL;
        }
        else {
            url = process.env.NODE_ENV == "staging" ? APP_URL_REMOTE_STAGING : APP_URL_REMOTE_PROD;
        }

        return url;
    },
    getFrontEndUrl : function(session) {
        let url = "";

        if (session && session.frontEndURL) {
            url = session.frontEndURL;
        }
        else {
            if (process.env.dev_env =="local") {
                url = APP_FRONTEND_URL_LOCAL;
            }
            else {
                url = process.env.NODE_ENV == "staging" ? APP_FRONTEND_URL_REMOTE_STAGING : APP_FRONTEND_URL_REMOTE_PROD;
            }
        }

        return url;
    },

    getDatabaseName: function () {
        if (process.env.dev_env =="local") {
            return DB_NAME_LOCAL;
        }
        else {
            return process.env.NODE_ENV == "staging" ? DB_NAME_STAGING : DB_NAME_PROD;
        }
    },
}

module.exports = ConfigMain;
