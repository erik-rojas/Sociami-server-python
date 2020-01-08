const CharacterClass = require('../../models/character/characterClasses');
const CharacterTraits = require('../../models/character/characterTraits');

const get_characterclasses = function get_characterclasses() {
    return new Promise((resolve, reject) => {
        return CharacterClass.find({})
        .then(function(foundCharacters){
            resolve(foundCharacters);
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const save_characterclasses = function save_characterclasses(classes) {
    return new Promise((resolve, reject) => {
        return CharacterClass.remove({})
        .then(function(){
            let characterClassModelsToSave = [];

            classes.forEach(characterClass => {
                const newCharacterClass = new CharacterClass(
                    {...characterClass}
                );

                characterClassModelsToSave.push(newCharacterClass);
            });

            if (characterClassModelsToSave.length > 0) {
                CharacterClass.collection.insertMany(characterClassModelsToSave)
                .then(() => {
                    resolve();
                })
            }
            else {
                reject("empty classes argument");
            }
         })
        .catch(function(error){
            reject(error);
        })
    });
};

const get_character_traits = function get_character_traits() {
    return new Promise((resolve, reject) => {
        return CharacterTraits.find({})
        .then(function(foundCharacterTraits){
            resolve(foundCharacterTraits);
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const save_character_traits = function save_characterclasses(traitsList) {
    return new Promise((resolve, reject) => {
        return CharacterTraits.remove({})
        .then(function(){
            let characterTraitsModelsToSave = [];

            traitsList.forEach(trait => {
                const newCharacterTraits = new CharacterTraits(
                    {...trait}
                );

                characterTraitsModelsToSave.push(newCharacterTraits);
            });

            if (characterTraitsModelsToSave.length > 0) {
                CharacterTraits.collection.insertMany(characterTraitsModelsToSave)
                .then(() => {
                    resolve();
                })
            }
            else {
                reject("empty traitsList argument");
            }
         })
        .catch(function(error){
            reject(error);
        })
    });
};

exports.get_characterclasses = get_characterclasses;
exports.save_characterclasses = save_characterclasses;

exports.get_character_traits = get_character_traits;
exports.save_character_traits = save_character_traits;