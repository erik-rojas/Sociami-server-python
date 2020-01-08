const Express = require('express'),
App = Express(),
Passport = require('passport'),
Session = require('express-session'),
BodyParser = require('body-parser');
const Busboy = require('connect-busboy');
const BusboyBodyParser = require('busboy-body-parser');
const IO = require('socket.io');
var apiai = require('apiai');
var ConfigMain = require('./config/main');
var ConfigSocial = require('./config/social');
var apiaiApp = apiai(ConfigSocial.ChatbotAccessToken);
var PubSub = require('pubsub-js');

// const runBot = require('./telegrambot/build/main.js');
const config = require('./config.json');

var Logger = require('morgan');
var CookieParser = require('cookie-parser');
var Flash = require('connect-flash');

var SoqqlerConnections = require('./models/soqqlerConnections');
var UserProfile = require('./models/userProfile');
var async = require('async');

var ChatHelper = require('./helpers/helper_chat');

const MongoStore = require('connect-mongo')(Session);

console.log(`Front End URL is: ${ConfigMain.getFrontEndUrl()}/auth/facebook/callback`);

const HelperTasks = require('./helpers/helper_tasks');
const HelperTimers = require('./helpers/helper_timers');

const CronJob = require('cron').CronJob;

// every day midnight SG timezone
// real 0 0 * * *
// test */1 * * * * every minute
const JobClearDailyTracker = new CronJob('0 0 * * *', () => {
  HelperTimers.refreshTracker('Daily')
}, null, false, 'Asia/Singapore')

// every week midnight SG timezone
const JobClearWeeklyTracker = new CronJob('0 0 * * 0', () => {
  HelperTimers.refreshTracker('Weekly')
}, null, false, 'Asia/Singapore')

// every 1st of the month SG timezone
const JobClearMonthlyTracker = new CronJob('0 0 1 * *', () => {
  HelperTimers.refreshTracker('Monthly')
}, null, false, 'Asia/Singapore')

var MongoConfig = require("./config/database.json");
var Mongoose = require('mongoose');
Mongoose.Promise = global.Promise;

/****MongoDB credentials*******************/
var mongoLogin = MongoConfig.username;
var mongoPass = MongoConfig.pass;
/******************************************/

const MongoConnectOptions = {
  useMongoClient: true,
  promiseLibrary: global.Promise,keepAlive: true,
  reconnectTries: 30,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
};

var mongoURI = String(MongoConfig.uri).replace("{username}", mongoLogin).replace("{password}", mongoPass).replace("{dbname}", ConfigMain.getDatabaseName());
console.log("Connecting to database...");
Mongoose.connect(mongoURI, MongoConnectOptions);

var db = Mongoose.connection;
db.on('error', function(err) {
console.log("Failed to connect to Database: " + err);
});
db.once('open', function() {
  console.log("Database connection successfull");
  JobClearDailyTracker.start();
  JobClearWeeklyTracker.start();
  JobClearMonthlyTracker.start();
});


var UserProfile = require('./models/userProfile');

const port = process.env.port ? process.env.port : process.env.NODE_ENV == "staging"? 8080: 3000;

App.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
next();
});

App.use(Logger('dev'));
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({extended: true}));
App.use(CookieParser());
App.use(Session({
secret: 'keyboard cat',
resave: true,
saveUninitialized: true,
store: new MongoStore({
  url:mongoURI,
})
}));

App.use(Passport.initialize());
App.use(Passport.session({ secret: 'Shhh.. This is a secret', cookie: { secure: true } }));

App.use(Flash());

Passport.serializeUser(function(user, done) {
  // console.log('Serializing user!!!:');
  // console.dir(user);
  done(null, user);
});
Passport.deserializeUser(function(user, done) {
  // console.log('Deserializing user!!!:');
  // console.dir(user);
  done(null, user);
});

