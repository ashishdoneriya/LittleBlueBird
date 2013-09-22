// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};



// 2013-07-23  $location is causing problems with jquery mobile: the browser back button stops working.  I think all links/routing stopped working.
//function LbbController($scope, Email, $rootScope, User, $location) {



// 2013-07-23  weird syntax needed for minification
var LbbController = ['$scope', '$timeout', 'Email', '$rootScope', 'User', 'Gift', 'Password', 'FacebookUser', 'MergeUsers', 'Circle', 'CircleParticipant', 'Reminder', 'Friend', 'UPC', // MUST END WITH A COMMA !
function($scope, $timeout, Email, $rootScope, User, Gift, Password, FacebookUser, MergeUsers, Circle, CircleParticipant, Reminder, Friend, UPC) {

  $scope.footermenu = '';
  $scope.eventfilter = 'current';
  
  
  $scope.logout = function() {
    if(typeof FB == 'undefined') return;
    FB.logout(function(response) {});
  }
  
  
  // copied/adapted from index-Simple.html in the infinite-beach-9173 project  2013-08-01
  // See also $rootScope.registerWithFacebook in app-FacebookModule.js
  $scope.fblogin = function() {
    FB.login(
      function(response) {
        if (response.authResponse) {
          FB.api('/me', function(fbuser) {
            tryToFindUserFromFBLogin(fbuser);
            $rootScope.fbuser = fbuser;
          });
        } 
        else {
          alert('woops!  could not log you in');
        }
      }, 
      { scope: "email" }
    );
  }
  
  
  // no reason for this to be here other than I was looking for an FB function to copy
  // and found the one above.  This fn was modeled after $rootScope.sendFacebookMessage in app-FacebookModule.js
  // The difference here is that the function doesn't assume anyone on the 'to' line
  $scope.shareAppViaFacebookMessage = function() {
      FB.ui({app_id: '136122483829', to:'7913493', method:'send', link:'http://www.littlebluebird.com/gf/'})
  }
  
  // make the share message customizable ???
  $scope.shareAppViaTimeline = function() {
    FB.ui({
        method:'feed',
        name:'Check out LittleBlueBird.com [FREE for all subscribers]',
        caption:'Give what THEY want - Get what YOU want',
        description:'This is the site my friends and family use to keep track of everyone\'s wish list.  There\'s also a mobile version with a barcode scanner so you can point, scan, add items to your wish list.',
        link:'http://www.littlebluebird.com/gf/',
        picture:'http://www.littlebluebird.com/gf/img/logo-whitebackground.gif',
        //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
        user_message_prompt:'user message prompt?'},
      function(response) {
        if(response && response.post_id) {
          console.log('$scope.fbsharelist():  post was successful');
        }
        else {
          console.log('$scope.fbsharelist():  post was not published');
        }
    });
  }
    
    
  // no reason for this to be here other than I was looking for an FB function to copy and found the one above.  
  // can also supply a "to" argument with value of someone's facebook id whose wall/timeline you want to post on
  // but beware, that person may not allow that.  This fn modeled after $rootScope.fbsharelist in 
  // app-FacebookModule.js
  $scope.fbsharelist = function(showUser) {
    FB.ui({
        method:'feed',
        name:'I\'ve updated my wish list. Check it out on LittleBlueBird.com [FREE for all subscribers]',
        caption:'Give what THEY want - Get what YOU want',
        description:'This is the site my friends and family use to keep track of everyone\'s wish list',
        link:'http://www.littlebluebird.com/gf/giftlist/'+showUser.id+'/',
        picture:'http://www.littlebluebird.com/gf/img/logo-whitebackground.gif',
        //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
        user_message_prompt:'user message prompt?'},
      function(response) {
        if(response && response.post_id) {
          console.log('$scope.fbsharelist():  post was successful');
        }
        else {
          console.log('$scope.fbsharelist():  post was not published');
        }
    });
  }
  

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    console.log(Email);
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }


  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function() {
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user; 
                                           //console.log(JSON.stringify($rootScope.user)); 
                                          }, 
                               function() {$scope.logingood=false; alert('Wrong user/pass');}  );
                               
    delete $scope.password;
  }
  
  // copied/adapted from $scope.mergeaccount in app-UserCtrl.js 2013-08-03
  $scope.mergeaccount = function(user) {
    $rootScope.user = MergeUsers.save({userId:user.id, facebookId:$rootScope.fbuser.id, email:$rootScope.fbuser.email}, 
        function() {
          $rootScope.showUser = angular.copy($rootScope.user);
          delete $rootScope.users;
          $scope.logingood = true;
        },
        function() {
          // not doing anything here?
          $scope.logingood = true;
        });
  }  
  
  
  tryToFindUserFromFBLogin = function(fbuser) {
     
     console.log("tryToFindUserFromFBLogin");
            // This will return 1..n people, but not 0.  If on the server, we don't find anyone having either the fb id or the email, then
            // we CREATE the account and return it.  If only one person is returned, that person will have his fb id set already.
            // If > 1 people are returned, we have to tell the user that multiple people were found having the given email address and the
            // user has to choose which person he is.
            $rootScope.users = FacebookUser.findOrCreate({email:fbuser.email, facebookId:fbuser.id, first:fbuser.first_name, last:fbuser.last_name},
                function() {
                    if($rootScope.users.length == 1) {
                        $rootScope.user = angular.copy($rootScope.users[0]);
                        $rootScope.showUser = angular.copy($rootScope.users[0]);
                        $scope.logingood = true; // don't forget this or else welcome page isn't going to show you anything
                    }
                }, // success
                function() {
                    alert('Woops! Facebook login is not working right now.  Contact us at info@littlebluebird.com if this problem persists.')
                    delete $rootScope.users;
                    delete $rootScope.user;
                } // fail
            ); // FacebookUser.findOrCreate
  }
  
  
  // 2013-07-31
  $scope.initNewUser = function() {
    $scope.newuser = {};
  }
  
  
  // copied/adapted from $rootScope.isUsernameUnique in app-UserModule.js  2013-07-31 
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
  
  
  // copied/adapted from $scope.save in app-UserCtrl.js  2013-07-31
  $scope.register = function(newuser) {
    $rootScope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    $rootScope.showUser = $rootScope.user;
                                    $scope.logingood = true; // don't forget this or else welcome page isn't going to show you anything
                                    $scope.initNewUser();
                                  },
                                  function() { 
                                    $scope.initNewUser();
                                  }
                                );
  }
  
  
  // 2013-07-31, 2013-08-16 added 4 notification fields
  $scope.saveuser = function(user) {
    console.log('user: ', user);
      User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic,
                 notifyonaddtoevent:user.notifyonaddtoevent, notifyondeletegift:user.notifyondeletegift, notifyoneditgift:user.notifyoneditgift, notifyonreturngift:user.notifyonreturngift}, 
                                  function() {
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  
  $scope.initNtfy = function() {
    jQuery("#notifyonaddtoevent").slider("refresh");
    jQuery("#notifyondeletegift").slider("refresh");
    jQuery("#notifyoneditgift").slider("refresh");
    jQuery("#notifyonreturngift").slider("refresh");
  }
  
  
  // 2013-07-31
  $scope.resetPass = function(currentpass, newpass) {
      Password.reset({userId: $rootScope.user.id, currentpass: currentpass, newpass: newpass},
                      function() {alert('Your password changed successfully');},
                      function() {alert('Uh oh - Problem on our end. Could not change your password.');});
  }
  
  
  // 2013-08-01  don't enable the submit button if the current password isn't even correct
  $scope.validatePassword = function(form, currentpassword) {
      checkUsers = Password.check({userId:$rootScope.user.id, currentpass: currentpassword}, 
                                        function() {
                                          if(checkUsers.length == 0) { form.currentpassword.$invalid = 'true'; }
                                          else { form.currentpassword.$invalid = 'false'; }
                                          console.log('form: ', form);
                                          console.log('form.currentpassword: ', form.currentpassword);
                                        },
                                        function() {
                                          form.currentpassword.$invalid = 'true';
                                          console.log('form: ', form);
                                          console.log('form.currentpassword: ', form.currentpassword);
                                        });
  }
  
  
  $scope.commasep = function(people) {
    if(!angular.isDefined(people)) return "";
    var names = [];
    for(var i=0; i < people.length; ++i) {
      names.push(people[i].fullname);
    }
    return names.join(" and ");
  }
  
  
    
  
  
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
  
  // 2013-08-08  But what if the email address is already in the database?  This call would create a second account for this person erroneously
  //			 We have to query by email first and return all people found so the user can choose "Yes, it's one of these people" or "No, not any of these people"
  //             Think about Marian continually inviting Eric by email.  If we don't query by email first, we'll end up with tons of duplicate accounts for Eric!
  $scope.invite = function(newparticipant, circle, participationLevel) {
      $scope.loading = true;
      $scope.maybepeople = User.query({email:newparticipant.email},
              function() {
                if($scope.maybepeople.length == 1 && User.alreadyfriends($scope.maybepeople[0], $rootScope.user)) {
                  $scope.selectthisparticipant($scope.maybepeople[0], participationLevel, false)
                }
                else {
                  jQuery("#maybepeopleview").hide();
                    setTimeout(function(){
                      jQuery("#maybepeopleview").listview("refresh");
                      jQuery("#maybepeopleview").show();
                    },0);
                }
                delete $scope.loading;
              },
              function() { delete $scope.loading; }
      );
  }
  
  
  // set/refresh the flip switches on 'areyouparticipating'
  $scope.initMyParticipation = function(user, circle) {
    $scope.userisparticipant = "true";
    $scope.userishonoree = "true";
	console.log('initMyParticipation: circle=', circle);
    jQuery("#areyouparticipating").slider("refresh");
    jQuery("#areyouanhonoree").slider("refresh");
  }
  
  
  // not worrying yet about whether the person is a giver or receiver, assume receiver  2013-08-09
  // We DO know thought that if circle.receiverLimit = -1, that the person will be added as a receiver
  $scope.addparticipant = function(person, circle, participationLevel) {
  
    var parms = {user:person, circle:circle, inviter:$rootScope.user, saveParticipant:true, 
                 onSuccessfulParticipantSave:refreshParticipants};
    console.log('$scope.addparticipant: parms:', parms);
    $scope.circle = Circle.addParticipant(parms);
  
  }
  
  
  // 2013-08-09
  $scope.removeparticipant = function(participant, circle) {
  
  }
  
  
  // 2013-08-08
  $scope.setcircle = function(c) { 
    c.participants = CircleParticipant.query({circleId:c.id},
                        function() {
                          $scope.circle = c;
                          $scope.circle.participants = c.participants
                          console.log(JSON.stringify(c))
                          refreshParticipants();
                        }
                     );
  }
  
  
  $scope.choosethiscircle = function(c) {
    $scope.chosencircle = c;
    $scope.participantstoadd = []; // these are the people from 'chosencircle' that will be added to circle
    $scope.chosencircle.participants = CircleParticipant.query({circleId:c.id},
        function() {
                                           
	        jQuery("#addfromthiseventview").hide();
	          setTimeout(function(){
	            jQuery("#addfromthiseventview").listview("refresh");
	            jQuery("#addfromthiseventview").show();
	         },0);
                        
        }
    );
    $scope.selectAllButton = "Select All";
  }
  
  
  $scope.refreshOtherEventsList = function() {
               
	        jQuery("#addfromtheseeventsview").hide();
	          setTimeout(function(){
	            jQuery("#addfromtheseeventsview").listview("refresh");
	            jQuery("#addfromtheseeventsview").show();
	         },0);
  }
  
  
  // 2013-08-29
  $scope.prepareAddParticipant = function(person) {
    if('checked' == jQuery("#addthisparticipant-"+person.id).attr('checked'))
      $scope.participantstoadd.push(person);
    else {
      for(var i=0; i < $scope.participantstoadd.length; ++i) {
        if($scope.participantstoadd[i].id == person.id) {
          $scope.participantstoadd.splice(i, 1);
          break;
        }
      }
    }
  }
  
  
  // 2013-08-29
  $scope.selectAll = function(circle) {
    var selected = false
    if($scope.selectAllButton=='Select All') {
      $scope.selectAllButton='Unselect All';
      selected = true;
    }
    else {
      $scope.selectAllButton='Select All';
      selected = false;
    }
    
    // without this, you're going to run into trouble if the user checks a few boxes and then click "Select All"
    if(selected) $scope.participantstoadd.splice(0, $scope.participantstoadd.length);
  
    for(var i=0; i < circle.participants.receivers.length; ++i) {
      var person = circle.participants.receivers[i];
      jQuery("#addthisparticipant-"+person.id).trigger('create');
      console.log("checkbox", jQuery("#addthisparticipant-"+person.id)[0].checked);
      jQuery("#addthisparticipant-"+person.id)[0].checked=selected;
      $scope.prepareAddParticipant(person);
    }
    for(var i=0; i < circle.participants.givers.length; ++i) {
      var person = circle.participants.receivers[i];
      jQuery("#addthisparticipant-"+person.id).trigger('create');
      console.log("checkbox", jQuery("#addthisparticipant-"+person.id)[0].checked);
      jQuery("#addthisparticipant-"+person.id)[0].checked=selected;
      $scope.prepareAddParticipant(person);
    }
  }
  
  
  // 2013-08-29
  $scope.addParticipants = function(people, circle, level) {
    var parms = {people:people, circle:circle, level:level, inviter:$rootScope.user, successFn:refreshParticipants};
    Circle.addParticipants(parms);
  }
  
  
  // 2013-08-08
  $scope.selectthisparticipant = function(person, participationLevel, isnewperson) {
      
      delete $scope.maybepeople;
      
      if(!angular.isDefined($scope.circle.participants)) {
        $scope.circle.participants = {receivers:[], givers:[]};
      }
      
         
      if(isnewperson) {
        // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
        anewuser = User.save({fullname:newparticipant.name, email:newparticipant.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                                  function() {
                                    if(participationLevel == 'Receiver') $scope.circle.participants.receivers.push(anewuser);
                                    else $scope.circle.participants.givers.push(anewuser);
                                    
									// 2013-08-08  took this code from app-CircleModule.js
									// if the circle already exists, add the participant to the db immediately
									if(angular.isDefined($scope.circle.id)) {
									  var newcp = CircleParticipant.save({circleId:$scope.circle.id, inviterId:$rootScope.user.id, userId:anewuser.id, participationLevel:participationLevel,
									                                     who:anewuser.fullname, notifyonaddtoevent:anewuser.notifyonaddtoevent, email:anewuser.email, circle:$scope.circle.name, 
									                                     adder:$rootScope.user.fullname},
									                                     function() {
									                                       $scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})
									                                     }
									                                    );
									}
	    
                                    $rootScope.user.friends.push(anewuser);
                                            
                                    refreshParticipants();
			                             
                                  } // end success function
                                );
        console.log('$scope.circle', $scope.circle);
      }
      else {
      
	    var parms = {user:person, circle:$scope.circle, inviter:$rootScope.user, saveParticipant: $scope.circle.id!=null, 
	                 onSuccessfulParticipantSave:refreshParticipants, level:participationLevel};
	    console.log('$scope.selectthisparticipant: parms:', parms);
	    $scope.circle = Circle.addParticipant(parms);
      }
      
  }
  
  
  refreshParticipants = function() {                     
        jQuery("#receiverview").hide();
          setTimeout(function(){
            jQuery("#receiverview").listview("refresh");
            jQuery("#receiverview").show();
         },0);
		                             
        jQuery("#giverview").hide();
          setTimeout(function(){
            jQuery("#giverview").listview("refresh");
            jQuery("#giverview").show();
         },0);
  }
  
  
  refreshParticipantsToDelete = function() {                     
        jQuery("#participantsToDelete").hide();
          setTimeout(function(){
            jQuery("#participantsToDelete").listview("refresh");
            jQuery("#participantsToDelete").show();
         },0);
  }
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.events = function() {
    //$scope.loading = "true";
    console.log('user.circle:', $scope.user.circles);
                              jQuery("#eventview").hide();
                              $timeout(function(){
                                //$scope.loading = "false";
                                jQuery("#eventview").listview().listview("refresh");
                                jQuery("#eventview").show();
                              },1000);
  }
  
  
  // 2013-08-04 see http://docs.mobiscroll.com/datetime
  // see also http://docs.mobiscroll.com/26/mobiscroll-core
  $scope.initNewEvent = function(circleType, receiverLimit) {
    $scope.circle = {circleType:circleType, receiverLimit:receiverLimit};
    //The Javascript: initializing the scroller
    var xmasMillis = new Date(new Date().getFullYear(), 11, 25).getTime();
	initdatepicker(xmasMillis);
	console.log('initNewGift: $scope.circle=', $scope.circle);
  };
  
  
  $scope.editevent = function(circle) {
    //The Javascript: initializing the scroller
	initdatepicker(circle.date);
  }
  
  
  initdatepicker = function(somemillidate) {  
    console.log('somedate: ', somemillidate);
    //The Javascript: initializing the scroller
	jQuery(function(){
	    jQuery("#datepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
	    if(typeof somemillidate != 'undefined') {
	      somedate = new Date(somemillidate);
          jQuery("#datepicker").mobiscroll('setValue', [somedate.getMonth(), somedate.getDate(), somedate.getFullYear()], true, 100);
	    }
	});
  }
  
  
  // 2013-08-18  This is called from 'areyouparticipating'.  The circle.id is still null when you're on this page, and if fact, you can
  // only get to that page if the circle.id is null.  When circle.is != null and you're on setnameanddate, the next page you go to is
  // participants
  $scope.saveNewCircle = function(userisparticipant, userishonoree, user, circle) {
    circle.expirationdate = new Date(jQuery("#datepicker").mobiscroll('getDate'));
        
	console.log('saveNewCircle: circle=', circle);
      
    // CircleParticipant records are written at the time the circle is inserted.  Circle updates are different - participants are written independently of circle updates  
    var parms = {userisparticipant:userisparticipant, userishonoree:userishonoree, user:user, circle:circle, saveParticipant:false}; // since this is a new circle, the participant will be saved at the same time the circle is inserted
    circle = Circle.addParticipant(parms);
    
	console.log('saveNewCircle: userisparticipant: circle=', circle);
    
    
    // The saved circle should become the current circle if it isn't already
    var savedcircle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id, participants:circle.participants},
                 function() {
                     console.log('JUST SAVED A NEW CIRCLE');
                     $scope.circle = savedcircle;
                     $scope.circle.participants = circle.participants; // so we don't have to query the db
                     console.log("saveNewCircle:  calling new fn");
                     if(Circle.alreadyParticipating($scope.circle, $rootScope.user))
                       $rootScope.user.circles.push(angular.copy($scope.circle));
                     refreshParticipants();
                 },
                 function() {alert('Uh Oh - had a problem saving this event.\nIf this problem persists, contact us at info@littlebluebird.com');} 
             ); // Circle.save()
               
    
  }
  

  // 2013-08-27  
  $scope.beginDeleteParticipants = function(type) {
    $scope.participationLevel = type;
    $scope.participantstodelete = [];
    refreshParticipantsToDelete();
  }
  
  
  // 2013-08-27 
  $scope.prepareDeleteParticipant = function(person) {
    if('checked' == jQuery("#deleteparticipant-"+person.id).attr('checked'))
      $scope.participantstodelete.push(person);
    else {
      for(var i=0; i < $scope.participantstodelete.length; i++ ) {
        var ff = $scope.participantstodelete[i].id;
        if(ff == person.id) {
          $scope.participantstodelete.splice(i, 1);
          break;
        }
      }
    }
  }
  
  
  // 2013-08-27 
  $scope.deletehonoree = function(circle) {
    $scope.removeParticipants(circle.participants.receivers, circle);
  }
  
  
  // taken from app-CircleModule.js: $rootScope.savecircle = function(circle, expdate)  2013-08-08
  // Update 2013-08-18:  Now that we have saveNewCircle(), this method should only be called on updating circles
  //					So we don't check to see if the circle.id is null here anymore; we assume it is not null.
  $scope.savecircle = function(circle) {
    circle.expirationdate = new Date(jQuery("#datepicker").mobiscroll('getDate'));
    
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    
    
    // The saved circle should become the current circle if it isn't already
    $scope.circle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id},
                 function() {
                   // else, we are updating, circle.id IS defined so update the circle in $rootScope.user.circles
                   for(var i=0; i < $rootScope.user.circles.length; i++) {
                       if($rootScope.user.circles[i].id == $scope.circle.id) {
                         $rootScope.user.circles.splice(i, 1, $scope.circle);
                       }
                   }
                   $scope.circle.participants = circle.participants;
                   
                   refreshParticipants();
                 },
                 function() {alert('Uh Oh - had a problem saving this event.\nIf this problem persists, contact us at info@littlebluebird.com');} 
             ); // Circle.save()
               
  }

  
  
  // 2013-08-09
  $scope.preparetoremove = function(index, participant, participationLevel) {
    $scope.index = index;  $scope.participant = participant;  $scope.participationLevel = participationLevel;
  }
  
  // 2013-08-08  taken from app-CircleCtrl.js $scope.removegiver
  $scope.removeparticipant = function(index, participant, circle, participationLevel) {
    
    CircleParticipant.delete({circleId:circle.id, userId:participant.id}, 
                        function() {
                          Reminder.delete({circleId:$scope.circle.id, userId:participant.id});
                          if(participationLevel=='Receiver') circle.participants.receivers.splice(index, 1);
                          else circle.participants.givers.splice(index, 1);
                          removeremindersforperson(participant);
                          delete $scope.index;  delete $scope.participant;  $scope.participationLevel = participationLevel;
                        }
                    ); // CircleParticipant.delete
  
  }
  
  
  // 2013-08-27 - We don't need to know Giver/Receiver, just remove the people from whatever list they are in
  $scope.removeParticipants = function(people, circle) {
    for(var i=0; i < people.length; ++i) {
      CircleParticipant.delete({circleId:circle.id, userId:people[i].id}, function(){}); // not messing with success and fail functions 
    }
    
    $scope.circle = Circle.removePeople(people, circle);
    refreshParticipants();
  }
  
  
  // taken from app-CircleModule.js: $rootScope.deletecircle() 2013-08-10
  // TODO delete reminders
  $rootScope.deleteevent = function(circle) {
    Circle.save({circleId:$scope.circle
    .id, datedeleted:new Date().getTime()},
                function() {
                  // now find the circle we just deleted from the user's list of circles
                  for(var i=0; i < $rootScope.user.circles.length; i++) {
                    if(circle.id == $rootScope.user.circles[i].id) {
                      $rootScope.user.circles.splice(i, 1);
                    }
                  }
                  
                  if($rootScope.user.circles.length > 0)
                    $scope.circle = $rootScope.user.circles[0];
                  else delete $scope.circle
                  
                } // end of success function
    ); // end of Circle.save
                
  }
    
  
  // 2013-08-08  taken from app-CircleCtrl.js
  function removeremindersforperson(person) {
    $scope.circle.newreminders = [];
    for(var i=0; i < $scope.circle.reminders.length; i++) {
      if($scope.circle.reminders[i].viewer != person.id) {
        $scope.circle.newreminders.push(angular.copy($scope.circle.reminders[i]));
        console.log($scope.circle.reminders[i]);
      }
    }
    $scope.circle.reminders = angular.copy($scope.circle.newreminders);
  }


  
  $scope.eventDateFilter = function(circle) {
    if($scope.eventfilter=='all') return true;
    else if($scope.eventfilter=='current') return !circle.isExpired;
    else if($scope.eventfilter=='past') return circle.isExpired;
  }
  
  
  // participants are either circle.participants.givers or circle.participants.receivers (see #participants)
  // This page sets up booleans that tell #addremoveparticipants which buttons to display
  $scope.prepAddRemoveParticipants = function(circle, participants, participationLevel) {
      $scope.participants = participants;
      $scope.participationLevel = participationLevel;
  
      $scope.showDeleteReceiverButton = participationLevel == 'Receiver' && participants.length > 0;
      $scope.showAddReceiverButton = participationLevel == 'Receiver' && !Circle.receiverLimitReached(circle);
      $scope.deleteReceiverButton = circle.receiverLimit == -1 ? "Remove Participants" : "Remove Honoree";
      $scope.addReceiverButton = circle.receiverLimit == -1 ? "Add Participants" : "Add Honoree";
      
      $scope.showDeleteGiverButton = participationLevel == 'Giver' && participants.length > 0;
      $scope.showAddGiverButton = participationLevel == 'Giver' ;
      $scope.deleteGiverButton = "Remove Guests";
      $scope.addGiverButton = "Add Guests";
      
      console.log('$scope.showDeleteGiverButton', $scope.showDeleteGiverButton);
  }
  
  
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function
  $scope.initNewGift = function() {
    delete $scope.currentgift;
    if(angular.isDefined($scope.circle)) {
      $scope.currentgift = {addedBy:$rootScope.user.id, circle:$scope.circle};
      $scope.currentgift.recipients = angular.copy($scope.circle.participants.receivers);
    }
    else {
      $scope.currentgift = {addedBy:$rootScope.user.id};
      $scope.currentgift.recipients = [$rootScope.showUser];
    }
    
    for(var i=0; i < $scope.currentgift.recipients.length; i++) {
      if($scope.currentgift.recipients[i].id == $rootScope.showUser.id)
        $scope.currentgift.recipients[i].checked = true;
    }
    
    console.log();
    
    // you need to specify who the gift is for if there is a circle and if there is more than one receiver in the circle
    $scope.needToSpecifyWhoTheGiftIsFor = angular.isDefined($scope.currentgift) && angular.isDefined($scope.currentgift.circle) 
           && angular.isDefined($scope.currentgift.recipients) && $scope.currentgift.recipients.length > 1;
  }
  
  
  $scope.beginreserving = function(gift) {
	jQuery(function(){
	    jQuery("#givedatepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
	});
	gift.senderName = $rootScope.user.fullname;
	$scope.reserving = true;
  }
  
  
  refreshWishlist = function() {
      console.log('refreshWishlist called');
      jQuery("#wishlistview").hide();
      setTimeout(function(){
        jQuery("#wishlistview").listview("refresh");
        jQuery("#wishlistview").show();
      },0);
  }
  
  
  
  //2013-08-11  taken from app-GiftCtrl $scope.buygift()
  $scope.reservegift = function(index, gift) {
    console.log('$scope.buygift ------------------------- called');
    
    if($scope.circle)
      gift.receivedate = new Date($scope.circle.date);
    else
      gift.receivedate = new Date(jQuery("#givedatepicker").mobiscroll('getDate'));
      
    gift.senderId = $rootScope.user.id;
    // gift.senderName set by the input field on the html page 
    
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    var parms = {giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id, senderId:gift.senderId, senderName:gift.senderName, receivedate:gift.receivedate.getTime()};
    console.log('parms: ', parms);
    var savedgift = Gift.save(parms, 
                      function() { $scope.currentgift = savedgift; 
                                   $scope.gifts.splice(index, 1, savedgift);
                                   refreshWishlist();   });
    delete $scope.reserving;
  }
  
  
  // taken from app-GiftCtrl $scope.returngift()
  $scope.returngift = function(index, gift) {
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    var savedgift = Gift.save({giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, 
                               recipientId:$rootScope.showUser.id, senderId:-1, senderName:''},
                      function() { $scope.currentgift = savedgift; 
                                   $scope.gifts.splice(index, 1, savedgift);
                                   refreshWishlist();   });
  }
  
  
  $scope.viewonline = function(url, event) {
    event.preventDefault();
    window.open(url, '_blank', 'location=yes');
    return false;
  }
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.addgift() function
  $scope.savegift = function(gift) {    
    successFn = function(savedgift) {
                 add = true;
                 for(var i=0; i < $scope.gifts.length; ++i) {
                   if($scope.gifts[i].id == savedgift.id) {
                     add = false;
                     break;
                   }
                 }
                 
                 if(add) {
                   $scope.gifts.reverse();
                   $scope.gifts.push(gift);
                   $scope.gifts.reverse();
                 }
                 
                 $scope.currentgift = {};
                 $scope.currentgift.recipients = [];
                 refreshWishlist();
               };
    
    $scope.savegift_takingargs(gift, successFn);
  }   
  
  
  // by 'takingargs', we mean this function is like $scope.savegift() except that $scope.savegift_takingargs() takes args,
  // namely the success function that will be called after the gift is saved
  $scope.savegift_takingargs = function(gift, successFn) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    
    for(var i=0; i < gift.recipients.length; ++i) {
      gift.recipients[i].checked = true;
    }
    
    // we need recipientId for gift.edbr on the server side
    var saveparms = {giftId:gift.id, updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy, recipientId:$rootScope.showUser.id, recipients:gift.recipients, viewerId:$rootScope.user.id, 
               senderId:gift.sender, senderName:gift.sender_name};
               
    console.log('savegift_takingargs: saveparms=', saveparms);
               
               
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    savedgift = Gift.save(saveparms, 
        function() {
            console.log('got this savedgift', savedgift); // we do get this
            successFn(savedgift);
        }, 
        function() {console.log("$scope.savegift_takingargs: FAIL FUNCTION")});
               
  } 
  
  
  
  // 2013-08-22: 'product' is the result of a barcode scan
  $scope.convertProductToGift = function(product) {
    $scope.currentgift = Gift.convertProductToGift(product, $scope.circle, $rootScope.user);
  }
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.deletegift() function
  $scope.deletegift = function(gift) {
    $scope.gifts.splice($scope.index, 1);
    Gift.delete({giftId:gift.id, updater:$rootScope.user.fullname}, 
                  function() {
                    refreshWishlist();
                  } // end success function
               );
  }
  
  
  // simple setter as we go from the wishlist page to the gift (details) page
  $scope.setcurrentgift = function(index, gift) {
    $scope.index = index; // so that if we delete the gift we know where it is in the list 'gifts'
    $scope.currentgift = gift;
    console.log('currentgift:', gift);
  }
  
  
  // 2013-08-08  taken from app-GiftCtrl.js
  $scope.giftlist = function(circle, participant) {
    
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
  
    $scope.gifts = Gift.query({viewerId:$rootScope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              $scope.gifts.ready = true;
                              $scope.circle = circle;
                              $rootScope.showUser = participant;
                              if($rootScope.user.id == participant.id) { $scope.gifts.mylist=true; } 
                              else { $scope.gifts.mylist=false; } 
                              console.log(JSON.stringify($rootScope.showUser));
                              refreshWishlist();
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 402)");});
  }
  
  
  $scope.mywishlist_takingargs = function(successFn) {
      $rootScope.showUser = $rootScope.user;
      console.log('mywishlist_takingargs: set $rootScope.showUser = $rootScope.user', $rootScope.showUser);
      $scope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            successFn,
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  $scope.mywishlist = function() {
      successFn = function() { 
                              $scope.gifts.mylist=true;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              console.log("mywishlist with successFn");
                              refreshWishlist();
                            };
      $scope.mywishlist_takingargs(successFn);
  }
  
  
  $scope.selectrecipient = function(recipient, gift, isnewperson) {
      delete $scope.circle;                  
      delete $scope.mayberecipients;
      if(!angular.isDefined(gift.recipients))
        gift.recipients = [];
      gift.recipients.push(recipient);
    
    
      if(isnewperson) {
        // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
        
        onSuccessfulSaveOfNewUser = function() {    
                                $rootScope.showUser = anewuser;
                                User.addfriend($rootScope.user, anewuser);
                                $scope.friendwishlist(anewuser);
                              }
        
        anewuser = User.save({fullname:recipient.name, email:recipient.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                              onSuccessfulSaveOfNewUser
                            );
      }
      else {
        // In this case, the user has chosen an existing user to be the recipient of the gift
        // Make the user and the recipient friends if they aren't already
        User.addfriend($rootScope.user, recipient);
        
        
        $rootScope.showUser = recipient;
        
		onsuccessfulWishlistQuery = function() {
	        $scope.gifts.mylist=false;
	        $scope.gifts.ready="true";
		    refreshWishlist();
		}
		
        failWishlistQuery = function() {alert("Hmmm... Had a problem getting "+recipient.fullname+"'s list\n  Try again  (error code 502)");};
        
		onsuccessfulSave = function(savedgift) {
	      $scope.currentgift = {};
	      $scope.currentgift.recipients = [];
		  // now requery for the recipient's wishlist
	      $scope.friendwishlist_takingargs(recipient, onsuccessfulWishlistQuery, failWishlistQuery);
		};
        
        $scope.savegift_takingargs(gift, onsuccessfulSave);
        
      }
    
  }
  
  
  // 2013-08-22: originally created to pass in a barcode-scanned product.  product has 'name' and 'url'
  $scope.addtomywishlist = function(gift) {
    delete $scope.circle;                     
    $rootScope.showUser = $rootScope.user; 
    if(!angular.isDefined(gift.recipients)) gift.recipients = [];
    gift.recipients.push($rootScope.user);
    console.log('gift.recipients:', gift.recipients);
    
	onsuccessfulWishlistQuery = function() {
        $scope.gifts.mylist=true;
        $scope.gifts.ready="true";
        delete $scope.circle;
        console.log('success: deleted the current circle');
	    refreshWishlist();
	}
	    
	onsuccessfulSave = function(savedgift) {
	  // now requery for my wishlist
      $scope.currentgift = {};
      $scope.currentgift.recipients = [];
      $scope.mywishlist_takingargs(onsuccessfulWishlistQuery);
	};
	    
    $scope.savegift_takingargs(gift, onsuccessfulSave);
    
  }
  
  
  // If someone is already friends with the person they are making the recipient, don't ask them if the person we found is the person they want - we know it is
  // We have to check the user's list of friends
  $scope.addRecipientByEmail = function(recipient, gift) {
      console.log('addRecipientByEmail: recipient=', recipient);
      $scope.searching = true;
      $scope.mayberecipients = User.query({email:recipient.email},
          function() {
              if(!angular.isDefined(gift.recipients)) gift.recipients = [];
              if($scope.mayberecipients.length==0) {
                  // if no one comes back in this query, then 'recipient' is a brand new user whose account needs to be created for him
                  
		          // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
		          anewuser = User.save({fullname:recipient.name, email:recipient.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                              function() {
                                // now that the new user's account has been created, he has to be made a recipient of the gift
                                $rootScope.user.friends.push(anewuser);
                                gift.recipients.push(anewuser);
                                $scope.savegift(gift);
                                $scope.friendwishlist(anewuser);
                              } // end success function
                            );
              }
              else {
                  // Here, we need to see if exactly one person came back and if that person is already a friend of the user,
                  // because if the user and this person are already friends, we don't have to ask the user if "this is the person you want" - we know it is
                  var alreadyfriends = User.alreadyfriends($rootScope.user, $scope.mayberecipients[0]);
                  if(alreadyfriends) {

			        $rootScope.showUser = $scope.mayberecipients[0];
			        
		            var parms = {recipient:$rootScope.showUser, gift:gift, user:$rootScope.user, 
		                         saveGiftSuccessFn:onsuccessfulSave};
			        
                    Gift.addrecipient(parms);
                    
                    delete $scope.circle; 
                    delete $scope.mayberecipients;
                  }
                  else {// FYI - this 'else' doesn't matter.  If we hit this block, there's nothing to do.  It means the email address
	                  // we entered returned 1 or more people.  In that event, the wishlist page displays the list of 'mayberecipients'
	                  // There is nothing for us to do in this 'else' case except refresh the list of 'mayberecipients' to ensure the css styles are still applied
			          jQuery("#mayberecipientsview").hide();
			            setTimeout(function(){
			              jQuery("#mayberecipientsview").listview("refresh");
			              jQuery("#mayberecipientsview").show();
			          },0);
                  }
              
	                  
		      }
		      delete $scope.searching;
          });
  }
  
  
  var onsuccessfulWishlistQuery = function() {
				        $scope.gifts.mylist=false;
				        $scope.gifts.ready="true";
					    refreshWishlist();
					};
					
  var failWishlistQuery = function() {alert("Hmmm... Had a problem getting "+recipient.fullname+"'s list\n  Try again  (error code 502)");};
  
  var onsuccessfulSave = function(savedgift) {
				      $scope.currentgift = {};
				      $scope.currentgift.recipients = [];
					  // now requery for the recipient's wishlist
				      $scope.friendwishlist_takingargs($rootScope.showUser, onsuccessfulWishlistQuery, failWishlistQuery);
					};
  
  
  $scope.addrecipient = function(recipient, gift) {
    $rootScope.showUser = recipient;
    var parms = {recipient:$rootScope.showUser, gift:gift, user:$rootScope.user, 
                 saveGiftSuccessFn:onsuccessfulSave};
                 
    Gift.addrecipient(parms);
    
    delete $scope.circle; 
  }
  
  
  $scope.prepareMultipleRecipients = function(recipient, gift) {
    if(!angular.isDefined($scope.recipientstoadd))
      $scope.recipientstoadd = [];
    if('checked' == jQuery("#makefriendrecipient-"+recipient.id).attr('checked'))
      $scope.recipientstoadd.push(recipient);
    else {
      for(var i=0; i < $scope.recipientstoadd.length; i++ ) {
        var ff = $scope.recipientstoadd[i].id;
        if(ff == recipient.id) {
          $scope.recipientstoadd.splice(i, 1);
          break;
        }
      }
    }
    
    console.log('$scope.recipientstoadd', $scope.recipientstoadd);
  }
  
  
  refreshRecipientList = function() {
	  jQuery("#recipientsview").hide();
	    setTimeout(function(){
	      jQuery("#recipientsview").listview("refresh");
	      jQuery("#recipientsview").show();
	  },0);
  }
  
  
  // 2013-08-26 
  // We don't need to also query for a wishlist because there are several recipients.  We let the user tap one of the recipients on the next page, #recipients
  $scope.addrecipients = function(recipients, gift) {
    $scope.loading = true;
    var onsuccessfulGiftSave = function(savedgift) {
      $scope.recipientsjustadded = angular.copy(recipients);
      recipients.splice(0, recipients.length);
      refreshRecipientList();
      delete $scope.loading;
    }
    var parms = {recipients:recipients, gift:gift, user:$rootScope.user, saveGiftSuccessFn: onsuccessfulGiftSave};
    Gift.addrecipients(parms);
  }
  
  
  // 2013-08-26 
  $scope.beginAddingRecipients = function(gift) {
    
  }
  
  
  
  // 2013-08-26 modeled after $scope.prepareDeleteFriends 
  $scope.prepareDeleteRecipients = function() {
    $scope.recipientstodelete = [];
  }
  
  
  // 2013-08-26 modeled after $scope.prepareDeleteFriend
  $scope.prepareDeleteRecipient = function(recipient) {
    if('checked' == jQuery("#deleterecipient-"+recipient.id).attr('checked'))
      $scope.recipientstodelete.push(recipient);
    else {
      for(var i=0; i < $scope.recipientstodelete.length; i++ ) {
        var ff = $scope.recipientstodelete[i].id;
        if(ff == recipient.id) {
          $scope.recipientstodelete.splice(i, 1);
          break;
        }
      }
    }
  } 
  
  
  $scope.removeRecipients = function(gift, recipients) {
    onsuccessfulRemoval = function(savedgift) {recipients.splice(0, recipients.length);$scope.currentgift = savedgift;}
    parms = {deleteRecipients:recipients, 
             gift:gift, 
             updaterName:$rootScope.user.fullname, 
             viewerId:$rootScope.user.id,
             successFn:onsuccessfulRemoval};
    $scope.currentgift = Gift.removeRecipients(parms);
  }
  
    
 
  
  
  $scope.setfootermenu = function(selected) {
    $scope.footermenu = selected;
  }
  
  $scope.footermenustyle = function(menuitem) {
    return $scope.footermenu == menuitem ? 'ui-btn-active ui-state-persist' : '';
  }


// see https://github.com/phonegap-build/BarcodeScanner/blob/master/README.md

  $scope.scan = function() {
  
    try {
	    var scanner = window.cordova.require("cordova/plugin/BarcodeScanner");
	console.log('scanner', scanner);
	    scanner.scan(
	      function (result) {
	        $scope.scanresult = result.text;
	        $scope.scanformat = result.format;
	        $scope.barcodelookup(result.text, result.format);
	      }, 
	      function (error) {
	          alert("Scanning failed: " + error);
	      }
	    );
	    
    }
    catch(err) {
      alert('Error:'+err.message);
    }
  }
  
  
  $scope.barcodelookup = function(barcode, formatIgnoredAtTheMoment) {
  
    //635753490879  one hit
    //075371080043  two hits
  
    var upcresult = UPC.lookup({code:barcode}, 
                          function() {
                              //console.log('upcresult', upcresult);
						      parser=new DOMParser();
						      xml=parser.parseFromString(upcresult.xml,"text/xml");
							  console.log('upcresult.xml', upcresult.xml);
							  console.log('xml', xml);
							  $scope.testjson = xmlToJson(xml);
							  
							  console.log('testjson for: '+barcode, JSON.stringify($scope.testjson));
							  
							  $scope.products = [];
							  if(!angular.isDefined($scope.testjson.ItemLookupResponse.Items.Item)) {
							    console.log("not even defined");
							  }
							  else if(angular.isDefined($scope.testjson.ItemLookupResponse.Items.Item.length)) {
							    // multiple products returned
							    for(var i=0; i < $scope.testjson.ItemLookupResponse.Items.Item.length; ++i) {
							      var product = {name: $scope.testjson.ItemLookupResponse.Items.Item[i].ItemAttributes.Title.text, url:$scope.testjson.ItemLookupResponse.Items.Item[i].DetailPageURL.text};
							      $scope.products.push(product);
							    }
							  }
							  else {
							    // only one product returned
							    var product = {name: $scope.testjson.ItemLookupResponse.Items.Item.ItemAttributes.Title.text, url:$scope.testjson.ItemLookupResponse.Items.Item.DetailPageURL.text};
							    $scope.products.push(product);
							  }
							  
							  refreshScanResults();
							  
							  console.log('products for '+barcode, JSON.stringify($scope.products));
							  
							  $scope.scanreturncode = $scope.products.length;
							  
                          }, 
                          function() {$scope.scanreturncode = -1;});
  
  }
  
  
  
  // got this from: http://davidwalsh.name/convert-xml-json
  // Changes XML to JSON
  function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
		//console.log('obj:', obj);
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if(nodeName == '#text') nodeName = 'text'; // my own hack 2013-08-21 because angular doesn't like json elements whose names start with #
			//console.log('nodeName:', nodeName);
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
  };
  
  
  
  refreshScanResults = function() {                     
        jQuery("#scanresultlist").hide();
          setTimeout(function(){
            jQuery("#scanresultlist").listview("refresh");
            jQuery("#scanresultlist").show();
         },0);
  }
  
  
  
  // 2013-08-23
  $scope.testing = true; // drop show/hide's on pages to reveal info like who the current user is
  
  
  // 2013-08-03 created to test whatever you want temporarily

  // taken from app-CircleModule.js: $rootScope.savecircle = function(circle, expdate)  2013-08-08
  $scope.test = function(circle) {
    circle.expirationdate = new Date(jQuery("#datepicker").mobiscroll('getDate'));
    
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    
    console.log('save this circle: ', circle);
    
    $scope.circle = circle;
    $scope.circleservice = Circle;
    alert(Circle);
  }
  
  
  $scope.seeform = function(form) {
    console.log('form:', form);
  }
  
  
  
  var testdate = new Date(new Date().getFullYear(), 11, 25);
  console.log('testdate: ', testdate);
  
  jQuery(function(){
	jQuery("#datepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
    jQuery("#datepicker").mobiscroll('setValue', [testdate.getMonth(), testdate.getDate(), testdate.getFullYear()], true, 100);
  });
  
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // USERS TO CHOOSE FROM
  // passwords removed
  $scope.tamie = {"$lift_class":"person","id":4,"first":"Tamie","last":"Dunklau","email":"tamiemarie@gmail.com","username":"tamie","password":"x","dateOfBirth":213771600000,"profilepic":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","bio":"","parent":null,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"10/10/1976","fullname":"Tamie Dunklau","circles":[{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 12th Birthday","date":1376629199000,"id":447,"date_deleted":0,"cutoff_date":0,"dateStr":"8/15/2013","receiverLimit":1,"reminders":[],"isExpired":false},{"$lift_class":"circles","circleType":"Christmas","name":"test","date":1388037599000,"id":438,"date_deleted":0,"cutoff_date":0,"dateStr":"12/25/2013","receiverLimit":-1,"reminders":[{"$lift_class":"reminders","id":5072,"circle":438,"viewer":1,"remind_date":1385445599000,"person":{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5076,"circle":438,"viewer":4,"remind_date":1385445599000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5071,"circle":438,"viewer":1,"remind_date":1386827999000,"person":{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5075,"circle":438,"viewer":4,"remind_date":1386827999000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5070,"circle":438,"viewer":1,"remind_date":1387432799000,"person":{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5074,"circle":438,"viewer":4,"remind_date":1387432799000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5069,"circle":438,"viewer":1,"remind_date":1387778399000,"person":{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5073,"circle":438,"viewer":4,"remind_date":1387778399000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}}],"isExpired":false},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mother's Day (Brenda) 2013","date":1368421199000,"id":426,"date_deleted":0,"cutoff_date":1368421199000,"dateStr":"5/12/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's Birthday","date":1361858399000,"id":421,"date_deleted":0,"cutoff_date":1361858399000,"dateStr":"2/25/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2012","date":1356501599000,"id":390,"date_deleted":0,"cutoff_date":1356501599000,"dateStr":"12/25/2012","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 16th Birthday","date":1353045599000,"id":389,"date_deleted":0,"cutoff_date":1353045599000,"dateStr":"11/15/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 36th Birthday","date":1349931599000,"id":379,"date_deleted":0,"cutoff_date":1349931599000,"dateStr":"10/10/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 11th Birthday","date":1347857999000,"id":372,"date_deleted":0,"cutoff_date":1347857999000,"dateStr":"9/16/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie)","date":1336971599000,"id":364,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda)","date":1336971599000,"id":365,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 2nd Birthday","date":1336798799000,"id":362,"date_deleted":0,"cutoff_date":1336798799000,"dateStr":"5/11/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 13rd Birthday","date":1333429199000,"id":363,"date_deleted":0,"cutoff_date":1333429199000,"dateStr":"4/2/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 68th Birthday","date":1330235999000,"id":360,"date_deleted":0,"cutoff_date":1330235999000,"dateStr":"2/25/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2011","date":1324879199000,"id":321,"date_deleted":0,"cutoff_date":1324879199000,"dateStr":"12/25/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 41st Birthday","date":1324015199000,"id":341,"date_deleted":0,"cutoff_date":1324015199000,"dateStr":"12/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 15th Birthday","date":1321423199000,"id":320,"date_deleted":0,"cutoff_date":1321423199000,"dateStr":"11/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 35th Birthday","date":1318309199000,"id":319,"date_deleted":0,"cutoff_date":1318309199000,"dateStr":"10/10/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 10th Birthday","date":1316235599000,"id":312,"date_deleted":0,"cutoff_date":1316235599000,"dateStr":"9/16/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2011","date":1308545999000,"id":298,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 1st Birthday","date":1305521999000,"id":297,"date_deleted":0,"cutoff_date":1305521999000,"dateStr":"5/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2011","date":1304917199000,"id":295,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2011","date":1304917199000,"id":294,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 12th Birthday","date":1301806799000,"id":293,"date_deleted":0,"cutoff_date":1301806799000,"dateStr":"4/2/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2010","date":1293343199000,"id":259,"date_deleted":0,"cutoff_date":1293343199000,"dateStr":"12/25/2010","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 40th Birthday","date":1292479199000,"id":271,"date_deleted":0,"cutoff_date":1292479199000,"dateStr":"12/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 14th Birthday","date":1289887199000,"id":261,"date_deleted":0,"cutoff_date":1289887199000,"dateStr":"11/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 34th Birthday","date":1286773199000,"id":252,"date_deleted":0,"cutoff_date":1286773199000,"dateStr":"10/10/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 9th Birthday","date":1284699599000,"id":246,"date_deleted":0,"cutoff_date":1284699599000,"dateStr":"9/16/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 68th Birthday","date":1279429199000,"id":245,"date_deleted":0,"cutoff_date":1279429199000,"dateStr":"7/17/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2010","date":1273467599000,"id":242,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2010","date":1273467599000,"id":243,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 66th Birthday","date":1267336799000,"id":241,"date_deleted":0,"cutoff_date":1267336799000,"dateStr":"2/27/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2009","date":1261893599000,"id":187,"date_deleted":0,"cutoff_date":1261893599000,"dateStr":"12/26/2009","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 39th Birthday","date":1260943199000,"id":216,"date_deleted":0,"cutoff_date":1260943199000,"dateStr":"12/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 13th Birthday","date":1258351199000,"id":217,"date_deleted":0,"cutoff_date":1258351199000,"dateStr":"11/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 33rd Birthday","date":1255237199000,"id":214,"date_deleted":0,"cutoff_date":1255237199000,"dateStr":"10/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 8th Birthday","date":1253163599000,"id":210,"date_deleted":0,"cutoff_date":1253163599000,"dateStr":"9/16/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 67th Birthday","date":1247979599000,"id":204,"date_deleted":0,"cutoff_date":1247979599000,"dateStr":"7/18/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Anniversary","name":"Tamie&Brent's Anniversary","date":1246251599000,"id":199,"date_deleted":0,"cutoff_date":1246251599000,"dateStr":"6/28/2009","receiverLimit":2,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2009","date":1245646799000,"id":200,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2009","date":1245646799000,"id":201,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2009","date":1242017999000,"id":195,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2009","date":1242017999000,"id":196,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 10th Birthday","date":1238734799000,"id":193,"date_deleted":0,"cutoff_date":1238734799000,"dateStr":"4/2/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 65th Birthday","date":1235627999000,"id":186,"date_deleted":0,"cutoff_date":1235627999000,"dateStr":"2/25/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2008","date":1230271199000,"id":112,"date_deleted":0,"cutoff_date":1230271199000,"dateStr":"12/25/2008","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 38th Birthday","date":1229407199000,"id":131,"date_deleted":0,"cutoff_date":1229407199000,"dateStr":"12/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 12th Birthday","date":1226815199000,"id":130,"date_deleted":0,"cutoff_date":1226815199000,"dateStr":"11/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 32nd Birthday","date":1223701199000,"id":93,"date_deleted":0,"cutoff_date":1223701199000,"dateStr":"10/10/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2008","date":1210568399000,"id":83,"date_deleted":0,"cutoff_date":1210568399000,"dateStr":"5/11/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2007","date":1198648799000,"id":15,"date_deleted":0,"cutoff_date":1198648799000,"dateStr":"12/25/2007","receiverLimit":-1,"reminders":[],"isExpired":true}],"friends":[{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":2,"first":"Francy","last":"Collins","fullname":"Francy Collins","username":"francy","profilepicUrl":"http://graph.facebook.com/1280492734/picture?type=normal","profilepicheight":86,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":174,"profilepicmargintop":"0px","profilepicmarginleft":"-12px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":116,"profilepicmargintop100":"0px","profilepicmarginleft100":"-8px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":58,"profilepicmargintop50":"0px","profilepicmarginleft50":"-4px","email":"collins89@sbcglobal.net","bio":"","age":45,"dateOfBirth":-62272800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":5,"first":"Todd","last":"Cocanougher","fullname":"Todd Cocanougher","username":"todd","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":6,"first":"Julianne","last":"Cocanougher","fullname":"Julianne Cocanougher","username":"julianne","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":8,"first":"Barbara","last":"Cocanougher","fullname":"Barbara Cocanougher","username":"barbara","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":9,"first":"Greg","last":"Collins","fullname":"Greg Collins","username":"greg","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":10,"first":"Lucy","last":"Collins","fullname":"Lucy Collins","username":"lucy","profilepicUrl":"http://graph.facebook.com/100000795588383/picture?type=normal","profilepicheight":202,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":303,"profilepicadjustedwidth":150,"profilepicmargintop":"-76px","profilepicmarginleft":"0px","profilepicadjustedheight100":202,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-51px","profilepicmarginleft100":"0px","profilepicadjustedheight50":101,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-25px","profilepicmarginleft50":"0px","email":"bookbug3@sbcglobal.net","bio":"Lucy's favorite color is blue.  She loves to read, listen to music, play games and hang out with her friends.  She plays viola. ","age":16,"dateOfBirth":848037600000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":11,"first":"Trent","last":"Collins","fullname":"Trent Collins","username":"trent","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"soccercrayon4-2@sbcglobal.net","bio":"Trent loves to climb trees, and play video games, basketball, soccer, and any other games with his friends.","age":14,"dateOfBirth":923032800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":12,"first":"Bill","last":"Dunklau","fullname":"Bill Dunklau","username":"bill","profilepicUrl":"http://graph.facebook.com/1336420404/picture?type=normal","profilepicheight":127,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":190,"profilepicadjustedwidth":150,"profilepicmargintop":"-20px","profilepicmarginleft":"0px","profilepicadjustedheight100":127,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-13px","profilepicmarginleft100":"0px","profilepicadjustedheight50":63,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-6px","profilepicmarginleft50":"0px","email":"transweb@sbcglobal.net","bio":"","age":71,"dateOfBirth":-866574000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":13,"first":"Brenda","last":"Dunklau","fullname":"Brenda Dunklau","username":"brenda","profilepicUrl":"http://graph.facebook.com/1140124546/picture?type=normal","profilepicheight":117,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":175,"profilepicadjustedwidth":150,"profilepicmargintop":"-12px","profilepicmarginleft":"0px","profilepicadjustedheight100":117,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-8px","profilepicmarginleft100":"0px","profilepicadjustedheight50":58,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-4px","profilepicmarginleft50":"0px","email":"brenda@lancerltd.com","bio":"","age":69,"dateOfBirth":-815770800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":14,"first":"Debbie","last":"Greaves","fullname":"Debbie Greaves","username":"debbie","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":15,"first":"Kim","last":"Greaves","fullname":"Kim Greaves","username":"Kim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":16,"first":"Janice","last":"Johnson","fullname":"Janice Johnson","username":"janice","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":17,"first":"Tim","last":"Johnson","fullname":"Tim Johnson","username":"tim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":65,"dateOfBirth":-678481200000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":500,"first":"Truman","last":"Dunklau","fullname":"Truman Dunklau","username":"truman","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"No more clothes please - my closet is full","age":3,"dateOfBirth":1273554000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":601,"first":"Jett","last":"Dunklau","fullname":"Jett Dunklau","username":"jett","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"The only thing I need is a new diaper","age":1,"dateOfBirth":1316408400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}; 
  
  $scope.brent = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 43rd Birthday","date":1387173599000,"id":431,"date_deleted":0,"cutoff_date":1387173599000,"dateStr":"12/15/2013","receiverLimit":1,"reminders":[{"$lift_class":"reminders","id":5054,"circle":431,"viewer":4,"remind_date":1385877600000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5057,"circle":431,"viewer":3,"remind_date":1385877600000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5053,"circle":431,"viewer":4,"remind_date":1386482400000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5056,"circle":431,"viewer":3,"remind_date":1386482400000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5052,"circle":431,"viewer":4,"remind_date":1386828000000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5055,"circle":431,"viewer":3,"remind_date":1386828000000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}}],"isExpired":false},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 71st Birthday","date":1374123599000,"id":430,"date_deleted":0,"cutoff_date":1374123599000,"dateStr":"7/17/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mother's Day (Brenda) 2013","date":1368421199000,"id":426,"date_deleted":0,"cutoff_date":1368421199000,"dateStr":"5/12/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's Birthday","date":1361858399000,"id":421,"date_deleted":0,"cutoff_date":1361858399000,"dateStr":"2/25/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2012","date":1356501599000,"id":390,"date_deleted":0,"cutoff_date":1356501599000,"dateStr":"12/25/2012","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 16th Birthday","date":1353045599000,"id":389,"date_deleted":0,"cutoff_date":1353045599000,"dateStr":"11/15/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 36th Birthday","date":1349931599000,"id":379,"date_deleted":0,"cutoff_date":1349931599000,"dateStr":"10/10/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 11th Birthday","date":1347857999000,"id":372,"date_deleted":0,"cutoff_date":1347857999000,"dateStr":"9/16/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day 2012","date":1339995599000,"id":366,"date_deleted":0,"cutoff_date":1339995599000,"dateStr":"6/17/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie)","date":1336971599000,"id":364,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda)","date":1336971599000,"id":365,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 2nd Birthday","date":1336798799000,"id":362,"date_deleted":0,"cutoff_date":1336798799000,"dateStr":"5/11/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 13rd Birthday","date":1333429199000,"id":363,"date_deleted":0,"cutoff_date":1333429199000,"dateStr":"4/2/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 68th Birthday","date":1330235999000,"id":360,"date_deleted":0,"cutoff_date":1330235999000,"dateStr":"2/25/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2011","date":1324879199000,"id":321,"date_deleted":0,"cutoff_date":1324879199000,"dateStr":"12/25/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 41st Birthday","date":1324015199000,"id":341,"date_deleted":0,"cutoff_date":1324015199000,"dateStr":"12/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 15th Birthday","date":1321423199000,"id":320,"date_deleted":0,"cutoff_date":1321423199000,"dateStr":"11/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 35th Birthday","date":1318309199000,"id":319,"date_deleted":0,"cutoff_date":1318309199000,"dateStr":"10/10/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 10th Birthday","date":1316235599000,"id":312,"date_deleted":0,"cutoff_date":1316235599000,"dateStr":"9/16/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 69th Birthday","date":1310965199000,"id":310,"date_deleted":0,"cutoff_date":1310965199000,"dateStr":"7/17/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2011","date":1308545999000,"id":298,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2011","date":1308545999000,"id":299,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 1st Birthday","date":1305521999000,"id":297,"date_deleted":0,"cutoff_date":1305521999000,"dateStr":"5/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2011","date":1304917199000,"id":294,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2011","date":1304917199000,"id":295,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 12th Birthday","date":1301806799000,"id":293,"date_deleted":0,"cutoff_date":1301806799000,"dateStr":"4/2/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 67th Birthday","date":1298699999000,"id":292,"date_deleted":0,"cutoff_date":1298699999000,"dateStr":"2/25/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Valentines Day","name":"Valentines Day 2011","date":1297749599000,"id":286,"date_deleted":0,"cutoff_date":1297749599000,"dateStr":"2/14/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2010","date":1293343199000,"id":259,"date_deleted":0,"cutoff_date":1293343199000,"dateStr":"12/25/2010","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 40th Birthday","date":1292479199000,"id":271,"date_deleted":0,"cutoff_date":1292479199000,"dateStr":"12/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 14th Birthday","date":1289887199000,"id":261,"date_deleted":0,"cutoff_date":1289887199000,"dateStr":"11/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 34th Birthday","date":1286773199000,"id":252,"date_deleted":0,"cutoff_date":1286773199000,"dateStr":"10/10/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 9th Birthday","date":1284699599000,"id":246,"date_deleted":0,"cutoff_date":1284699599000,"dateStr":"9/16/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 68th Birthday","date":1279429199000,"id":245,"date_deleted":0,"cutoff_date":1279429199000,"dateStr":"7/17/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2010","date":1273467599000,"id":242,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2010","date":1273467599000,"id":243,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 66th Birthday","date":1267336799000,"id":241,"date_deleted":0,"cutoff_date":1267336799000,"dateStr":"2/27/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2009","date":1261893599000,"id":187,"date_deleted":0,"cutoff_date":1261893599000,"dateStr":"12/26/2009","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 39th Birthday","date":1260943199000,"id":216,"date_deleted":0,"cutoff_date":1260943199000,"dateStr":"12/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 13th Birthday","date":1258351199000,"id":217,"date_deleted":0,"cutoff_date":1258351199000,"dateStr":"11/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 33rd Birthday","date":1255237199000,"id":214,"date_deleted":0,"cutoff_date":1255237199000,"dateStr":"10/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 8th Birthday","date":1253163599000,"id":210,"date_deleted":0,"cutoff_date":1253163599000,"dateStr":"9/16/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 67th Birthday","date":1247979599000,"id":204,"date_deleted":0,"cutoff_date":1247979599000,"dateStr":"7/18/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Anniversary","name":"Tamie&Brent's Anniversary","date":1246251599000,"id":199,"date_deleted":0,"cutoff_date":1246251599000,"dateStr":"6/28/2009","receiverLimit":2,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2009","date":1245646799000,"id":200,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2009","date":1245646799000,"id":201,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2009","date":1242017999000,"id":195,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2009","date":1242017999000,"id":196,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 10th Birthday","date":1238734799000,"id":193,"date_deleted":0,"cutoff_date":1238734799000,"dateStr":"4/2/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 65th Birthday","date":1235627999000,"id":186,"date_deleted":0,"cutoff_date":1235627999000,"dateStr":"2/25/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2008","date":1230271199000,"id":112,"date_deleted":0,"cutoff_date":1230271199000,"dateStr":"12/25/2008","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 38th Birthday","date":1229407199000,"id":131,"date_deleted":0,"cutoff_date":1229407199000,"dateStr":"12/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 12th Birthday","date":1226815199000,"id":130,"date_deleted":0,"cutoff_date":1226815199000,"dateStr":"11/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 32nd Birthday","date":1223701199000,"id":93,"date_deleted":0,"cutoff_date":1223701199000,"dateStr":"10/10/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2008","date":1210568399000,"id":83,"date_deleted":0,"cutoff_date":1210568399000,"dateStr":"5/11/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2007","date":1198648799000,"id":15,"date_deleted":0,"cutoff_date":1198648799000,"dateStr":"12/25/2007","receiverLimit":-1,"reminders":[],"isExpired":true}],
  "friends":[{"id":2,"first":"Francy","last":"Collins","fullname":"Francy Collins","username":"francy","profilepicUrl":"http://graph.facebook.com/1280492734/picture?type=normal","profilepicheight":86,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":174,"profilepicmargintop":"0px","profilepicmarginleft":"-12px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":116,"profilepicmargintop100":"0px","profilepicmarginleft100":"-8px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":58,"profilepicmargintop50":"0px","profilepicmarginleft50":"-4px","email":"collins89@sbcglobal.net","bio":"","age":45,"dateOfBirth":-62272800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":5,"first":"Todd","last":"Cocanougher","fullname":"Todd Cocanougher","username":"todd","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":6,"first":"Julianne","last":"Cocanougher","fullname":"Julianne Cocanougher","username":"julianne","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":8,"first":"Barbara","last":"Cocanougher","fullname":"Barbara Cocanougher","username":"barbara","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":9,"first":"Greg","last":"Collins","fullname":"Greg Collins","username":"greg","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":10,"first":"Lucy","last":"Collins","fullname":"Lucy Collins","username":"lucy","profilepicUrl":"http://graph.facebook.com/100000795588383/picture?type=normal","profilepicheight":202,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":303,"profilepicadjustedwidth":150,"profilepicmargintop":"-76px","profilepicmarginleft":"0px","profilepicadjustedheight100":202,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-51px","profilepicmarginleft100":"0px","profilepicadjustedheight50":101,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-25px","profilepicmarginleft50":"0px","email":"bookbug3@sbcglobal.net","bio":"Lucy's favorite color is blue.  She loves to read, listen to music, play games and hang out with her friends.  She plays viola. ","age":16,"dateOfBirth":848037600000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":11,"first":"Trent","last":"Collins","fullname":"Trent Collins","username":"trent","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"soccercrayon4-2@sbcglobal.net","bio":"Trent loves to climb trees, and play video games, basketball, soccer, and any other games with his friends.","age":14,"dateOfBirth":923032800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":12,"first":"Bill","last":"Dunklau","fullname":"Bill Dunklau","username":"bill","profilepicUrl":"http://graph.facebook.com/1336420404/picture?type=normal","profilepicheight":127,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":190,"profilepicadjustedwidth":150,"profilepicmargintop":"-20px","profilepicmarginleft":"0px","profilepicadjustedheight100":127,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-13px","profilepicmarginleft100":"0px","profilepicadjustedheight50":63,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-6px","profilepicmarginleft50":"0px","email":"transweb@sbcglobal.net","bio":"","age":71,"dateOfBirth":-866574000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":13,"first":"Brenda","last":"Dunklau","fullname":"Brenda Dunklau","username":"brenda","profilepicUrl":"http://graph.facebook.com/1140124546/picture?type=normal","profilepicheight":117,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":175,"profilepicadjustedwidth":150,"profilepicmargintop":"-12px","profilepicmarginleft":"0px","profilepicadjustedheight100":117,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-8px","profilepicmarginleft100":"0px","profilepicadjustedheight50":58,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-4px","profilepicmarginleft50":"0px","email":"brenda@lancerltd.com","bio":"","age":69,"dateOfBirth":-815770800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":14,"first":"Debbie","last":"Greaves","fullname":"Debbie Greaves","username":"debbie","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":15,"first":"Kim","last":"Greaves","fullname":"Kim Greaves","username":"Kim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":16,"first":"Janice","last":"Johnson","fullname":"Janice Johnson","username":"janice","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":17,"first":"Tim","last":"Johnson","fullname":"Tim Johnson","username":"tim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":65,"dateOfBirth":-678481200000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":435,"first":"Gmail","last":"Gmail","fullname":"Gmail Gmail","username":"gmail","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@gmail.com","bio":"","age":52,"dateOfBirth":-285444000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":500,"first":"Truman","last":"Dunklau","fullname":"Truman Dunklau","username":"truman","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"No more clothes please - my closet is full","age":3,"dateOfBirth":1273554000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":601,"first":"Jett","last":"Dunklau","fullname":"Jett Dunklau","username":"jett","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"The only thing I need is a new diaper","age":1,"dateOfBirth":1316408400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_circles = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[],
  "friends":[{"id":2,"first":"Francy","last":"Collins","fullname":"Francy Collins","username":"francy","profilepicUrl":"http://graph.facebook.com/1280492734/picture?type=normal","profilepicheight":86,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":174,"profilepicmargintop":"0px","profilepicmarginleft":"-12px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":116,"profilepicmargintop100":"0px","profilepicmarginleft100":"-8px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":58,"profilepicmargintop50":"0px","profilepicmarginleft50":"-4px","email":"collins89@sbcglobal.net","bio":"","age":45,"dateOfBirth":-62272800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":5,"first":"Todd","last":"Cocanougher","fullname":"Todd Cocanougher","username":"todd","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":6,"first":"Julianne","last":"Cocanougher","fullname":"Julianne Cocanougher","username":"julianne","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":8,"first":"Barbara","last":"Cocanougher","fullname":"Barbara Cocanougher","username":"barbara","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":9,"first":"Greg","last":"Collins","fullname":"Greg Collins","username":"greg","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":10,"first":"Lucy","last":"Collins","fullname":"Lucy Collins","username":"lucy","profilepicUrl":"http://graph.facebook.com/100000795588383/picture?type=normal","profilepicheight":202,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":303,"profilepicadjustedwidth":150,"profilepicmargintop":"-76px","profilepicmarginleft":"0px","profilepicadjustedheight100":202,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-51px","profilepicmarginleft100":"0px","profilepicadjustedheight50":101,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-25px","profilepicmarginleft50":"0px","email":"bookbug3@sbcglobal.net","bio":"Lucy's favorite color is blue.  She loves to read, listen to music, play games and hang out with her friends.  She plays viola. ","age":16,"dateOfBirth":848037600000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":11,"first":"Trent","last":"Collins","fullname":"Trent Collins","username":"trent","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"soccercrayon4-2@sbcglobal.net","bio":"Trent loves to climb trees, and play video games, basketball, soccer, and any other games with his friends.","age":14,"dateOfBirth":923032800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":12,"first":"Bill","last":"Dunklau","fullname":"Bill Dunklau","username":"bill","profilepicUrl":"http://graph.facebook.com/1336420404/picture?type=normal","profilepicheight":127,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":190,"profilepicadjustedwidth":150,"profilepicmargintop":"-20px","profilepicmarginleft":"0px","profilepicadjustedheight100":127,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-13px","profilepicmarginleft100":"0px","profilepicadjustedheight50":63,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-6px","profilepicmarginleft50":"0px","email":"transweb@sbcglobal.net","bio":"","age":71,"dateOfBirth":-866574000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":13,"first":"Brenda","last":"Dunklau","fullname":"Brenda Dunklau","username":"brenda","profilepicUrl":"http://graph.facebook.com/1140124546/picture?type=normal","profilepicheight":117,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":175,"profilepicadjustedwidth":150,"profilepicmargintop":"-12px","profilepicmarginleft":"0px","profilepicadjustedheight100":117,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-8px","profilepicmarginleft100":"0px","profilepicadjustedheight50":58,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-4px","profilepicmarginleft50":"0px","email":"brenda@lancerltd.com","bio":"","age":69,"dateOfBirth":-815770800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":14,"first":"Debbie","last":"Greaves","fullname":"Debbie Greaves","username":"debbie","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":15,"first":"Kim","last":"Greaves","fullname":"Kim Greaves","username":"Kim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":16,"first":"Janice","last":"Johnson","fullname":"Janice Johnson","username":"janice","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":17,"first":"Tim","last":"Johnson","fullname":"Tim Johnson","username":"tim","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":65,"dateOfBirth":-678481200000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":435,"first":"Gmail","last":"Gmail","fullname":"Gmail Gmail","username":"gmail","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@gmail.com","bio":"","age":52,"dateOfBirth":-285444000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":500,"first":"Truman","last":"Dunklau","fullname":"Truman Dunklau","username":"truman","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"No more clothes please - my closet is full","age":3,"dateOfBirth":1273554000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":601,"first":"Jett","last":"Dunklau","fullname":"Jett Dunklau","username":"jett","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"The only thing I need is a new diaper","age":1,"dateOfBirth":1316408400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_friends = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 43rd Birthday","date":1387173599000,"id":431,"date_deleted":0,"cutoff_date":1387173599000,"dateStr":"12/15/2013","receiverLimit":1,"reminders":[{"$lift_class":"reminders","id":5054,"circle":431,"viewer":4,"remind_date":1385877600000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5057,"circle":431,"viewer":3,"remind_date":1385877600000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5053,"circle":431,"viewer":4,"remind_date":1386482400000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5056,"circle":431,"viewer":3,"remind_date":1386482400000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5052,"circle":431,"viewer":4,"remind_date":1386828000000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5055,"circle":431,"viewer":3,"remind_date":1386828000000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}}],"isExpired":false},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 71st Birthday","date":1374123599000,"id":430,"date_deleted":0,"cutoff_date":1374123599000,"dateStr":"7/17/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mother's Day (Brenda) 2013","date":1368421199000,"id":426,"date_deleted":0,"cutoff_date":1368421199000,"dateStr":"5/12/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's Birthday","date":1361858399000,"id":421,"date_deleted":0,"cutoff_date":1361858399000,"dateStr":"2/25/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2012","date":1356501599000,"id":390,"date_deleted":0,"cutoff_date":1356501599000,"dateStr":"12/25/2012","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 16th Birthday","date":1353045599000,"id":389,"date_deleted":0,"cutoff_date":1353045599000,"dateStr":"11/15/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 36th Birthday","date":1349931599000,"id":379,"date_deleted":0,"cutoff_date":1349931599000,"dateStr":"10/10/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 11th Birthday","date":1347857999000,"id":372,"date_deleted":0,"cutoff_date":1347857999000,"dateStr":"9/16/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day 2012","date":1339995599000,"id":366,"date_deleted":0,"cutoff_date":1339995599000,"dateStr":"6/17/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie)","date":1336971599000,"id":364,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda)","date":1336971599000,"id":365,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 2nd Birthday","date":1336798799000,"id":362,"date_deleted":0,"cutoff_date":1336798799000,"dateStr":"5/11/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 13rd Birthday","date":1333429199000,"id":363,"date_deleted":0,"cutoff_date":1333429199000,"dateStr":"4/2/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 68th Birthday","date":1330235999000,"id":360,"date_deleted":0,"cutoff_date":1330235999000,"dateStr":"2/25/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2011","date":1324879199000,"id":321,"date_deleted":0,"cutoff_date":1324879199000,"dateStr":"12/25/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 41st Birthday","date":1324015199000,"id":341,"date_deleted":0,"cutoff_date":1324015199000,"dateStr":"12/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 15th Birthday","date":1321423199000,"id":320,"date_deleted":0,"cutoff_date":1321423199000,"dateStr":"11/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 35th Birthday","date":1318309199000,"id":319,"date_deleted":0,"cutoff_date":1318309199000,"dateStr":"10/10/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 10th Birthday","date":1316235599000,"id":312,"date_deleted":0,"cutoff_date":1316235599000,"dateStr":"9/16/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 69th Birthday","date":1310965199000,"id":310,"date_deleted":0,"cutoff_date":1310965199000,"dateStr":"7/17/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2011","date":1308545999000,"id":298,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2011","date":1308545999000,"id":299,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 1st Birthday","date":1305521999000,"id":297,"date_deleted":0,"cutoff_date":1305521999000,"dateStr":"5/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2011","date":1304917199000,"id":294,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2011","date":1304917199000,"id":295,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 12th Birthday","date":1301806799000,"id":293,"date_deleted":0,"cutoff_date":1301806799000,"dateStr":"4/2/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 67th Birthday","date":1298699999000,"id":292,"date_deleted":0,"cutoff_date":1298699999000,"dateStr":"2/25/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Valentines Day","name":"Valentines Day 2011","date":1297749599000,"id":286,"date_deleted":0,"cutoff_date":1297749599000,"dateStr":"2/14/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2010","date":1293343199000,"id":259,"date_deleted":0,"cutoff_date":1293343199000,"dateStr":"12/25/2010","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 40th Birthday","date":1292479199000,"id":271,"date_deleted":0,"cutoff_date":1292479199000,"dateStr":"12/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 14th Birthday","date":1289887199000,"id":261,"date_deleted":0,"cutoff_date":1289887199000,"dateStr":"11/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 34th Birthday","date":1286773199000,"id":252,"date_deleted":0,"cutoff_date":1286773199000,"dateStr":"10/10/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 9th Birthday","date":1284699599000,"id":246,"date_deleted":0,"cutoff_date":1284699599000,"dateStr":"9/16/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 68th Birthday","date":1279429199000,"id":245,"date_deleted":0,"cutoff_date":1279429199000,"dateStr":"7/17/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2010","date":1273467599000,"id":242,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2010","date":1273467599000,"id":243,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 66th Birthday","date":1267336799000,"id":241,"date_deleted":0,"cutoff_date":1267336799000,"dateStr":"2/27/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2009","date":1261893599000,"id":187,"date_deleted":0,"cutoff_date":1261893599000,"dateStr":"12/26/2009","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 39th Birthday","date":1260943199000,"id":216,"date_deleted":0,"cutoff_date":1260943199000,"dateStr":"12/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 13th Birthday","date":1258351199000,"id":217,"date_deleted":0,"cutoff_date":1258351199000,"dateStr":"11/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 33rd Birthday","date":1255237199000,"id":214,"date_deleted":0,"cutoff_date":1255237199000,"dateStr":"10/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 8th Birthday","date":1253163599000,"id":210,"date_deleted":0,"cutoff_date":1253163599000,"dateStr":"9/16/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 67th Birthday","date":1247979599000,"id":204,"date_deleted":0,"cutoff_date":1247979599000,"dateStr":"7/18/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Anniversary","name":"Tamie&Brent's Anniversary","date":1246251599000,"id":199,"date_deleted":0,"cutoff_date":1246251599000,"dateStr":"6/28/2009","receiverLimit":2,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2009","date":1245646799000,"id":200,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2009","date":1245646799000,"id":201,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2009","date":1242017999000,"id":195,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2009","date":1242017999000,"id":196,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 10th Birthday","date":1238734799000,"id":193,"date_deleted":0,"cutoff_date":1238734799000,"dateStr":"4/2/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 65th Birthday","date":1235627999000,"id":186,"date_deleted":0,"cutoff_date":1235627999000,"dateStr":"2/25/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2008","date":1230271199000,"id":112,"date_deleted":0,"cutoff_date":1230271199000,"dateStr":"12/25/2008","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 38th Birthday","date":1229407199000,"id":131,"date_deleted":0,"cutoff_date":1229407199000,"dateStr":"12/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 12th Birthday","date":1226815199000,"id":130,"date_deleted":0,"cutoff_date":1226815199000,"dateStr":"11/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 32nd Birthday","date":1223701199000,"id":93,"date_deleted":0,"cutoff_date":1223701199000,"dateStr":"10/10/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2008","date":1210568399000,"id":83,"date_deleted":0,"cutoff_date":1210568399000,"dateStr":"5/11/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2007","date":1198648799000,"id":15,"date_deleted":0,"cutoff_date":1198648799000,"dateStr":"12/25/2007","receiverLimit":-1,"reminders":[],"isExpired":true}],
  "friends":[],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_circles_or_friends = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[],
  "friends":[],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // NEW USERS TO CHOOSE FROM
  $scope.scotttiger = {fullname:'Scott Tiger', username:'scott', password:'scott', passagain:'scott', email:'bdunklau@yahoo.com'};
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // 'SHOW' USERS TO CHOOSE FROM
  $scope.showKiera = {"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":false,"$$hashKey":"03W"} ;
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CIRCLES TO CHOOSE FROM
  $scope.kieras12thbday = {"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 12th Birthday","date":1376629199000,"id":447,"date_deleted":0,"cutoff_date":0,"dateStr":"8/15/2013","receiverLimit":1,"reminders":[],"isExpired":false,"$$hashKey":"004","participants":{"givers":[{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"receivers":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":false}]}};
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // WISH LISTS TO CHOOSE FROM
  $scope.kierasbdaywishlist = [{"$lift_class":"gift","description":"One Direction dolls (any/all)","url":"","id":9155,"status":"","circle":447,"sender":null,"addedBy":3,"affiliate":null,"sender_name":"","reallyWants":0,"dateCreated":1376160054000,"deleted":"","receivedate":0,"affiliateUrl":"","recipients":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"canedit":false,"candelete":false,"canbuy":true,"canreturn":false,"canseestatus":true,"isbought":false,"issurprise":false,"addedByName":"Kiera"},{"$lift_class":"gift","description":"One Direction comforter (queen size)","url":"","id":9154,"status":"","circle":447,"sender":null,"addedBy":3,"affiliate":null,"sender_name":"","reallyWants":0,"dateCreated":1376160014000,"deleted":"","receivedate":0,"affiliateUrl":"","recipients":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"canedit":false,"candelete":false,"canbuy":true,"canreturn":false,"canseestatus":true,"isbought":false,"issurprise":false,"addedByName":"Kiera"},{"$lift_class":"gift","description":"Charming Charlies gift card","url":null,"id":8231,"status":"available","circle":447,"sender":null,"addedBy":4,"affiliate":null,"sender_name":"","reallyWants":0,"dateCreated":1353961872000,"deleted":"delete","receivedate":0,"affiliateUrl":null,"recipients":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"canedit":true,"candelete":true,"canbuy":true,"canreturn":false,"canseestatus":true,"isbought":false,"issurprise":true,"addedByName":"Tamie"},{"$lift_class":"gift","description":"Target gift card","url":null,"id":8230,"status":"available","circle":390,"sender":null,"addedBy":4,"affiliate":null,"sender_name":null,"reallyWants":0,"dateCreated":1353961850000,"deleted":"delete","receivedate":0,"affiliateUrl":null,"recipients":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"canedit":true,"candelete":true,"canbuy":true,"canreturn":false,"canseestatus":true,"isbought":false,"issurprise":true,"addedByName":"Tamie"},{"$lift_class":"gift","description":"Half Price Books gift card","url":null,"id":8229,"status":"available","circle":390,"sender":null,"addedBy":4,"affiliate":null,"sender_name":null,"reallyWants":0,"dateCreated":1353961835000,"deleted":"delete","receivedate":0,"affiliateUrl":null,"recipients":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],"canedit":true,"candelete":true,"canbuy":true,"canreturn":false,"canseestatus":true,"isbought":false,"issurprise":true,"addedByName":"Tamie"}] ;
  
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  // GIFTS TO CHOOSE FROM
  $scope.youmedupree_addedbytamie = {"addedBy":4,"circle":{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 12th Birthday","date":1376629199000,"id":447,"date_deleted":0,"cutoff_date":0,"dateStr":"8/15/2013","receiverLimit":1,"reminders":[],"isExpired":false,"$$hashKey":"004","participants":{"givers":[{"id":1,"first":"Brent","last":"Dunklau","fullname":"Brent Dunklau","username":"bdunklau","profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":139,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":194,"profilepicmargintop":"0px","profilepicmarginleft":"-22px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":129,"profilepicmargintop100":"0px","profilepicmarginleft100":"-14px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":64,"profilepicmargintop50":"0px","profilepicmarginleft50":"-7px","email":"bdunklau@yahoo.com","bio":"All I want this year are gift cards...","age":42,"dateOfBirth":30088800000,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null,"$$hashKey":"01I"},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null,"$$hashKey":"01K"}],"receivers":[{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://www.littlebluebird.com/gf/img/Silhouette-male.gif","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":false,"$$hashKey":"01G"}]}},"description":"You, Me and Dupree","url":"http://www.amazon.com/You-Me-Dupree-Owen-Wilson/dp/B000ICM5X0%3FSubscriptio…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB000ICM5X0","affiliateUrl":"http://www.amazon.com/You-Me-Dupree-Owen-Wilson/dp/B000ICM5X0%3FSubscriptio…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB000ICM5X0","canedit":true};
  
  
  
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // UPC/Barcode scanning tests...
  
  $scope.upcresults_678149033229 = {"ItemLookupResponse":{"@attributes":{"xmlns":"http://webservices.amazon.com/AWSECommerceService/2011-08-01"},"OperationRequest":{"HTTPHeaders":{"Header":{"@attributes":{"Name":"UserAgent","Value":"Java/1.6.0_29"}}},"RequestId":{"text":"6fc932f1-5afe-4145-b4bf-b6b040bdad3b"},"Arguments":{"Argument":[{"@attributes":{"Name":"Operation","Value":"ItemLookup"}},{"@attributes":{"Name":"Service","Value":"AWSECommerceService"}},{"@attributes":{"Name":"Signature","Value":"Xgo/dI0mVVabE0kCPA2/ZyLYCPFJe0nCrhjyqPWzgcc="}},{"@attributes":{"Name":"AssociateTag","Value":"wwwlittleb040-20"}},{"@attributes":{"Name":"ItemId","Value":"678149033229"}},{"@attributes":{"Name":"IdType","Value":"UPC"}},{"@attributes":{"Name":"AWSAccessKeyId","Value":"056DP6E1ENJTZNSNP602"}},{"@attributes":{"Name":"Timestamp","Value":"2013-08-23T15:30:12.000Z"}},{"@attributes":{"Name":"SearchIndex","Value":"All"}}]},"RequestProcessingTime":{"text":"0.0287750000000000"}},"Items":{"Request":{"IsValid":{"text":"True"},"ItemLookupRequest":{"IdType":{"text":"UPC"},"ItemId":{"text":"678149033229"},"ResponseGroup":{"text":"Small"},"SearchIndex":{"text":"All"},"VariationPage":{"text":"All"}}},"Item":{"ASIN":{"text":"B00008OM99"},"DetailPageURL":{"text":"http://www.amazon.com/Catch-Screen-Two-Disc-Special-Edition/dp/B00008OM99%3…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00008OM99"},"ItemLinks":{"ItemLink":[{"Description":{"text":"Technical Details"},"URL":{"text":"http://www.amazon.com/Catch-Screen-Two-Disc-Special-Edition/dp/tech-data/B0…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"Add To Baby Registry"},"URL":{"text":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB00008OM99%…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"Add To Wedding Registry"},"URL":{"text":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB00008OM…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"Add To Wishlist"},"URL":{"text":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB00008O…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"Tell A Friend"},"URL":{"text":"http://www.amazon.com/gp/pdp/taf/B00008OM99%3FSubscriptionId%3D056DP6E1ENJT…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"All Customer Reviews"},"URL":{"text":"http://www.amazon.com/review/product/B00008OM99%3FSubscriptionId%3D056DP6E1…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}},{"Description":{"text":"All Offers"},"URL":{"text":"http://www.amazon.com/gp/offer-listing/B00008OM99%3FSubscriptionId%3D056DP6…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00008OM99"}}]},"ItemAttributes":{"Actor":[{"text":"Leonardo DiCaprio"},{"text":"Tom Hanks"},{"text":"Christopher Walken"},{"text":"Martin Sheen"},{"text":"Nathalie Baye"}],"Creator":[{"@attributes":{"Role":"Producer"},"text":"Anthony Romano"},{"@attributes":{"Role":"Producer"},"text":"Barry Kemp"},{"@attributes":{"Role":"Producer"},"text":"Daniel Lupi"},{"@attributes":{"Role":"Producer"},"text":"Devorah Moos-Hankin"},{"@attributes":{"Role":"Writer"},"text":"Frank Abagnale Jr."},{"@attributes":{"Role":"Writer"},"text":"Jeff Nathanson"},{"@attributes":{"Role":"Writer"},"text":"Stan Redding"}],"Director":{"text":"Steven Spielberg"},"Manufacturer":{"text":"Dreamworks Video"},"ProductGroup":{"text":"DVD"},"Title":{"text":"Catch Me If You Can (Full Screen Two-Disc Special Edition)"}}}}}};
  $scope.products_678149033229 = [{"name":"Catch Me If You Can (Full Screen Two-Disc Special Edition)","url":"http://www.amazon.com/Catch-Screen-Two-Disc-Special-Edition/dp/B00008OM99%3…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00008OM99"}];
  
  $scope.upcresults_025192966521 = {"ItemLookupResponse":{"@attributes":{"xmlns":"http://webservices.amazon.com/AWSECommerceService/2011-08-01"},"OperationRequest":{"HTTPHeaders":{"Header":{"@attributes":{"Name":"UserAgent","Value":"Java/1.6.0_29"}}},"RequestId":{"text":"7fe0bce3-9e4f-4d8e-8b96-f00705d76966"},"Arguments":{"Argument":[{"@attributes":{"Name":"Operation","Value":"ItemLookup"}},{"@attributes":{"Name":"Service","Value":"AWSECommerceService"}},{"@attributes":{"Name":"AssociateTag","Value":"wwwlittleb040-20"}},{"@attributes":{"Name":"SearchIndex","Value":"All"}},{"@attributes":{"Name":"Signature","Value":"d+Gudc24Y/eLhtTaPtnlCJq4g+v/D8qXEmN3pgJ4eDI="}},{"@attributes":{"Name":"ItemId","Value":"025192966521"}},{"@attributes":{"Name":"IdType","Value":"UPC"}},{"@attributes":{"Name":"AWSAccessKeyId","Value":"056DP6E1ENJTZNSNP602"}},{"@attributes":{"Name":"Timestamp","Value":"2013-08-23T15:43:29.000Z"}}]},"RequestProcessingTime":{"text":"0.0501840000000000"}},"Items":{"Request":{"IsValid":{"text":"True"},"ItemLookupRequest":{"IdType":{"text":"UPC"},"ItemId":{"text":"025192966521"},"ResponseGroup":{"text":"Small"},"SearchIndex":{"text":"All"},"VariationPage":{"text":"All"}}},"Item":{"ASIN":{"text":"B000ICM5X0"},"DetailPageURL":{"text":"http://www.amazon.com/You-Me-Dupree-Owen-Wilson/dp/B000ICM5X0%3FSubscriptio…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB000ICM5X0"},"ItemLinks":{"ItemLink":[{"Description":{"text":"Technical Details"},"URL":{"text":"http://www.amazon.com/You-Me-Dupree-Owen-Wilson/dp/tech-data/B000ICM5X0%3FS…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"Add To Baby Registry"},"URL":{"text":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB000ICM5X0%…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"Add To Wedding Registry"},"URL":{"text":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB000ICM5…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"Add To Wishlist"},"URL":{"text":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB000ICM…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"Tell A Friend"},"URL":{"text":"http://www.amazon.com/gp/pdp/taf/B000ICM5X0%3FSubscriptionId%3D056DP6E1ENJT…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"All Customer Reviews"},"URL":{"text":"http://www.amazon.com/review/product/B000ICM5X0%3FSubscriptionId%3D056DP6E1…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}},{"Description":{"text":"All Offers"},"URL":{"text":"http://www.amazon.com/gp/offer-listing/B000ICM5X0%3FSubscriptionId%3D056DP6…nkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB000ICM5X0"}}]},"ItemAttributes":{"Actor":[{"text":"Owen Wilson"},{"text":"Kate Hudson"},{"text":"Matt Dillon"},{"text":"Michael Douglas"},{"text":"Seth Rogen"}],"Creator":[{"@attributes":{"Role":"Producer"},"text":"Owen Wilson"},{"@attributes":{"Role":"Producer"},"text":"Mary Parent"},{"@attributes":{"Role":"Producer"},"text":"Scott Stuber"},{"@attributes":{"Role":"Writer"},"text":"Michael LeSieur"}],"Director":[{"text":"Anthony Russo"},{"text":"Joe Russo"}],"Manufacturer":{"text":"Universal Studios"},"ProductGroup":{"text":"DVD"},"Title":{"text":"You, Me and Dupree"}}}}}};
  $scope.products_025192966521 =  [{"name":"You, Me and Dupree","url":"http://www.amazon.com/You-Me-Dupree-Owen-Wilson/dp/B000ICM5X0%3FSubscriptio…nkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB000ICM5X0"}];
  
  // combined the 2 products above into one array
  $scope.phonymultipleresults = [$scope.products_678149033229[0], $scope.products_025192966521[0]];
  
  
  refreshScanResults();
  
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // THIS IS WHAT THE APP IS USING
  
  // to prepopulate login forms and password recovery forms
  $scope.logingood = true; // to get to the welcome screen
  $rootScope.user = $scope.tamie;
  $rootScope.showUser = $scope.showKiera;
  $scope.circle = $scope.kieras12thbday; //{name:'test', date:testdate, receiverLimit:-1, circleType:'Christmas'};
  $scope.gifts = $scope.kierasbdaywishlist;
  $scope.products = $scope.phonymultipleresults;
  $scope.product = $scope.products_025192966521[0]; // for #selectedproduct
  $scope.scanreturncode = $scope.products.length;
  $scope.currentgift = $scope.youmedupree_addedbytamie;
  
  $scope.newuser = $scope.scotttiger;
  $scope.newparticipant = {participationLevel:'Receiver'};
  $scope.email = 'bdunklau@yahoo.com';
  $scope.username = 'bdunklau';
  $scope.password = 'bdunklau';
  
  
}];

