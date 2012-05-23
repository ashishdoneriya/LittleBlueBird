var app = angular.module('project', ['UserModule']).
  config(function($routeProvider){
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html'}}).
      when('/addcircle', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circleform.html'}}).
      when('/circles', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html'}}).
      when('/editgift', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html'}}).
      when('/event/:circleId', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html'}}).
      when('/giftlist', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', one: 'partials/myaccountheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/myaccount.html'}}).
      otherwise({redirectTo: '/login', templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html'}});
  }).run(function($route, $rootScope){    
    $rootScope.$on('$beforeRouteChange', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        $rootScope.templates = newRoute.$route.templates;
        $rootScope.layoutController = newRoute.$route.controller;
    });
    
});

angular.module('UserModule', ['ngResource', 'ngCookies']).
  factory('User', function($resource) {
      var User = $resource('/lbb/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('Circle', function($resource) {
      var Circle = $resource('/lbb/circles/:circleId', {circleId:'@circleId', userId:'@userId'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });

      return Circle;
  }).
  factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/lbb/circleparticipants/:circleId', {circleId:'@circleId'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/lbb/gifts/:giftId', {giftId:'@giftId', viewerId:'@viewerId', circleId:'@circleId', recipientId:'@recipientId', description:'@description', url:'@url', receivers:'@receivers', addedby:'@addedby', circle:'@circle'}, 
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
        controller: CurrentCtrl,
        scope: { btnText:'bind' },
        templateUrl: 'templates/ddbtn-user.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  });

  
 
function MyAccountCtrl( $rootScope, $scope, $cookieStore, User ) {
 
  $scope.save = function(user) {
    $scope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    $cookieStore.put("user", $scope.user);
                                    $cookieStore.put("showUser", $scope.user);
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  if(!angular.isDefined($scope.user)) {
    $scope.user = $cookieStore.get("user");
  }
  
}



function CurrentCtrl($rootScope, $scope, $cookieStore, User, Circle, Gift) {
  
  // "my wish list" call
  $scope.mywishlist = function() {
    alert("$scope.mywishlist");
    gifts = Gift.query({viewerId:$cookieStore.get("user").id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true; 
                              $cookieStore.put("showUser", $cookieStore.get("user")); 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+$cookieStore.get("user").first+"'s list\n  Try again");});
  }

  $rootScope.$on("userchange", function(event) {
    $scope.showUser = $cookieStore.get("showUser");
    $scope.user = $cookieStore.get("user");
  });

  $rootScope.$on("circlechange", function(event) {
    $scope.circle = Circle.currentCircle;
    $scope.gifts = Circle.gifts;
  });
  
  $scope.isExpired = function() { 
    if(!angular.isDefined($scope.circle)) return false;
    return $scope.circle.date < new Date().getTime(); 
  }

  $scope.user = $cookieStore.get("user");
  $scope.showUser = $cookieStore.get("showUser");
  $scope.circle = Circle.currentCircle;
  
  $scope.editgift = function(gift) {
    gift.editing = true;
    $scope.gift = gift;
    $scope.giftorig = angular.copy(gift);
  }
  
  $scope.canceleditgift = function(gift) {
    gift.editing=false;
    $scope.gift.description = $scope.giftorig.description;
    $scope.gift.url = $scope.giftorig.url;
  }
  
  $scope.savegift = function(gift) {
    gift.adding = false;
    gift.editing = false;
    gift.canedit = true;
    Gift.save({giftId:gift.id, description:gift.description, url:gift.url, receivers:$scope.circle.participants.receivers, addedby:$scope.user.id, circle:$scope.circle.id},
              function() {$scope.gifts.reverse();$scope.gifts.push(gift);$scope.gifts.reverse();});
  }
}


function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, Circle, Gift, CircleParticipant, $log) { 
  $scope.user = $cookieStore.get("user");
  
  $scope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
  
  $scope.isExpired = function() { 
    return $scope.circle.date < new Date().getTime(); 
  }
  
  $scope.currentCircle = function() { 
    return Circle.currentCircle; //$cookieStore.get("currentCircle"); 
  }
  
  $scope.makeActive = function(circle) {
    Circle.currentCircle = circle;
    Circle.currentCircle.isExpired = circle.date < new Date();
    $rootScope.$emit("circlechange");
  }

  $rootScope.$on("circlechange", function(event) {
    //$scope.circle = Circle.currentCircle;
    //$scope.gifts = Circle.gifts;
  });

  $rootScope.$on("userchange", function(event) {
    //$scope.user = $cookieStore.get("user");
  });
  
  $scope.activeOrNot = function(circle) {
    if(!angular.isDefined(circle) || !angular.isDefined(Circle.currentCircle))
      return false;
    return circle.id == Circle.currentCircle.id ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id});
  }
  
  $scope.giftlist = function(circle, participant) {
    gifts = Gift.query({viewerId:$cookieStore.get("user").id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.currentCircle = circle;
                              if($cookieStore.get("user").id == participant.id) { Circle.gifts.mylist=true; } else { Circle.gifts.mylist=false; } 
                              $cookieStore.put("showUser", participant); 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again");});
  }
  
}

function UserCtrl($location, $cookieStore, $scope, User, Gift, CircleParticipant) {
  
  $scope.save = function(user) {
    var currentUser = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                    $cookieStore.put("user", currentUser);
                                    $cookieStore.put("showUser", currentUser);
                                  }
                                );
  }
  
  $scope.user = $cookieStore.get("user");
  
  $scope.isUsernameUnique = function(user, form) {
    if(!angular.isDefined(user.username)) 
      return;
    checkUsers = User.query({username:user.username}, 
                                        function() {
                                          if(checkUsers.length > 0) { form.username.$error.taken = 'true'; }
                                          else { form.username.$error.taken = 'false'; }
                                        });
  } 
  
  $scope.logout = function() {
    $cookieStore.remove("user");
    $cookieStore.remove("currentCircle");
  }
}

function LoginCtrl($rootScope, $cookieStore, $scope, $location, User, Circle, CircleParticipant) { 
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || ! angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      return;
    }
    
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           $location.url('myaccount'); 
                                           if($scope.users[0].dateOfBirth == 0) { $scope.users[0].dateOfBirth = ''; }                                           
                                           $cookieStore.put("user", $scope.users[0]);                                          
                                           $cookieStore.put("showUser", $scope.users[0]);
                                           $rootScope.$emit("userchange");
                                           //for(i=0; i < $scope.users[0].circles.length; i++) {
                                           //  $scope.users[0].circles[i].participants = CircleParticipant.query({circleId:$scope.users[0].circles[i].id});
                                           //}
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  
}

  