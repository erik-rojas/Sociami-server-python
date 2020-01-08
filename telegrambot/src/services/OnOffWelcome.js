import { OnOffWelcome } from "../db/onOffWelcomeRepository";

class OnOffWelcomeService {
    constructor () {}

    async getChatWelcomeStatus(chatId) {
        let id = parseInt(chatId);

        return await OnOffWelcome.findOne({
            where:{
                ChatId: id
            }
        })
    };

    async setChatWelcomeStatus(chatId) {
        let id = parseInt(chatId);

        let chat = await this.getChatWelcomeStatus(chatId);
        
        let updateStatus;

        if(chat && chat.IsOnOff && chat.IsOnOff == 0)
            updateStatus = 1;

        if(chat && chat.IsOnOff && chat.IsOnOff == 1)
            updateStatus = 0;

        if(!chat)
            updateStatus = 1;

        if(chat && !chat.IsOnOff)
            updateStatus = 1;

        await OnOffWelcome.destroy({
            where: {
                ChatId: id
            }
        });

        return await OnOffWelcome.create({
            ChatId: id,
            IsOnOff: updateStatus
        })
    };
}

const service = new OnOffWelcomeService();

export default service;