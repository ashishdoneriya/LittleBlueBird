
  
  // copied/adapted from $scope.mergeaccount in app-UserCtrl.js 2013-08-03
  $scope.mergeaccount = function(user) {
    $rootScope.user = MergeUsers.save({userId:user.id, facebookId:$rootScope.fbuser.id, email:$rootScope.fbuser.email}, 
        function() {
          $rootScope.showUser = angular.copy($rootScope.user);
          delete $rootScope.users;
          $scope.logingood = true;
        },
        function() {
          // not doing anything here?
          $scope.logingood = true;
        });
  }  
  
  
  tryToFindUserFromFBLogin = function(fbuser) {
     
     console.log("tryToFindUserFromFBLogin");
            // This will return 1..n people, but not 0.  If on the server, we don't find anyone having either the fb id or the email, then
            // we CREATE the account and return it.  If only one person is returned, that person will have his fb id set already.
            // If > 1 people are returned, we have to tell the user that multiple people were found having the given email address and the
            // user has to choose which person he is.
            $rootScope.users = FacebookUser.findOrCreate({email:fbuser.email, facebookId:fbuser.id, first:fbuser.first_name, last:fbuser.last_name},
                function() {
                    if($rootScope.users.length == 1) {
                        $rootScope.user = angular.copy($rootScope.users[0]);
                        $rootScope.showUser = angular.copy($rootScope.users[0]);
                        $scope.logingood = true; // don't forget this or else welcome page isn't going to show you anything
                    }
                    else refreshWhoAreYouList();
                    
                    delete $scope.loggingin;
                    
                }, // success
                function() {
                    alert('Woops! Facebook login is not working right now.  Contact us at info@littlebluebird.com if this problem persists.')
                    delete $rootScope.users;
                    delete $rootScope.user;
                    delete $scope.loggingin;
                } // fail
            ); // FacebookUser.findOrCreate
  }
  
  
  refreshWhoAreYouList = function() {
        jQuery("#whoareyouview").hide();
          setTimeout(function(){
            jQuery("#whoareyouview").listview("refresh");
            jQuery("#whoareyouview").show();
         },0);
  }
  
  
  // 2013-07-31
  $scope.initNewUser = function() {
    $scope.newuser = {};
  }
  
  
  // copied/adapted from $rootScope.isUsernameUnique in app-UserModule.js  2013-07-31 
  $scope.isUsernameUnique = function(user, form) {
      if(!angular.isDefined(user.username)) {
        return;
      }
      checkUsers = User.query({username:user.username}, 
                                        function() {
                                          if(checkUsers.length > 0) { form.username.$error.taken = 'true'; }
                                          else { form.username.$error.taken = 'false'; }
                                        });
  } 
  
  
  // copied/adapted from $scope.save in app-UserCtrl.js  2013-07-31
  $scope.register = function(newuser) {
    $rootScope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    $rootScope.showUser = $rootScope.user;
                                    $scope.logingood = true; // don't forget this or else welcome page isn't going to show you anything
                                    $scope.initNewUser();
                                  },
                                  function() { 
                                    $scope.initNewUser();
                                  }
                                );
  }
  
  
  // 2013-07-31, 2013-08-16 added 4 notification fields
  $scope.saveuser = function(user) {
    console.log('user: ', user);
      User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic,
                 notifyonaddtoevent:user.notifyonaddtoevent, notifyondeletegift:user.notifyondeletegift, notifyoneditgift:user.notifyoneditgift, notifyonreturngift:user.notifyonreturngift}, 
                                  function() {
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  
  $scope.initNtfy = function() {
    jQuery("#notifyonaddtoevent").slider("refresh");
    jQuery("#notifyondeletegift").slider("refresh");
    jQuery("#notifyoneditgift").slider("refresh");
    jQuery("#notifyonreturngift").slider("refresh");
  }
  
  
  // 2013-07-31
  $scope.resetPass = function(currentpass, newpass) {
      Password.reset({userId: $rootScope.user.id, currentpass: currentpass, newpass: newpass},
                      function() {alert('Your password changed successfully');},
                      function() {alert('Uh oh - Problem on our end. Could not change your password.');});
  }
  
  
  // 2013-08-01  don't enable the submit button if the current password isn't even correct
  $scope.validatePassword = function(form, currentpassword) {
      checkUsers = Password.check({userId:$rootScope.user.id, currentpass: currentpassword}, 
                                        function() {
                                          if(checkUsers.length == 0) { form.currentpassword.$invalid = 'true'; }
                                          else { form.currentpassword.$invalid = 'false'; }
                                          console.log('form: ', form);
                                          console.log('form.currentpassword: ', form.currentpassword);
                                        },
                                        function() {
                                          form.currentpassword.$invalid = 'true';
                                          console.log('form: ', form);
                                          console.log('form.currentpassword: ', form.currentpassword);
                                        });
  }
  
  
  $scope.commasep = function(people) {
    if(!angular.isDefined(people)) return "";
    var names = [];
    for(var i=0; i < people.length; ++i) {
      names.push(people[i].fullname);
    }
    return names.join(" and ");
  }
  
  