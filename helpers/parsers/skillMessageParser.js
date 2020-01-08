const SkillMessageParserUtility = require('../parsers/utility/skillMessageParserUtility')
var async = require('async');

let SkillMessageParser = {
}

SkillMessageParser.parseSkillName = async function(message, skillId) {  
    var skillName = await SkillMessageParserUtility.getSkillName(skillId);
    message = message.replace("##skillname##", skillName);
    return message;
}

module.exports = SkillMessageParser;