App.use('/', require('./routes/routes.js'));
App.use('/', require('./routes/mailerlite.js'));
App.use('/', require('./routes/linkedin.js'));
App.use('/', require('./routes/facebook.js'));
App.use('/', require('./routes/localUser.js'));
App.use('/', require('./routes/userActivities.js'));
App.use('/userProfile/:id/:type/upload-image', Busboy());
App.use('/userProfile/:id/:type/upload-image', BusboyBodyParser());
App.use('/', require('./routes/userProfile.js'));
App.use('/', require('./routes/apiServices.js'));
App.use('/', require('./routes/hangouts.js'));
App.use('/', require('./routes/recommendationSystem.js'));
App.use('/skill/:id/upload-image', Busboy());
App.use('/skill/:id/upload-image', BusboyBodyParser());
App.use('/', require('./routes/skillMaintenance.js'));
App.use('/', require('./routes/fetchResources.js'));
App.use('/', require('./routes/taskManagement.js'));
App.use('/', require('./routes/projectManagement.js'));
App.use('/', require('./routes/socialNetwork.js'));
App.use('/', require('./routes/questionsMaintenance.js'));
App.use('/addSkillsFile', require('./routes/addSkillsFile.js'));
App.use('/addRoadMapsFile', require('./routes/addRoadMapsFile.js'));
App.use('/addQuestionsFile', require('./routes/addQuestionsFile.js'));
App.use('/', require('./routes/hangoutAnswers.js'));
App.use('/', require('./routes/timers.js'))
App.use('/company/:id/upload-image', Busboy());
App.use('/company/:id/upload-image', BusboyBodyParser());
App.use('/', require('./routes/company.js'))
App.use('/', require('./routes/ticket.js'))
App.use('/achievements/:id/upload-image', Busboy());
App.use('/achievements/:id/upload-image', BusboyBodyParser());
App.use('/', require('./routes/achievements.js'))
App.use('/', require('./routes/article.js'))
App.use('/', require('./routes/userAchievement.js'))
App.use('/houses/:id/:type/upload-image', Busboy());
App.use('/houses/:id/:type/upload-image', BusboyBodyParser());
App.use('/', require('./routes/house.js'))
//db testing routes, remove or refactor later
App.use('/', require('./routes/test_db.js'));
App.use('/', require('./routes/setting.js'));
App.use('/', require('./routes/support.js'));
App.use('/', require('./routes/logout.js'));

App.use('/', require('./routes/taskBonuses.js'));

App.use('/', require('./routes/xpRanges.js'));

App.use('/', require('./routes/userLevels.js'));

App.use('/', require('./routes/taskActivityUnlockRequirements.js'));

App.use('/', require('./routes/googleAnalytics.js'));

App.use('/', require('./routes/userInteractions.js'));
App.use('/', require('./routes/userNextActions.js'));

App.use('/', require('./routes/conversation.js'));

App.use('/', require('./routes/characterManagement'));

App.use('/', require('./routes/promo'));

App.use('/', require('./routes/adminUser'));

App.use('/', require('./routes/userAccounting'));
App.use('/', require('./routes/teams'));
App.use('/', require('./routes/preferences'));
App.use('/', require('./routes/challenges'));

App.use('/', require('./routes/taskRef'));

//admin-signup
const localSignupStrategy = require('./auth/local-signup');
const localLoginStrategy = require('./auth/local-login');

Passport.use('local-signup', localSignupStrategy);
Passport.use('local-login', localLoginStrategy);
/*********************** */

// // Telegram Bot

// Configuration from config.json

const tokenProd = config.tokenProd;
const tokenStage = config.tokenStage;

const allowedUsers = config.allowedUsers;
const dgToken = config.dialogFlowClientToken;

// if(process.env.NODE_ENV && process.env.NODE_ENV == "staging") {
//   //run staging bot
//   runBot(tokenStage, allowedUsers, dgToken);
//   console.log("Staging Telegram Bot working...");
// }

