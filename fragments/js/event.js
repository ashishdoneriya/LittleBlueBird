
  
  // 2013-08-08  But what if the email address is already in the database?  This call would create a second account for this person erroneously
  //			 We have to query by email first and return all people found so the user can choose "Yes, it's one of these people" or "No, not any of these people"
  //             Think about Marian continually inviting Eric by email.  If we don't query by email first, we'll end up with tons of duplicate accounts for Eric!
  $scope.invite = function(newparticipant, circle, participationLevel) {
      $scope.loading = true;
      $scope.maybepeople = User.query({email:newparticipant.email},
              function() {
              
                // You tried to add someone to your event by entering their name/email.  This name/email wasn't found
                // in the LBB database...  2013-09-30
                if($scope.maybepeople.length == 0) {
                 
                   // so the first thing we do is create an account for this person...
                  
                   // This User.save call was taken from friend.js:  $scope.searchforfriend 2013-09-30
                   anewuser = User.save({fullname:newparticipant.name, email:newparticipant.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname},
                       function() {
                               
                           // upon successful save of the new person's account, add this new person to the circle
                           console.log("$scope.addparticipant(anewuser, circle, participationLevel);");
                           $scope.addparticipant(anewuser, circle, participationLevel);
                       
                       
                           // also make this new person a friend of the current user
                           User.save({userId:$rootScope.user.id, username:$rootScope.user.username, lbbfriends:[anewuser]},
                                     function(){ 
                                         // ...and assuming the update of the current user was ok, add the newfriend to the user's list of friends
                                         $rootScope.user.friends.push(anewuser); 
                                         
                                     } // end success fn
                                     
                           ); // User.save
                           
                       } // end success fn
                       
                   ); // anewuser = User.save()
                  
                  
                } // if($scope.maybepeople.length == 0)
                
                else if($scope.maybepeople.length == 1 && User.alreadyfriends($scope.maybepeople[0], $rootScope.user)) {
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
  
  
  // 2013-09-30
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
        anewuser = User.save({fullname:person.name, email:person.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
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
									                                       //$scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})
									                                       // do we really need to bring the reminders back to the client? 2013-10-03
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
            console.log('refreshParticipants CALLED -------------------------------------------------');  
                   
        jQuery("#receiverview").hide();
          setTimeout(function(){
            jQuery("#receiverview").listview("refresh");
            jQuery("#receiverview").show();
            console.log('REFRESHED receiverview -------------------------------------------------');
         },25);
		                             
        jQuery("#giverview").hide();
          setTimeout(function(){
            jQuery("#giverview").listview("refresh");
            jQuery("#giverview").show();
            console.log('REFRESHED giverview -------------------------------------------------');
         },25);
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
  
  
  