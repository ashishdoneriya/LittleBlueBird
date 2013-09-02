
angular.module('CircleModule', ['UserModule'])
.factory('Circle', function($resource) {
      var Circle = $resource('/gf/rest/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });
      console.log("CircleModule:  created Circle factory");   
      
      return Circle;
  })
.factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/gf/rest/circleparticipants/:circleId', {circleId:'@circleId', userId:'@userId', inviterId:'@inviterId', 
                                         participationLevel:'@participationLevel', who:'@who', email:'@email', circle:'@circle', adder:'@adder',
                                         notifyonaddtoevent:'@notifyonaddtoevent'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  })
.factory('EventHelper', function($rootScope) {

    var eventtypes = [{type:'Christmas', limit:-1},
                {type:'Birthday', limit:1},
                {type:'Anniversary', limit:2},
                {type:'Mothers Day', limit:1},
                {type:'Fathers Day', limit:1},
                {type:'Valentines Day', limit:-1},
                {type:'Graduation', limit:1},
                {type:'Baby Shower', limit:1},
                {type:'Other', limit:-1}];
                
    var EventHelper = {};
    
    EventHelper.getEventType = function(newRoute) {
      var thetype = newRoute.params.type;
      var typeInfo = {type:'Other', limit:-1}; // default values
      for(var i=0; i < eventtypes.length; i++) {
        if(eventtypes[i].type == thetype) {
          console.log("app-CircleModule: EventHelper.createNewEvent(): FOUND eventtypes["+i+"].type = "+eventtypes[i].type+", eventtypes["+i+"].limit = "+eventtypes[i].limit);
          typeInfo = eventtypes[i];
        }
      }
      
      return typeInfo;
    }
    
    return EventHelper; 
                
  })
.run(function($rootScope, $location, EventHelper, Circle) {
  
    // See events.html:  #/newevent/Christmas,Birthday,etc
    // This event is fired all the time, so make sure the url contains 'newevent' to proceed
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){ 
    
      // This is what we do when we are creating a new event.  See events.html
      if ($location.url().indexOf('newevent') != -1) {
        console.log("app-CircleModule:run():routeChangeStart:  This is our 'new event' function.  newRoute = .....");
        console.log(newRoute);
        $rootScope.typeInfo = EventHelper.getEventType(newRoute);
        $rootScope.search = '';
        $rootScope.title = "New "+$rootScope.typeInfo.type+" Event";
        $rootScope.peoplesearchresults = [];
        $rootScope.thecircle = {name:'', circleType:$rootScope.typeInfo.type, receiverLimit:$rootScope.typeInfo.limit, participants:{receivers:[], givers:[]}};
      }
      else if($location.url().indexOf('editevent') != -1) {
        $rootScope.title = "Edit Event";
        console.log('app-CircleModule.js:routeChangeStart: trying to copy: $rootScope.circle', $rootScope.circle);
        $rootScope.thecircle = angular.copy($rootScope.circle); // infinite recursive loop here:  circle.participants.both[0].circles.participants.both[0]...
        $rootScope.expdate = $rootScope.thecircle.dateStr;
        console.log('app-CircleModule.js:routeChangeStart: $rootScope.thecircle.dateStr=', $rootScope.thecircle.dateStr);
      }
    
    })
    
  })
