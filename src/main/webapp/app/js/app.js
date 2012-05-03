// Create a new module
angular.module('project', ['UserModule']).
  config(function($routeProvider){
    $routeProvider.
      when('/circledetails', {template: 'partials/layout.html', controller: UserCtrl}).
      when('/giftlist', {template: 'partials/layout.html', controller: UserCtrl}).
      when('/login', {template: 'partials/layout-nlo.html', controller: LoginCtrl}).
      when('/myaccount', {template: 'partials/layout.html', controller: MyAccountCtrl}).
      when('/register', {template: 'partials/register.html', controller: UserCtrl}).
      otherwise({redirectTo: '/login', template: 'partials/login.html', controller: LoginCtrl});
  })
  
angular.module('UserModule', ['ngResource', 'ngCookies']).
  factory('User', function($resource) {
      var User = $resource('/api/users/:userId', {userId:'@id', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio'}, 
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
  })
  .directive('btnEditCircle', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: { },
        templateUrl: 'templates/ddbtn-editcircle.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('btnUser', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: UserCtrl,
        scope: { btnText:'bind' },
        templateUrl: 'templates/ddbtn-user.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  });
  
 
function MyAccountCtrl( $scope, $cookieStore, User ) {
 
  $scope.template = {one: 'partials/circleinfo.html', two: 'menu.html', four: 'partials/myaccount.html'};
  
  $scope.user = function() {
    var x;
    if(angular.isDefined(User.currentUser)) {
      return User.currentUser
    }
    else if(angular.isDefined($cookieStore.get("user"))) {
      $scope.currentUser = User.find({userId:$cookieStore.get("user").id}, 
                      function() {User.currentUser=$scope.currentUser; User.currentUser.passwordAgain=$scope.currentUser.password;} );
      return User.currentUser
    }
    else {
      return x;
    }
  } 
  
}


function UserCtrl($location, $cookieStore, $scope, User, Gift, CircleParticipant) { 
 
  $scope.template = {one: 'partials/circleinfo.html', two: 'menu.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html'};

  $scope.saveOld = function(user) {
    User.save({first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth});
  }

  $scope.save = function(user) {
    User.currentUser = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                    $cookieStore.put("user", User.currentUser);
                                  }
                                );
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
  
  $scope.isUsernameUnique = function(user, form) {
    if(!angular.isDefined(user.username)) 
      return;
    checkUsers = User.query({username:user.username}, 
                                        function() {
                                          if(checkUsers.length > 0) { form.username.$error.taken = 'true'; }
                                          else { form.username.$error.taken = 'false'; }
                                        });
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
    return (angular.isDefined(User.currentUser.id) && User.currentUser.id == circle.id) ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    var participants = CircleParticipant.query({circleId:circle.id}, function() {circle.participants = participants;});
  }
  
  $scope.giftlist = function(circle, participant) {
    User.currentCircle.gifts = Gift.query({viewerId:User.currentUser.id, circleId:circle.id, recipientId:participant.id});
  }
  
  $scope.gifts = function() {
    return (angular.isDefined(User.currentCircle) && angular.isDefined(User.currentCircle.gifts)) ? User.currentCircle.gifts : [];
  }
  
  $scope.circleDetails = function(circle) {
    $location.url('circledetails')
  }
  
  $scope.logout = function() {
    var x;
    User.currentUser = x; 
    $cookieStore.remove("user");
  }
} 


function LoginCtrl($cookieStore, $scope, $location, User, Circle) { 
 
  $scope.templates = [{one: 'partials/login.html', two: 'partials/register.html'}];
  $scope.template = $scope.templates[0];
  
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || ! angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      return;
    }
    
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           $location.url('giftlist'); 
                                           User.currentUser = $scope.users[0];
                                           $cookieStore.put("user", User.currentUser);}, 
                               function() {$scope.loginfail=true;}  );
  }
  
  $scope.isLoggedIn = function() {
    return angular.isDefined($cookieStore.get("user"));
  }
  
  $scope.makeActive = function(descr) {
    $scope.activeLink = descr;
  }
  
  $scope.activeOrNot = function(descr) {
    return $scope.activeLink == descr ? "active" : "";
  }
  
}

