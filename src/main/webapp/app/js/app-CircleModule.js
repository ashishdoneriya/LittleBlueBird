
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
.run(function($rootScope, Circle) {

    // define $rootScope functions here to make them globally available
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
      console.log("CircleModule: rootScope.isExpired(): "+isexpired+" --------------------------------");
      return isexpired; 
    }
    
  });