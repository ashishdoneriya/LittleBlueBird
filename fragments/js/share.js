

// 2013-09-30  send an email to whoever you want via this function
// See sharelittlebluebirdoveremail-nofooter.html
$scope.shareLittleBlueBirdOverEmail = function(share) {
  
  
}


$scope.doesEmailExistAlready = function(email) {

  // you want to know if the person is already an LBB user
  // alert the user because who wants to receive an invitation to something you're already a part of
  
  $scope.userExistsAlready = User.query({email:email},
              function() {
              },
              function() {}
  );
  
}

  
  
  // COULD NOT GET THIS TO WORK ON IPHONE  2013-09-25
  // This fn was modeled after $rootScope.sendFacebookMessage in app-FacebookModule.js
  // The difference here is that the function doesn't assume anyone on the 'to' line
  $scope.shareAppViaFacebookMessage = function() {
      FB.ui({method:'send', link:'http://www.littlebluebird.com/gf/'});
  }
  
  
  // This is actually sharing the website, not the app.  Once the app is in the app store, should change this to send people to the app store/google play
  // make the share message customizable ???
  $scope.shareAppViaTimeline = function() {
    FB.ui({
        method:'feed',
        name:'Check out LittleBlueBird.com [FREE for all subscribers]',
        caption:'Give what THEY want - Get what YOU want',
        description:'This is the site my friends and family use to keep track of everyone\'s wish list.  There\'s also a mobile version with a barcode scanner so you can point, scan, add items to your wish list.',
        link:'http://www.littlebluebird.com/gf/',
        picture:'http://www.littlebluebird.com/gf/img/logo-whitebackground.gif',
        //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
        user_message_prompt:'user message prompt?'},
      function(response) {
        if(response && response.post_id) {
          console.log('$scope.fbsharelist():  post was successful');
        }
        else {
          console.log('$scope.fbsharelist():  post was not published');
        }
    });
  }
    
    
  // can also supply a "to" argument with value of someone's facebook id whose wall/timeline you want to post on
  // but beware, that person may not allow that.  This fn modeled after $rootScope.fbsharelist in 
  // app-FacebookModule.js
  $scope.fbsharelist = function(user, showUser) {
    var someones = user.id==showUser.id ? "my" : showUser.fullname+"'s"
    var msg = "I just updated "+someones+" wish list. Check it out on LittleBlueBird.com [FREE for all subscribers]"
    FB.ui({
        method:'feed',
        name:msg,
        caption:'Give what THEY want - Get what YOU want',
        description:'This is the site my friends and family use to keep track of everyone\'s wish list',
        link:'http://www.littlebluebird.com/gf/giftlist/'+showUser.id+'/',
        picture:'http://www.littlebluebird.com/gf/img/logo-whitebackground.gif',
        //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
        user_message_prompt:'user message prompt?'},
      function(response) {
        if(response && response.post_id) {
          console.log('$scope.fbsharelist():  post was successful');
        }
        else {
          console.log('$scope.fbsharelist():  post was not published');
        }
    });
  }