// else{
//   //run deploy bot
//   runBot(tokenProd, allowedUsers, dgToken);
//   console.log("Production Telegram Bot working...");
// }
//

var server = App.listen(port);
const socketIO = IO(server);

var socket1;

var users = [];
var anonymousUsers = [];
var currUser = [];
// Setup socket.io
socketIO.on('connection', socket => {
var userID = socket.handshake.query.userID;
const username = socket.handshake.query.username;
const firstName = socket.handshake.query.firstName;
const lastName = socket.handshake.query.lastName;
const userType = socket.handshake.query.userType;
console.log(`${userID} = ${firstName} ${lastName} connected`);

socket1 = socket;

var hasUserJoined = false;

if(username){
  for(var i=0; i < users.length; i++){
    if(users[i].userID == userID){
      users[i].socketIds.push(socket.id);
      hasUserJoined = true;
      currUser = users[i];
    }
  }

  if(!hasUserJoined){
    const userData = {
      username: username,
      userID: userID,
      firstName: firstName,
      lastName: lastName,
      userType: userType,
      socketIds: []
    }
    userData.socketIds.push(socket.id);
    users.push(userData);
    currUser = userData;
  }

  var type = "connect";
  getFriends(socket, type, hasUserJoined, currUser);
}

else{
  const userData = {
    userID: userID,
    socketId: socket.id
  }

  anonymousUsers.push(userData);

}

socket.on('client:message', data => {
  var senderSocketIds = [];
  var receiverSocketIds = [];
  ChatHelper.persistMessage(data)
  for(var i=0; i<users.length; i++){
    if(users[i].userID == data.sender){
      senderSocketIds = users[i].socketIds;
    }
    if(users[i].userID == data.receiver){
      receiverSocketIds = users[i].socketIds;
    }
  }

  for(var j=0; j<senderSocketIds.length; j++){
    data.fromMe = true;
    socket.broadcast.to(senderSocketIds[j]).emit('server:message', data);
  }

  for(var k=0; k<receiverSocketIds.length; k++){
    data.fromMe = false;
    socket.broadcast.to(receiverSocketIds[k]).emit('server:message', data);
  }
});

socket.on('UserLoggedIn', userData => {
  for(var j=0; j<anonymousUsers.length; j++){
    if(anonymousUsers[j].socketId == socket.id){
      anonymousUsers.splice(j,1);
    }
  }

  var hasUserJoined = false;

  for(var i=0; i < users.length; i++){
    if(users[i].userID == userData.userID){
      users[i].socketIds.push(socket.id);
      hasUserJoined = true;
      currUser = users[i];
    }
  }

  if(!hasUserJoined){
    userData.socketIds = [];
    userData.socketIds.push(socket.id);
    users.push(userData);
    currUser = userData;
  }

  var type = "connect";
  getFriends(socket, type, hasUserJoined, currUser);
});

socket.on('chatbotClient:message', data => {
  var senderSocketIds = [];
  var loggedIn = false;
  for(var i=0; i<users.length; i++){
    if(users[i].userID == data.sender){
      senderSocketIds = users[i].socketIds;
      loggedIn = true;
    }
  }
  ChatHelper.persistMessage(data)
  if(loggedIn){
    for(var j=0; j<senderSocketIds.length; j++){
      data.fromMe = true;
      socket.broadcast.to(senderSocketIds[j]).emit('chatbotServer:message', data);
    }
  }

  var request = apiaiApp.textRequest(data.message, {
    sessionId: data.sender
  });

  request.on('response', function(response) {

    var message = response.result.fulfillment.speech;
    for(var i=0;i<response.result.fulfillment.messages.length; i++){
      if(response.result.fulfillment.messages[i].type == 4){
        if(response.result.fulfillment.messages[i].payload.type == "link"){
          message = '<a href="' + response.result.fulfillment.messages[i].payload.content + '">' + response.result.fulfillment.messages[i].payload.title + '</a>';
        }
        else if(response.result.fulfillment.messages[i].payload.type == "img"){
          message = '<img style="width:150px;" src="' + response.result.fulfillment.messages[i].payload.content + '"></img>';
        }
      }
    }

      const messageObject = {
        sender: "chatbot",
        message: message,
        receiver: data.sender,
        time: new Date(),
        fromMe: false
      };

      ChatHelper.persistMessage(messageObject)
      socket.emit('chatbotServer:message', messageObject);

      if(loggedIn){
        for(var j=0; j<senderSocketIds.length; j++){
          socket.broadcast.to(senderSocketIds[j]).emit('chatbotServer:message', messageObject);
        }
      }
  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();
});

socket.on('chatbotClient:initiateWelcomeMessage', data => {
  userID = data;
  var eventGetNextAction = {
    name: "get_id",
    data: {
        id: userID,
    }
  };

  var requestTest = apiaiApp.eventRequest(eventGetNextAction, {
    sessionId: userID
  });

  requestTest.on('response', function(response) {
    var senderSocketIds = [];

    for(var i=0; i<users.length; i++){
      if(users[i].userID == userID){
        senderSocketIds = users[i].socketIds;
      }
    }

    const messageObject = {
      sender: "chatbot",
      message: response.result.fulfillment.speech,
      receiver: userID,
      time: new Date(),
      fromMe: false
    };

    socket.emit('chatbotServer:message', messageObject);

      for(var j=0; j<senderSocketIds.length; j++){
        socket.broadcast.to(senderSocketIds[j]).emit('chatbotServer:message', messageObject);
      }
  });

  requestTest.on('error', function(error) {
      console.log(error);
  });

  requestTest.end();
});

socket.on('disconnect', () => {
    var isAnonymousUser = true;
    for(var i=0;i<users.length;i++){
        if(users[i].userID == userID){
          isAnonymousUser = false;
          var index = users[i].socketIds.indexOf(socket.id);
          if (index > -1) {
            users[i].socketIds.splice(index, 1);
          }
          if(users[i].socketIds.length<1){
            var type = "disconnect";
            var currUser = users[i];
            getFriends(socket, type, true, currUser);
            users.splice(i,1);
            console.log(`${userID} disconnected`)
          }
        }
    }

    if(isAnonymousUser){
      for(var j=0;j<anonymousUsers.length;j++){
        if(anonymousUsers[j].userID == userID){
          anonymousUsers.splice(j,1);
          console.log(`${userID} disconnected`)
        }
      }
    }
});


});


var eventSubscriber = function(msg, eventObj) {
    if (eventObj.userIdList && eventObj.userIdList.length > 0) {
      broadcastToSpecifiedUsers(msg, eventObj);
    }
    else if (eventObj.userIdExcludedList && eventObj.userIdExcludedList.length > 0) {
      broadcastToAllExcept(msg, eventObj);
    }
    else {
      broadcastToAll(msg, eventObj);
    }
};

function broadcastToAll(msg, eventObj){
  if (!socket1) {
    return; //@Sunil - why do we have undefined socket1 used here? This leads to crash. I put return for now.
  }

  socket1.emit(msg, eventObj);
  for(var i=0; i<users.length; i++){
    for(var j=0; j<users[i].socketIds.length; j++){
      socket1.broadcast.to(users[i].socketIds[j]).emit(msg, eventObj);
    }
  }
}

function broadcastToAllExcept(msg, eventObj){
  const userIdExcludedList = eventObj.userIdExcludedList;
  for(var k=0; k<userIdExcludedList.length; k++){
    for(var l=0; l<users.length; l++){
      if(userIdExcludedList[k] != users[l].userID){
        for(var m=0; m<users[l].socketIds.length; m++){
          socket1.broadcast.to(users[l].socketIds[m]).emit(msg, eventObj);
        }
        if(userIdExcludedList[k] != currUser.userID){
          socket1.emit(msg, eventObj);
        }
      }
    }
  }
}

function broadcastToSpecifiedUsers(msg, eventObj){
  const userIdList = eventObj.userIdList;
  for(var k=0; k<userIdList.length; k++){
    for(var l=0; l<users.length; l++){
      if(userIdList[k] == users[l].userID){
        for(var m=0; m<users[l].socketIds.length; m++){
          socket1.broadcast.to(users[l].socketIds[m]).emit(msg, eventObj);
        }
        if(userIdList[k] == currUser.userID){
          socket1.emit(msg, eventObj);
        }
      }
    }
  }
}

var token = PubSub.subscribe('EVENT', eventSubscriber);

function getFriends(socket, type, hasUserJoined, currUser){
  const currentUser = currUser.userID;
  var connectedUsersList = new Array();
  SoqqlerConnections.find({$or:[{userID1:currentUser},{userID2:currentUser}]}, (function(err, result) {
    if(result.length) {
      async.forEach(result, processEachTask,afterAllTasks);

      function processEachTask(task, callback) {
        var user = new Object();
        user.id = (task.userID1 == currentUser) ? task.userID2 : task.userID1;
        //var isLoggedin = false;
        if(task.requestStatus == 1) {
            // Friends

              const queryUser = {'_id': user.id};
              UserProfile.findOne(queryUser, function(err, response) {
                  if(err) {
                      // Unable to find user, skip.
                      // Log the error
                      console.log(err);  // handle errors!
                  }
                  else {
                      if (response != null) {
                          // User found. Update the friendList
                          var isLoggedin = false;
                          const profileImage = response.profile.pictureURL ? response.profile.pictureURL
                          : "https://s3.us-east-2.amazonaws.com/sociamibucket/assets/images/userProfile/default-profile.png";
                          const userData = {
                            userID: user.id,
                            firstName: response.profile.firstName,
                            lastName: response.profile.lastName,
                            profileImage: profileImage,
                          }

                          if(response.facebookID){
                            userData.username = response.facebookID;
                            userData.userType = "facebook";
                          }
                          else{
                            userData.username = response.linkedInID;
                            userData.userType = "linkedin";
                          }

                          for(var i=0; i<users.length; i++){
                            if(users[i].userID == user.id){
                              userData.loggedinStatus = true;
                              isLoggedin = true;
                              userData.socketIds = users[i].socketIds;
                            }
                          }

                          if(!isLoggedin){
                            userData.loggedinStatus = false;
                            userData.socketIds = [];
                          }

                          connectedUsersList.push(userData);
                      }
                      else{
                          // user not found. should not happen in ideal cases
                      }
                  }
                  callback(err);
            });
          //}
        } else {
          callback()
        }
      }
      function afterAllTasks(err) {
        if(type == "connect"){
          userObj = {
            connectedUsersList: connectedUsersList,
            user: currUser
          }
          socket.emit('server:user', userObj);
          if(!hasUserJoined){
            currUser.loggedinStatus = true;
            for(var i=0; i<connectedUsersList.length; i++){
              if(connectedUsersList[i].loggedinStatus == true){
                for(var j=0; j<connectedUsersList[i].socketIds.length; j++){
                  socket.broadcast.to(connectedUsersList[i].socketIds[j]).emit('newUser', currUser);
                }
              }
            }
          }
        }

        else if(type == "disconnect"){
          currUser.loggedinStatus = false;
          for(var i=0; i<connectedUsersList.length; i++){
            if(connectedUsersList[i].loggedinStatus == true){
              for(var j=0; j<connectedUsersList[i].socketIds.length; j++){
                socket.broadcast.to(connectedUsersList[i].socketIds[j]).emit('newUser', currUser);
              }
            }
          }
        }

      }
    }
  }));
}

console.log('sociami RESTful API server started on: ' + port);
