

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, UserSearch, Email, Gift, Circle, CircleParticipant) {
  
  //console.log("UserCtrl called");
  
  
  $scope.userExists = function() {
    //console.log("scope.userExists:  true (HARD-CODED)");
    return true;
  }
  
  $scope.userExistsWORKONTHIS = function() {
    if(angular.isDefined($rootScope.user) && angular.isDefined($rootScope.user.id)) {
      //console.log("$scope.userExists():  return true because $rootScope.user is defined");
      return true;
    }
    else if($scope.lookingforuser) {
      //console.log("$scope.lookingforuser="+$scope.lookingforuser+"  ...so hang on and return false from $scope.userExists()");
      return false;
    }
    else {
      $scope.lookingforuser = true;
      //console.log("setting $scope.lookingforuser="+$scope.lookingforuser+"  because there's no $rootScope.user yet...");
      
      // see if the user is logged in to FB
      FB.getLoginStatus(function(response) {
        // 'connected', 'not_authorized', 'unknown'
        $scope.fbstatus = response.status;
        //console.log("FB login status response...");
        //console.log(response);
        if(response.status == 'connected') {
          FB.api('/me', 
            function(user) { // success
              //console.log("User IS logged in to FB... let's try setting a cookie...");
              $cookieStore.put("fbid", user.id);
              $scope.initfbuser(user);
              $scope.lookingforuser = false;
              //console.log("setting $scope.lookingforuser="+$scope.lookingforuser+"  because FB.api returned a user");
              $scope.$apply() // Manual scope evaluation
            }
          );
        } // if(response.status == 'connected')
        else {
          //console.log("User is NOT logged in to FB");
          
          // maybe there's an LBB cookie because they don't have a FB account...
          if(angular.isDefined($cookieStore.get("userId"))) {
            //console.log("$scope.userExists():  $rootScope.user is not defined, but there is a userId cookie: emit userchange");
            $rootScope.user = User.find({userId:$cookieStore.get("userId")}, 
                      function(){User.currentUser = $rootScope.user; 
                                 $scope.lookingforuser = false;
                                 //console.log("setting $scope.lookingforuser="+$scope.lookingforuser+"  because we found the LBB cookie: userId");
                                 //console.log("$rootScope.user.id="+$rootScope.user.id); 
                                 //console.log("$rootScope.user.first="+$rootScope.user.first); 
                                 //console.log($rootScope.user); 
                                 $rootScope.$emit("userchange");}
                      );
          } // if(angular.isDefined($cookieStore.get("userId")))
          else {
            // They're not logged in to FB and there's no LBB cookie, so send them to the login page 
            $scope.lookingforuser = false;
            //console.log("setting $scope.lookingforuser="+$scope.lookingforuser+"  because we are redirecting to /login");
            //console.log("redirecting to:  /login");
            $location.url("/login");
          }
        
        } // else: if(response.status == 'connected') 
        
      
      }); // FB.getLoginStatus(function(response) {
      
      
      //console.log("$scope.userExists():  return false because it seemed like the right thing to do here");
      return false;
      
    } // else
  }
  
    
  // originally, this was in ConnectCtrl - don't know if we'll still need it there or not
  $scope.initfbuserSTILLUSINGTHIS = function(user) {
      $scope.fbuser = user;
      console.log("$scope.initfbuser:  $scope.fbuser...");
      console.log($scope.fbuser);
      console.log("$scope.fbuser.id = "+$scope.fbuser.id);
      
      // We have query using the email address because the facebook id may not be in our db yet
      var users = UserSearch.query({search:$scope.fbuser.email},
                    function() {
                      console.log("scope.initfbuser:  found "+users.length+" people with this email: "+$scope.fbuser.email); 
                      if(users.length == 1) {
                        console.log(users[0]);
                        $rootScope.user = users[0];
                        User.save({login:true, userId:$rootScope.user.id, facebookId:$scope.fbuser.id});
                      }  
                      else if(users.length == 0) {
                        $rootScope.user = User.save({login:true, fullname:$scope.fbuser.first_name+' '+$scope.fbuser.last_name, first:$scope.fbuser.first_name, last:$scope.fbuser.last_name, username:$scope.fbuser.email, email:$scope.fbuser.email, password:$scope.fbuser.email, bio:'', profilepic:'http://graph.facebook.com/'+$scope.fbuser.id+'/picture?type=large', facebookId:$scope.fbuser.id}, 
                                          function() { 
                                            //$scope.getfriends($rootScope.user);
                                            User.showUser = $rootScope.user;
                                            User.currentUser = $rootScope.user;
                                            $rootScope.$emit("userchange");                                           
                                            $rootScope.$emit("mywishlist"); 
                                            $location.url('welcome');
                                          }
                                        );
                      } 
                      else {
                        // Here, we have several people in LBB that share the FB email address ...See if any already have the FB id
                        // Nobody has the FB id => ask who are you?
                        var userfound = false;
                        for(var i=0; i < users.length; i++) {
                          if(users[i].facebookId == $scope.fbuser.id && !userfound) {
                            userfound = true;
                            $rootScope.user = users[i];  // FOUND $rootScope.user !
                            User.currentUser = $rootScope.user;
                            $rootScope.$emit("userchange");  
                          }
                        }
                        if(!userfound) {
                          User.multipleUsers = users;
                          User.email = $scope.fbuser.email;
                          User.facebookId = $scope.fbuser.id;
                          $location.url('whoareyou');  // have to ask who are you and send the user to a page showing everyone with this email
                        }
                      }
                      
                      
                    }, // end 'success' function of var users = UserSearch.query()
                    function(){alert("Could not log you in at this time\n(error code 601)");}
                 ); // end var users = UserSearch.query()
      
  } // end $scope.initfbuser
  
  
  //$rootScope.showUser = $rootScope.user; //User.showUser;
  $scope.multipleusers = function() { console.log("multipleusers() called"); return User.multipleUsers; }
  $scope.sharedemail = function() { return User.email; }
  
  $scope.showaccepted = function() {
    console.log("$rootScope.user.friends.length="+$rootScope.user.friends.length);
    for(var i=0; i < $rootScope.user.friends.length; i++) {
      if($rootScope.user.friends[i].email != '')
        $rootScope.user.friends[i].show = true;
      else
        $rootScope.user.friends[i].show = false;
    }
  }
  
  $scope.showinvited = function() {
    for(var i=0; i < $rootScope.user.friends.length; i++) {
      if($rootScope.user.friends[i].fbreqid != '' && $rootScope.user.friends[i].email == '')
        $rootScope.user.friends[i].show = true;
      else
        $rootScope.user.friends[i].show = false;
    }
  }
  
  $scope.showall = function() {
    for(var i=0; i < $rootScope.user.friends.length; i++) {
      $rootScope.user.friends[i].show = true;
    }
  }
  
  $scope.resendWelcomeEmail = function() {
    Email.send({type:'welcome', from:'info@littlebluebird.com', user:$rootScope.user}, function() {}, function() {});
  }
  
  $scope.mergeaccount = function(user) {
    user.facebookId = User.facebookId;
    User.currentUser = user;
    $rootScope.user = user;
    User.save({userId:user.id, facebookId:user.facebookId});
    $rootScope.$emit("userchange");                    
    $rootScope.$emit("mywishlist");                    
    $location.url('mywishlist');
  }
  
  $scope.nocirclemessage = {title:'', message:''};
  $scope.hasActiveCircles = function() {
    if(!angular.isDefined($rootScope.user))
      return;
    for(var i=0; i < $rootScope.user.circles.length; i++) {
      if($rootScope.user.circles[i].date > new Date().getTime()) {
        $scope.nocirclemessage = {title:'', message:''};
        return;
      }
      $scope.nocirclemessage = {title:'All Events Passed', message:'Create more events'};
    }
    if($scope.nocirclemessage.message == "") $scope.nocirclemessage = {title:'No Events', message:"Create some events"};
  }
  
  // "my wish list" call
  $scope.mywishlist = function() {
    console.log("check scope.user.id...");
    console.log($rootScope.user.id);
    gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true;
                              var x;
                              Circle.currentCircle = x; 
                              User.currentUser = $rootScope.user;
                              User.showUser = $rootScope.user;
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+User.currentUser.first+"'s list\n  Try again  (error code 701)");});
  }
  
  $scope.myaccount = function() {
    User.currentUser = $rootScope.user;
    User.showUser = $rootScope.user;
    $rootScope.$emit("userchange");
  }
  
  // THIS IS WRONG - IT'S NOT ALWAYS THE CURRENT USER !!
  $scope.showUser = function() { return $rootScope.user }
  
  $scope.loginpage = function() {
    $location.url('login');
  }
  
  $scope.save = function(user) {
    $rootScope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                  }
                                );
  }

  $rootScope.$on("userchange", function(event) {
    $rootScope.user = User.currentUser;
    $rootScope.showUser = User.showUser;
  });
  
  $rootScope.$on("mywishlist", function(event) {
    $scope.mywishlist();
  });
  
  $rootScope.$on("$viewContentLoaded", function(event) {
    console.log("UserCtrl:  $rootScope.$on('$viewContentLoaded'...");
  });
  
  if(angular.isDefined($route.current.params.showUserId) && !angular.isDefined($rootScope.showUser)) {
    $rootScope.showUser = User.find({userId:$route.current.params.showUserId}, function() {}, function() {alert("Could not find user "+$route.current.params.showUserId);})
  }
  
  // duplicated in RegisterCtrl
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
}