
  
  
  $scope.logout = function() {
    if(typeof FB == 'undefined') return;
    FB.logout(function(response) {});
  }
  
  
  // copied/adapted from index-Simple.html in the infinite-beach-9173 project  2013-08-01
  // See also $rootScope.registerWithFacebook in app-FacebookModule.js
  $scope.fblogin = function() {
    FB.login(
      function(response) {
        if (response.authResponse) {
          FB.api('/me', function(fbuser) {
            tryToFindUserFromFBLogin(fbuser);
            $rootScope.fbuser = fbuser;
          });
        } 
        else {
          alert('woops!  could not log you in');
        }
      }, 
      { scope: "email" }
    );
  }
  
  
  // no reason for this to be here other than I was looking for an FB function to copy
  // and found the one above.  This fn was modeled after $rootScope.sendFacebookMessage in app-FacebookModule.js
  // The difference here is that the function doesn't assume anyone on the 'to' line
  $scope.shareAppViaFacebookMessage = function() {
      FB.ui({app_id: '136122483829', to:'7913493', method:'send', link:'http://www.littlebluebird.com/gf/'})
  }
  
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
    
    
  // no reason for this to be here other than I was looking for an FB function to copy and found the one above.  
  // can also supply a "to" argument with value of someone's facebook id whose wall/timeline you want to post on
  // but beware, that person may not allow that.  This fn modeled after $rootScope.fbsharelist in 
  // app-FacebookModule.js
  $scope.fbsharelist = function(showUser) {
    FB.ui({
        method:'feed',
        name:'I\'ve updated my wish list. Check it out on LittleBlueBird.com [FREE for all subscribers]',
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
  

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    console.log(Email);
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }


  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function() {
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user; 
                                           //console.log(JSON.stringify($rootScope.user)); 
                                          }, 
                               function() {$scope.logingood=false; alert('Wrong user/pass');}  );
                               
    delete $scope.password;
  }