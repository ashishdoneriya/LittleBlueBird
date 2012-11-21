

// This is LittleBlueBird login - don't confuse with FB login.  FB login goes through ConnectCtrl
function LoginCtrl($document, $window, $rootScope, $cookieStore, $scope, $location, User, Circle, Logout, Email, CircleParticipant, facebookConnect) { 
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      
      console.log("scope.login:  didn't want this to happen");
      return;
    }
    
      console.log("scope.login:  made it this far at least");
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           User.currentUser = $rootScope.user;
                                           User.showUser = User.currentUser;  
                                           // uncomment for facebook integration
                                           //$scope.getfriends(User.currentUser);                                       
                                           $rootScope.$emit("userchange");                                          
                                           $rootScope.$emit("mywishlist");
                                           console.log("scope.login:  go to 'gettingstarted'");
                                           $location.url('gettingstarted'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  $scope.logout = function() {
    Logout.logout({});   
    User.currentUser = x; 
    $rootScope.user = x;
    console.log("logging out");                                      
    $rootScope.$emit("userchange");
    //alert("logout");
  }
  
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
}