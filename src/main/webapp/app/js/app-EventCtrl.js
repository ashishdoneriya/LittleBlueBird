
function EventsCtrl($rootScope, $scope, Circle, Reminder) {

  
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      console.log("EventsCtrl: routeChangeSuccess ----------------------------- doing nothing");
    }
  );
  
  $scope.getType = function() {return Circle.circleType;}

  
  $scope.newcircleFunction = function(thetype, limit) {
    $scope.search = '';
    $rootScope.peoplesearchresults = [];
    Circle.circleType = thetype;
    $scope.newcircle = {name:'', creatorId:$rootScope.user.id, receiverLimit:limit, participants:{receivers:[], givers:[]}};
    $scope.circlecopies = angular.copy($rootScope.user.circles);
  }
    
  $scope.cancelnewcircle = function() {
    $scope.newcircle = {participants:[]};
    delete $rootScope.expdate;
  }
 
  $scope.savecircle = function(circle, expdate) {
    console.log("expdate = "+expdate);
    circle.expirationdate = new Date(expdate);
    console.log("circle.expirationdate.getTime() = "+circle.expirationdate.getTime());
    var savedcircle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:Circle.circleType, 
                 participants:circle.participants, creatorId:circle.creatorId},
                 function() {
                   if(!angular.isDefined(circle.id))
                     $rootScope.user.circles.push(savedcircle); 
                 } 
               );
    console.log("end of $scope.savecircle()");
  }
  
  // when you're creating a new user and then immediately adding them to the circle
  $scope.addparticipant2 = function(person, circle, participationlevel) {
    $scope.addparticipant(-1, person, circle, participationlevel);
  }
  
  // add all the participants in the 'fromcircle' to the 'tocircle'
  $scope.addparticipants = function(fromcircle, tocircle) {
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
    
  $scope.beginnewuser = function() {
    $scope.addmethod = 'createaccount';
    $scope.newuser = {};
    console.log("app-EventCtrl:  beginnewuser:  $scope.addmethod="+$scope.addmethod);
  } 
  
  // TODO add reminder
  $scope.addmyselfasgiver = function(circle) {
    $scope.addparticipant2($rootScope.user, circle, 'Giver')
    // if 'you' happen to be a 'receiver', remove yourself from 'receivers'...
    for(var i=0; i < circle.participants.receivers.length; i++) {
      if(circle.participants.receivers[i].id == $rootScope.user.id)
        circle.participants.receivers.splice(i, 1);
    }
  }
  
  // TODO add reminder
  $scope.addmyselfasreceiver = function(circle) {
    $scope.addparticipant2($rootScope.user, circle, 'Receiver');
    // if 'you' happen to be a 'giver', remove yourself from 'givers'...
    for(var i=0; i < circle.participants.givers.length; i++) {
      if(circle.participants.givers[i].id == $rootScope.user.id)
        circle.participants.givers.splice(i, 1);
    }
  }
}


