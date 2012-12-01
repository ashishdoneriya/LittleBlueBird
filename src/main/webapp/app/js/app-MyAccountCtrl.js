
function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, User ) {
  
  console.log("MyAccountCtrl called");
  
  $rootScope.$on("userchange", function(event) {
    $scope.notifyonaddtoevent = $rootScope.user.notifyonaddtoevent;
    $scope.notifyondeletegift = $rootScope.user.notifyondeletegift;
    $scope.notifyoneditgift = $rootScope.user.notifyoneditgift;
    $scope.notifyonreturngift = $rootScope.user.notifyonreturngift;
  });
  
  
  $scope.updateemailprefs = function() {
    $rootScope.user.notifyonaddtoevent = $scope.notifyonaddtoevent;
    $rootScope.user.notifyondeletegift = $scope.notifyondeletegift;
    $rootScope.user.notifyoneditgift = $scope.notifyoneditgift;
    $rootScope.user.notifyonreturngift = $scope.notifyonreturngift;
    $rootScope.user = User.save({userId:$rootScope.user.id, notifyonaddtoevent:$rootScope.user.notifyonaddtoevent, notifyondeletegift:$rootScope.user.notifyondeletegift, notifyoneditgift:$rootScope.user.notifyoneditgift, notifyonreturngift:$rootScope.user.notifyonreturngift}, 
                                  function() {
                                    //User.currentUser = $rootScope.user;
                                    //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  $scope.save = function(user) {
    $rootScope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    //User.currentUser = $rootScope.user;
                                    //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}

