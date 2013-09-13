
function NewEventCtrl($rootScope, $scope) {

  $scope.back = function(addmethod) {
    $rootScope.addmethod = addmethod;
  }
  
  // TODO duplicated code! Why is this same code also in app-FriendCtrl.js ?
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
  
  // 2/12/13
  $scope.selectAllParticipants = function(people) {
    delete $rootScope.selectedpeople;
    $rootScope.selectedpeople = [];
    for(var i=0; i < people.length; i++) {
      people[i].selected = true;
      $rootScope.selectedpeople.push(people[i]);
    }
  }
  
  // 2/12/13
  $scope.addSelectedPeople = function(circle) {
    $rootScope.addmethod = 'fromanotherevent';
    if(!angular.isDefined(circle.participants.both)) {
      circle.participants.both = [];
    }
    for(var i=0; i < $rootScope.selectedpeople.length; i++) {
      $rootScope.addparticipant(-1, $rootScope.selectedpeople[i], circle, $rootScope.participationLevel);
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
}


function EventCtrl($rootScope, $scope, $route, Circle, CircleParticipant, Reminder) {

  // TODO don't need this anymore.  This is how we kept track of the 3 menu items: Me, Friend, Events - which are going away soon ...maybe
  $rootScope.activeitem = 'events';
  
  $scope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      if(!newRoute)
        return
      console.log("newRoute.params.circleId="+newRoute.params.circleId);
      $rootScope.determineCurrentCircle(newRoute);
      console.log("EventCtrl: routeChangeSuccess -----------------------------");
      
    }
  );
}