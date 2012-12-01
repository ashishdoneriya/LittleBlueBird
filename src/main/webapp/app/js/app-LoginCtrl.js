

function LoginCtrl($rootScope, $cookieStore, $scope, $location, User, Logout, Email, facebookConnect) { 

    $scope.fbuser = {}
    $scope.error = null;
    $rootScope.loginoption = '';
    
  $scope.loginhelpbox = function(showhide) {
    console.log("scope.loginhelpbox, using rootScope -----------------------------");
    $rootScope.loginhelp = showhide;
  }
  
  
  $scope.setloginoption = function(something) { 
    console.log("$rootScope.setloginoption -----------------------"); 
    $rootScope.loginoption = something; 
  }
  
  $scope.setloginsectiontwo = function(somename) { $rootScope.loginsectiontwo = somename; }
  
 
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
                                           //User.currentUser = $rootScope.user;
                                           $rootScope.showUser = $rootScope.user;  
                                           // uncomment for facebook integration
                                           //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting                                         
                                           //$rootScope.$emit("mywishlist");  // commented out on 11/30/12 - experimenting
                                           console.log("scope.login:  go to 'gettingstarted'");
                                           $location.url('gettingstarted'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  $scope.logout = function() {
    Logout.logout({});   
    delete $rootScope.user;
    $cookieStore.remove("user");
    console.log("logging out");                                      
    //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
    //alert("logout");
  }
  
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
}