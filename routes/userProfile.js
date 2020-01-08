const Routes = require('express').Router();

const UserProfileController = require('../controllers/userProfile');
Routes.get('/fetchUserProfile', UserProfileController.fetch_user_profile);
Routes.get('/fetchUserProfileById', UserProfileController.fetch_user_profile_by_id);
Routes.get('/fetchUserCompany', UserProfileController.fetch_user_company);
Routes.post('/userProfileUpdate', UserProfileController.update_userProfile);
Routes.get('/userProfileGet', UserProfileController.get_userProfile); 
Routes.get('/userProfileGetAll', UserProfileController.get_all_userProfile);

Routes.post('/userProgressionTreeStart', UserProfileController.progression_tree_start);
Routes.post('/userProgressionTreeStop', UserProfileController.progression_tree_stop);
Routes.get('/userProgressionsClear', UserProfileController.progression_tree_clear_all);
Routes.get('/userHangoutsClear', UserProfileController.hangouts_clear);

Routes.post('/userProfileCharacterSet', UserProfileController.set_character);

Routes.post('/userProfile/:id/:type/upload-image', UserProfileController.upload_userprofile_image);

/*
 |   Feed
*/
Routes.put('/:userId/following/:toUserId', UserProfileController.follow_user);
Routes.delete('/:userId/following/:toUserId', UserProfileController.unfollow_user);
Routes.get('/:userId/followers', UserProfileController.fetch_followers);
Routes.get('/:userId/following', UserProfileController.fetch_following);
Routes.get('/:userId/feeds', UserProfileController.fetch_feeds);
Routes.post('/:userId/posts', UserProfileController.save_post);
Routes.get('/:userId/posts', UserProfileController.fetch_my_posts);

module.exports = Routes;