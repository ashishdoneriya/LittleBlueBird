
function EditCircleCtrl($rootScope) {
  
}

function MyCircleCtrl($rootScope, $scope, Circle) {
  
  // TODO delete reminders
  $scope.deletecircle = function(index) {
    Circle.save({circleId:$rootScope.circle.id, datedeleted:new Date().getTime()},
                function() {$rootScope.user.circles.splice(index, 1); 
                            if($rootScope.user.circles.length > 0) {$rootScope.circle = $rootScope.user.circles[0];}
                            else {delete $rootScope.circle;}
                            });
                
  }
}

function AddCircleCtrl($rootScope, $scope, Circle, CircleParticipant, UserSearch) {

  
    $scope.usersearch = '';
  
    $scope.query = function(sss) {
      console.log("app-CircleModule: scope.query() -----------------------");
      $scope.usersearch = 'loading';
      $scope.people = UserSearch.query({search:sss}, 
                      function() {
                        $scope.usersearch = 'loaded'; 
                        //$scope.people.splice(0, $scope.people.length); // effectively refreshes the people list
                        
                        // uncomment for facebook integration
                        //for(var i=0; i < $scope.user.friends.length; i++) {
                        //  if(!lbbNamesContainFbName(lbbpeople, $scope.user.friends[i].fullname))
                        //    $scope.people.push($scope.user.friends[i]);
                        //}
                        //for(var i=0; i < lbbpeople.length; i++) {
                        //  $scope.people.push(lbbpeople[i]);
                        //}
                        $scope.noonefound = $scope.people.length==0 ? true : false; 
                        console.log($scope.people);
                      }, 
                      function() {
                        //$scope.people.splice(0, $scope.people.length);
                        $scope.usersearch = '';
                      }
                    );
    };
    
  
  // TODO add reminder
  $scope.addmyselfasgiver = function(circle) {
    $scope.participationlevel = 'Giver'
    $scope.addparticipant2($scope.user, circle)
    //circle.participants.givers.push($scope.user);
  }
    
    
  $scope.addparticipant = function(index, person, circle) {
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
      console.log("$scope.addparticipant:  $scope.user.id="+$scope.user.id);
      var newcp = CircleParticipant.save({circleId:circle.id, inviterId:$scope.user.id, userId:person.id, participationLevel:$scope.participationlevel,
                                         who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:circle.name, adder:$scope.user.fullname},
                                         function() {$scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})});
    }
  }
  
  // when you're creating a new user and then immediately adding them to the circle
  $scope.addparticipant2 = function(person, circle) {
    $scope.addparticipant(-1, person, circle);
  }

  
  $scope.newcircleFunction = function(thetype, limit) {
    $scope.search = '';
    $scope.people = {};
    Circle.circleType = thetype;
    $scope.newcircle = {name:'', creatorId:$rootScope.user.id, receiverLimit:limit, participants:{receivers:[], givers:[]}};
    $scope.circlecopies = angular.copy($rootScope.user.circles);
  }
  
  $scope.getType = function() {return Circle.circleType;}
  
  // TODO add reminder
  $scope.addmyselfasreceiver = function(circle) {
    $scope.participationlevel = 'Receiver'
    $scope.addparticipant2($rootScope.user, circle)
    //circle.participants.receivers.push($rootScope.user);
  }
  
  $scope.removereceiver = function(index, circle, participant) {
    circle.participants.receivers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$rootScope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  $scope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$rootScope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
    
  $scope.beginnewuser = function() {
    $scope.addmethod = 'createaccount';
    $scope.newuser = {};
    console.log("app-CircleCtrl:  AddCircleCtrl: beginnewuser:  $scope.addmethod="+$scope.addmethod);
  }
    
  //$scope.addparticipant = function(index, person, circle) {
  //  //alert("$scope.addparticipant:  person.first="+person.first);
  //  if(!angular.isDefined(circle.participants))
  //    circle.participants = {receivers:[], givers:[]};
  //  if($rootScope.participationlevel == 'Giver')
  //    circle.participants.givers.push(person);
  //  else circle.participants.receivers.push(person);
  //  
  //  if(index != -1) {
  //    console.log("index = "+index);
  //    $scope.people[index].hide = true;
  //  }
  //  
  //  // if the circle already exists, add the participant to the db immediately
  //  if(angular.isDefined(circle.id)) {
  //    //alert("circle.id="+circle.id+"\n $rootScope.participationlevel="+$rootScope.participationlevel);
  //    console.log("$scope.addparticipant:  $rootScope.user.id="+$rootScope.user.id);
  //    var newcp = CircleParticipant.save({circleId:circle.id, inviterId:$rootScope.user.id, userId:person.id, participationLevel:$rootScope.participationlevel,
  //                                       who:person.fullname, notifyonaddtoevent:person.notifyonaddtoevent, email:person.email, circle:circle.name, adder:$rootScope.user.fullname},
  //                                       function() {$rootScope.circle.reminders = Reminder.query({circleId:$rootScope.circle.id})});
  //  }
  //}
    
  // when you're creating a new user and then immediately adding them to the circle
  //$scope.addparticipant2 = function(person, circle) {
  //  $scope.addparticipant(-1, person, circle);
  //}
  
  function removeremindersforperson(person) {
    $rootScope.circle.newreminders = [];
    for(var i=0; i < $rootScope.circle.reminders.length; i++) {
      if($rootScope.circle.reminders[i].viewer != person.id) {
        $rootScope.circle.newreminders.push(angular.copy($rootScope.circle.reminders[i]));
        console.log($rootScope.circle.reminders[i]);
      }
    }
    $rootScope.circle.reminders = angular.copy($rootScope.circle.newreminders);
  }
  
  // duplicated in app-FriendCtrl.js
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
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
    
  $scope.cancelnewcircle = function() {
    $rootScope.circle = {participants:[]};
    $scope.expdate = undefined;
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
                   //User.currentUser=$rootScope.user; 
                   //$rootScope.$emit("userchange"); // commented out on 11/30/12 - experimenting
                 } 
               );
    console.log("end of $scope.savecircle()");
  }
  
}

