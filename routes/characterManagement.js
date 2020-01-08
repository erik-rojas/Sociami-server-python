const Routes = require('express').Router();

const Controller = require('../controllers/characterManagement');
Routes.get('/characterClassesGet', Controller.get_classes);
Routes.post('/characterClassesSet', Controller.set_classes);

Routes.get('/characterTraitsGet', Controller.get_traits);
Routes.post('/characterTraitsSet', Controller.set_traits);


module.exports = Routes;

/*
{
	"characterClasses": [
		{
			"name": "The business clairvoyants", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Ashe.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Ashe_big.png",
            "description1": "The Business CLAIRVOYANTS House ensures the funding, legal and other constructs to spiral growth into the future economy.",
            "skills": ["Finance", "Legal", "Business"]
        },
        {
            "name": "The network clairvoyants", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Kaye.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Kaye_big.png",
            "description1": "The Network Clairvoyants House are experts in the usage of technology to see all, or protect all from dangers that come in the future economy.",
            "skills": ["Cybersecurity", "Networking"]
        },
        {
            "name": "The bot tinkerers", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Leo.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Leo_big.png",
            "description1": "The Bot Tinkerers House represent the usage of robots and data science for the growth of humankind in the future economy.",
            "skills": ["Data Science", "Robotics"]
       },
       {
            "name": "The Science illuminati", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Leona.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Leona_big.png",
            "description1": "The Science Illuminati House represent the usage of science and technology to further the cause of improving life in the future economy.",
            "skills": ["Chemical Engineering", "BioTech"]
       },
       {
            "name": "The executives", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Max.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Max_big.png",
            "description1": "The Executives House manages the continued growth and operational sustainability of businesses for the future economies.",
            "skills": ["Operations Management", "Big Data", "Data Analytics"]
       },
       {
            "name": "The app ninjas", 
            "imageURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Nelson.png",
            "imageBigURL": "http://sociamibucket.s3.amazonaws.com/assets/character_creation/character_icons/Nelson_big.png",
            "description1": "The App Ninjas House are able to build technology, across all kinds of applications, language, to develop the game-changing growth needed for the future economy.",
            "skills": ["Data Science", "Programming"]
       }
	]
}
*/

/*
{
	"characterTraits": [
		{
			"name": "Realistic (Do'er)",
            "description": "Prefers physical activities that require skill, strenth and coordination."
        },
		{
			"name": "Investigative (Thinker)",
			"description": "Prefers working theory and information, thinking, organizing and understanding."
		},
		{
			"name": "Artistic (Creator)",
			"description": "Prefers creative, original and unsystematic activities that allow creative expression."
		},
 		{
			"name": "Social (Helper)",
			"description": "Prefers activities that involve helping healing or developing others."
		},
		{
			"name": "Enterprising (Persuander)",
			"description": "Prefers competitive environments, leadership, influence, selling and status."
		},
 		{
			"name": "Conventional (Organizer)",
			"description": "Prefers precise, rule regulated or derly and unambiguous activities."
		}
	]
}
*/