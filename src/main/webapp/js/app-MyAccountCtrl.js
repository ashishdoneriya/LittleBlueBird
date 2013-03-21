
function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, $timeout, User ) {
  
  console.log("MyAccountCtrl called");
  
  // 3/14/13  personalinfo.html: User edits his info but works with 'usercopy', not 'user'
  $rootScope.usercopy = angular.copy($rootScope.user);
  
  // 3.17.13
  $scope.cssPersonalInfoSaved = 'transition0';
  $scope.cssBioSaved = 'transition0';
  
    
  // 3/13/13
  $scope.resetuser = function() {
      $rootScope.usercopy = angular.copy($rootScope.user);
      angular.resetForm($scope, 'regForm', $rootScope.usercopy); 
  }
  
  
  $scope.togglepersonalinfo = function() {
    if(!angular.isDefined($scope.personalinfo) || !$scope.personalinfo) $scope.personalinfo = true;
    else $scope.personalinfo = false;
  }
  
  
  $scope.togglebio = function() {
    if(!angular.isDefined($scope.bio) || !$scope.bio) $scope.bio = true;
    else $scope.bio = false;
  }
  
  
  $scope.savePersonalInfo = function(user) {
    //console.log("$scope.savePersonalInfo(): took out success guts -----------------------------");
    $rootScope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    $scope.cssPersonalInfoSaved = 'transition1';
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
    $rootScope.user = User.save({userId:$rootScope.user.id, notifyonaddtoevent:$rootScope.user.notifyonaddtoevent, notifyondeletegift:$rootScope.user.notifyondeletegift, notifyoneditgift:$rootScope.user.notifyoneditgift, notifyonreturngift:$rootScope.user.notifyonreturngift}, 
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

