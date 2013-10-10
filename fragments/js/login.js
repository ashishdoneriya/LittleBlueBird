
  
  
  $scope.logout = function() {
    if(typeof FB == 'undefined') return;
    FB.logout(function(response) {});
  }
  
  
  // copied/adapted from index-Simple.html in the infinite-beach-9173 project  2013-08-01
  // See also $rootScope.registerWithFacebook in app-FacebookModule.js
  $scope.fblogin = function() {
    FB.login(
      function(response) {
        
        $scope.loggingin = true;
        
        if (response.authResponse) {
          FB.api('/me', function(fbuser) {
            tryToFindUserFromFBLogin(fbuser);
            $rootScope.fbuser = fbuser;
          });
        } 
        else {
          delete $scope.loggingin;
          alert('woops!  could not log you in');
        }
      }, 
      { scope: "email" }
    );
  }
  
  
  // 2013-10-06  This is our mobile app update strategy: We call the server and ask it for the current version. 
  // Then we compare it to the version here.
  $scope.version = function() {
    $scope.version = "0.1.9"; // needs to match the version in config.xml <widget> tag
    app_version_row = Version.query({}, 
      function() {
        $scope.currentversion = app_version_row.version;
        console.log('SERVER VERSION: ', $scope.currentversion);
        if($scope.version != $scope.currentversion) {
          $scope.needupdate = true;
        }
        else $scope.needupdate = false;
      }
    );
  }
  

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    console.log(Email);
    // 'to' will be determined on the server
    Email.send({type:'passwordrecovery', email:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }


  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function() {
    $scope.loggingin = true;
  
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           delete $scope.loggingin;
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user; 
                                           //console.log(JSON.stringify($rootScope.user)); 
                                          }, 
                               function() {$scope.logingood=false;
                                           delete $scope.loggingin; 
                                           alert('Wrong user/pass');}  );
                               
    delete $scope.password;
  }