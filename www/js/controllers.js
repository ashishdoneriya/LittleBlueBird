// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};



// 2013-07-23  $location is causing problems with jquery mobile: the browser back button stops working.  I think all links/routing stopped working.
//function LbbController($scope, Email, $rootScope, User, $location) {



// 2013-07-23  weird syntax needed for minification
var LbbController = ['$scope', 'Email', '$rootScope', 'User', 'Gift', 'Password', 'FacebookUser', 'MergeUsers', 'Circle', 'CircleParticipant', 'Reminder',
function($scope, Email, $rootScope, User, Gift, Password, FacebookUser, MergeUsers, Circle, CircleParticipant, Reminder) {

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
  $scope.lbblogin = function(event) {
    console.log("event: ", event);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user; 
                                           console.log($rootScope.user); 
                                          }, 
                               function() {$scope.logingood=false; alert('Wrong user/pass');}  );
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
  
  
  // 2013-07-31
  $scope.saveuser = function(user) {
      User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
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
  
  
  // 2013-08-08
  $scope.setcircle = function(c) { 
    c.participants = CircleParticipant.query({circleId:c.id},
                        function() {
                          $scope.circle = c;
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
                              jQuery("#eventview").hide();
                              setTimeout(function(){
                                jQuery("#eventview").listview("refresh");
                                jQuery("#eventview").show();
                              },0);
  }
  
  
  // 2013-08-04 see http://docs.mobiscroll.com/datetime
  // see also http://docs.mobiscroll.com/26/mobiscroll-core
  $scope.initNewEvent = function(circleType, receiverLimit) {
    $scope.circle = {circleType:circleType, receiverLimit:receiverLimit};
    //The Javascript: initializing the scroller
	jQuery(function(){
	    jQuery("#datepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
	});
  };
  
  
  // taken from app-CircleModule.js: $rootScope.savecircle = function(circle, expdate)  2013-08-08
  $scope.savecircle = function(circle) {
    circle.expirationdate = new Date(jQuery("#datepicker").mobiscroll('getDate'));
    
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    
    var inserting = !angular.isDefined(circle.id)
    
    // The saved circle should become the current circle if it isn't already
    $scope.circle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id},
                 function() {
                   if(inserting) {
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
                   } 
                   else {
                     // else, we are updating, circle.id IS defined so update the circle in $rootScope.user.circles
                     for(var i=0; i < $rootScope.user.circles.length; i++) {
                       if($rootScope.user.circles[i].id == $scope.circle.id) {
                         $rootScope.user.circles.splice(i, 1, $scope.circle);
                       }
                     }
                     //$rootScope.combineReceiversAndGiversIntoBoth($scope.circle);
                   }  
                 },
                 function() {alert('Uh Oh - had a problem saving this event.\nIf this problem persists, contact us at info@littlebluebird.com');} 
             ); // Circle.save()
               
  }


  
  // 2013-08-08  taken from app-CircleCtrl.js
  $scope.removereceiver = function(index, circle, participant) {
    circle.participants.receivers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  // 2013-08-08  taken from app-CircleCtrl.js
  $scope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
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
    else if($scope.eventfilter=='current') return circle.date > new Date().getTime();
    else if($scope.eventfilter=='past') return circle.date < new Date().getTime();
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
    
    var saveparms = {updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id};
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    var savedgift = Gift.save(saveparms,
               function() {
                 if(add) {$scope.gifts.reverse();$scope.gifts.push(savedgift);$scope.gifts.reverse();}
                 $scope.currentgift = {};
                 $scope.currentgift.recipients = [];
                 setTimeout(function(){
                   jQuery("#wishlistview").listview("refresh");
                   jQuery("#wishlistview").show();
                 },0);
               });
               
  }    
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.deletegift() function
  $scope.deletegift = function(gift) {
    $scope.gifts.splice($scope.index, 1);
    Gift.delete({giftId:gift.id, updater:$rootScope.user.fullname}, 
                  function() {
                     setTimeout(function(){
                      jQuery("#wishlistview").listview("refresh");
                      jQuery("#wishlistview").show();
                    },0);
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
                              if($rootScope.user.id == participant.id) { $scope.gifts.mylist=true; } else { $scope.gifts.mylist=false; } 
                              
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
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
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  $scope.setfootermenu = function(selected) {
    $scope.footermenu = selected;
  }
  
  $scope.footermenustyle = function(menuitem) {
    return $scope.footermenu == menuitem ? 'ui-btn-active ui-state-persist' : '';
  }
  
  
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
  
  
  // a test user, with password removed
  $scope.brent = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 43rd Birthday","date":1387173599000,"id":431,"date_deleted":0,"cutoff_date":1387173599000,"dateStr":"12/15/2013","receiverLimit":1,"reminders":[{"$lift_class":"reminders","id":5054,"circle":431,"viewer":4,"remind_date":1385877600000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5057,"circle":431,"viewer":3,"remind_date":1385877600000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5053,"circle":431,"viewer":4,"remind_date":1386482400000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5056,"circle":431,"viewer":3,"remind_date":1386482400000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5052,"circle":431,"viewer":4,"remind_date":1386828000000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5055,"circle":431,"viewer":3,"remind_date":1386828000000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}}],"isExpired":false},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 71st Birthday","date":1374123599000,"id":430,"date_deleted":0,"cutoff_date":1374123599000,"dateStr":"7/17/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mother's Day (Brenda) 2013","date":1368421199000,"id":426,"date_deleted":0,"cutoff_date":1368421199000,"dateStr":"5/12/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's Birthday","date":1361858399000,"id":421,"date_deleted":0,"cutoff_date":1361858399000,"dateStr":"2/25/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2012","date":1356501599000,"id":390,"date_deleted":0,"cutoff_date":1356501599000,"dateStr":"12/25/2012","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 16th Birthday","date":1353045599000,"id":389,"date_deleted":0,"cutoff_date":1353045599000,"dateStr":"11/15/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 36th Birthday","date":1349931599000,"id":379,"date_deleted":0,"cutoff_date":1349931599000,"dateStr":"10/10/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 11th Birthday","date":1347857999000,"id":372,"date_deleted":0,"cutoff_date":1347857999000,"dateStr":"9/16/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day 2012","date":1339995599000,"id":366,"date_deleted":0,"cutoff_date":1339995599000,"dateStr":"6/17/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie)","date":1336971599000,"id":364,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda)","date":1336971599000,"id":365,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 2nd Birthday","date":1336798799000,"id":362,"date_deleted":0,"cutoff_date":1336798799000,"dateStr":"5/11/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 13rd Birthday","date":1333429199000,"id":363,"date_deleted":0,"cutoff_date":1333429199000,"dateStr":"4/2/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 68th Birthday","date":1330235999000,"id":360,"date_deleted":0,"cutoff_date":1330235999000,"dateStr":"2/25/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2011","date":1324879199000,"id":321,"date_deleted":0,"cutoff_date":1324879199000,"dateStr":"12/25/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 41st Birthday","date":1324015199000,"id":341,"date_deleted":0,"cutoff_date":1324015199000,"dateStr":"12/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 15th Birthday","date":1321423199000,"id":320,"date_deleted":0,"cutoff_date":1321423199000,"dateStr":"11/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 35th Birthday","date":1318309199000,"id":319,"date_deleted":0,"cutoff_date":1318309199000,"dateStr":"10/10/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 10th Birthday","date":1316235599000,"id":312,"date_deleted":0,"cutoff_date":1316235599000,"dateStr":"9/16/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 69th Birthday","date":1310965199000,"id":310,"date_deleted":0,"cutoff_date":1310965199000,"dateStr":"7/17/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2011","date":1308545999000,"id":298,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2011","date":1308545999000,"id":299,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 1st Birthday","date":1305521999000,"id":297,"date_deleted":0,"cutoff_date":1305521999000,"dateStr":"5/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2011","date":1304917199000,"id":294,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2011","date":1304917199000,"id":295,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 12th Birthday","date":1301806799000,"id":293,"date_deleted":0,"cutoff_date":1301806799000,"dateStr":"4/2/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 67th Birthday","date":1298699999000,"id":292,"date_deleted":0,"cutoff_date":1298699999000,"dateStr":"2/25/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Valentines Day","name":"Valentines Day 2011","date":1297749599000,"id":286,"date_deleted":0,"cutoff_date":1297749599000,"dateStr":"2/14/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2010","date":1293343199000,"id":259,"date_deleted":0,"cutoff_date":1293343199000,"dateStr":"12/25/2010","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 40th Birthday","date":1292479199000,"id":271,"date_deleted":0,"cutoff_date":1292479199000,"dateStr":"12/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 14th Birthday","date":1289887199000,"id":261,"date_deleted":0,"cutoff_date":1289887199000,"dateStr":"11/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 34th Birthday","date":1286773199000,"id":252,"date_deleted":0,"cutoff_date":1286773199000,"dateStr":"10/10/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 9th Birthday","date":1284699599000,"id":246,"date_deleted":0,"cutoff_date":1284699599000,"dateStr":"9/16/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 68th Birthday","date":1279429199000,"id":245,"date_deleted":0,"cutoff_date":1279429199000,"dateStr":"7/17/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2010","date":1273467599000,"id":242,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2010","date":1273467599000,"id":243,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 66th Birthday","date":1267336799000,"id":241,"date_deleted":0,"cutoff_date":1267336799000,"dateStr":"2/27/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2009","date":1261893599000,"id":187,"date_deleted":0,"cutoff_date":1261893599000,"dateStr":"12/26/2009","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 39th Birthday","date":1260943199000,"id":216,"date_deleted":0,"cutoff_date":1260943199000,"dateStr":"12/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 13th Birthday","date":1258351199000,"id":217,"date_deleted":0,"cutoff_date":1258351199000,"dateStr":"11/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 33rd Birthday","date":1255237199000,"id":214,"date_deleted":0,"cutoff_date":1255237199000,"dateStr":"10/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 8th Birthday","date":1253163599000,"id":210,"date_deleted":0,"cutoff_date":1253163599000,"dateStr":"9/16/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 67th Birthday","date":1247979599000,"id":204,"date_deleted":0,"cutoff_date":1247979599000,"dateStr":"7/18/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Anniversary","name":"Tamie&Brent's Anniversary","date":1246251599000,"id":199,"date_deleted":0,"cutoff_date":1246251599000,"dateStr":"6/28/2009","receiverLimit":2,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2009","date":1245646799000,"id":200,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2009","date":1245646799000,"id":201,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2009","date":1242017999000,"id":195,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2009","date":1242017999000,"id":196,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 10th Birthday","date":1238734799000,"id":193,"date_deleted":0,"cutoff_date":1238734799000,"dateStr":"4/2/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 65th Birthday","date":1235627999000,"id":186,"date_deleted":0,"cutoff_date":1235627999000,"dateStr":"2/25/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2008","date":1230271199000,"id":112,"date_deleted":0,"cutoff_date":1230271199000,"dateStr":"12/25/2008","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 38th Birthday","date":1229407199000,"id":131,"date_deleted":0,"cutoff_date":1229407199000,"dateStr":"12/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 12th Birthday","date":1226815199000,"id":130,"date_deleted":0,"cutoff_date":1226815199000,"dateStr":"11/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 32nd Birthday","date":1223701199000,"id":93,"date_deleted":0,"cutoff_date":1223701199000,"dateStr":"10/10/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2008","date":1210568399000,"id":83,"date_deleted":0,"cutoff_date":1210568399000,"dateStr":"5/11/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2007","date":1198648799000,"id":15,"date_deleted":0,"cutoff_date":1198648799000,"dateStr":"12/25/2007","receiverLimit":-1,"reminders":[],"isExpired":true}],
  "friends":[{"id":2,"first":"Francy","last":"Collins","fullname":"Francy Collins","username":"francy","profilepicUrl":"http://graph.facebook.com/1280492734/picture?type=normal","profilepicheight":86,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":174,"profilepicmargintop":"0px","profilepicmarginleft":"-12px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":116,"profilepicmargintop100":"0px","profilepicmarginleft100":"-8px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":58,"profilepicmargintop50":"0px","profilepicmarginleft50":"-4px","email":"collins89@sbcglobal.net","bio":"","age":45,"dateOfBirth":-62272800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":5,"first":"Todd","last":"Cocanougher","fullname":"Todd Cocanougher","username":"todd","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":6,"first":"Julianne","last":"Cocanougher","fullname":"Julianne Cocanougher","username":"julianne","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":8,"first":"Barbara","last":"Cocanougher","fullname":"Barbara Cocanougher","username":"barbara","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":9,"first":"Greg","last":"Collins","fullname":"Greg Collins","username":"greg","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":10,"first":"Lucy","last":"Collins","fullname":"Lucy Collins","username":"lucy","profilepicUrl":"http://graph.facebook.com/100000795588383/picture?type=normal","profilepicheight":202,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":303,"profilepicadjustedwidth":150,"profilepicmargintop":"-76px","profilepicmarginleft":"0px","profilepicadjustedheight100":202,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-51px","profilepicmarginleft100":"0px","profilepicadjustedheight50":101,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-25px","profilepicmarginleft50":"0px","email":"bookbug3@sbcglobal.net","bio":"Lucy's favorite color is blue.  She loves to read, listen to music, play games and hang out with her friends.  She plays viola. ","age":16,"dateOfBirth":848037600000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":11,"first":"Trent","last":"Collins","fullname":"Trent Collins","username":"trent","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"soccercrayon4-2@sbcglobal.net","bio":"Trent loves to climb trees, and play video games, basketball, soccer, and any other games with his friends.","age":14,"dateOfBirth":923032800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":12,"first":"Bill","last":"Dunklau","fullname":"Bill Dunklau","username":"bill","profilepicUrl":"http://graph.facebook.com/1336420404/picture?type=normal","profilepicheight":127,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":190,"profilepicadjustedwidth":150,"profilepicmargintop":"-20px","profilepicmarginleft":"0px","profilepicadjustedheight100":127,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-13px","profilepicmarginleft100":"0px","profilepicadjustedheight50":63,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-6px","profilepicmarginleft50":"0px","email":"transweb@sbcglobal.net","bio":"","age":71,"dateOfBirth":-866574000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":13,"first":"Brenda","last":"Dunklau","fullname":"Brenda Dunklau","username":"brenda","profilepicUrl":"http://graph.facebook.com/1140124546/picture?type=normal","profilepicheight":117,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":175,"profilepicadjustedwidth":150,"profilepicmargintop":"-12px","profilepicmarginleft":"0px","profilepicadjustedheight100":117,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-8px","profilepicmarginleft100":"0px","profilepicadjustedheight50":58,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-4px","profilepicmarginleft50":"0px","email":"brenda@lancerltd.com","bio":"","age":69,"dateOfBirth":-815770800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":14,"first":"Debbie","last":"Greaves","fullname":"Debbie Greaves","username":"debbie","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":15,"first":"Kim","last":"Greaves","fullname":"Kim Greaves","username":"Kim","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":16,"first":"Janice","last":"Johnson","fullname":"Janice Johnson","username":"janice","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":17,"first":"Tim","last":"Johnson","fullname":"Tim Johnson","username":"tim","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":65,"dateOfBirth":-678481200000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":435,"first":"Gmail","last":"Gmail","fullname":"Gmail Gmail","username":"gmail","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@gmail.com","bio":"","age":52,"dateOfBirth":-285444000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":500,"first":"Truman","last":"Dunklau","fullname":"Truman Dunklau","username":"truman","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"No more clothes please - my closet is full","age":3,"dateOfBirth":1273554000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":601,"first":"Jett","last":"Dunklau","fullname":"Jett Dunklau","username":"jett","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"The only thing I need is a new diaper","age":1,"dateOfBirth":1316408400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_circles = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[],
  "friends":[{"id":2,"first":"Francy","last":"Collins","fullname":"Francy Collins","username":"francy","profilepicUrl":"http://graph.facebook.com/1280492734/picture?type=normal","profilepicheight":86,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":174,"profilepicmargintop":"0px","profilepicmarginleft":"-12px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":116,"profilepicmargintop100":"0px","profilepicmarginleft100":"-8px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":58,"profilepicmargintop50":"0px","profilepicmarginleft50":"-4px","email":"collins89@sbcglobal.net","bio":"","age":45,"dateOfBirth":-62272800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":5,"first":"Todd","last":"Cocanougher","fullname":"Todd Cocanougher","username":"todd","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":6,"first":"Julianne","last":"Cocanougher","fullname":"Julianne Cocanougher","username":"julianne","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":8,"first":"Barbara","last":"Cocanougher","fullname":"Barbara Cocanougher","username":"barbara","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":9,"first":"Greg","last":"Collins","fullname":"Greg Collins","username":"greg","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":10,"first":"Lucy","last":"Collins","fullname":"Lucy Collins","username":"lucy","profilepicUrl":"http://graph.facebook.com/100000795588383/picture?type=normal","profilepicheight":202,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":303,"profilepicadjustedwidth":150,"profilepicmargintop":"-76px","profilepicmarginleft":"0px","profilepicadjustedheight100":202,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-51px","profilepicmarginleft100":"0px","profilepicadjustedheight50":101,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-25px","profilepicmarginleft50":"0px","email":"bookbug3@sbcglobal.net","bio":"Lucy's favorite color is blue.  She loves to read, listen to music, play games and hang out with her friends.  She plays viola. ","age":16,"dateOfBirth":848037600000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":11,"first":"Trent","last":"Collins","fullname":"Trent Collins","username":"trent","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"soccercrayon4-2@sbcglobal.net","bio":"Trent loves to climb trees, and play video games, basketball, soccer, and any other games with his friends.","age":14,"dateOfBirth":923032800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":12,"first":"Bill","last":"Dunklau","fullname":"Bill Dunklau","username":"bill","profilepicUrl":"http://graph.facebook.com/1336420404/picture?type=normal","profilepicheight":127,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":190,"profilepicadjustedwidth":150,"profilepicmargintop":"-20px","profilepicmarginleft":"0px","profilepicadjustedheight100":127,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-13px","profilepicmarginleft100":"0px","profilepicadjustedheight50":63,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-6px","profilepicmarginleft50":"0px","email":"transweb@sbcglobal.net","bio":"","age":71,"dateOfBirth":-866574000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":13,"first":"Brenda","last":"Dunklau","fullname":"Brenda Dunklau","username":"brenda","profilepicUrl":"http://graph.facebook.com/1140124546/picture?type=normal","profilepicheight":117,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":175,"profilepicadjustedwidth":150,"profilepicmargintop":"-12px","profilepicmarginleft":"0px","profilepicadjustedheight100":117,"profilepicadjustedwidth100":100,"profilepicmargintop100":"-8px","profilepicmarginleft100":"0px","profilepicadjustedheight50":58,"profilepicadjustedwidth50":50,"profilepicmargintop50":"-4px","profilepicmarginleft50":"0px","email":"brenda@lancerltd.com","bio":"","age":69,"dateOfBirth":-815770800000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":14,"first":"Debbie","last":"Greaves","fullname":"Debbie Greaves","username":"debbie","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":15,"first":"Kim","last":"Greaves","fullname":"Kim Greaves","username":"Kim","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":16,"first":"Janice","last":"Johnson","fullname":"Janice Johnson","username":"janice","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":0,"dateOfBirth":null,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":17,"first":"Tim","last":"Johnson","fullname":"Tim Johnson","username":"tim","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"janiceloyd@sbcglobal.net","bio":"","age":65,"dateOfBirth":-678481200000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":435,"first":"Gmail","last":"Gmail","fullname":"Gmail Gmail","username":"gmail","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@gmail.com","bio":"","age":52,"dateOfBirth":-285444000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":500,"first":"Truman","last":"Dunklau","fullname":"Truman Dunklau","username":"truman","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"No more clothes please - my closet is full","age":3,"dateOfBirth":1273554000000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null},{"id":601,"first":"Jett","last":"Dunklau","fullname":"Jett Dunklau","username":"jett","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"bdunklau@yahoo.com","bio":"The only thing I need is a new diaper","age":1,"dateOfBirth":1316408400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_friends = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 43rd Birthday","date":1387173599000,"id":431,"date_deleted":0,"cutoff_date":1387173599000,"dateStr":"12/15/2013","receiverLimit":1,"reminders":[{"$lift_class":"reminders","id":5054,"circle":431,"viewer":4,"remind_date":1385877600000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5057,"circle":431,"viewer":3,"remind_date":1385877600000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5053,"circle":431,"viewer":4,"remind_date":1386482400000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5056,"circle":431,"viewer":3,"remind_date":1386482400000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5052,"circle":431,"viewer":4,"remind_date":1386828000000,"person":{"id":4,"first":"Tamie","last":"Dunklau","fullname":"Tamie Dunklau","username":"tamie","profilepicUrl":"http://graph.facebook.com/tamie.dunklau/picture?type=normal","profilepicheight":100,"profilepicwidth":100,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"tamiemarie@gmail.com","bio":"","age":36,"dateOfBirth":213771600000,"facebookId":"1435144902","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}},{"$lift_class":"reminders","id":5055,"circle":431,"viewer":3,"remind_date":1386828000000,"person":{"id":3,"first":"Kiera","last":"Daniell","fullname":"Kiera Daniell","username":"kiera","profilepicUrl":"http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg","profilepicheight":-1,"profilepicwidth":-1,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px","email":"superkikid@gmail.com","bio":"If you want to buy Kiera gift cards, she likes Taco Bueno, McDonalds and Half Price Books.","age":11,"dateOfBirth":1000616400000,"facebookId":null,"notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","giftsHaveBeenPurchasedForMe":null}}],"isExpired":false},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 71st Birthday","date":1374123599000,"id":430,"date_deleted":0,"cutoff_date":1374123599000,"dateStr":"7/17/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mother's Day (Brenda) 2013","date":1368421199000,"id":426,"date_deleted":0,"cutoff_date":1368421199000,"dateStr":"5/12/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's Birthday","date":1361858399000,"id":421,"date_deleted":0,"cutoff_date":1361858399000,"dateStr":"2/25/2013","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2012","date":1356501599000,"id":390,"date_deleted":0,"cutoff_date":1356501599000,"dateStr":"12/25/2012","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 16th Birthday","date":1353045599000,"id":389,"date_deleted":0,"cutoff_date":1353045599000,"dateStr":"11/15/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 36th Birthday","date":1349931599000,"id":379,"date_deleted":0,"cutoff_date":1349931599000,"dateStr":"10/10/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 11th Birthday","date":1347857999000,"id":372,"date_deleted":0,"cutoff_date":1347857999000,"dateStr":"9/16/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day 2012","date":1339995599000,"id":366,"date_deleted":0,"cutoff_date":1339995599000,"dateStr":"6/17/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie)","date":1336971599000,"id":364,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda)","date":1336971599000,"id":365,"date_deleted":0,"cutoff_date":1336971599000,"dateStr":"5/13/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 2nd Birthday","date":1336798799000,"id":362,"date_deleted":0,"cutoff_date":1336798799000,"dateStr":"5/11/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 13rd Birthday","date":1333429199000,"id":363,"date_deleted":0,"cutoff_date":1333429199000,"dateStr":"4/2/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 68th Birthday","date":1330235999000,"id":360,"date_deleted":0,"cutoff_date":1330235999000,"dateStr":"2/25/2012","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2011","date":1324879199000,"id":321,"date_deleted":0,"cutoff_date":1324879199000,"dateStr":"12/25/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 41st Birthday","date":1324015199000,"id":341,"date_deleted":0,"cutoff_date":1324015199000,"dateStr":"12/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 15th Birthday","date":1321423199000,"id":320,"date_deleted":0,"cutoff_date":1321423199000,"dateStr":"11/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 35th Birthday","date":1318309199000,"id":319,"date_deleted":0,"cutoff_date":1318309199000,"dateStr":"10/10/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 10th Birthday","date":1316235599000,"id":312,"date_deleted":0,"cutoff_date":1316235599000,"dateStr":"9/16/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 69th Birthday","date":1310965199000,"id":310,"date_deleted":0,"cutoff_date":1310965199000,"dateStr":"7/17/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2011","date":1308545999000,"id":298,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2011","date":1308545999000,"id":299,"date_deleted":0,"cutoff_date":1308545999000,"dateStr":"6/19/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Truman's 1st Birthday","date":1305521999000,"id":297,"date_deleted":0,"cutoff_date":1305521999000,"dateStr":"5/15/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2011","date":1304917199000,"id":294,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2011","date":1304917199000,"id":295,"date_deleted":0,"cutoff_date":1304917199000,"dateStr":"5/8/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 12th Birthday","date":1301806799000,"id":293,"date_deleted":0,"cutoff_date":1301806799000,"dateStr":"4/2/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 67th Birthday","date":1298699999000,"id":292,"date_deleted":0,"cutoff_date":1298699999000,"dateStr":"2/25/2011","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Valentines Day","name":"Valentines Day 2011","date":1297749599000,"id":286,"date_deleted":0,"cutoff_date":1297749599000,"dateStr":"2/14/2011","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2010","date":1293343199000,"id":259,"date_deleted":0,"cutoff_date":1293343199000,"dateStr":"12/25/2010","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 40th Birthday","date":1292479199000,"id":271,"date_deleted":0,"cutoff_date":1292479199000,"dateStr":"12/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 14th Birthday","date":1289887199000,"id":261,"date_deleted":0,"cutoff_date":1289887199000,"dateStr":"11/15/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 34th Birthday","date":1286773199000,"id":252,"date_deleted":0,"cutoff_date":1286773199000,"dateStr":"10/10/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 9th Birthday","date":1284699599000,"id":246,"date_deleted":0,"cutoff_date":1284699599000,"dateStr":"9/16/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 68th Birthday","date":1279429199000,"id":245,"date_deleted":0,"cutoff_date":1279429199000,"dateStr":"7/17/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2010","date":1273467599000,"id":242,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2010","date":1273467599000,"id":243,"date_deleted":0,"cutoff_date":1273467599000,"dateStr":"5/9/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 66th Birthday","date":1267336799000,"id":241,"date_deleted":0,"cutoff_date":1267336799000,"dateStr":"2/27/2010","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2009","date":1261893599000,"id":187,"date_deleted":0,"cutoff_date":1261893599000,"dateStr":"12/26/2009","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 39th Birthday","date":1260943199000,"id":216,"date_deleted":0,"cutoff_date":1260943199000,"dateStr":"12/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 13th Birthday","date":1258351199000,"id":217,"date_deleted":0,"cutoff_date":1258351199000,"dateStr":"11/15/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 33rd Birthday","date":1255237199000,"id":214,"date_deleted":0,"cutoff_date":1255237199000,"dateStr":"10/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Kiera's 8th Birthday","date":1253163599000,"id":210,"date_deleted":0,"cutoff_date":1253163599000,"dateStr":"9/16/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Bill's 67th Birthday","date":1247979599000,"id":204,"date_deleted":0,"cutoff_date":1247979599000,"dateStr":"7/18/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Anniversary","name":"Tamie&Brent's Anniversary","date":1246251599000,"id":199,"date_deleted":0,"cutoff_date":1246251599000,"dateStr":"6/28/2009","receiverLimit":2,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Bill) 2009","date":1245646799000,"id":200,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Fathers Day","name":"Fathers Day (Brent) 2009","date":1245646799000,"id":201,"date_deleted":0,"cutoff_date":1245646799000,"dateStr":"6/21/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Brenda) 2009","date":1242017999000,"id":195,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2009","date":1242017999000,"id":196,"date_deleted":0,"cutoff_date":1242017999000,"dateStr":"5/10/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Trent's 10th Birthday","date":1238734799000,"id":193,"date_deleted":0,"cutoff_date":1238734799000,"dateStr":"4/2/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brenda's 65th Birthday","date":1235627999000,"id":186,"date_deleted":0,"cutoff_date":1235627999000,"dateStr":"2/25/2009","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2008","date":1230271199000,"id":112,"date_deleted":0,"cutoff_date":1230271199000,"dateStr":"12/25/2008","receiverLimit":-1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Brent's 38th Birthday","date":1229407199000,"id":131,"date_deleted":0,"cutoff_date":1229407199000,"dateStr":"12/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Lucy's 12th Birthday","date":1226815199000,"id":130,"date_deleted":0,"cutoff_date":1226815199000,"dateStr":"11/15/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Birthday","name":"Tamie's 32nd Birthday","date":1223701199000,"id":93,"date_deleted":0,"cutoff_date":1223701199000,"dateStr":"10/10/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Mothers Day","name":"Mothers Day (Tamie) 2008","date":1210568399000,"id":83,"date_deleted":0,"cutoff_date":1210568399000,"dateStr":"5/11/2008","receiverLimit":1,"reminders":[],"isExpired":true},{"$lift_class":"circles","circleType":"Christmas","name":"Christmas 2007","date":1198648799000,"id":15,"date_deleted":0,"cutoff_date":1198648799000,"dateStr":"12/25/2007","receiverLimit":-1,"reminders":[],"isExpired":true}],
  "friends":[],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  $scope.brent_no_circles_or_friends = {"$lift_class":"person","id":1,"first":"Brent","last":"Dunklau","email":"bdunklau@yahoo.com","username":"bdunklau","password":"xxxxxxx","dateOfBirth":30088800000,"profilepic":"http://graph.facebook.com/569956369/picture?type=large","bio":"All I want this year are gift cards...","parent":null,"facebookId":"569956369","notifyonaddtoevent":"true","notifyondeletegift":"true","notifyoneditgift":"true","notifyonreturngift":"true","dateOfBirthStr":"12/15/1970","fullname":"Brent Dunklau",
  "circles":[],
  "friends":[],
  "profilepicUrl":"http://graph.facebook.com/569956369/picture?type=large","profilepicheight":180,"profilepicwidth":180,"appRequestStatus":"","profilepicadjustedheight":150,"profilepicadjustedwidth":150,"profilepicmargintop":"0px","profilepicmarginleft":"0px","profilepicadjustedheight100":100,"profilepicadjustedwidth100":100,"profilepicmargintop100":"0px","profilepicmarginleft100":"0px","profilepicadjustedheight50":50,"profilepicadjustedwidth50":50,"profilepicmargintop50":"0px","profilepicmarginleft50":"0px"}
  
  
  
  // a test new user
  $scope.scotttiger = {fullname:'Scott Tiger', username:'scott', password:'scott', passagain:'scott', email:'bdunklau@yahoo.com'};
  $scope.newuser = $scope.scotttiger;
  
  $rootScope.user = $scope.brent_no_friends;
  $scope.logingood = true; // to get to the welcome screen
  
  // to prepopulate login forms and password recovery forms
  $scope.email = 'bdunklau@yahoo.com';
  $scope.username = 'bdunklau';
  $scope.password = 'bdunklau';
  
  var testdate = new Date(new Date().getFullYear(), 11, 25);
  console.log('testdate: ', testdate);
  $scope.circle = {name:'test', date:testdate, receiverLimit:-1, circleType:'Christmas'};
  
  $scope.newparticipant = {participationLevel:'Receiver'};
  
  jQuery(function(){
	jQuery("#datepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
    jQuery("#datepicker").mobiscroll('setValue', [testdate.getMonth(), testdate.getDate(), testdate.getFullYear()], true, 100);
  });
  
}];

