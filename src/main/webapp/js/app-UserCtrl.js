
function AskMobileCtrl($rootScope, $scope) {
  $scope.mobileanswer = function(yn) {
    $rootScope.askmobile = yn;
  }
}


function ProfilePicCtrl($rootScope, $cookieStore, User) {
  console.log("ProfilePicCtrl --------------------");
  
  if(!angular.isDefined($rootScope.showUser)) {
    $rootScope.showUser = User.find({userId:$cookieStore.get("showUser")});
  }
  
  $rootScope.showUserfunc = function() { return $rootScope.showUser; }
}


function CreateAccountCtrl($scope, $rootScope, CircleParticipant, User) {

  
  $scope.cancelnewuser = function() {
    $scope.addmethod = 'byname';
    $scope.usersearch = ''; 
    $scope.search = '';
    $scope.newuser = {};
  }
    
  $scope.beginnewgiver = function() {
    $scope.addgivermethod = 'createaccount';
    $scope.newuser = {};
  }
    
  $scope.beginnewreceiver = function() {
    $scope.addreceivermethod = 'createaccount';
    $scope.newuser = {};
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
      console.log("$scope.addparticipant:  $rootScope.user.id="+$rootScope.user.id);
      var newcp = CircleParticipant.save({circleId:$rootScope.circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:level,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:$rootScope.circle.name, 
                                         adder:$rootScope.user.fullname},
                                         function() {$rootScope.circle.reminders = Reminder.query({circleId:$rootScope.circle.id})});
    }
  }
  
}


// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, UserSearch, Email, Gift, Circle, CircleParticipant, MergeUsers) {
  
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
  
  $scope.save = function(user) {
    $rootScope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                  }
                                );
  }

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
}