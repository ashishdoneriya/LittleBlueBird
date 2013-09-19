
function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, $timeout, User, Password ) {
  
  console.log("MyAccountCtrl called");
  
  // 3/14/13  personalinfo.html: User edits his info but works with 'usercopy', not 'user'
  $rootScope.usercopy = angular.copy($rootScope.user);
  
  // 3.17.13
  $scope.cssPersonalInfoSaved = 'transition0';
  $scope.cssPasswordSaved = 'transition0';
  $scope.cssBioSaved = 'transition0';
  
    
  // 3/13/13
  $scope.resetuser = function() {
      $rootScope.usercopy = angular.copy($rootScope.user);
      angular.resetForm($scope, 'regForm', $rootScope.usercopy); 
  }
  
  $scope.resetPasswordForm = function(form) {
    $rootScope.usercopy.password = '';
    $rootScope.usercopy.newpassword = '';
    $rootScope.usercopy.newpasswordAgain = '';
    form.$setPristine();
  }
  
  
  /************
  $scope.togglepersonalinfo = function() {
    if(!angular.isDefined($scope.personalinfo) || !$scope.personalinfo) $scope.personalinfo = true;
    else $scope.personalinfo = false;
  }
  ***************/
  
  
  $scope.togglebio = function() {
    if(!angular.isDefined($scope.bio) || !$scope.bio) $scope.bio = true;
    else $scope.bio = false;
  }
  
  
  // 2013-09-18
  $scope.changePassword = function(user) {
      console.log('CHANGE PASSWORD:', user);
      var res = Password.save({userId: user.id, currentpassword: user.password, newpassword: user.newpassword},
                      function() {console.log('res:', res);$timeout(function() {$scope.cssPasswordSaved = 'transition2'}, 100)},
                      function() {console.log('res:', res);alert('Uh oh - Problem on our end. Could not change your password.');});
    
  }
  
  
  
  // 2013-09-18 Copied from user.js on the mobile side.  Don't enable the submit button if the current password isn't even correct
  $scope.validatePassword = function(form, currentpassword) {
     
      console.log('$scope.validatePassword AT LEAST WE MADE IT THIS FAR ------------------------------------ ');
      checkUsers = Password.check({userId:$rootScope.user.id, currentpassword: currentpassword}, 
                                        function() {
                                          if(checkUsers.length == 0) { form.password.$invalid = 'true'; }
                                          else { form.password.$invalid = 'false'; }
                                          console.log('form: ', form);
                                          console.log('form.password: ', form.password);
                                        },
                                        function() {
                                          form.password.$invalid = 'true';
                                          console.log('form: ', form);
                                          console.log('form.password: ', form.password);
                                        });
  }
  
  
  
  $scope.savePersonalInfo = function(user) {
    //console.log("$scope.savePersonalInfo(): took out success guts -----------------------------");
    var saveduser = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    $scope.cssPersonalInfoSaved = 'transition1';
                                    console.log('saveduser:', saveduser);
                                    $rootScope.user.fullname = saveduser.fullname;
                                    $rootScope.user.first = saveduser.first;
                                    $rootScope.user.last = saveduser.last;
                                    $rootScope.user.username = saveduser.username;
                                    $rootScope.user.email = saveduser.email;
                                    $rootScope.user.bio = saveduser.bio;
                                    $rootScope.user.profilepic = saveduser.profilepic;
                                    $rootScope.user.profilepicUrl = saveduser.profilepicUrl; //not sure why I have a profilepic AND profilepicUrl
                                    
                                    $timeout(function() {$scope.cssPersonalInfoSaved = 'transition2'}, 100)
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  
  $scope.saveBio = function(user) {
    //console.log("$scope.saveBio(): took out success guts -----------------------------");
    $rootScope.user = User.save({userId:user.id, bio:user.bio}, 
                                  function() {
                                    $scope.cssBioSaved = 'transition1';
                                    $timeout(function() {$scope.cssBioSaved = 'transition2'}, 100)
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}

function EmailPrefsCtrl($rootScope, $scope, $timeout, User) {
  
  console.log("EmailPrefsCtrl called");
  
  $scope.cssEmailPrefsSaved = 'transition0';
  
  $rootScope.usercopy = angular.copy($rootScope.user);
  
    
  // 3/13/13
  $scope.resetuser = function() {
    // don't have to call angular.resetForm() in this case because emailprefs.html doesn't have a <form>
    // just some checkboxes and save/reset/cancel buttons
    $scope.usercopy = angular.copy($rootScope.user); 
  }
    
  
  $scope.updateemailprefs = function() {
    $rootScope.user.notifyonaddtoevent = $scope.usercopy.notifyonaddtoevent;
    $rootScope.user.notifyondeletegift = $scope.usercopy.notifyondeletegift;
    $rootScope.user.notifyoneditgift = $scope.usercopy.notifyoneditgift;
    $rootScope.user.notifyonreturngift = $scope.usercopy.notifyonreturngift;
    
    // don't need the return value here
    User.save({userId:$rootScope.user.id, notifyonaddtoevent:$rootScope.user.notifyonaddtoevent, notifyondeletegift:$rootScope.user.notifyondeletegift, notifyoneditgift:$rootScope.user.notifyoneditgift, notifyonreturngift:$rootScope.user.notifyonreturngift}, 
                                  function() {
                                    $scope.cssEmailPrefsSaved = 'transition1';
                                    $timeout(function() {$scope.cssEmailPrefsSaved = 'transition2'}, 100)
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  $scope.toggleemailprefs = function() {
    if(!angular.isDefined($scope.emailprefs) || !$scope.emailprefs) $scope.emailprefs = true;
    else $scope.emailprefs = false;
  }
  
}

