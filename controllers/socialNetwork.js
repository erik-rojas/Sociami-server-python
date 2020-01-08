exports.get_friends_of_user = function(req, res) {
    const _userId = req.query.id;

    if (!_userId) {
        res.sendStatus(400);
    }
    else {
        const DummyFriendImages = [
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/annalisaicon.png",
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/johnicon.png",
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/Joshicon.png", 
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/marciaicon.png",
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/Mathildaicon.png",
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/matthewicon.png", 
            "http://sociamibucket.s3.amazonaws.com/assets/images/custom_ui/friends-list/Thomasicon.png",
          ];

        const DummyFriends = [
            {_id:"5a0b9262802fd75a1dffc41b", firstName:"Daniel", lastName:"Shen", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a0bb1e6802fd75a1dffc41c", firstName:"Pek", lastName:"Yun Ning", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a0c16dfd97fb72976b7b8c7", firstName:"Hardik", lastName:"Mandankaa", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a1f1c3c4223e313a6e0dfd1", firstName:"Alexander", lastName:"Zolotov", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"}, //LinkedIn
            {_id:"5a2446327974e720efe0f915", firstName:"Michael", lastName:"Korzun", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a34fb841597751958637888", firstName:"Jigar", lastName:"Shah", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a34f3d71597751958637885", firstName:"Jigar", lastName:"Shah", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a24f0bf85371d22ecdddd14", firstName:"Jay", lastName:"Shaw", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a0f91f74b9e4f46c667ffff", firstName:"Vu", lastName:"Huu Phuong", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
            {_id:"5a2b5b827974e720efe0f923", firstName:"Sunil", lastName:"Mishra", 
              profileImage: DummyFriendImages[Math.floor(Math.random() * (DummyFriendImages.length - 0)) + 0],
              userText: "Mobile app testing 50 mutual friends"},
        ];

        res.status(200);
        res.send(DummyFriends);
    }
  };