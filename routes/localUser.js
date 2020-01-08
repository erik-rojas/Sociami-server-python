const Routes = require('express').Router();
var UserProfile = require('../models/userProfile');
var MailerLite = require('../helpers/mailerlite');

//TODO user interaction
Routes.post('/auth/sign-in', async (req, res) => {
  const { email, password, name, character } = req.body;
  
  if (!(email && password && name)) {
    res.status(400).send();
    return;
  }

  UserProfile.findOne({ 'profile.email': email })
    .select('+password')
    .exec(async (err, user) => {
      if (err) {
        console.error(err);
      }

      if (user) {
        const match = await user.comparePassword(password);
        if (!match) {
          res.send(403);
          return;
        } else {
          res.json(user);
          return;
        }
      }

      const newUser = new UserProfile({
        facebookID: '' + Math.random() + Math.random(), // YOLO!
        linkedInID: '' + Math.random() + Math.random(),
        profile: {
          email: email,
          firstName: name,
          character: character
        },
        password: password,
        created: Date.now(),
      });

      await newUser.hashPassword();
      if (!newUser.password) {
        res.send(500);
        return;
      }
      newUser.save(async (err, user) => {
        if (err) {
          console.error(err);
          res.send(500, err);
        } else {
          let addedToMailerLite = await MailerLite.push_new_subscriber_to_group(
            MailerLite.SoqqleUserListGroupID,
            email,
            name,
          );
          res.json(user);
        }
      });
    });
});

module.exports = Routes;
