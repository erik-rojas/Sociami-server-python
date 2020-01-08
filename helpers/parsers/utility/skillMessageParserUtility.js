const Skills = require('../../../models/deepdive/skills');
var async = require('async');

let SkillMessageParserUtility = {
}

SkillMessageParserUtility.getSkillName = async function(skillId) {  
    try{
        skillData = await Skills.findOne({ _id: skillId });
        return skillData.skill;
    }
    catch(err){
        console.log(err);
        return "";
    } 
}

module.exports = SkillMessageParserUtility;