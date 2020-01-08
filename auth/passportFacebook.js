var Passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var ConfigMain = require('../config/main');
var ConfigSocial = require('../config/social');

const UserProfile = require('../models/userProfile');
const SettingModel = require('../models/setting');

const MailerLite = require('../helpers/mailerlite');

var HelperFaceBook = require('../helpers/helper_facebook');

const UserInteractionsHelper = require('../helpers/UserInteractions');

Passport.use(
  new Strategy(
    {
      passReqToCallback: true,
      clientID: ConfigSocial.FacebookAppID,
      clientSecret: ConfigSocial.FacebookAppSecret,
      callbackURL: `${ConfigMain.getThisUrl()}/auth/facebook/callback`,
      enableProof: true,
      scope: ['user_friends'],
      profileFields: ConfigSocial.FaceBookProfileIDs,
    },
    function(req, accessToken, refreshToken, profile, done) {
      let CharacterCreationData = undefined;

      if (req.session.character) {
        CharacterCreationData = Object.assign(
          {},
          CharacterCreationData,
          req.session.character
        );
        req.session.character = undefined;
      }

      UserProfile.findOne({ facebookID: profile.id }, function(err, user) {
        if (err) {
          console.log(err); // handle errors!
        } else {
          if (user) {
            console.log(`Facebook user exists`);
            //in case wo don't yet have email and picture - update them
            if (
              !user.profile.email ||
              !user.profile.pictureURL ||
              !user.facebook.token ||
              !user.profile.character
            ) {
              if (
                !user.profile.email &&
                profile.emails &&
                profile.emails.length > 0
              ) {
                user.profile.email = profile.emails[0].value;
              }
              if (
                !user.profile.pictureURL &&
                profile.photos &&
                profile.photos.length > 0
              ) {
                user.profile.pictureURL = profile.photos[0].value;
              }

              if (user.facebook.token == null) {
                user.facebook.token = accessToken;
              }

              if (!user.profile.character && CharacterCreationData) {
                user.profile.character = CharacterCreationData;

                if (
                  user.profile.character &&
                  user.profile.character.traitsName
                ) {
                  UserInteractionsHelper.pushInteraction(
                    UserInteractionsHelper.Types.ACTION_EXECUTE,
                    UserInteractionsHelper.SubTypes.CHARACTER_TRAIT_SELECTED,
                    user._id,
                    null
                  )
                    .then(document => {
                      console.log(
                        'UserInteraction of Character Trait selection during Login with Facebook for User Id - ' +
                          user._id
                      );
                    })
                    .catch(error => {
                      console.log(error);
                    });
                }

                if (
                  user.profile.character &&
                  user.profile.character.characterName
                ) {
                  UserInteractionsHelper.pushInteraction(
                    UserInteractionsHelper.Types.ACTION_EXECUTE,
                    UserInteractionsHelper.SubTypes.CHARACTER_NAME_SELECTED,
                    user._id,
                    null
                  )
                    .then(document => {
                      console.log(
                        'UserInteraction of Character Name selection during Login with Facebook for User Id - ' +
                          user._id
                      );
                    })
                    .catch(error => {
                      console.log(error);
                    });
                }
              }

              user.save(function(err) {
                if (err) {
                  console.log(err); // handle errors!
                } else {
                  console.log(
                    `User FacebookID: ${user.getFacebookID()} updated`
                  );
                  done(null, user);
                }
              });
            } else {
              done(null, user);
            }

            UserInteractionsHelper.pushInteraction(
              UserInteractionsHelper.Types.ACTION_EXECUTE,
              UserInteractionsHelper.SubTypes.LOGIN_FACEBOOK,
              user._id,
              null
            )
              .then(document => {
                console.log(
                  'User Interaction of Login with Facebook for User Id - ' +
                    user._id
                );
              })
              .catch(error => {
                console.log(error);
              });
          } else {
            const pictureURL =
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : undefined;

            SettingModel.findOne(function(err, objSetting) {
              var _defaultBonus = 0;
              if (objSetting) {
                _defaultBonus = objSetting.defaultBonus;
              }
              //TODO: Take correct fields
              let newProfile = new UserProfile({
                facebookID: profile.id,
                linkedInID: '' + Math.random() + Math.random(),
                profile: {
                  firstName: profile.name.givenName,
                  lastName: profile.name.familyName,
                  education: 'N/A due to FaceBook review restrictions',
                  experience: 'N/A due to FaceBook review restrictions',
                  interests: 'N/A due to FaceBook review restrictions',
                  skills: 'N/A due to FaceBook review restrictions',
                  balance: _defaultBonus,
                  character: CharacterCreationData,
                  pictureURL: pictureURL,
                  email:
                    profile.emails && profile.emails.length > 0
                      ? profile.emails[0].value
                      : null,
                },
                facebook: {
                  _id: profile.id,
                  friends:
                    profile._json &&
                    profile._json.friends &&
                    profile._json.friends.data
                      ? profile._json.friends.data
                      : [],
                  token: accessToken,
                },
                created: Date.now(),
              });

              newProfile.save(async function(err, savedProfile) {
                if (err) {
                  console.log(err); // handle errors!
                } else {
                  let fb_friends_id = [];
                  savedProfile.facebook.friends.map(friend =>{
                    fb_friends_id.push(friend.id)
                  })
                  UserProfile.find({ facebookID: { $in: fb_friends_id } }, function(err, fbfriends) {
                    if(fbfriends){
                      let userData = {id: savedProfile.facebookID, name: savedProfile.profile.firstName+' '+savedProfile.profile.lastName }
                      fbfriends.map(singleFriend => {
                          singleFriend.facebook.friends.push(userData);
                          singleFriend.update(singleFriend, (err)=>{
                          if(err){
                            console.log(err)
                          }else{
                            console.log("Users friends updated")

                          }
                        })
                      })
                    }
                  })
                  const memberName =
                    savedProfile.profile.firstName &&
                    savedProfile.profile.lastName
                      ? savedProfile.profile.firstName +
                        ' ' +
                        savedProfile.profile.lastName
                      : '';

                  const memberEmail = savedProfile.profile.email
                    ? savedProfile.profile.email
                    : undefined;

                  let addedToMailerLite = await MailerLite.push_new_subscriber_to_group(
                    MailerLite.SoqqleUserListGroupID,
                    memberEmail,
                    memberName
                  );

                  UserInteractionsHelper.pushInteraction(
                    UserInteractionsHelper.Types.ACTION_EXECUTE,
                    UserInteractionsHelper.SubTypes.ACCOUNT_CREATED_FACEBOOK,
                    savedProfile._id,
                    null
                  )
                    .then(document => {
                      console.log(
                        'User Interaction of Account creation with Facebook for User Id - ' +
                          savedProfile._id
                      );
                    })
                    .catch(error => {
                      console.log(error);
                    });

                  if (savedProfile.profile.character.traitsName) {
                    UserInteractionsHelper.pushInteraction(
                      UserInteractionsHelper.Types.ACTION_EXECUTE,
                      UserInteractionsHelper.SubTypes.CHARACTER_TRAIT_SELECTED,
                      savedProfile._id,
                      null
                    )
                      .then(document => {
                        console.log(
                          'UserInteraction of Character Trait selection during Account creation with Facebook for User Id - ' +
                            savedProfile._id
                        );
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  }

                  if (savedProfile.profile.character.characterName) {
                    UserInteractionsHelper.pushInteraction(
                      UserInteractionsHelper.Types.ACTION_EXECUTE,
                      UserInteractionsHelper.SubTypes.CHARACTER_NAME_SELECTED,
                      savedProfile._id,
                      null
                    )
                      .then(document => {
                        console.log(
                          'UserInteraction of Character Name selection during Account creation with Facebook for User Id - ' +
                            savedProfile._id
                        );
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  }


                  console.log(
                    `User FacebookID: ${newProfile.getFacebookID()} created`
                  );
                  done(null, newProfile);
                }
              });
            });
          }
        }
      });
    }
  )
);

module.exports = Passport;
