

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, $location, Gift, Circle, User, facebookFriends, AppRequest) {
  
  console.log("FriendCtrl called:  ----------------");
  
  $scope.mode = 'friends';
  $rootScope.activeitem = 'friends';
    
  // duplicated almost - similar to app-CircleCtrl.js
  $scope.beginnewuser = function() {
     $scope.mode = 'createaccount';
    console.log("$scope.mode="+$scope.mode);
    $scope.newuser = {};
  }
  
  $scope.addlbbfriend = function() {
    $scope.mode = 'addlbbfriend';
    console.log("$scope.mode="+$scope.mode);
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
  
  // TODO duplicated in RegisterCtrl and UserCtrl
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
    $rootScope.showUser = friend;
    console.log("viewerId:$rootScope.user.id="+$rootScope.user.id);
    $rootScope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=false;
                              $rootScope.gifts.ready="true";
                              delete $rootScope.circle;
                              console.log("$scope.friendwishlist():  delete $rootScope.circle - check below");
                              console.log($rootScope.circle);
                              //$rootScope.$emit("circlechange"); // commented out on 11/30/12 - experimenting
                              //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  $rootScope.$on("friends", function(event) {
    // fbinvite() sets $rootScope.user.friends so need to do anything here except listen for the event
  });
}

function FriendsNoneCtrl($scope, $rootScope) {

}