
function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, User ) {
  
  console.log("MyAccountCtrl called");
  
  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
    $scope.notifyonaddtoevent = $scope.user.notifyonaddtoevent;
    $scope.notifyondeletegift = $scope.user.notifyondeletegift;
    $scope.notifyoneditgift = $scope.user.notifyoneditgift;
    $scope.notifyonreturngift = $scope.user.notifyonreturngift;
  });
  
  
  $scope.updateemailprefs = function() {
    $scope.user.notifyonaddtoevent = $scope.notifyonaddtoevent;
    $scope.user.notifyondeletegift = $scope.notifyondeletegift;
    $scope.user.notifyoneditgift = $scope.notifyoneditgift;
    $scope.user.notifyonreturngift = $scope.notifyonreturngift;
    $scope.user = User.save({userId:$scope.user.id, notifyonaddtoevent:$scope.user.notifyonaddtoevent, notifyondeletegift:$scope.user.notifyondeletegift, notifyoneditgift:$scope.user.notifyoneditgift, notifyonreturngift:$scope.user.notifyonreturngift}, 
                                  function() {
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  $scope.save = function(user) {
    $scope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}

