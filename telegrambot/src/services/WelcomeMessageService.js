import { WelcomeMessage } from "../db/welcomeMessageRepository";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

let lastMessage = "";

class WelcomeMessageService {
    constructor () {}

    async add(msg) {
        // let messages = await WelcomeMessage.findAll();
        // if(messages) {
        //     messages.forEach(element => {
        //         WelcomeMessage.destroy({
        //             where: {
        //                 Id: element.Id
        //             }
        //         })
        //     });
        // }

        return await WelcomeMessage.create({
            Text: msg.text
        })
    };

    removeById(id) {
        WelcomeMessage.destroy({
            where: {
                Id: id
            }
        })
    }

    async getRandom() {
        let messages = await WelcomeMessage.findAll();

        if(!messages || messages.length == 0) return null;

        let rIndex = await this.getRndInteger(0, messages.length - 1, messages);

        lastMessage = messages[rIndex].Text;
        
        return messages[rIndex];
    }

    async getAll() {
        return await WelcomeMessage.findAll();
    }

    async getRndInteger(min, max, messages) {

        let index = Math.floor(Math.random() * (max - min + 1) ) + min;

        if(messages[index].Text != lastMessage || messages.length == 1)
            return index;
        
        await sleep(1000);
        return this.getRndInteger(min, max, messages);
    }
}

const service = new WelcomeMessageService();

export default service;