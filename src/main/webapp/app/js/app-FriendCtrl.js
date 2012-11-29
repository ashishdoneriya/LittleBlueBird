

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, $location, Gift, Circle, User, facebookFriends, AppRequest) {
  
  console.log("FriendCtrl called:  ----------------");
  
  $scope.mode = 'friends';
    
  // duplicated almost - similar to app-CircleCtrl.js
  $scope.beginnewuser = function() {
    $scope.mode = 'createaccount';
    $scope.newuser = {};
  }
  
  $scope.cancel = function() {
    console.log("cancel() -------------------");
    $scope.mode = 'friends';
  }
  
  // duplicated in app-CircleCtrl.js
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
  }
  
  // duplicated ...almost from app-CircleCtrl.js.  The difference here is no circle
  $scope.createonthefly = function(newuser) {
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, 
                          email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, 
                          creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname, profilepicLimit:100}, 
                                  function() {$rootScope.user.friends.push(anewuser);}
                                );
                                
    $scope.mode = 'friends';
  }
  
  // duplicated in RegisterCtrl and UserCtrl
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
  
  
  // just like $scope.giftlist above but no circle here
  $scope.friendwishlist = function(friend) {
    gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=false;
                              //var x;
                              //Circle.currentCircle = x; 
                              delete $rootScope.circle;
                              console.log("$scope.friendwishlist():  delete $rootScope.circle - check below");
                              console.log($rootScope.circle);
                              User.currentUser = $rootScope.user;
                              User.showUser = friend;
                              console.log("$scope.friendwishlist:  set $location.url(/giftlist/#)");
                              $location.path('/giftlist/'+friend.id);
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  $rootScope.$on("friends", function(event) {
    // fbinvite() sets $rootScope.user.friends so need to do anything here except listen for the event
  });
}