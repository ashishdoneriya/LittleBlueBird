

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, $location, Gift, Circle, User, facebookFriends, AppRequest) {
  
  console.log("FriendCtrl called:  ----------------");
  
  $rootScope.activeitem = 'friends';
  $scope.selectedfriends = [];
      
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      // Create a render() function and put the stuff below in that
      //render();
    }
  );
  
  // duplicated in app-CircleCtrl.js
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
  }
  
  // duplicated ...almost from app-CircleCtrl.js.  The difference here is no circle
  $scope.createfriendonthefly = function(newuser) {
    console.log("$scope.createfriendonthefly():  CALLED ----------------------------------------");
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, 
                          email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, 
                          creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname, profilepicLimit:100}, 
                                  function() {$rootScope.user.friends.push(anewuser);}
                                );
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
  
  $scope.clicklbbuser = function(index, person, people) {
    if(angular.isDefined(person.selected)) {
      delete person.selected;
      for(var i=0; i < $scope.selectedfriends.length; i++) {
        if($scope.selectedfriends[i].id = person.id) {
          $scope.selectedfriends.splice(i, 1);
          break;
        }
      }
    }
    else {
      person.selected = true; 
      $scope.selectedfriends.push(person);
    }
    console.log($scope.selectedfriends);
  }
  
  // returns the selected or not-selected style of a person's row
  $scope.selectedOrNotStyle = function(style, index, size, person) {
    if(angular.isDefined(person.selected) && person.selected==true)
      style = style + ' selected';
    return $rootScope.isLastRow(style, index, size);
  }
  
  $scope.addselectedfriends = function() {
    $rootScope.usersearch = 'not loaded';
    $rootScope.user = User.save({userId:$rootScope.user.id, lbbfriends:$scope.selectedfriends}, function() {$scope.selectedfriends=[];});
  }
  
  $scope.cancelselectedfriends = function() { 
    $scope.selectedfriends = []; 
    $rootScope.search = '';
    $rootScope.usersearch = 'not loaded';
  }
  
  $rootScope.$on("friends", function(event) {
    // fbinvite() sets $rootScope.user.friends so need to do anything here except listen for the event
  });
}

function FriendsNoneCtrl($scope, $rootScope) {

}