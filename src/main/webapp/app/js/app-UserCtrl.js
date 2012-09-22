

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, UserSearch, Email, Gift, Circle, CircleParticipant) {
  
  console.log("UserCtrl called");
  
  // to re-get the user when the page is reloaded
  $scope.lookforuser = function() {
    if(angular.isDefined($scope.user)) { 
      // don't do anything
      console.log("$scope.lookforuser:  $scope.user is already defined.  It is...");
      console.log($scope.user);
      
    }
    // next check for the userId cookie
    else if(angular.isDefined($cookieStore.get("userId"))) {
      console.log("$scope.lookforuser:  $scope.user is not defined, but there is a userId cookie: emit userchange");
      $scope.user = User.find({userId:$cookieStore.get("userId")}, 
                      function(){User.currentUser = $scope.user; 
                                 console.log("$scope.user.id="+$scope.user.id); 
                                 console.log("$scope.user.first="+$scope.user.first); 
                                 console.log($scope.user); 
                                 $rootScope.$emit("userchange");}
                    );
    }
    // next see if the user is logged in to fb - if so, take that user info and send to the server
    // and send back the userId cookie
    else // else1
    {
      console.log("$scope.lookforuser:  $scope.user is not defined, and there is NO userId cookie, so check FB login status...");
      
      
      FB.getLoginStatus(function(response) {
        // 'connected', 'not_authorized', 'unknown'
        $scope.fbstatus = response.status;
        console.log("FB login status response...");
        console.log(response);
        if(response.status == 'connected') {
          FB.api('/me', 
            function(user) { // success
              $scope.initfbuser(user);
              $scope.$apply() // Manual scope evaluation
            }
          );
        }
        else {
          console.log("redirecting to:  /login");
          $location.url("/login");
        }
      }); // end FB.getLoginStatus
      
      
    } // end else1
  } //end $scope.lookforuser
  
  
  // originally, this was in ConnectCtrl - don't know if we'll still need it there or not
  $scope.initfbuser = function(user) {
    
      $scope.fbuser = user;
      console.log("$scope.initfbuser:  $scope.fbuser...");
      console.log($scope.fbuser);
      console.log("$scope.fbuser.id = "+$scope.fbuser.id);
      
      var users = UserSearch.query({login:true, search:$scope.fbuser.email},
                    function() {
                      console.log("found this fb user..."); 
                      console.log(users[0]);   
                      
                      
                                 
                    }, // end 'success' function of var users = UserSearch.query()
                    function(){alert("Could not log you in at this time\n(error code 401)");}
                 ); // end var users = UserSearch.query()
      
  } // end $scope.initfbuser
  
  
  $scope.showUser = $scope.user; //User.showUser;
  $scope.multipleusers = function() { console.log("multipleusers() called"); return User.multipleUsers; }
  $scope.sharedemail = function() { return User.email; }
  
  $scope.showaccepted = function() {
    console.log("$scope.user.friends.length="+$scope.user.friends.length);
    for(var i=0; i < $scope.user.friends.length; i++) {
      if($scope.user.friends[i].email != '')
        $scope.user.friends[i].show = true;
      else
        $scope.user.friends[i].show = false;
    }
  }
  
  $scope.showinvited = function() {
    for(var i=0; i < $scope.user.friends.length; i++) {
      if($scope.user.friends[i].fbreqid != '' && $scope.user.friends[i].email == '')
        $scope.user.friends[i].show = true;
      else
        $scope.user.friends[i].show = false;
    }
  }
  
  $scope.showall = function() {
    for(var i=0; i < $scope.user.friends.length; i++) {
      $scope.user.friends[i].show = true;
    }
  }
  
  $scope.resendWelcomeEmail = function() {
    Email.send({type:'welcome', from:'info@littlebluebird.com', user:$scope.user}, function() {}, function() {});
  }
  
  $scope.mergeaccount = function(user) {
    user.facebookId = User.facebookId;
    User.currentUser = user;
    User.save({userId:user.id, facebookId:user.facebookId});
    $rootScope.$emit("userchange");                    
    $rootScope.$emit("mywishlist");                    
    $location.url('mywishlist');
  }
  
  $scope.nocirclemessage = {title:'', message:''};
  $scope.hasActiveCircles = function() {
    for(var i=0; i < $scope.user.circles.length; i++) {
      if($scope.user.circles[i].date > new Date().getTime()) {
        $scope.nocirclemessage = {title:'', message:''};
        return;
      }
      $scope.nocirclemessage = {title:'All Events Passed', message:'Create more events'};
    }
    if($scope.nocirclemessage.message == "") $scope.nocirclemessage = {title:'No Events', message:"Create some events"};
  }
  
  // adjust dims for large profile pics
  $scope.adjustedheight = function(auser, limit) { 
    if(!angular.isDefined(auser))
      return -1;
    var mindim = auser.profilepicheight < auser.profilepicwidth ? auser.profilepicheight : auser.profilepicwidth
    var ratio = mindim > limit ? limit / mindim : 1;
    var adj = ratio * auser.profilepicheight;
    return adj;
  }
  
  $scope.adjustedwidth = function(auser, limit) {
    if(!angular.isDefined(auser))
      return -1;
    var mindim = auser.profilepicheight < auser.profilepicwidth ? auser.profilepicheight : auser.profilepicwidth
    var ratio = mindim > limit ? limit / mindim : 1;
    var adj = ratio * auser.profilepicwidth;
    return adj;
  }
  
  // "my wish list" call
  $scope.mywishlist = function() {
    console.log("check scope.user.id...");
    console.log($scope.user.id);
    gifts = Gift.query({viewerId:$scope.user.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true;
                              var x;
                              Circle.currentCircle = x; 
                              User.currentUser = $scope.user;
                              User.showUser = $scope.user;
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+User.currentUser.first+"'s list\n  Try again  (error code 301)");});
  }
  
  $scope.myaccount = function() {
    User.currentUser = $scope.user;
    User.showUser = $scope.user;
    $rootScope.$emit("userchange");
  }
  
  $scope.loginpage = function() {
    $location.url('login');
  }
  
  $scope.save = function(user) {
    $scope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                  }
                                );
  }

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
  });

  $rootScope.$on("mywishlist", function(event) {
    $scope.mywishlist();
  });
  
  if(angular.isDefined($route.current.params.showUserId) && !angular.isDefined($scope.showUser)) {
    $scope.showUser = User.find({userId:$route.current.params.showUserId}, function() {}, function() {alert("Could not find user "+$route.current.params.showUserId);})
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
  
  $scope.userExists = function() {
    return angular.isDefined($scope.user) && angular.isDefined($scope.user.id)
  }
}