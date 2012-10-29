

// This is LittleBlueBird login - don't confuse with FB login.  FB login goes through ConnectCtrl
function LoginCtrl($document, $window, $rootScope, $cookieStore, $scope, $location, User, Circle, Logout, Email, CircleParticipant, facebookConnect) { 
  
  $scope.comingfromfacebookDONTKNOWABOUTTHIS = function() {
    if(angular.isDefined($scope.facebookreqids))
      return;
    $scope.facebookreqids = [];
    console.log($scope.facebookreqids);
    var parms = $window.location.search.split("&")
    if(parms.length > 0) {
      for(var i=0; i < parms.length; i++) {
        if(parms[i].split("=").length > 1 && (parms[i].split("=")[0] == 'request_ids' || parms[i].split("=")[0] == '?request_ids')) {
          fbreqids_csv = parms[i].split("=")[1].split("%2C")
          for(var j=0; j < fbreqids_csv.length; j++) {
            $scope.facebookreqids.push(fbreqids_csv[j]);
          }  
        }
      }
    }
  
    for(var k=0; k < $scope.facebookreqids.length; k++) {
      console.log("$scope.facebookreqids["+k+"] = "+$scope.facebookreqids[k]);
    }
    console.log("here's where we'd call user.query()");
    if($scope.facebookreqids.length == 0)
      return;
    var someusers = User.query({fbreqid:$scope.facebookreqids}, 
                               function() {
                                 // TODO might be good to have an "oops" page just in case the request_ids doesn't match anyone - if someone is monkeying with the url
                                 $rootScope.user = someusers[0]; 
                                 
                                 // We've identified the new user by facebook request id.  Now we're going to go through the FB login process
                                 // because we know the person is logged in to FB (they just came from there).
						         facebookConnect.askFacebookForAuthentication(
						             function(reason) { // fail
						               $scope.error = reason;
						             }, 
						             function(userfromfb) { // success
						             
                                       // I only need these 3 parms...
                                       saveduser = User.save({login:true, userId:$rootScope.user.id, email:userfromfb.email}, 
                                                             function() { 
                                                               User.showUser = saveduser;
                                                               User.currentUser = saveduser;
                                                               $rootScope.$emit("userchange"); 
                                                               $rootScope.$emit("getfriends");                                           
                                                               $rootScope.$emit("mywishlist"); 
                                                               $location.url('welcome');
                                                             });

						             });
        
                               }, 
                               function() {console.log("didn't find anybody")});
  }
  
 
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