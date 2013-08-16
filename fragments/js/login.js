
  
  
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
  

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    console.log(Email);
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }


  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function(event) {
    console.log("event: ", event);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user; 
                                           console.log(JSON.stringify($rootScope.user)); 
                                          }, 
                               function() {$scope.logingood=false; alert('Wrong user/pass');}  );
  }