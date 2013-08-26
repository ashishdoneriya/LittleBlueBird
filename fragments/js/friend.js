
    
  
  
  // 2013-07-23  copied/adapted from $rootScope.friendwishlist in app.js
  $scope.friendwishlist = function(friend) {
      success = function() { 
                              $scope.gifts.mylist=false;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            };
      
      fail = function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");};
  
      $scope.friendwishlist_takingargs(friend, success, fail);
  }
  
  
  $scope.friendwishlist_takingargs = function(friend, success, fail) {
      $rootScope.showUser = friend;
      $scope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, success, fail);
  }
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.friends = function() {
                              setTimeout(function(){
                                jQuery("#friendview").listview("refresh");
                              },0);
  }
  
  
  $scope.initNewFriend = function() {
    $scope.newfriend = {};
  }
  
  
  // 2013-08-13:  Similar to $scope.invite() in event.js, when a person tries to add a friend by email (and name), we have to query
  // the db first to see if the email address already exists.  The email address COULD be in the db several times.  If the email
  // is found at all, we have to present the user with the names of everyone having this email address.  We have to give the user
  // the opportunity to say "yes, this is the person I'm trying to add."
  $scope.searchforfriend = function(newfriend) {
    $scope.searchingforfriends = true;
    $scope.maybefriends = User.query({email:newfriend.email},
                                      function() {
                                        jQuery("#maybefriendsview").hide();
			                              setTimeout(function(){
			                                jQuery("#maybefriendsview").listview("refresh");
			                                jQuery("#maybefriendsview").show();
			                             },0);
			                             delete $scope.searchingforfriends;
			                             
			                             // If the user entered an email that wasn't found in the db...
			                             if($scope.maybefriends.length==0) {
			                               // then this newfriend needs to have a new account created in the db
			                               anewuser = User.save({fullname:newfriend.name, email:newfriend.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname},
			                                   function() {
			                                       // upon successful save of the new friend's account, update the current user with this new friends
			                                       User.save({userId:$rootScope.user.id, username:$rootScope.user.username, lbbfriends:[anewuser]},
			                                           function(){ 
			                                               // ...and assuming the update of the current user was ok, add the newfriend to the user's list of friends
			                                               $rootScope.user.friends.push(anewuser); 
			                                               refreshFriends();
			                                           });
			                                   });
			                             }
                                      },
                                      function() {delete $scope.searchingforfriends;} );
  }
  
  
  
  
  
  // 2013-08-08
  $scope.selectthisfriend = function(newfriend, isnewperson) {
      
      delete $scope.maybefriends;      
         
      if(isnewperson) {
        // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
        anewuser = User.save({fullname:newfriend.name, email:newfriend.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                            function() {
                                $rootScope.user = User.save({userId:$rootScope.user.id, lbbfriends:[anewuser]},
                                                           function() {
                                                             refreshFriends();
                                                           }
                                                  ); //User.save()
                            } // end success function
                   ); //User.save()
      }
      else {
        $rootScope.user = User.save({userId:$rootScope.user.id, lbbfriends:[newfriend]},
                                   function() {
                                     refreshFriends();
                                   }
                          ); //User.save()
      }
      
  }
  
  
  refreshFriends = function() {                     
        jQuery("#friendview").hide();
          setTimeout(function(){
            jQuery("#friendview").listview("refresh");
            jQuery("#friendview").show();
         },0);
  }
  
  
  $scope.prepareDeleteFriends = function() {
    $scope.friendstodelete = [];
  }
  
  
  $scope.prepareDeleteFriend = function(friend) {
    if('checked' == jQuery("#deletefriend-"+friend.id).attr('checked'))
      $scope.friendstodelete.push(friend);
    else {
      for(var i=0; i < $scope.friendstodelete.length; i++ ) {
        var ff = $scope.friendstodelete[i].id;
        if(ff == friend.id) {
          $scope.friendstodelete.splice(i, 1);
          break;
        }
      }
    }
    
    console.log('$scope.friendstodelete', $scope.friendstodelete);
  }
  
  
  // 2013-08-19  Tried calling Friends.delete() in a loop but the counter got to the end before the success fn could be
  // called.  The result was friends was being accessed with an index that was 1 greater than what was in the array.
  // LESSON:  You can't remove friends from the user's list of friends INSIDE the success fn.  
  $scope.removeFriends = function(friends) {
    for(i=0; i < friends.length; ++i ) {
	  console.log('Before Friend.delete: friends['+i+'].id', friends[i].id);
	  console.log('friends.length=', friends.length);
      Friend.delete({userId:$rootScope.user.id, friendId:friends[i].id});
    }
    
    for(i=0; i < friends.length; ++i ) {
      var totalFriends = $rootScope.user.friends.length
      for(var j=0; j < totalFriends; j++) {
        if(friends[i].id == $rootScope.user.friends[j].id) {
          $rootScope.user.friends.splice(j, 1);
          --totalFriends;
        }
      }
    }
    
    
    friends.splice(0, friends.length);
    console.log('friends gone?', friends);
  }