const ConfigMain = require('../config/main');
const ConfigSocial = require('../config/social');

const UserProfile = require('../models/userProfile');
const SettingModel = require('../models/setting');

const MailerLite = require('../helpers/mailerlite');

const UserInteractionsHelper = require("../helpers/UserInteractions");

exports.callback = function(req, res) {
  res.redirect(`/auth/linkedin/callback/success?linkedInId=${req.user.id}`);
}

exports.callback_success = function(req, res) {
  let CharacterCreationData = undefined;

  if (req.session.character) {
    CharacterCreationData = Object.assign({}, CharacterCreationData, req.session.character);
    req.session.character = undefined;
  }

  const FrontEndURL = ConfigMain.getFrontEndUrl(req.session);

  req.session.frontEndURL = undefined;

  UserProfile.findOne({ linkedInID: req.user.id }, function(err, profile) {
    if(err) {
      console.log(err);  // handle errors!
      res.redirect(`${FrontEndURL}/authorize?linkedInID=${req.user.id}`);
      return;
    }
    if (!err && profile !== null) {
      console.log(`LinkedIn user exists`);

      if (!profile.profile.email || !profile.profile.pictureURL || !profile.profile.character) {
        if (!profile.profile.email && req.user._json.emailAddress) {
          profile.profile.email = req.user._json.emailAddress;
        }

        const pictureURL = (req.user._json.pictureUrls && req.user._json.pictureUrls.values.length > 0) ?
        req.user._json.pictureUrls.values[0] : req.user._json.pictureUrl;

        if (!profile.profile.pictureURL && pictureURL) {
          profile.profile.pictureURL = pictureURL;
        }

        if (!profile.profile.character && CharacterCreationData) {
          profile.profile.character = CharacterCreationData;
        }

        if(profile.profile.character && profile.profile.character.traitsName){
          UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_TRAIT_SELECTED, profile._id, null)
          .then((document) => {
            console.log("UserInteraction of Character Trait selection during Login with LinkedIn for User Id - " + profile._id);
          })
          .catch((error) => {
            console.log(error);
          });
        }

        if(profile.profile.character && profile.profile.character.characterName){
          UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_NAME_SELECTED, profile._id, null)
          .then((document) => {
            console.log("UserInteraction of Character Name selection during Login with LinkedIn for User Id - " + profile._id);
          })
          .catch((error) => {
            console.log(error);
          });
        }

        profile.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            res.redirect(`${FrontEndURL}/authorize?linkedInID=${req.user.id}`);
          }
        });
      }
      else {
        res.redirect(`${FrontEndURL}/authorize?linkedInID=${req.user.id}`);
      }

      UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.LOGIN_LINKEDIN, profile._id, null)
        .then((document) => {
          console.log("User Interaction of Login with Linked for User Id - " + profile._id);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      //TODO: Take correct fields
      console.log("req.user");
      console.dir(req.user);

      const pictureURL = (req.user._json.pictureUrls && req.user._json.pictureUrls.values.length > 0) ?
        req.user._json.pictureUrls.values[0] : req.user._json.pictureUrl;

      SettingModel.findOne(function(err,objSetting){
        var _defaultBonus=0;
        if(objSetting){
          _defaultBonus=objSetting.defaultBonus;
        }
        let newProfile = new UserProfile({
          linkedInID: req.user.id,
          facebookID: '' + Math.random() + Math.random(),
          profile: {
            firstName: req.user.name.givenName,
            lastName: req.user.name.familyName,
            education: req.user._json.industry,
            experience: req.user._json.headline,
            interests: 'N/A due to LinkedIn permissions restrictions',
            skills: 'N/A due to LinkedIn permissions restrictions',
            balance:_defaultBonus,
            character: CharacterCreationData,
            pictureURL: pictureURL,
            email: req.user._json.emailAddress ? req.user._json.emailAddress : null,
          },
          created: Date.now()
        });
        newProfile.save(async function(err, savedProfile) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            const memberName = (savedProfile.profile.firstName && savedProfile.profile.lastName) 
                ? savedProfile.profile.firstName + " " + savedProfile.profile.lastName : "";
              
            const memberEmail = savedProfile.profile.email ? savedProfile.profile.email : undefined;

            let addedToMailerLite = await MailerLite.push_new_subscriber_to_group(MailerLite.SoqqleUserListGroupID, 
                memberEmail, memberName);

               UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.ACCOUNT_CREATED_LINKEDIN, savedProfile._id, null)
                .then((document) => {
                  console.log("User Interaction of Account creation with LinkedIn for User Id - " + savedProfile._id);
                })
                .catch((error) => {
                  console.log(error);
                });

                if(savedProfile.profile.character.traitsName){
                  UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_TRAIT_SELECTED, savedProfile._id, null)
                  .then((document) => {
                    console.log("UserInteraction of Character Trait selection during account creation with LinkedIn for User Id - " + savedProfile._id);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                }
        
                if(savedProfile.profile.character.characterName){
                  UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_NAME_SELECTED, savedProfile._id, null)
                  .then((document) => {
                    console.log("UserInteraction of Character Name selection during account creation with LinkedIn for User Id - " + savedProfile._id);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                }

            console.log(`User linkedInID: ${req.user.id} created`);
          }
          res.redirect(`${FrontEndURL}/authorize?linkedInID=${req.user.id}`);
          return;
        });
      })
      
    }
  });
};

exports.account = function(req, res) {
  res.send({ user: req.user });
}

exports.login = function(req, res) {
  res.send({ user: req.user });
}