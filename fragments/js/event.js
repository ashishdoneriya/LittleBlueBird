
  
  // 2013-08-08  But what if the email address is already in the database?  This call would create a second account for this person erroneously
  //			 We have to query by email first and return all people found so the user can choose "Yes, it's one of these people" or "No, not any of these people"
  //             Think about Marian continually inviting Eric by email.  If we don't query by email first, we'll end up with tons of duplicate accounts for Eric!
  $scope.invite = function(newparticipant, circle) {
      $scope.maybepeople = User.query({email:newparticipant.email},
              function() {
                if($scope.maybepeople.length == 1 && User.alreadyfriends($scope.maybepeople[0], $rootScope.user)) {
                  $scope.selectthisparticipant($scope.maybepeople[0], $scope.newparticipant.participationLevel, false)
                }
                else {
                  jQuery("#maybepeopleview").hide();
                    setTimeout(function(){
                      jQuery("#maybepeopleview").listview("refresh");
                      jQuery("#maybepeopleview").show();
                    },0);
                }
              }
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
    $scope.circle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id, participants:circle.participants},
                 function() {
                     console.log('JUST SAVED A NEW CIRCLE');
                     $scope.circle.participants = circle.participants; // so we don't have to query the db
                     if(Circle.userIsParticipating(user, circle))
                       $rootScope.user.circles.push($scope.circle);
                     refreshParticipants();
                 },
                 function() {alert('Uh Oh - had a problem saving this event.\nIf this problem persists, contact us at info@littlebluebird.com');} 
             ); // Circle.save()
               
    
  }
  

  // 2013-08-27  
  $scope.beginDeleteParticipants = function(type) {
    $scope.participationLevel = type;
    $scope.participantstodelete = [];
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
  
  
  