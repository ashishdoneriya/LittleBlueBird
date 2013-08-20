// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};



// 2013-07-23  $location is causing problems with jquery mobile: the browser back button stops working.  I think all links/routing stopped working.
//function LbbController($scope, Email, $rootScope, User, $location) {



// 2013-07-23  weird syntax needed for minification
var LbbController = ['$scope', 'Email', '$rootScope', 'User', 'Gift', 'Password', 'FacebookUser', 'MergeUsers', 'Circle', 'CircleParticipant', 'Reminder', 'Friend', // MUST END WITH A COMMA !
function($scope, Email, $rootScope, User, Gift, Password, FacebookUser, MergeUsers, Circle, CircleParticipant, Reminder, Friend) {

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
  
  
    
  
  
  // 2013-07-23  copied/adapted from $rootScope.friendwishlist in app.js
  $scope.friendwishlist = function(friend) {
      $rootScope.showUser = friend;
      $scope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              $scope.gifts.mylist=false;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
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
  $scope.invite = function(newparticipant, circle) {
      $scope.maybepeople = User.query({email:newparticipant.email},
                                      function() {
                                        jQuery("#maybepeopleview").hide();
			                              setTimeout(function(){
			                                jQuery("#maybepeopleview").listview("refresh");
			                                jQuery("#maybepeopleview").show();
			                             },0);
                                      });
  }
  
  
  // set/refresh the flip switches on 'areyouparticipating'
  $scope.initMyParticipation = function(user, circle) {
    $scope.userisparticipant = "true";
    $scope.userishonoree = "true";
    jQuery("#areyouparticipating").slider("refresh");
    jQuery("#areyouanhonoree").slider("refresh");
  }
  
  
  // not worrying yet about whether the person is a giver or receiver, assume receiver  2013-08-09
  // We DO know thought that if circle.receiverLimit = -1, that the person will be added as a receiver
  $scope.addparticipant = function(person, circle, participationLevel) {
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    var limitreached = circle.receiverLimit != -1 && circle.participants.receivers.length == circle.receiverLimit
    var level = 'Receiver';
    if(participationLevel == 'Giver' || limitreached) { 
      circle.participants.givers.push(person); 
      level = 'Giver';
    }
    else circle.participants.receivers.push(person);
    
    CircleParticipant.save({circleId:circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:level,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:circle.name, adder:$rootScope.user.fullname},
                                         function() {circle.reminders = Reminder.query({circleId:circle.id})});
      
  }
  
  
  // 2013-08-09
  $scope.removeparticipant = function(participant, circle) {
  
  }
  
  
  // 2013-08-08
  $scope.setcircle = function(c) { 
    c.participants = CircleParticipant.query({circleId:c.id},
                        function() {
                          $scope.circle = c;
                          console.log(JSON.stringify(c))
                          refreshParticipants();
                        }
                     );
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
        if(participationLevel == 'Receiver') $scope.circle.participants.receivers.push(person);
        else $scope.circle.participants.givers.push(person);
        
        console.log('$scope.circle', $scope.circle);
      
        // 2013-08-08  took this code from app-CircleModule.js
	    // if the circle already exists, add the participant to the db immediately
	    if(angular.isDefined($scope.circle.id)) {
	      CircleParticipant.save({circleId:$scope.circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:participationLevel,
	                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:$scope.circle.name, adder:$rootScope.user.fullname},
	                                         function() {$scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})});
	    }
                                    
        refreshParticipants();
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
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.events = function() {
    console.log('user.circle:', $scope.user.circles);
                              jQuery("#eventview").hide();
                              setTimeout(function(){
                                jQuery("#eventview").listview("refresh");
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
    
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
      
    if(userisparticipant=='true') {
      if(userishonoree=='true') circle.participants.receivers.push(user);
      else if(userishonoree=='false') circle.participants.givers.push(user);
      else circle.participants.receivers.push(user);
    }
    
    
    // The saved circle should become the current circle if it isn't already
    $scope.circle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id},
                 function() {
                     $rootScope.user.circles.push($scope.circle);
                     circle.id = $scope.circle.id;
                     
                     // on brand new circles, where all are receivers, add the current user by default
                     if(circle.receiverLimit == -1)
                       circle.participants.receivers.push($rootScope.user);
                     
                     // since we are inserting, we have participants that need to be added to the event
                     for(var i=0; i < circle.participants.receivers.length; i++) {
                       CircleParticipant.save({circleId:$scope.circle.id, inviterId:$rootScope.user.id, userId:circle.participants.receivers[i].id, 
                                         participationLevel:'Receiver', who:circle.participants.receivers[i].fullname, email:circle.participants.receivers[i].email, circle:circle.name, 
                                         adder:$rootScope.user.fullname}
                                         ); // CircleParticipant.save
                     }
                     for(var i=0; i < circle.participants.givers.length; i++) {
                       CircleParticipant.save({circleId:$scope.circle.id, inviterId:$rootScope.user.id, userId:circle.participants.givers[i].id, 
                                         participationLevel:'Giver', who:circle.participants.givers[i].fullname, email:circle.participants.givers[i].email, circle:circle.name, 
                                         adder:$rootScope.user.fullname}
                                         ); // CircleParticipant.save
                     }
                     $scope.circle.participants = circle.participants;
                   
                     refreshParticipants();
                 },
                 function() {alert('Uh Oh - had a problem saving this event.\nIf this problem persists, contact us at info@littlebluebird.com');} 
             ); // Circle.save()
               
    
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
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function
  $scope.initNewGift = function() {
    delete $scope.currentgift;
    if(angular.isDefined($scope.circle)) {
      $scope.currentgift = {addedBy:$rootScope.user, circle:$scope.circle};
      $scope.currentgift.recipients = angular.copy($scope.circle.participants.receivers);
    }
    else {
      $scope.currentgift = {addedBy:$rootScope.user};
      $scope.currentgift.recipients = [$rootScope.showUser];
    }
    
    for(var i=0; i < $scope.currentgift.recipients.length; i++) {
      if($scope.currentgift.recipients[i].id == $rootScope.showUser.id)
        $scope.currentgift.recipients[i].checked = true;
    }
    
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
  
  
  $scope.viewonline = function(gift, event) {
    event.preventDefault();
    window.open(gift.affiliateUrl, '_blank', 'location=yes');
    return false;
  }
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.addgift() function
  $scope.savegift = function(gift) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    var add = false;
    
    for(var i=0; i < gift.recipients.length; i++) {
      if(gift.recipients[i].checked && gift.recipients[i].id == $rootScope.showUser.id) {
        add = true;
        //alert(" gift.recipients["+i+"].checked="+gift.recipients[i].checked+"\n gift.recipients["+i+"].id="+gift.recipients[i].id+"\n $rootScope.showUser.id="+$rootScope.showUser.id);
      }
    }
    
    var saveparms = {giftId:gift.id, updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id,
               senderId:gift.sender, senderName:gift.sender_name};
               
               
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    var savedgift = Gift.save(saveparms,
               function() {
                 if(add) {$scope.gifts.reverse();$scope.gifts.push(savedgift);$scope.gifts.reverse();}
                 $scope.currentgift = {};
                 $scope.currentgift.recipients = [];
                 refreshWishlist();
               });
               
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
  
  
  $scope.mywishlist = function() {
      $rootScope.showUser = $rootScope.user;
      $scope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            function() { 
                              $scope.gifts.mylist=true;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              refreshWishlist();
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  $scope.setfootermenu = function(selected) {
    $scope.footermenu = selected;
  }
  
  $scope.footermenustyle = function(menuitem) {
    return $scope.footermenu == menuitem ? 'ui-btn-active ui-state-persist' : '';
  }
  
}];

