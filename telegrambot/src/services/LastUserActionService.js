const lastUserAction = new Map();

//actions:
// - "addMessage"
// - "setChatId"
// - "setChatPostTime"
// - "none"

class LastUserActionService {
    constructor(){}

    setLastAction(userId, action) {
        lastUserAction.set(userId, action);
    }

    getLastAction(userId) {
        return lastUserAction.get(userId);
    }
}

const lastUserActionService = new LastUserActionService();

export default lastUserActionService;