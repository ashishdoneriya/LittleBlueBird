
function NewEventCtrl($rootScope, $scope) {

  $scope.back = function() {
    $rootScope.addmethod = 'fromanotherevent';
  }
  
  $scope.clicklbbuser = function(index, person, people) {
    if(angular.isDefined(person.selected)) {
      delete person.selected;
      for(var i=0; i < $rootScope.selectedpeople.length; i++) {
        if($rootScope.selectedpeople[i].id == person.id) {
          $rootScope.selectedpeople.splice(i, 1);
          break;
        }
      }
    }
    else {
      person.selected = true; 
      $rootScope.selectedpeople.push(person);
    }
    console.log($rootScope.selectedpeople);
  }
  
  $scope.selectAllParticipants = function(people) {
    delete $rootScope.selectedpeople;
    $rootScope.selectedpeople = [];
    for(var i=0; i < people.length; i++) {
      people[i].selected = true;
      $rootScope.selectedpeople.push(people[i]);
    }
  }
  
  $scope.addSelectedPeople = function(circle) {
    $rootScope.addmethod = 'fromanotherevent';
    if(!angular.isDefined(circle.participants.both)) {
      circle.participants.both = [];
    }
    for(var i=0; i < $rootScope.selectedpeople.length; i++) {
      //////////////////////////////////////////////////
      // ADD TO 'both'
      // make sure the person isn't already in 'both'
      var inboth = false;
      for(var j=0; j < circle.participants.both.length; j++) {
        if(circle.participants.both[j].id == $rootScope.selectedpeople[i].id) {
          inboth = true;
          break;
        }
      } 
      if(!inboth) {
        circle.participants.both.push($rootScope.selectedpeople[i]);
        console.log("ADDED TO 'both': $rootScope.selectedpeople["+i+"]....");
        console.log($rootScope.selectedpeople[i]);
      }
      
      //////////////////////////////////////////////////
      // ADD TO 'givers'
      if($rootScope.participationLevel == 'Giver') {
        // make sure the person isn't already in 'givers'
        var ingivers = false;
        for(var j=0; j < circle.participants.givers.length; j++) {
          if(circle.participants.givers[j].id == $rootScope.selectedpeople[i].id) {
            ingivers = true;
            break;
          }
        } 
        if(!ingivers) {
          circle.participants.givers.push($rootScope.selectedpeople[i]);
          console.log("ADDED TO 'givers': $rootScope.selectedpeople["+i+"]....");
          console.log($rootScope.selectedpeople[i]);
        }
      }
      
      //////////////////////////////////////////////////
      // ADD TO 'receivers'
      else {
        // NO LIMIT OR LIMIT NOT YET REACHED
        if(circle.receiverLimit == -1 || circle.participants.receivers.length < circle.receiverLimit) {
          // make sure the person isn't already in 'receivers'
          var inreceivers = false;
          for(var j=0; j < circle.participants.receivers.length; j++) {
            if(circle.participants.receivers[j].id == $rootScope.selectedpeople[i].id) {
              inreceivers = true;
              break;
            }
          } 
          if(!inreceivers) {
            circle.participants.receivers.push($rootScope.selectedpeople[i]);
            console.log("ADDED TO 'receivers': $rootScope.selectedpeople["+i+"]....");
            console.log($rootScope.selectedpeople[i]);
          }
        } // NO LIMIT OR LIMIT NOT YET REACHED

        //////////////////////////////////////////////////////////////////////
        // IN THIS CASE, THE RECEIVER LIMIT HAS BEEN REACHED, SO EVEN THOUGH WE SELECTED participationLevel 'Receiver',
        // THIS PERSON/THESE PEOPLE ARE GOING TO BE ADDED AS Givers INSTEAD.
        else {
          var ingivers = false;
          for(var j=0; j < circle.participants.givers.length; j++) {
            if(circle.participants.givers[j].id == $rootScope.selectedpeople[i].id) {
              ingivers = true;
              break;
            }
          } 
          if(!ingivers) {
            circle.participants.givers.push($rootScope.selectedpeople[i]);
            console.log("ADDED TO 'givers': $rootScope.selectedpeople["+i+"]....");
            console.log($rootScope.selectedpeople[i]);
          }

        } 
        // IN THIS CASE, THE RECEIVER LIMIT HAS BEEN REACHED, SO EVEN THOUGH WE SELECTED participationLevel 'Receiver',
        // THIS PERSON/THESE PEOPLE ARE GOING TO BE ADDED AS Givers INSTEAD. 
        //////////////////////////////////////////////////////////////////////       
      }
    }
  }

}

function EventsCtrl($rootScope, $scope, Circle, Reminder, $location) {

  
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      console.log("EventsCtrl: routeChangeSuccess ----------------------------- doing nothing");
      $rootScope.determineCurrentCircle(newRoute);
    }
  );
  
  // TODO shouldn't need this anymore.  Look at app-CircleModule:EventHelper. It's a global function that captures the event type and how many receivers are allowed.
  $scope.getType = function() {return Circle.circleType;}

  // NOT USED ANYMORE?  REPLACING THIS FUNCTION WITH AN <a href> TAG
  $scope.newcircleFunction = function(thetype, limit) {
    $scope.search = '';
    $rootScope.peoplesearchresults = [];
    Circle.circleType = thetype;
    $scope.newcircle = {name:'', creatorId:$rootScope.user.id, receiverLimit:limit, participants:{receivers:[], givers:[]}};
    $scope.circlecopies = angular.copy($rootScope.user.circles);
    $location.url('/newevent/'+thetype+'/'+limit);
  }
    
  $scope.cancelnewcircle = function() {
    $scope.newcircle = {participants:[]};
    delete $rootScope.expdate;
  }
}


function EventCtrl($rootScope, $scope, $route, Circle, CircleParticipant, Reminder) {

  // TODO don't need this anymore.  This is how we kept track of the 3 menu items: Me, Friend, Events - which are going away soon ...maybe
  $rootScope.activeitem = 'events';
  
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      console.log("newRoute.params.circleId="+newRoute.params.circleId);
      $rootScope.determineCurrentCircle(newRoute);
      console.log("EventCtrl: routeChangeSuccess -----------------------------");
      
    }
  );
  
  // edit the $rootScope.circle
  $scope.begineditcircle = function() {
    $rootScope.expdate=$rootScope.circle.dateStr;
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
}