function EventCtrl($rootScope, $scope, $route, Circle, CircleParticipant, Reminder) {

  // TODO don't need this anymore.  This is how we kept track of the 3 menu items: Me, Friend, Events - which are going away soon ...maybe
  $rootScope.activeitem = 'events';
  
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      // Create a render() function and put the stuff below in that
      //render();
      console.log("newRoute.params.circleId="+newRoute.params.circleId);
      if(angular.isDefined(newRoute.params.circleId)) {
        for(var i=0; i < $rootScope.user.circles.length; i++) {
          if($rootScope.user.circles[i].id == newRoute.params.circleId) {
            $rootScope.circle = $rootScope.user.circles[i];
            $rootScope.circle.participants = CircleParticipant.query({circleId:$rootScope.circle.id}, 
	            function() {
	                console.log("app-EventCtrl: routeChangeSuccess:  $rootScope.circle.participants.....");
	                console.log($rootScope.circle.participants);
	                console.log("app-EventCtrl: routeChangeSuccess:  $rootScope.circle.participants.receivers.....");
	                console.log($rootScope.circle.participants.receivers);
	            
                    // THIS IS KINDA DUMB...
			        // the only reason that I'm combining the givers and receivers here is so that I can 
			        // tell where the last row is on event.html  Otherwise, all I know is that I have a collection
			        // of givers and another collection of receivers and I can only tell where the last row 
			        // of each group is.
			        $rootScope.circle.participants.both = [];
			        for(var i=0; i < $rootScope.circle.participants.receivers.length; i++) {
			          var p = $rootScope.circle.participants.receivers[i];
			          p.isReceiver = true;
			          $rootScope.circle.participants.both.push(p);
			        }
			        for(var i=0; i < $rootScope.circle.participants.givers.length; i++) {
			          var p = $rootScope.circle.participants.givers[i];
			          p.isGiver = true;
			          $rootScope.circle.participants.both.push(p);
			        }
	                console.log("app-EventCtrl: routeChangeSuccess:  $rootScope.circle.participants.both.....");
	                console.log($rootScope.circle.participants.both);
	                
	            } // success function of CircleParticipant.query
	        ); // CircleParticipant.query
            
            
            
          } // if($rootScope.user.circles[i].id == newRoute.params.circleId)
        } // for(var i=0; i < $rootScope.user.circles.length; i++)
      } // if(angular.isDefined(newRoute.params.circleId))
      
      console.log("EventCtrl: routeChangeSuccess -----------------------------");
      
    }
  );
  
  // edit the $rootScope.circle
  $scope.begineditcircle = function() {
    $rootScope.expdate=$rootScope.circle.dateStr;
  }
    
  $scope.canaddreceiver = function(circle) {
    var isdefined = angular.isDefined(circle) && angular.isDefined(circle.receiverLimit) && angular.isDefined(circle.participants.receivers)
    return isdefined && (circle.receiverLimit == -1 || circle.receiverLimit > circle.participants.receivers.length);
  }
  
  // TODO add reminder
  $scope.addmyselfasreceiver = function(circle) {
    $scope.addparticipant2($rootScope.user, circle, 'Receiver');
    // if 'you' happen to be a 'giver', remove yourself from 'givers'...
    for(var i=0; i < circle.participants.givers.length; i++) {
      if(circle.participants.givers[i].id == $rootScope.user.id)
        circle.participants.givers.splice(i, 1);
    }
  }
    
  $scope.addparticipant_4ARGROOTSCOPEVERSIONSHOULDBEGETTINGCALLED = function(index, person, participationlevel) {
    console.log("$scope.addparticipant = function(index, person, participationlevel):  participationlevel="+participationlevel);
    var level = participationlevel;
    if(participationlevel == 'Giver') {
      $rootScope.circle.participants.givers.push(person);
      level = 'Giver';
    }
    else if($scope.canaddreceiver($rootScope.circle)) {
      $rootScope.circle.participants.receivers.push(person);
      level = 'Receiver';
    }
    else {
      $rootScope.circle.participants.givers.push(person);
      level = 'Giver';
    }
    
    if(index != -1) {
      console.log("index = "+index);
      $rootScope.peoplesearchresults[index].hide = true;
    }
    
    // if the circle already exists, add the participant to the db immediately
    if(angular.isDefined($rootScope.circle.id)) {
      console.log("$scope.addparticipant:  $rootScope.user.id="+$rootScope.user.id);
      var newcp = CircleParticipant.save({circleId:$rootScope.circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:level,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:$rootScope.circle.name, 
                                         adder:$rootScope.user.fullname},
                                         function() {$rootScope.circle.reminders = Reminder.query({circleId:$rootScope.circle.id})});
    }
  }
  
  // TODO add reminder
  $scope.addmyselfasgiver = function(circle) {
    $scope.addparticipant2($rootScope.user, circle, 'Giver')
    // if 'you' happen to be a 'receiver', remove yourself from 'receivers'...
    for(var i=0; i < circle.participants.receivers.length; i++) {
      if(circle.participants.receivers[i].id == $rootScope.user.id)
        circle.participants.receivers.splice(i, 1);
    }
  }
}