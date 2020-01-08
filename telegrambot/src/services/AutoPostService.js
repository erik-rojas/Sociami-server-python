import msgService from "./MessageService";
import chatService from "./ChatService";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const everyTime = 24 * 60 * 60 * 1000; //auto post delay, first number in exp it's hours
//const everyTime = 60 * 1000; //auto post delay, first number in exp it's hours

class AutoPostService {
    constructor() {}

    async postMessage(bot, chat) {
        let message = await msgService.getRandom();

        if(message)
            bot.sendMessage(chat.ChatId, message.Text);
    }

    async startAutoPost(bot) {
        // while(true) {
        //     console.log("checking");
        //     let chat = await chatService.getChat();
        //     if(!chat) {
        //         await sleep(10000);
        //         continue;
        //     }           

        //     if(!chat.IsRunning) {
        //         await sleep(10000);
        //         continue;
        //     }            
            
        //     if(!chat.LastPostetTime) {
        //         await this.firstPost(chat, bot);
        //         await sleep(10000);
        //         continue;
        //     }
        
        //     let lastPost = new Date(chat.LastPostetTime);   
        //     let now = new Date();     

        //     let diff = now.getTime() - lastPost.getTime(); 

        //     if(diff > everyTime) {               
        //         this.postMessage(bot, chat);
        //         let nowStr = now.toISOString();
        //         await chatService.setLastPostTime(chat.ChatId, nowStr);            
        //     }
    
        //     await sleep(10000);
        // }
    }

    async firstPost(chat, bot) {
        let lastPost = new Date(chat.LastPostetTime);    
        
        let now = new Date();

        if(chat.AutoPostTimeHour == now.getHours() && chat.AutoPostTimeMinute == now.getMinutes()) {
            this.postMessage(bot, chat);
            let nowStr = now.toISOString();
            await chatService.setLastPostTime(chat.ChatId, nowStr);
        }
    }
}

const service = new AutoPostService();

export default service;