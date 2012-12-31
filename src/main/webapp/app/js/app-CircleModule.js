
angular.module('CircleModule', [])
.factory('Circle', function($resource) {
      var Circle = $resource('/gf/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
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
      var CircleParticipant = $resource('/gf/circleparticipants/:circleId', {circleId:'@circleId', userId:'@userId', inviterId:'@inviterId', 
                                         participationLevel:'@participationLevel', who:'@who', email:'@email', circle:'@circle', adder:'@adder',
                                         notifyonaddtoevent:'@notifyonaddtoevent'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  })
.run(function($rootScope, $location, Circle, CircleParticipant, Reminder, UserSearch, Gift) {

  // define $rootScope functions here to make them globally available
  
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
  
  // also referenced from events.html
  $rootScope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id}, 
                                                  function() {
                                                    // $rootScope.giftlist(circle, circle.participants.receivers[0]);
                                                  });
  }
  
  
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
  
  
  // don't have to pass circle in; it's $rootScope.circle
  $rootScope.updatecirclename = function() {
    console.log("CircleModule: updatecirclename !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    Circle.save({circleId:$rootScope.circle.id, name:$rootScope.circle.name});
  }
  
  // don't have to pass circle in; it's $rootScope.circle
  // similar to $scope.savecircle() in app-CircleCtrl
  $rootScope.updatecircledate = function(expdate) {
    $rootScope.circle.expirationdate = new Date(expdate);
    $rootScope.circle = Circle.save({circleId:$rootScope.circle.id, expirationdate:$rootScope.circle.expirationdate.getTime()});
  }
  
  $rootScope.begineditcircledate = function(expdate) {
    $rootScope.expdate=$rootScope.circle.dateStr
  }
  
    
});