function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, UserSearch, Circle, Gift, CircleParticipant, Reminder, $route) {              
               
  // ugly hack - set fields in the Create Account form so the outer circleForm will pass validation in the USUAL event
  // that the user doesn't try to create an account on the fly.  If the user DOES try to create an account on the fly,
  // we will set newuser = {}
  $scope.newuserstub = {fullname:' ', email:'a@a.com', username:new Date().getTime()+'', password:' ', passwordAgain:' '};
  $scope.newuser = $scope.newuserstub;
  
  if(angular.isDefined($rootScope.circle)) {}
  else if(angular.isDefined($route.current.params.circleId)) {
    // circleId parm will have a & on the end that needs to be stripped off when coming to someone's 
    // wish list FROM FACEBOOK.  I set $window.location.search to '' in app.js:run()
    // THIS CODE IS DUPLICATED IN app-GiftCtrl:Gift2Ctrl
    var circleId = $route.current.params.circleId
    if(circleId.substring(circleId.length - 1 == '&')) circleId = circleId.substring(0, circleId.length-1)
    $rootScope.circle = Circle.query({circleId:circleId}, function() {console.log("app-CircleCtrl: $rootScope.circle....");console.log($rootScope.circle);}, function() {alert("Could not find Event "+circleId);})
  }
  
  $scope.nocircle = function() {
    return !angular.isDefined($rootScope.circle);
  }
  
  $scope.reminders = function(circle) { 
    $rootScope.circle = circle;
    $location.url('/reminders')
  }

  //$rootScope.$on("usersearchresults", function(event) {
  //  $scope.people = UserSearch.results;
  //});
  

         
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
  
  $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0',
        dateFormat : 'mm/dd/yy'
    };
  
  $scope.canaddreceiver = function(circle) {
    var isdefined = angular.isDefined(circle) && angular.isDefined(circle.receiverLimit) && angular.isDefined(circle.participants.receivers)
    return isdefined && (circle.receiverLimit == -1 || circle.receiverLimit > circle.participants.receivers.length);
  }
  
  $scope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$rootScope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  function removeremindersforperson(person) {
    $rootScope.circle.newreminders = [];
    for(var i=0; i < $rootScope.circle.reminders.length; i++) {
      if($rootScope.circle.reminders[i].viewer != person.id) {
        $rootScope.circle.newreminders.push(angular.copy($rootScope.circle.reminders[i]));
        console.log($rootScope.circle.reminders[i]);
      }
    }
    $rootScope.circle.reminders = angular.copy($rootScope.circle.newreminders);
  }
  
}