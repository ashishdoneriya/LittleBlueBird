

function LoginCtrl($rootScope, $cookieStore, $scope, $location, User, Logout, Email, facebookConnect) { 

    $scope.fbuser = {}
    $scope.error = null;
       
    
    $scope.fbsharegift = function(gift) {
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
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      
      console.log("scope.login:  didn't want this to happen");
      return;
    }
    
      console.log("scope.login:  made it this far at least");
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           User.currentUser = $rootScope.user;
                                           User.showUser = User.currentUser;  
                                           // uncomment for facebook integration
                                           //$scope.getfriends(User.currentUser);                                       
                                           $rootScope.$emit("userchange");                                          
                                           $rootScope.$emit("mywishlist");
                                           console.log("scope.login:  go to 'gettingstarted'");
                                           $location.url('gettingstarted'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  $scope.logout = function() {
    Logout.logout({});   
    User.currentUser = x; 
    $rootScope.user = x;
    console.log("logging out");                                      
    $rootScope.$emit("userchange");
    //alert("logout");
  }
  
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
}