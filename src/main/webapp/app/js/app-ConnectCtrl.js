
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

    $scope.registerWithFacebook = function() {
        facebookConnect.askFacebookForAuthentication(
          function(reason) { // fail
            $scope.error = reason;
            console.log("$scope.registerWithFacebook:  reason="+reason);
          }, 
          function(user) { // success
            console.log("$scope.registerWithFacebook:  success...");
            $scope.initfbuser(user);
            $scope.$apply() // Manual scope evaluation
          }
        );
    }
    
    
    $scope.deleteAppRequest = function(requestId) {
      console.log("$scope.deleteAppRequest() ------------");
      facebookConnect.deleteAppRequest(requestId);
    }
    
    
    $scope.initfbuser = function(user) {
            $scope.fbuser = user;
            console.log("$scope.fbuser...");
            console.log($scope.fbuser);
            console.log("$scope.fbuser.id = "+$scope.fbuser.id);
            
            // could get more than one person back - parent + children
            var users = UserSearch.query({login:true, search:$scope.fbuser.email}, 
                                          function(){
                                                     //console.log(users[0]);
                                                     
                                                     // Now look for the user that has the right facebook id.  There might not be one though - if the user hasn't yet "merged" his LBB account with his FB account
                                                     var alreadymergedaccount = false;
                                                     for(var i=0; i < users.length; i++) {
                                                       if(users[i].facebookId == $scope.fbuser.id) {
                                                         alreadymergedaccount = true;
                                                         User.currentUser = users[i]; // this is what we want to happen... we found a record in our person table that has this email AND facebookId
                                                         $rootScope.user = users[i];
                                                       }
                                                     }
                                                     console.log("$scope.initfbuser():  $rootScope.user="+$rootScope.user);
                                                     if(alreadymergedaccount) {
                                                       console.log("alreadymergedaccount - $emit commented out");
                                                       //if(User.currentUser.friends.length == 0)
                                                       //  $scope.getfriends(User.currentUser);
                                                       //else
                                                       //  console.log("already have friends - not getting them again");
                                                       
                                                       //$rootScope.$emit("userchange");
                                                       //$rootScope.$emit("mywishlist");
                                                       $location.url('mywishlist');
                                                     } 
                                                     else { // ...but in the beginning, this is what will happen - no record in our person table contains this facebookId
                                                       if(users.length == 0) {
                                                         // need to create account for this person in LBB
                                                       
                                                         $rootScope.user = User.save({login:true, fullname:$scope.fbuser.first_name+' '+$scope.fbuser.last_name, first:$scope.fbuser.first_name, last:$scope.fbuser.last_name, username:$scope.fbuser.email, email:$scope.fbuser.email, password:$scope.fbuser.email, bio:'', profilepic:'http://graph.facebook.com/'+$scope.fbuser.id+'/picture?type=large', facebookId:$scope.fbuser.id}, 
                                                                                function() { 
                                                                                   //$scope.getfriends($rootScope.user);
                                                                                   User.showUser = $rootScope.user;
                                                                                   User.currentUser = $rootScope.user;
                                                                                   console.log("just created an LBB account, check $rootScope.user...");
                                                                                   console.log($rootScope.user);
                                                                                   $rootScope.$emit("userchange");                                           
                                                                                   $rootScope.$emit("mywishlist"); 
                                                                                   $location.url('welcome');
                                                                                }
                                                                               );
                                                       }
                                                       else if(users.length == 1) {  // easy... we found exactly one person with this email - set the facebookid
                                                         users[0].facebookId = $scope.fbuser.id;
                                                         User.currentUser = users[0];
                                                         User.showUser = users[0];
                                                         $rootScope.user = users[0];
                                                         $scope.getfriends();
                                                         console.log("users.length == 1:  users[0].profilepicUrl...");
                                                         console.log(users[0].profilepicUrl);
                                                         var placeholderPic = "http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg";
                                                         
                                                         console.log("users[0].profilepicUrl != placeholderPic...");
                                                         console.log(users[0].profilepicUrl != placeholderPic);
                                                         
                                                         var pic = users[0].profilepicUrl != placeholderPic ? users[0].profilepicUrl : "http://graph.facebook.com/"+$scope.fbuser.id+"/picture?type=large";
                                                         var uagain = User.save({userId:User.currentUser.id, facebookId:$scope.fbuser.id, profilepic:pic}, 
                                                                                function() {User.currentUser = uagain; 
                                                                                            User.showUser = uagain;
									                                                        $rootScope.$emit("userchange");                                          
									                                                        $rootScope.$emit("mywishlist");
									                                                        $location.url('mywishlist');});
                                                       }
                                                       else if(users.length > 1) {
                                                         // And if we happen to find several people all with the same email address and no FB id,
                                                         // we have to ask the user "who are you" and display all the people that have this email address
                                                         // "Why are you asking me?"... "What is a 'merged' account?"...  "Why do I need to 'merge' my accounts?"...
                                                         // These are all things we have to explain to the user on the mergeaccount page
                                                         User.multipleUsers = users;
                                                         User.email = $scope.fbuser.email;
                                                         User.facebookId = $scope.fbuser.id;
                                                         $location.url('whoareyou'); 
                                                       }
                                                     }
                                                     /************
                                                     *******************/
                                                    },
                                          function() {alert("Could not log you in at this time\n(error code 201)");});
    } //end $scope.initfbuser
}