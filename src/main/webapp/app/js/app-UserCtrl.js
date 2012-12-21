
function ProfilePicCtrl($rootScope, $cookieStore, User) {
  console.log("ProfilePicCtrl --------------------");
  
  if(!angular.isDefined($rootScope.showUser)) {
    $rootScope.showUser = User.find({userId:$cookieStore.get("showUser")});
  }
  
  $rootScope.showUserfunc = function() { return $rootScope.showUser; }
}


function CreateAccountCtrl($scope, $rootScope, CircleParticipant, User) {

  
  // TODO duplicated in RegisterCtrl
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
  
  $scope.cancelnewuser = function() {
    $scope.addmethod = 'byname';
    $scope.usersearch = ''; 
    $scope.search = '';
    $scope.newuser = {};
  }
  
  // TODO duplicated in app-FriendCtrl.js
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
  }
    
  $scope.beginnewgiver = function() {
    $scope.addgivermethod = 'createaccount';
    $scope.newuser = {};
  }
    
  $scope.beginnewreceiver = function() {
    $scope.addreceivermethod = 'createaccount';
    $scope.newuser = {};
  }
  
  $scope.createonthefly = function(newuser, participationlevel) {
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                                  function() {$scope.addparticipant3(anewuser, participationlevel); $scope.addgivermethod = ''; $scope.addreceivermethod = ''; $scope.usersearch = ''; $scope.search = '';}
                                );
  }
  
  
  // when you're creating a new user and then immediately adding them to the circle
  $scope.addparticipant3 = function(person, participationlevel) {
    $scope.addparticipant(-1, person, participationlevel);
  }
    
  $scope.addparticipant = function(index, person, participationlevel) {
    var level = participationlevel;
    if(participationlevel == 'Giver') {
      $rootScope.circle.participants.givers.push(person);
      level = 'Giver';
    }
    else if($scope.canaddreceiver($rootScope.circle)) {
      $rootScope.circle.participants.receivers.push(person);
      level = 'Receiver';
    }
    else {
      $rootScope.circle.participants.givers.push(person);
      level = 'Giver';
    }
    
    if(index != -1) {
      console.log("index = "+index);
      $scope.people[index].hide = true;
    }
    
    // if the circle already exists, add the participant to the db immediately
    if(angular.isDefined($rootScope.circle.id)) {
      console.log("$scope.addparticipant:  $scope.user.id="+$scope.user.id);
      var newcp = CircleParticipant.save({circleId:$rootScope.circle.id, inviterId:$scope.user.id, userId:person.id, participationLevel:level,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:$rootScope.circle.name, 
                                         adder:$rootScope.user.fullname},
                                         function() {$rootScope.circle.reminders = Reminder.query({circleId:$rootScope.circle.id})});
    }
  }
  
}


// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, UserSearch, Email, Gift, Circle, CircleParticipant, MergeUsers) {
  
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
              //$scope.$apply() // Manual scope evaluation - commented out on 11/30/12 - experimenting
            }
          );
        } // if(response.status == 'connected')
        else {
          //console.log("User is NOT logged in to FB");
          
          // maybe there's an LBB cookie because they don't have a FB account...
          if(angular.isDefined($cookieStore.get("user"))) {
            //console.log("$scope.userExists():  $rootScope.user is not defined, but there is a userId cookie: emit userchange");
            $rootScope.user = User.find({userId:$cookieStore.get("user")}, 
                      function(){
                                 //User.currentUser = $rootScope.user; 
                                 $scope.lookingforuser = false;
                                 //console.log("setting $scope.lookingforuser="+$scope.lookingforuser+"  because we found the LBB cookie: userId");
                                 //console.log("$rootScope.user.id="+$rootScope.user.id); 
                                 //console.log("$rootScope.user.first="+$rootScope.user.first); 
                                 //console.log($rootScope.user); 
                                 //$rootScope.$emit("userchange"); // commented out on 11/30/12 - experimenting
                                 }
                      );
          } // if(angular.isDefined($cookieStore.get("user")))
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
  
  
  $scope.resendWelcomeEmail = function() {
    Email.send({type:'welcome', from:'info@littlebluebird.com', user:$rootScope.user}, function() {}, function() {});
  }
  
  $scope.mergeaccount = function(user) {
    console.log("$scope.mergeaccount() --------------------------------------------");
    $rootScope.user = MergeUsers.save({userId:user.id, facebookId:$rootScope.fbuser.id, email:$rootScope.fbuser.email}, function() {$rootScope.showUser = angular.copy($rootScope.user);});
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
    $rootScope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=true;
                              delete $rootScope.circle;
                              console.log("mywishlist(): delete $rootScope.circle:  check below ------------------");
                              console.log($rootScope.circle);
                              $rootScope.showUser = $rootScope.user;
                              //$rootScope.$emit("circlechange");   // commented out on 11/30/12 - experimenting
                              //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+$rootScope.user.fullname+"'s list\n  Try again  (error code 701)");});
  }
  
  $scope.myaccount = function() {
    //$rootScope.$emit("userchange"); // commented out on 11/30/12 - experimenting
  }
  
  $scope.loginpage = function() {
    console.log("going to login page ??????????????");
    $location.url('/login');
  }
  
  $scope.save = function(user) {
    $rootScope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                  }
                                );
  }
  
  $scope.userobj = function() { return $rootScope.user; }

  $rootScope.$on("userchange", function(event) {
    console.log("app-UserCtrl: $rootScope.$on(\"userchange\", function(event):  $rootScope.user.................");
    console.log($rootScope.user);
    // don't have to do this anymore; $rootScope.user is updated in the function that triggers this event.  All we have to do here is listen for the event
    //$rootScope.user = User.currentUser;
    //$rootScope.showUser = User.showUser;
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
  
  // TODO duplicated in RegisterCtrl
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