import { Message } from "../db/messagesRepository.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

let lastMessage = "";


class MessageService {
    constructor () {}

    async add(msg) {
        return await Message.create({
            MessageId: msg.message_id,
            Text: msg.text
        })
    };

    async getAll() {
        return await Message.findAll();
    }

    async removeById(msgId) {
        let id = parseInt(msgId);
        await Message.destroy({
            where: {
                MessageId: id
            }
        });
    }

    async getRandom () {
        let messages = await this.getAll();

        if(!messages) return null;

        let rIndex = await this.getRndInteger(0, messages.length - 1, messages);

        lastMessage = messages[rIndex].Text;
        
        return messages[rIndex];

    }

    async getRndInteger(min, max, messages) {

        let index = Math.floor(Math.random() * (max - min + 1) ) + min;

        if(messages[index].Text != lastMessage || messages.length == 1)
            return index;
        
        await sleep(1000);
        return this.getRndInteger(min, max, messages);
    }
}

const service = new MessageService();

export default service;