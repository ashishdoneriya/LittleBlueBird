
function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, UserSearch, Circle, Gift, CircleParticipant, Reminder, $route) {              
               
  // ugly hack - set fields in the Create Account form so the outer circleForm will pass validation in the USUAL event
  // that the user doesn't try to create an account on the fly.  If the user DOES try to create an account on the fly,
  // we will set newuser = {}
  $scope.newuserstub = {fullname:' ', email:'a@a.com', username:new Date().getTime()+'', password:' ', passwordAgain:' '};
  $scope.newuser = $scope.newuserstub;
  
  if(angular.isDefined(Circle.currentCircle)) {
    $scope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    $scope.circle = Circle.query({circleId:$route.current.params.circleId}, function() {Circle.currentCircle = $scope.circle;}, function() {alert("Could not find Event "+$route.current.params.circleId);})
  }
  
  
  $scope.addreminder = function() {
    var remind_date = new Date($scope.remdate).getTime();
    var people = [];
    for(var i=0; i < $scope.circle.participants.receivers.length; i++) {
      var p = $scope.circle.participants.receivers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $scope.circle.reminders.length; j++) {
          var rem = $scope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    for(var i=0; i < $scope.circle.participants.givers.length; i++) {
      var p = $scope.circle.participants.givers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $scope.circle.reminders.length; j++) {
          var rem = $scope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    
    for(var i=0; i < $scope.circle.participants.receivers.length; i++) {
      $scope.circle.participants.receivers[i].checked = false;
    }
    for(var i=0; i < $scope.circle.participants.givers.length; i++) {
      $scope.circle.participants.givers[i].checked = false;
    }
    
    $scope.remdate = '';
    
    if(people.length == 0) return;
    
    var reminders = Reminder.save({circleId:$scope.circle.id, remind_date:remind_date, people:people}, 
                                   function(){$scope.circle.reminders = reminders;}, 
                                   function(){alert("Uh Oh!\nHad a problem updating the reminders")});
  }
  
  
  $scope.removereminder = function(reminder, index) {
    $scope.circle.reminders.splice(index, 1)
    Reminder.delete({circleId:$scope.circle.id, userId:reminder.person.id, remind_date:reminder.remind_date});
  }
    
  
  $scope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
    
  $scope.beginnewuser = function() {
    $scope.addmethod = 'createaccount';
    $scope.newuser = {};
  }
  
  $scope.cancelnewuser = function() {
    $scope.addmethod = 'byname';
    $scope.usersearch = ''; 
    $scope.search = '';
    $scope.newuser = {};
  }
  
  $scope.createonthefly = function(newuser, thecircle) {
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                                  function() {$scope.addparticipant2(anewuser, thecircle); $scope.addmethod = 'byname'; $scope.usersearch = ''; $scope.search = '';}
                                );
  }
  
  $scope.isExpired = function() { 
    return angular.isDefined($scope.circle) && $scope.circle.date < new Date().getTime(); 
  }
  
  $scope.nocircle = function() {
    return !angular.isDefined($scope.circle);
  }
  
  $scope.currentCircle = function() { 
    return Circle.currentCircle;
  }
  
  $scope.makeActive = function(index, circle) {
    circle.index = index; // for deleting
    Circle.currentCircle = circle;
    Circle.currentCircle.isExpired = circle.date < new Date();
    $rootScope.$emit("circlechange");
  }

  $rootScope.$on("circlechange", function(event) {
    $scope.circle = Circle.currentCircle;
    $scope.gifts = Circle.gifts;
  });

  $rootScope.$on("userchange", function(event) {
    $rootScope.user = User.currentUser;
  });

  //$rootScope.$on("usersearchresults", function(event) {
  //  $scope.people = UserSearch.results;
  //});
  
  $scope.usersearch = '';
  $scope.people = [];
  
  $scope.query = function() {
    $scope.usersearch = 'loading';
    var lbbpeople = UserSearch.query({search:$scope.search}, 
                      function() {
                        $scope.usersearch = 'loaded'; 
                        $scope.people.splice(0, $scope.people.length); // effectively refreshes the people list
                        
                        // uncomment for facebook integration
                        //for(var i=0; i < $rootScope.user.friends.length; i++) {
                        //  if(!lbbNamesContainFbName(lbbpeople, $rootScope.user.friends[i].fullname))
                        //    $scope.people.push($rootScope.user.friends[i]);
                        //}
                        for(var i=0; i < lbbpeople.length; i++) {
                          $scope.people.push(lbbpeople[i]);
                        }
                        $scope.noonefound = $scope.people.length==0 ? true : false; 
                      }, 
                      function() {$scope.people.splice(0, $scope.people.length);$scope.usersearch = '';});
  }
  
         
  // helper function:  If there's overlap between the LBB users and FB friends, we want to know
  // about it.  Use the LBB user and ignore the FB user.  In the future, we'll want to add to the person table: facebook id
  // so we can tell for sure if the LBB 'Eric Moore' equals the FB 'Eric Moore'       
  function lbbNamesContainFbName(lbbnames, fbname) {
    for(var i=0; i < lbbnames.length; i++) {
      var convertedFbName = fbNameToLbbName(fbname);
      var lbbfullname = lbbnames[i].first + " " + lbbnames[i].last;
      if(lbbfullname == convertedFbName)
        return true;
    }
    return false;
  }
  
  function fbNameToLbbName(fbname) {
    var n = fbname.split(" ");
    var first = n[0];
    var last = n.length == 2 ? n[1] : n[2];
    return first + " " + last;
  }
  
  $scope.activeOrNot = function(circle) {
    if(!angular.isDefined(circle) || !angular.isDefined(Circle.currentCircle))
      return false;
    return circle.id == Circle.currentCircle.id ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id}, 
                                                  function() {$scope.giftlist(circle, circle.participants.receivers[0]);});
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
                   User.currentUser=$rootScope.user; 
                   $rootScope.$emit("userchange");
                 } 
               );
    console.log("end of $scope.savecircle()");
  }
  
  $scope.newcircleFunction = function(thetype, limit) {
    $scope.search = '';
    $scope.people = {};
    Circle.circleType = thetype;
    $location.url($location.path());
    $scope.newcircle = {name:'', creatorId:$rootScope.user.id, receiverLimit:limit, participants:{receivers:[], givers:[]}};
    $scope.circlecopies = angular.copy($rootScope.user.circles);
  }
  
  $scope.editcircleFunction = function(circle) {
    $scope.thecircle = circle;
    $scope.expdate = circle.dateStr;
    for(var i=0; i < $scope.thecircle.participants.receivers.length; i++) {
      console.log($scope.circle.participants.receivers[i]);
    }
    $scope.circlecopies = angular.copy($rootScope.user.circles);
  }
  
  // TODO add reminder
  $scope.addmyselfasreceiver = function(circle) {
    $scope.participationlevel = 'Receiver'
    $scope.addparticipant2($rootScope.user, circle)
    //circle.participants.receivers.push($rootScope.user);
  }
  
  // TODO add reminder
  $scope.addmyselfasgiver = function(circle) {
    $scope.participationlevel = 'Giver'
    $scope.addparticipant2($rootScope.user, circle)
    //circle.participants.givers.push($rootScope.user);
  }
  
  $scope.getType = function() {return Circle.circleType;}
  
  $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0',
        dateFormat : 'mm/dd/yy'
    };
    
  $scope.cancelnewcircle = function() {
    $scope.circle = {participants:[]};
    $scope.expdate = undefined;
  }
    
  $scope.addparticipant = function(index, person, circle) {
    //alert("$scope.addparticipant:  person.first="+person.first);
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    if($scope.participationlevel == 'Giver')
      circle.participants.givers.push(person);
    else circle.participants.receivers.push(person);
    
    if(index != -1) {
      console.log("index = "+index);
      $scope.people[index].hide = true;
    }
    
    // if the circle already exists, add the participant to the db immediately
    if(angular.isDefined(circle.id)) {
      //alert("circle.id="+circle.id+"\n $scope.participationlevel="+$scope.participationlevel);
      var newcp = CircleParticipant.save({circleId:circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:$scope.participationlevel,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:circle.name, adder:$rootScope.user.fullname},
                                         function() {$scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})});
    }
  }
    
  // when you're creating a new user and then immediately adding them to the circle
  $scope.addparticipant2 = function(person, circle) {
    $scope.addparticipant(-1, person, circle);
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
  
  $scope.canaddreceiver = function(circle) {
    var isdefined = angular.isDefined(circle) && angular.isDefined(circle.receiverLimit) && angular.isDefined(circle.participants.receivers)
    return isdefined && (circle.receiverLimit == -1 || circle.receiverLimit > circle.participants.receivers.length);
  }
  
  $scope.removereceiver = function(index, circle, participant) {
    circle.participants.receivers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  $scope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
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
  
  // TODO delete reminders
  $scope.deletecircle = function(circle, index) {
    Circle.save({circleId:circle.id, datedeleted:new Date().getTime()},
                function() {$rootScope.user.circles.splice(index, 1); 
                            User.currentUser=$rootScope.user; 
                            if($rootScope.user.circles.length > 0) {circle = $rootScope.user.circles[0]; Circle.currentCircle = $rootScope.user.circles[0];}
                            else {circle = {}; Circle.currentCircle = {};}
                            $rootScope.$emit("userchange"); 
                            $rootScope.$emit("circlechange");});
                
    $location.url($location.path());
  }
  
  // duplicated in app-FriendCtrl.js
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
  }
  
}