.run(function($rootScope, $location, Circle, CircleParticipant, Reminder, UserSearch, Gift, Reminder, User) {

  // define $rootScope functions here to make them globally available
  
  // 2/15/13
  // TODO delete reminders
  $rootScope.deletecircle = function($event) {
    //$event.preventDefault();
    //$event.stopPropagation();
    $location.url('events');
    Circle.save({circleId:$rootScope.deleteevent.id, datedeleted:new Date().getTime()},
                function() {
                  // now find the circle we just deleted from the user's list of circles
                  for(var i=0; i < $rootScope.user.circles.length; i++) {
                    if($rootScope.deleteevent.id == $rootScope.user.circles[i].id) {
                      $rootScope.user.circles.splice(i, 1);
                    }
                  }
                  delete $rootScope.deleteevent
                } // end of success function
    ); // end of Circle.save
                
  }
  
  //  2/15/13
  $rootScope.confirmDeleteEvent = function($event, event) {
    $event.preventDefault();
    $event.stopPropagation();
    $rootScope.deleteevent = angular.copy(event);
    $rootScope.combineReceiversAndGiversIntoBoth($rootScope.deleteevent);
  }
  
  // called when the user clicks cancel from the newevent/editevent page. 
  $rootScope.cancelcirclechanges = function() {
    $rootScope.currentevent();
  }
  
  // If there is a current event/circle in the rootScope, go to that event's page
  // If there is no current event in the rootScope, then just go to the events page
  $rootScope.currentevent = function() {
    if(angular.isDefined($rootScope.circle)) {
      console.log("rootScope.cancelcirclechanges:  $location.path('currentevent')");
      $location.path('currentevent');
    }
    else {
      console.log("rootScope.cancelcirclechanges:  $location.path('events')");
      $location.path('events');
    }
  }
    
  $rootScope.canaddreceiver = function(circle) {
    //console.log("$rootScope.canaddreceiver:  circle=....");
    //console.log(circle);
    var isdefined = angular.isDefined(circle) && angular.isDefined(circle.receiverLimit) && angular.isDefined(circle.participants.receivers)
    return isdefined && (circle.receiverLimit == -1 || circle.receiverLimit > circle.participants.receivers.length);
  }
  
  
  $rootScope.addmyselfasreceiver = function(circle) {
    $rootScope.addparticipant(-1, $rootScope.user, circle, 'Receiver');
    // if 'you' happen to be a 'giver', remove yourself from 'givers'...
    for(var i=0; i < circle.participants.givers.length; i++) {
      if(circle.participants.givers[i].id == $rootScope.user.id)
        circle.participants.givers.splice(i, 1);
    }
  } 
  
  
  // TODO add reminder
  $rootScope.addmyselfasgiver = function(circle) {
    $rootScope.addparticipant(-1, $rootScope.user, circle, 'Giver');
    // if 'you' happen to be a 'receiver', remove yourself from 'receivers'...
    for(var i=0; i < circle.participants.receivers.length; i++) {
      if(circle.participants.receivers[i].id == $rootScope.user.id)
        circle.participants.receivers.splice(i, 1);
    }
  }
  
  
  // also referenced from events.html
  $rootScope.makeActive = function(index, circle) {
    console.log("CircleModule: rootScope.makeActive() ----------------------------");
    circle.index = index; // for deleting
    //Circle.currentCircle = circle;
    //Circle.currentCircle.isExpired = circle.date < new Date();
    $rootScope.circle = circle;
    $rootScope.circle.isExpired = circle.date < new Date();
    //$rootScope.$emit("circlechange"); // commented out on 11/30/12 - experimenting
  }
    
  
  $rootScope.isExpired = function() { 
    var isexpired = angular.isDefined($rootScope.circle) && $rootScope.circle.isExpired; //angular.isDefined($rootScope.circle) && $rootScope.circle.date < new Date().getTime();
    //console.log("CircleModule: rootScope.isExpired(): "+isexpired+" --------------------------------");
    return isexpired; 
  }
  
  // also referenced from events.html
  $rootScope.activeOrNot = function(circle) {
    if(!angular.isDefined($rootScope.circle))
      return false;
    return circle.id == $rootScope.circle.id ? "active" : "";
  }
  
  // I think this is being phased out.  app-EventCtrl:routeChangeSuccess makes the same call to
  // CircleParticipant.query()
  $rootScope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id}, 
                                                  function() {
                                                    // $rootScope.giftlist(circle, circle.participants.receivers[0]);
                                                  });
  }
  
  
  $rootScope.selectEventToAddFrom = function(circle) {
    console.log("app-CircleModule: $rootScope.selectEventToAddFrom() --------------------------------");
    $rootScope.showParticipants(circle);
    $rootScope.sourceEvent = circle;
    $rootScope.addmethod='fromspecificevent';
    delete $rootScope.selectedpeople;
    $rootScope.selectedpeople = [];
    $rootScope.combineReceiversAndGiversIntoBoth(circle)
  }
  
  
  // TODO Deprecated on 1/26/13.  Not sure where all this is used but I don't think it's being used anymore
  // I used to use it in the left side menu.  Also used to use it when adding people from other events, also 
  // not used anymore.  Do a search and see where all it's used and delete if it's really not being used anywhere.
  // also referenced from events.html
  $rootScope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
  
  
  // probably should be in GiftModule but that doesn't exist and this function is called from this module anyway - does that matter?
  $rootScope.giftlist = function(circle, participant) {
    
    console.log("$rootScope.giftlist(): $rootScope.gifts.......commented out stuff");
  
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
                              console.log("DO IT NOW:  giftlist/"+$rootScope.showUser.id+"/"+$rootScope.circle.id);
                              $location.url('giftlist/'+$rootScope.showUser.id+'/'+$rootScope.circle.id+'/');
  
    $rootScope.gifts = Gift.query({viewerId:$rootScope.user.id, circleId:$rootScope.circle.id, recipientId:participant.id}, 
                            function() { 
                              $rootScope.gifts.ready = true;
                              $rootScope.circle = circle;
                              $rootScope.showUser = participant;
                              if($rootScope.user.id == participant.id) { $rootScope.gifts.mylist=true; } else { $rootScope.gifts.mylist=false; } 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 401)");});
  }
  
  
  // TODO duplicated in ManagePeopleCtrl
  $rootScope.removereceiver = function(index, circle, participant) {
    circle.participants.receivers.splice(index, 1);
    removefromboth(circle, participant);
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      $rootScope.removeremindersforperson(participant);
    }
  }
  
  function removefromboth(circle, participant) {
    if(angular.isDefined(circle.participants.both)) {
      for(var i=0; i < circle.participants.both.length; i++) {
        if(circle.participants.both[i].id == participant.id)
          circle.participants.both.splice(i, 1);
      }
    }
  }
  
  // TODO duplicated in ManagePeopleCtrl
  $rootScope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1);
    removefromboth(circle, participant);
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      $rootScope.removeremindersforperson(participant);
    }
  }
  
  // TODO duplicated in ManagePeopleCtrl
  $rootScope.removeremindersforperson = function(person) {
    $rootScope.circle.newreminders = [];
    for(var i=0; i < $rootScope.circle.reminders.length; i++) {
      if($rootScope.circle.reminders[i].viewer != person.id) {
        $rootScope.circle.newreminders.push(angular.copy($rootScope.circle.reminders[i]));
        console.log($rootScope.circle.reminders[i]);
      }
    }
    $rootScope.circle.reminders = angular.copy($rootScope.circle.newreminders);
  }
  
  
  // add all the participants in the 'fromcircle' to the 'tocircle'
  $rootScope.addparticipants = function(fromcircle, tocircle) {
    for(var i=0; i < fromcircle.participants.receivers.length; i++) {
      var hasLimit = angular.isDefined(tocircle.receiverLimit) && tocircle.receiverLimit != -1;
      if(hasLimit && tocircle.participants.receivers.length == tocircle.receiverLimit)
        tocircle.participants.givers.push(fromcircle.participants.receivers[i]);
      else tocircle.participants.receivers.push(fromcircle.participants.receivers[i]);
    }
    for(var i=0; i < fromcircle.participants.givers.length; i++) {
      if(!angular.isDefined(tocircle.receiverLimit) || tocircle.receiverLimit == -1)
        tocircle.participants.receivers.push(fromcircle.participants.givers[i]);
      else
        tocircle.participants.givers.push(fromcircle.participants.givers[i]);
    }
  }
 
 
  // 2/15/13
  $rootScope.savecircle = function(circle, expdate) {
    circle.expirationdate = new Date(expdate);
    
    console.log("app-CircleModule: $rootScope.savecircle:  circle.expirationdate.getTime() = "+circle.expirationdate.getTime());
    console.log("app-CircleModule: trying to save this circle...");
    console.log(circle);
    console.log("app-CircleModule: and these participants...", circle.participants);
    
    var inserting = !angular.isDefined(circle.id)
    
    // The saved circle should become the current circle if it isn't already
    $rootScope.circle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:circle.circleType, 
                 creatorId:$rootScope.user.id},
                 function() {
                   if(inserting) {
                     var savedcircle = angular.copy($rootScope.circle)
                     $rootScope.user.circles.reverse();
                     $rootScope.user.circles.push(savedcircle);
                     $rootScope.user.circles.reverse();
                     circle.id = $rootScope.circle.id;
                     // since we are inserting, we have participants that need to be added to the event
                     for(var i=0; i < circle.participants.receivers.length; i++) {
                       // check if they're friends already and pre-emptively add if they are not.
                       // If there's a problem on the db side, we can remove in the fail function
                       User.addfriend($rootScope.user, circle.participants.receivers[i]);
                       var cp = CircleParticipant.save({circleId:$rootScope.circle.id, inviterId:$rootScope.user.id, userId:circle.participants.receivers[i].id, 
                                         participationLevel:'Receiver', who:circle.participants.receivers[i].fullname, email:circle.participants.receivers[i].email, circle:circle.name, 
                                         adder:$rootScope.user.fullname},
                                         function() {
                                           
                                         }
                                ); // CircleParticipant.save
                     }
                     for(var i=0; i < circle.participants.givers.length; i++) {
                       User.addfriend($rootScope.user, circle.participants.givers[i]);
                       CircleParticipant.save({circleId:$rootScope.circle.id, inviterId:$rootScope.user.id, userId:circle.participants.givers[i].id, 
                                         participationLevel:'Giver', who:circle.participants.givers[i].fullname, email:circle.participants.givers[i].email, circle:circle.name, 
                                         adder:$rootScope.user.fullname}
                                         ); // CircleParticipant.save
                     }
                     // more YUCK - if you want to see the list of participants on the next page, event.html, you have to add all
                     // participants to the 'both' array...
                     if(!angular.isDefined($rootScope.circle.participants))
                       $rootScope.circle.participants = {both: [], receivers: [], givers: []};
                     for(var i=0; i < circle.participants.receivers.length; ++i) {
                       $rootScope.circle.participants.receivers.push(circle.participants.receivers[i]);
                       $rootScope.circle.participants.both.push(circle.participants.receivers[i]);
                     }  
                     for(var i=0; i < circle.participants.givers.length; ++i) {
                       $rootScope.circle.participants.givers.push(circle.participants.givers[i]);
                       $rootScope.circle.participants.both.push(circle.participants.givers[i]);
                     }  
                     console.log('just saved: $rootScope.circle: ', $rootScope.circle);
                   } 
                   else {
                     // else, we are updating, circle.id IS defined so update the circle in $rootScope.user.circles
                     for(var i=0; i < $rootScope.user.circles.length; i++) {
                       if($rootScope.user.circles[i].id == $rootScope.circle.id) {
                         $rootScope.user.circles.splice(i, 1, $rootScope.circle);
                       }
                     }
                     $rootScope.combineReceiversAndGiversIntoBoth($rootScope.circle);
                   }  
                 } 
               );
    console.log("app-CircleModule: $rootScope.savecircle:  end" );
    
    $rootScope.currentevent();
  }
  
  
  $rootScope.setEventFilter = function(crit) {
    $rootScope.eventfilter = crit;
  }
  
  
  $rootScope.eventDateFilter = function(circle) {
    console.log("eventDateFilter");
    if($rootScope.eventfilter=='all') return true;
    else if($rootScope.eventfilter=='current') return !circle.isExpired;
    else if($rootScope.eventfilter=='past') return circle.isExpired;
    else {
      $rootScope.eventfilter='current';
      return !circle.isExpired;
    }
  }
  
    
  // 2/12/13
  // We pass in circle here because this function is used for new circles where there is no circle id yet
  // as well as for existing circles.
  $rootScope.addparticipant = function(index, person, circle, participationLevel) {
    console.log("$rootScope.addparticipant = function(index, person, circle, participationLevel) ------------------------------------");
    if(!angular.isDefined(circle.participants)) {
      circle.participants = {receivers:[], givers:[]};
      console.log("$rootScope.addparticipant:  circle.participants = {receivers:[], givers:[]}");
    }
      
    if(participationLevel == 'Giver') {
      circle.participants.givers.push(person);
      person.isGiver = true; // YUCK!  Only doing this because circle.participants.both exists
      console.log("$rootScope.addparticipant:  circle.participants.givers.push(person)");
    }
    else if(circle.receiverLimit == -1) { // no limit on receivers
      circle.participants.receivers.push(person);
      person.isReceiver = true; // YUCK!  Only doing this because circle.participants.both exists
      console.log("$rootScope.addparticipant:  circle.participants.receivers.push(person)");
    }
    else {
      if(circle.participants.receivers.length < circle.receiverLimit) {
        circle.participants.receivers.push(person);
        person.isReceiver = true; // YUCK!  Only doing this because circle.participants.both exists
        console.log("$rootScope.addparticipant:  circle.participants.receivers.push(person)  because we're under the receiver limit");
      }
      else {
        circle.participants.givers.push(person);
        person.isGiver = true; // YUCK!  Only doing this because circle.participants.both exists
        console.log("$rootScope.addparticipant:  circle.participants.givers.push(person)  because we're NOT under the receiver limit");
      }
    }

    
    // YUCK!  Add to 'both' also just so the new person will show up in event.html
    if(angular.isDefined(circle.participants.both)) { 
      var alreadythere = false;
      for(var i=0; i < circle.participants.both.length; i++) {
        if(circle.participants.both[i].id == person.id) alreadythere = true;
      }
      if(!alreadythere) circle.participants.both.push(person); 
    }

    
    if(index != -1) {
      console.log("index = "+index);
      $rootScope.peoplesearchresults[index].hide = true;
    }
    
    // if the circle already exists, add the participant to the db immediately
    if(angular.isDefined(circle.id)) {
      console.log("$rootScope.addparticipant:  $rootScope.user.id="+$rootScope.user.id);
      var newcp = CircleParticipant.save({circleId:circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:participationLevel,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:circle.name, adder:$rootScope.user.fullname},
                                         function() {circle.reminders = Reminder.query({circleId:circle.id})});
    }
    
    // If the circle doesn't exist yet, see $rootScope.savecircle() in this file

  }
  
  $rootScope.beginAddingByName = function(participationLevel) {
    $rootScope.participationLevel = participationLevel;
    $rootScope.addmethod = 'byname';
  }
  
  $rootScope.beginAddingFromAnotherEvent = function(participationLevel) {
    $rootScope.circlecopies = angular.copy($rootScope.user.circles);
    $rootScope.addmethod='fromanotherevent';
    $rootScope.participationLevel = participationLevel;
    console.log("app-CircleModule: rootScope.beginAddingFromAnotherEvent --------------------------------------");
  }
  
  // THIS IS KINDA DUMB...
  // the only reason that I'm combining the givers and receivers here is so that I can 
  // tell where the last row is on event.html  Otherwise, all I know is that I have a collection
  // of givers and another collection of receivers and I can only tell where the last row 
  // of each group is.
  $rootScope.combineReceiversAndGiversIntoBoth = function(circle) {
    var ppp = CircleParticipant.query({circleId:circle.id}, 
            function() {
                circle.participants = ppp;
                console.log("$rootScope.combineReceiversAndGiversIntoBoth:  circle.participants.....");
                console.log(circle.participants);
                console.log("$rootScope.combineReceiversAndGiversIntoBoth:  circle.participants.receivers.....");
                console.log(circle.participants.receivers);
                
                // THIS IS KINDA DUMB...
		        // the only reason that I'm combining the givers and receivers here is so that I can 
		        // tell where the last row is on event.html  Otherwise, all I know is that I have a collection
		        // of givers and another collection of receivers and I can only tell where the last row 
		        // of each group is.
		        circle.participants.both = [];
		        for(var i=0; i < circle.participants.receivers.length; i++) {
		          var p = circle.participants.receivers[i];
		          p.isReceiver = true;
		          circle.participants.both.push(p);
		          User.addfriend($rootScope.user, p);
		        }
		        for(var i=0; i < circle.participants.givers.length; i++) {
		          var p = circle.participants.givers[i];
		          p.isGiver = true;
		          circle.participants.both.push(p);
		          User.addfriend($rootScope.user, p);
		        }
                console.log("$rootScope.combineReceiversAndGiversIntoBoth:  circle.participants.both.....");
                console.log(circle.participants.both);
	                
            } // success function of CircleParticipant.query
    ); // CircleParticipant.query
  }
  
  $rootScope.determineCurrentCircle = function(newRoute) {
    console.log("$rootScope.determineCurrentCircle -----------------------------------------------");
    
    if(!newRoute)
      return;
    
    console.log("xxxxxxxxxxxxxxxxxxxxxx");
    if(angular.isDefined(newRoute.params.circleId)) {
        for(var i=0; i < $rootScope.user.circles.length; i++) {
          if($rootScope.user.circles[i].id == newRoute.params.circleId) {
            $rootScope.circle = $rootScope.user.circles[i];
            $rootScope.combineReceiversAndGiversIntoBoth($rootScope.circle)
		    console.log("rootScope.circle = ....");
		    console.log($rootScope.circle);
            
          } // if($rootScope.user.circles[i].id == newRoute.params.circleId)
        } // for(var i=0; i < $rootScope.user.circles.length; i++)
    } // if(angular.isDefined(newRoute.params.circleId))
  }
    
});

// http://stackoverflow.com/questions/12603914/reset-form-to-pristine-state-angularjs-1-0-x
// see app-EventCtrl.js:  $scope.resetInviteByEmailForm()
angular.resetForm = function (scope, formName, defaults) {
    console.log("anguler.resetForm() ----------------------------- check scope...");
    console.log(scope);
    $('form[name=' + formName + '], form[name=' + formName + '] .ng-dirty').removeClass('ng-dirty').addClass('ng-pristine');
    var form = scope[formName];
    form.$dirty = false;
    form.$pristine = true;
    for(var field in form) {
      if(angular.isDefined(form[field])){
        if(form[field].$pristine === false) {
          form[field].$pristine = true;
        }
        if(form[field].$dirty === true) {
          form[field].$dirty = false;
        }
      }
    }
    
    for(var d in defaults) {
      scope[d] = defaults[d];
    }
};