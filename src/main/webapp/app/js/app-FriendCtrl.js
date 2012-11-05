

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, User, facebookFriends, indexHolder) {
  
  console.log("FriendCtrl called:  ----------------");
  
    $scope.getfriends = function(offset, limit) {
    
      facebookFriends.getfriends(offset, limit, function(fail){alert(fail);}, 
                                 function(friends) {
                                   console.log("FriendCtrl:  begin success block ---------------");
                                   
                                   //if(angular.isDefined($rootScope.user.friends)) $rootScope.user.friends.splice(0, $rootScope.user.friends.length); else $rootScope.user.friends = [];
                                   var fbfriends = [];
                                   for(var i=0; i < friends.data.length; i++) {
                                     //console.log("friends.data[i].name="+friends.data[i].name);
                                     friends.data[i].fullname = friends.data[i].name;
                                     friends.data[i].profilepicUrl = "http://graph.facebook.com/"+friends.data[i].id+"/picture?type=square";
                                     fbfriends.push(friends.data[i]);
                                   }

                                   $scope.friends = fbfriends;
                                   console.log("FriendCtrl:  $scope.friends = fbfriends;");
                                   console.log($scope.friends);
                                   
                                   console.log("FriendCtrl:  $scope.$apply() ------------");
                                   $scope.$apply();
                                   
                                   // rethinking this...
                                   // will write each friend to the person table and write a record to the friends table for each friend to associate the user with all his friends
                                   //var saveduser = User.save({userId:$rootScope.user.id, friends:savethesefriends}, 
                                   //          function() {$rootScope.user = saveduser; console.log("$rootScope.user.friends.length="+$rootScope.user.friends.length)
                                   //          });
                                   
                                 }
                                );
    
    
    } // $scope.getfriends = function()
    
    
    // removed 'friend' argument from function to pull up a dialog showing all of your friends
    $scope.fbinvite = function() {
      FB.ui({method: 'apprequests', message: 'Check out LittleBlueBird - You\'ll love it!'}, 
            function callback(response) {
              // response.to:  an array of fb id's
              // response.request:  the request id returned by fb
              console.log("$scope.fbinvite:  response...");
              console.log(response);
              //friend.fbreqid = response.request;
              //User.save({userId:friend.id, fbreqid:friend.fbreqid});
            });
    }
    
    
    $scope.getfriends(indexHolder.offset(), indexHolder.limit());
  
 
    $scope.previousFriends = function() {
      $scope.getfriends(indexHolder.previous(), indexHolder.limit());
    }
  
 
    $scope.nextFriends = function() {
      $scope.getfriends(indexHolder.next(), indexHolder.limit());
      console.log("$scope.nextFriends:  $scope.$apply() ------------");
      $scope.$apply();
    }
}