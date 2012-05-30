var app = angular.module('project', ['UserModule', 'angularBootstrap.modal']).
  config(function($routeProvider){
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html'}}).
      when('/circles', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html'}}).
      when('/editgift', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html'}}).
      when('/event/:circleId', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html'}}).
      when('/giftlist', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', one: 'partials/myaccountheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/myaccount.html'}}).
      when('/selectprimaryreceiver', {templates: {layout: 'layout.html', one: 'partials/circleinfo.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/selectprimaryreceiver.html'}}).
      otherwise({redirectTo: '/login', templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html'}});
  }).run(function($route, $rootScope){    
    $rootScope.$on('$beforeRouteChange', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        $rootScope.templates = newRoute.$route.templates;
        $rootScope.layoutController = newRoute.$route.controller;
    });
    
});

angular.module('UserModule', ['ngResource', 'ngCookies', 'ui', 'angularBootstrap.modal']).
  factory('User', function($resource) {
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('UserSearch', function($resource) {
      var UserSearch = $resource('/gf/usersearch', {search:'@search'}, 
                    {
                      query: {method:'GET', isArray:true}
                    });

      return UserSearch;
  }).
  factory('Circle', function($resource) {
      var Circle = $resource('/gf/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', userId:'@userId'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });

      return Circle;
  }).
  factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/gf/circleparticipants/:circleId', {circleId:'@circleId'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/gifts/:giftId', {giftId:'@giftId', viewerId:'@viewerId', circleId:'@circleId', recipientId:'@recipientId', description:'@description', url:'@url', receivers:'@receivers', addedby:'@addedby', circle:'@circle'}, 
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
  })
  .directive('btnAddCircle', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: false,
        controller: CircleCtrl,
        scope: false,
        templateUrl: 'templates/ddbtn-addcircle.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('keyDown', function(){
      return {
        transclude: false,
        controller: UserCtrl,
        scope: false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs, controller) {
           element.bind("keyup", 
             function() {
               scope.query();
             }
           );
        }
      }
  });

function Retrieve($scope, $cookieStore, User, defaultValue, key) {
  if(angular.isDefined(defaultValue)) {
    return defaultValue;
  }
  else if(angular.isDefined($cookieStore.get(key))) {
    var u = User.find({userId:$cookieStore.get(key)});
    return u;
  }
  else
  {
    return {}; 
  }
}

function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, User ) {
  
  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
  });
  
  $scope.user = Retrieve($scope, $cookieStore, User, User.currentUser, "userId");
  
  $scope.save = function(user) {
    $scope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    User.currentUser = $scope.user;
                                    User.showUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}


function CurrentCtrl($rootScope, $scope, $cookieStore, User, Circle, Gift, $route) {
  
  // "my wish list" call
  $scope.mywishlist = function() {
    alert("$scope.mywishlist");
    gifts = Gift.query({viewerId:User.currentUser.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true; 
                              User.showUser = User.currentUser; 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+User.currentUser.first+"'s list\n  Try again");});
  }

  $rootScope.$on("userchange", function(event) {
    $scope.showUser = User.showUser;
    $scope.user = User.currentUser;
  });

  $rootScope.$on("circlechange", function(event) {
    $scope.circle = Circle.currentCircle;
    $scope.gifts = Circle.gifts;
  });
  
  $scope.isExpired = function() { 
    if(!angular.isDefined($scope.circle)) return false;
    return $scope.circle.date < new Date().getTime(); 
  }

  $scope.user = Retrieve($scope, $cookieStore, User, User.currentUser, "userId");
  $scope.showUser = Retrieve($scope, $cookieStore, User, User.showUser, "showUserId");
  
  
  if(angular.isDefined(Circle.currentCircle)) {
    $scope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    $scope.circle = Circle.query({circleId:$route.current.params.circleId}, function() {console.log($scope.circle);}, function() {alert("Could not find Event "+$route.current.params.circleId);})
  }
  
  
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


function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, UserSearch, Circle, Gift, CircleParticipant, $route) {              
             
  
  $scope.user = Retrieve($scope, $cookieStore, User, User.currentUser, "userId");
    
  
  $scope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
  
  $scope.isExpired = function() { 
    return $scope.circle.date < new Date().getTime(); 
  }
  
  $scope.currentCircle = function() { 
    return Circle.currentCircle;
  }
  
  $scope.makeActive = function(circle) {
    $location.search("cid", circle.id);
    Circle.currentCircle = circle;
    Circle.currentCircle.isExpired = circle.date < new Date();
    $rootScope.$emit("circlechange");
  }

  $rootScope.$on("circlechange", function(event) {
    //$scope.circle = Circle.currentCircle;
    //$scope.gifts = Circle.gifts;
  });

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
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
    gifts = Gift.query({viewerId:$scope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.currentCircle = circle;
                              User.currentUser = $scope.user;
                              if($scope.user.id == participant.id) { Circle.gifts.mylist=true; } else { Circle.gifts.mylist=false; } 
                              User.showUser = participant; 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again");});
  }
  
  $scope.save = function(circle) {
    Circle.save({name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:Circle.circleType});
    $location.url('selectmom');
  }
  
  $scope.type = function(thetype) {
    Circle.circleType = thetype;
    $location.url($location.path());
  }
  
  $scope.getType = function() {return Circle.circleType;}
  
  $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0',
        dateFormat : 'mm/dd/yy'
    };
    
  $scope.addparticipant = function(person) {
    if(!angular.isDefined($scope.circle))
      $scope.circle = {};
    if(!angular.isDefined($scope.circle.participants))
      $scope.circle.participants = [];
    $scope.circle.participants.push(person);
  }
  
  $scope.query = function() {
    if($scope.search.length > 1)
      $scope.people = UserSearch.query({search:$scope.search});
    else {
      $scope.people = {};
    }
  }
  
}

function UserCtrl($location, $cookieStore, $scope, User, Gift, CircleParticipant) {
  
  $scope.save = function(user) {
    $scope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                    User.showUser = $scope.user;
                                  }
                                );
  }
  
  $scope.user = Retrieve($scope, $cookieStore, User, User.currentUser, "userId");
  
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
    User.currentUser = {};
  }
}

function LoginCtrl($document, $rootScope, $cookies, $cookieStore, $scope, $location, User, Circle, CircleParticipant) { 
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || ! angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      return;
    }
    
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($scope.users[0].dateOfBirth == 0) { $scope.users[0].dateOfBirth = ''; }                                           
                                           User.showUser = $scope.users[0];
                                           $rootScope.$emit("userchange");
                                           User.currentUser = $scope.users[0];
                                           $location.url('myaccount'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
}

function PrimaryReceiverCtrl($scope) {
}

  