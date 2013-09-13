

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, User, Friend) {
  
  console.log("FriendCtrl called:  ----------------");
  
  $rootScope.activeitem = 'friends';
  $scope.selectedfriends = [];
      
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      // Create a render() function and put the stuff below in that
      //render();
    }
  );
  
  // duplicated ...almost from app-CircleCtrl.js.  The difference here is no circle
  $scope.createfriendonthefly = function(newuser) {
    console.log("$scope.createfriendonthefly():  CALLED ----------------------------------------");
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, 
                          email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, 
                          creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname, profilepicLimit:100}, 
                                  function() {$rootScope.user.friends.push(anewuser);}
                                );
  }
  
  // TODO duplicated code! Why is this same code also in app-EventCtrl.js ?
  // don't let the user friend himself
  $scope.clicklbbuser = function(index, person, people) {
    if(angular.isDefined(person.selected)) {
      delete person.selected;
      for(var i=0; i < $scope.selectedfriends.length; i++) {
        if($scope.selectedfriends[i].id == person.id) {
          $scope.selectedfriends.splice(i, 1);
          break;
        }
      }
    }
    else {
      person.selected = true; 
      if($rootScope.user.id != person.id)
        $scope.selectedfriends.push(person);
    }
    console.log($scope.selectedfriends);
  }
  
  $scope.savenewfriend = function(newuser) {
    newuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password}, 
                                  function() { 
                                    $rootScope.user = User.save({userId:$rootScope.user.id, lbbfriends:[newuser]});
                                  }
                                );
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
  
  $scope.removefriend = function($event, friend) {
    console.log("$event.preventDefault() and stop propagation");
    $event.preventDefault();
    $event.stopPropagation(); // friends.html contains an <a> tag that wraps each friend line.  This <a> tag sends the user
    // to the friends wish list page.  But we don't want to go there in this case, so we call $event.stopPropagation()
    // and $event.preventDefault() - we actually need both in this case
    for(var i=0; i < $rootScope.user.friends.length; i++) {
      if(friend.id == $rootScope.user.friends[i].id) {
        $rootScope.user.friends.splice(i, 1);
        Friend.delete({userId:$rootScope.user.id, friendId:friend.id});
        break;
      }
    }
  }
    
  $scope.createafriend = function() {
    $scope.newuser = {};
  }
  
  $rootScope.$on("friends", function(event) {
    // fbinvite() sets $rootScope.user.friends so need to do anything here except listen for the event
  });
}

function FriendsNoneCtrl($scope, $rootScope) {

}