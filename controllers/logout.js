const UserInteractionsHelper = require("../helpers/UserInteractions");

exports.logout = function(req, res) {
  if (!req.body.userID) {
    res.sendStatus(400);
  }
  else {
    UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.LOGOUT, req.body.userID, null)
        .then((document) => {
            console.log("User Interaction of Logout for User Id - " + req.body.userID);
            res.status(200);
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500); 
        });
    }
};