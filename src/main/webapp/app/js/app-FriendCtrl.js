

// main.html, personalinfo.html, circleinfo.html, friends.html, giftlist.html, mycircles.html, navbar.html,
// profilepic.html, welcome.html, whoareyou.html, ddbtn-addcircle.html
function FriendCtrl($scope, $rootScope, User, facebookFriends, AppRequest) {
  
  console.log("FriendCtrl called:  ----------------");
    
    
    // removed 'friend' argument from function to pull up a dialog showing all of your friends
    $scope.fbinvite = function() {
      FB.ui({method: 'apprequests', message: 'Check out LittleBlueBird - You\'ll love it!'}, 
            function callback(response) {
              // response.to:  an array of fb id's
              // response.request:  the request id returned by fb
              console.log("$scope.fbinvite:  response...");
              console.log(response);
              for(var i=0; i < response.to.length; i++) {
                AppRequest.save({facebookId:response.to[i], fbreqid:response.request});
              }
            });
    }
}