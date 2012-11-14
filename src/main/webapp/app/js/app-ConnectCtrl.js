
// see:  http://jsfiddle.net/Hxbqd/6/
function ConnectCtrl(facebookConnect, facebookFriends, $scope, $rootScope, $resource, $location, UserSearch, User) {

    $scope.fbuser = {}
    $scope.error = null;
       
    
    $scope.fbshare = function(gift) {
      FB.ui({
          method:'feed',
          message:'Buy me this: '+gift.description,
          name:'Name goes here',
          caption:'Caption goes here',
          description:'Description goes here - looks like it can be really long...',
          link:'http://www.littlebluebird.com',
          picture:'http://www.littlebluebird.com/giftfairy/img/logo.gif',
          actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
          user_message_prompt:'user message prompt?'},
        function(response) {
          if(response && response.post_id) {
            console.log('post was successful');
          }
          else {
            console.log('post was not published');
          }
        });
    }

    $rootScope.$on("getfriends", function(event) {
      $rootScope.user = User.currentUser;
      $scope.getfriends($rootScope.user);
    });
    
    
    $scope.deleteAppRequest = function(requestId) {
      console.log("$scope.deleteAppRequest() ------------");
      facebookConnect.deleteAppRequest(requestId);
    }
}