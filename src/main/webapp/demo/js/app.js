// Create a new module
angular.module('project', ['UserModule']).
  config(function($routeProvider){
    $routeProvider.
      when('/giftlist', {template: 'partials/giftlist.html'}).
      when('/circledetails', {template: 'partials/circledetails.html'}).
      when('/login', {template: 'partials/login.html', controller: LoginCtrl}).
      when('/register', {template: 'partials/register.html', controller: UserCtrl}).
      otherwise({redirectTo: '/login', template: 'partials/login.html', controller: LoginCtrl});
  })
  
angular.module('UserModule', ['ngResource', 'ngCookies']).
  factory('User', function($resource) {
      var User = $resource('/api/users/:userId', {userId:'@id', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('Circle', function($resource) {
      var Circle = $resource('/api/circles/:circleId', {circleId:'@id', userId:'@userId'}, 
                    {
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });

      return Circle;
  }).
  factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/api/circleparticipants/:circleId', {circleId:'@id'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/api/gifts/:giftId', {giftId:'@id', viewerId:'@viewerId', circleId:'@circleId', recipientId:'@recipientId'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      save: {method:'POST'}
                    });

      return Gift;
  });
  
  
  
//  .directive('input', function() {
//    return {
//        restrict: 'E',
//        require: 'ngModel',
//        link: function(scope, elm, attr, ngModelCtrl) {
//            if (attr.type === 'radio' || attr.type === 'checkbox') return;
//            
//            elm.unbind('input').unbind('keydown').unbind('change');
//            elm.bind('blur', function() {
//                scope.$apply(function() {
//                    ngModelCtrl.$setViewValue(elm.val());
//                });         
//            });
//        }
//    };
//  });
// override the default input to update on blur



function UserCtrl($location, $cookies, $cookieStore, $scope, User, Gift, CircleParticipant) { 
  $scope.save = function(user) {
    alert("user.first = "+user.first);
    User.save({first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth});
    $scope.users = User.query();
  }
  
  $scope.askProfilePic = function(user) {
    alert("askProfilePic");
    $('#profilePicModal').modal('hide');
  }
  
  $scope.user = function() {
    var x;
    if(angular.isDefined(User.currentUser)) {
      return User.currentUser
    }
    else if(angular.isDefined($cookieStore.get("user"))) {
      $scope.currentUser = User.find({userId:$cookieStore.get("user").id}, 
                      function() {User.currentUser=$scope.currentUser;} );
      return User.currentUser
    }
    else {
      return x;
    }
  }  
  
  $scope.toggleCircle = function(circle) {
    return angular.isDefined(circle.show) ? circle.show=!circle.show : circle.show=true;
  } 
  
  $scope.shouldShow = function(circle) {
    return circle.show;
  }
  
  $scope.activeCircle = function() { return User.currentCircle; }
  
  $scope.makeActive = function(circle) {
    User.currentCircle = circle;
  }
  
  $scope.activeOrNot = function(circle) {
    return User.currentCircle.id == circle.id ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    var participants = CircleParticipant.query({circleId:circle.id}, function() {circle.participants = participants;});
  }
  
  $scope.giftlist = function(circle, participant) {
    User.currentCircle.gifts = Gift.query({viewerId:User.currentUser.id, circleId:circle.id, recipientId:participant.id});
  }
  
  $scope.gifts = function() {return User.currentCircle.gifts;}
  
  $scope.circleDetails = function(circle) {
    $location.url('circledetails')
  }
    
    $('#invalidpass').popover(); 
    $('#invalidpassagain').popover();    
    $('#emailrequired').popover();   
    $('#emailinvalid').popover();
    $('#invalidusername').popover();
    $('#passwordsdontmatch').popover();
    $('#invaliddob').popover();
    $('#invalidprofilepic').popover();
    $('#invalidform').popover();
    $('.dropdown-toggle').dropdown();
} 


function LoginCtrl($cookies, $cookieStore, $scope, $location, User, Circle) {
  
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.tryagain=''; 
                                           $location.url('giftlist'); 
                                           User.currentUser = $scope.users[0];
                                           $cookieStore.put("user", User.currentUser);
                                           $cookies.userId = $scope.users[0].id; 
                                           
                                           
                                           }, 
                               function() {$scope.tryagain='try again';}  );
  }
  
  $scope.logout = function() {
    var x;
    User.currentUser = x; 
    $cookies.userId = x;
  }
  
  $scope.isLoggedIn = function() {
    return angular.isDefined($cookies.userId);
  }
  
  $scope.makeActive = function(descr) {
    $scope.activeLink = descr;
  }
  
  $scope.activeOrNot = function(descr) {
    return $scope.activeLink == descr ? "active" : "";
  }
  
}

