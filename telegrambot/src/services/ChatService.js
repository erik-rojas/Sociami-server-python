import { Chat } from "../db/chatsRepository.js";


class ChatService {
    constructor () {}

    async add(chat) {
        return await Chat.create({
            ChatId: chat.id,
            ChatTitle: chat.title
        });
    }

    async removeById(chatId) {
        let id = parseInt(chatId);
        await Chat.destroy({
            where: {
                ChatId: id
            }
        });
    }

    async changeChatStatus(chatId) {
        let id = parseInt(chatId);
        let chat = await this.getChat();

        if(chat.IsRunning) chat.IsRunning = false;
        else chat.IsRunning = true;

        await chat.save();
    }

    async changePostTime(chatId, time) {
        let id = parseInt(chatId);
        let chat = await this.getChat();

        chat.IsAutoPost = true;
        chat.AutoPostTimeHour = time.hour;
        chat.AutoPostTimeMinute = time.minute;

        await chat.save();
    }

    async setLastPostTime(chatId, time) {
        let id = parseInt(chatId);
        let chat = await this.getChat();

        chat.LastPostetTime = time;

        await chat.save();
    }


    async getChat() {
        return await Chat.findOne();
    }
}

const service = new ChatService();

export default service;