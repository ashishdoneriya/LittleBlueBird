function ReminderCtrl($rootScope, $scope, Reminder) {

  
  $scope.removereminder = function(reminder, index) {
    $rootScope.circle.reminders.splice(index, 1)
    Reminder.delete({circleId:$rootScope.circle.id, userId:reminder.person.id, remind_date:reminder.remind_date});
  }
  
  
  $scope.addreminder = function() {
    var remind_date = new Date($scope.remdate).getTime();
    var people = [];
    for(var i=0; i < $rootScope.circle.participants.receivers.length; i++) {
      var p = $rootScope.circle.participants.receivers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $rootScope.circle.reminders.length; j++) {
          var rem = $rootScope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    for(var i=0; i < $rootScope.circle.participants.givers.length; i++) {
      var p = $rootScope.circle.participants.givers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $rootScope.circle.reminders.length; j++) {
          var rem = $rootScope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    
    for(var i=0; i < $rootScope.circle.participants.receivers.length; i++) {
      $rootScope.circle.participants.receivers[i].checked = false;
    }
    for(var i=0; i < $rootScope.circle.participants.givers.length; i++) {
      $rootScope.circle.participants.givers[i].checked = false;
    }
    
    $scope.remdate = '';
    
    if(people.length == 0) return;
    
    var reminders = Reminder.save({circleId:$rootScope.circle.id, remind_date:remind_date, people:people}, 
                                   function(){$rootScope.circle.reminders = reminders;}, 
                                   function(){alert("Uh Oh!\nHad a problem updating the reminders")});
  }
  
}