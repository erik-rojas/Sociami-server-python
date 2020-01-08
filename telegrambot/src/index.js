import TelegramBot from "node-telegram-bot-api";

import msgService from "./services/MessageService";
import chatService from "./services/ChatService";
import lastUserActionService from "./services/LastUserActionService";
import welcomeMessageService from "./services/WelcomeMessageService";

import autoPostService from "./services/AutoPostService";
import onOffWeclomeService from "./services/OnOffWelcome";

module.exports = function initialTBot(token, allowedUsers, dgToken) {
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    let botInfo = {};
    bot.getMe().then(res =>{
        botInfo = res;
        console.log("Bot ID: " + botInfo.id);
    });

    //dialogFlow
    var apiai = require('apiai');

    var app = apiai(dgToken);
    //

    autoPostService.startAutoPost(bot);

        // start bot
        bot.onText(/\/start/, function onStart(msg) {
            if(msg.chat.id != msg.from.id) {
                return;
            }
            
            //check allowed chat 
            const chatId = msg.chat.id;
            let isAllowedChat = false;
            allowedUsers.forEach(element => {
                if(element == msg.from.id)
                    isAllowedChat = true;
            });
            if(!isAllowedChat) {
                bot.sendMessage(chatId, "You are not allowed to use bot");
                return;
            }
            
        
            const openKeyboard = {
                reply_markup: {
                    keyboard: [
                        ["Add message to the list", "Show list of messages"],
                        ["Set destination chat", "Get chat info"],
                        ["Add Welcome message", "Show all Welcome messages"]
                    ],
                    one_time_keyboard: false,
                    resize_keyboard: false,
                },
            };

            bot.sendMessage(chatId, "Hello. I'm your auto-post bot, let's do some awesome stuff!", openKeyboard);
        });

        bot.onText(/\/getMyId/, function onStart(msg) {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            if(msg.chat.id != msg.from.id)
                return;

            bot.sendMessage(chatId, "Your id: " + userId);
        });

        bot.onText(/getChatId/, function onStart(msg) {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            bot.sendMessage(chatId, "Chat id: " + chatId);
        });

        bot.onText(/webHook/, function onStart(msg) {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            bot.sendMessage(chatId, "Yes, webhook is running on port: " + port);
        });

        bot.onText(/\/getTime/, function onStart(msg) {
            const chatId = msg.chat.id;

            if(msg.chat.id != msg.from.id)
                return;
            
            var currentdate = new Date(); 
            var datetime =  currentdate.getDate() + "/"
                            + (currentdate.getMonth()+1)  + "/" 
                            + currentdate.getFullYear() + " @ "  
                            + currentdate.getHours() + ":"  
                            + currentdate.getMinutes() + ":" 
                            + currentdate.getSeconds();

            bot.sendMessage(chatId, "Current server time: " + datetime);
        });

        //dialogFlow
        bot.on('message', msg => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            if(msg.chat.id == msg.from.id)
                return;

            if(!msg.text || msg.text.length == 0 || msg.text[0] != '/')
                return;

            if(msg.text == "/getChatId" || msg.text == "/getMyId" || msg.text == "/getTime")
                return;

            var request = app.textRequest(msg.text.substr(1), {
                sessionId: dgToken
            });
            
            request.on('response', function(response) {
                //console.log(response);
                let answer = response.result.fulfillment.speech;
        
                bot.sendMessage(chatId, answer);
                return;
            });
            
            request.on('error', function(error) {
                //console.log(error);
                return;
            });
            
            request.end();
            
        })
        //

        //send welcome message
        bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            if(msg.new_chat_member && msg.new_chat_member.id == botInfo.id)
                return; 

            if(!msg.new_chat_member && !msg.new_chat_members)
                return;

            let onOffChat = await onOffWeclomeService.getChatWelcomeStatus(chatId);
            
            if(onOffChat == null || onOffChat.IsOnOff == 0) {
                return;
            }
                
            if(onOffChat && !onOffChat.IsOnOff){
                return;
            }

               

            //send welcome message to many users
            if(msg.new_chat_members != null && msg.new_chat_members.length > 0){
                let message = await welcomeMessageService.getRandom();
                let welcomeMessage = "";
                msg.new_chat_members.forEach(element => {
                    if(element.username != null && element.username.length > 0)
                        welcomeMessage += "@" + element.username + ", ";
                    else
                        welcomeMessage += element.first_name;
                });
                
                bot.sendMessage(chatId, welcomeMessage + " " + message.dataValues.Text);
                return;
            }

            //send welcome message to one user
            if(msg.new_chat_member != null) {     
                let message = await welcomeMessageService.getRandom();   
                bot.sendMessage(chatId, "@" + msg.new_chat_member.first_name + " " + message.dataValues.Text);
                return;
            }
        });

        bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            if(msg.chat.id != msg.from.id)
                return;

            //get welcome message
            if(msg.text === "Show all Welcome messages") {
                let messages = await welcomeMessageService.getAll();
                if(!messages || messages.length == 0) {
                    bot.sendMessage(chatId, "Welcome message not added for now, add one!");
                    return;
                }

                messages.forEach(element => {
                    const keyboard = {
                        reply_markup: {
                            inline_keyboard: [
                            [
                                {
                                text: 'Remove welcome message',
                                callback_data: 'rWMById' + element.Id
                                }
                            ]
                            ]
                        }
                        };

                    bot.sendMessage(chatId, element.dataValues.Text, keyboard);
                });
                        
                return;
            }

            //set welcome message?
            if (msg.text === "Add Welcome message") {
                lastUserActionService.setLastAction(userId, "setWelcomeMessage");
                bot.sendMessage(chatId, "Ok, send welcome message to me...");
                return;
            }

            //get all messages
            if (msg.text === "Show list of messages") {
                let allMessages = await msgService.getAll();
                if(allMessages.length == 0) {
                    bot.sendMessage(chatId, "No messages yet, add one!");
                    return;
                }
                    
                allMessages.forEach(message => {
                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [
                        [
                            {
                            text: 'Remove message',
                            callback_data: 'rMById' + message.MessageId
                            }
                        ]
                        ]
                    }
                    };
                    
                bot.sendMessage(chatId, message.dataValues.Text, keyboard);
                })  
                return;
            }

            //add message?
            if (msg.text === "Add message to the list") {
                lastUserActionService.setLastAction(userId, "addMessage");
                bot.sendMessage(chatId, "Ok, send message to me...");
                return;
            }

            //set dest chat?
            if (msg.text === "Set destination chat") {
                lastUserActionService.setLastAction(userId, "setChatId");
                bot.sendMessage(chatId, "Ok, send me chat ID...");
                return;
            }

            //get chat info
            if (msg.text === "Get chat info") {
                let chat = await chatService.getChat();
                if(!chat) {
                    bot.sendMessage(chatId, "Chat not added for now, add one");
                    return;
                }

                let isWelcomeEnabledMessage;
                let isWelcomeStatus;

                let onOffChat = await onOffWeclomeService.getChatWelcomeStatus(chat.ChatId);
                if(onOffChat == null || onOffChat.IsOnOff == 0) {
                    isWelcomeEnabledMessage = "No";
                    isWelcomeStatus = "Enable welcome new users";
                }
                    
                if(onOffChat && onOffChat.IsOnOff == 1) {
                    isWelcomeEnabledMessage = "Yes";
                    isWelcomeStatus = "Disable welcome new users";
                }

                if(onOffChat && !onOffChat.IsOnOff){
                    isWelcomeEnabledMessage = "No";
                    isWelcomeStatus = "Enable welcome new users";
                }
                    
                let isRunningMessage;
                if(chat.IsRunning)
                    isRunningMessage = "Yes";
                else
                    isRunningMessage = "No";

                let changeStatusMessage;
                if(chat.IsRunning)
                    changeStatusMessage = "Stop autoposting";
                else
                    changeStatusMessage = "Start autoposting";
                
                let autoPostTimeMessage = "Not setted";
                if(chat.IsAutoPost) {
                    autoPostTimeMessage = chat.AutoPostTimeHour + ":" + chat.AutoPostTimeMinute;
                }
                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Remove chat',
                                    callback_data: 'rChatById' + chat.ChatId
                                },
                                {
                                    text: 'Change post time',
                                    callback_data: 'cChatPostTimeById' + chat.ChatId
                                },
                                {
                                    text: changeStatusMessage,
                                    callback_data: 'cChatStatusById' + chat.ChatId
                                }
                            ],
                            [
                                {
                                    text: isWelcomeStatus,
                                    callback_data: 'cChatWelcome' + chat.ChatId
                                }
                            ]
                        ]
                    }
                };

                bot.sendMessage(chatId, "Chat title: " + chat.ChatTitle + "\nAuto post time: " + autoPostTimeMessage + "\nIs autoposting now: " + isRunningMessage + "\nIs welcoming enabled: " + isWelcomeEnabledMessage, keyboard);
                return;
            }

            //set welcome message
            if(msg.text && lastUserActionService.getLastAction(userId) == "setWelcomeMessage") {
                lastUserActionService.setLastAction(userId, "none");
                await welcomeMessageService.add(msg);
                bot.sendMessage(chatId, "Welcome message added! Now your new members will receive it on join");
            }

            //add message
            if(msg.text && lastUserActionService.getLastAction(userId) == "addMessage") {
                lastUserActionService.setLastAction(userId, "none");
                await msgService.add(msg);
                bot.sendMessage(chatId, "Your message added!");
            }

            //set dest chat
            if(msg.text && lastUserActionService.getLastAction(userId) == "setChatId") {
                lastUserActionService.setLastAction(userId, "none");
                try {
                    let chat = await bot.getChat(msg.text);
                    await chatService.add(chat);
                    bot.sendMessage(chatId, "Chat added successfully!");
                }
                catch(err) {
                    if(err.message == "ETELEGRAM: 400 Bad Request: chat not found")
                    bot.sendMessage(chatId, "Chat not found. Check typed chat id and try again")
                }
            }

            //set autopost time
            if(msg.text && lastUserActionService.getLastAction(userId) == "setChatPostTime") {
                lastUserActionService.setLastAction(userId, "none");

                let parsed = msg.text.split(":");

                if(!parsed[0] || !parsed[1]) {
                    bot.sendMessage(chatId, "Wrong time typed, try again, write like this '17:25'");
                    return;
                }

                let hour = parseInt(parsed[0]);
                let minute = parseInt(parsed[1]);

                if(hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                    bot.sendMessage(chatId, "Wrong time typed, try again, write like this '17:25'");
                    return;
                }

                await chatService.changePostTime(chatId, {hour: hour, minute: minute});
                bot.sendMessage(chatId, "Autopost time changed to: " + hour + ":" + minute);

            }
        });
    
    // Handle callback queries
    bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        };

        bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        
        //remove message
        if(action.includes("rMById")) {
            let id = action.substring(6);
            await msgService.removeById(id);
            bot.deleteMessage(opts.chat_id, opts.message_id);
            bot.sendMessage(opts.chat_id, "Message removed");
            return;
        }

        //remove welcome message
        if(action.includes("rWMById")) {
            let id = action.substring(7);
            await welcomeMessageService.removeById(id);
            bot.deleteMessage(opts.chat_id, opts.message_id);
            bot.sendMessage(opts.chat_id, "Message removed");
            return;
        }

        //remove chat
        if(action.includes("rChatById")) {
            let id = action.substring(9);
            await chatService.removeById(id);
            bot.deleteMessage(opts.chat_id, opts.message_id);
            bot.sendMessage(opts.chat_id, "Chat removed");
            return;
        }

        //change chat status
        if(action.includes("cChatStatusById")) {
            let id = action.substring(15);
            await chatService.changeChatStatus(id);

            bot.sendMessage(opts.chat_id, "Chat settings changed, click 'Get chat'");
            return;
        }

        //change chat welcoming
        if(action.includes("cChatWelcome")) {
            let id = action.substring(12);
            await onOffWeclomeService.setChatWelcomeStatus(id);
            bot.sendMessage(opts.chat_id, "Chat settings changed, click 'Get chat'");
            return;
        }

        //change post time?
        if(action.includes("cChatPostTimeById")) {
            lastUserActionService.setLastAction(callbackQuery.from.id, "setChatPostTime");
            bot.sendMessage(opts.chat_id, "Ok, type time, like 21:30 or 14:00");
            return;
        }
    });
}