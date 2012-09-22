var app = angular.module('project', ['UserModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider){
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html', three:'partials/LittleBlueBird.html', four:'partials/navbar.html'}}).
      when('/foo/:fooid', {templates: {layout: 'foo', foo: 'partials/foo/foo.html'}}).
      when('/bar/:fooid/:barid', {templates: {layout: 'foo', foo: 'partials/foo/bar.html'}}).
      when('/baz/:fooid/:barid/:bazid', {templates: {layout: 'foo', foo: 'partials/foo/foo.html', bar: 'partials/foo/bar.html'}}).
      when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', one: 'partials/login.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}}).
      when('/circles', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/friends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/friends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/gettingstarted', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/gettingstarted.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId/:circleId/:viewerId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/myaccount/main.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/mywishlist', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/reminders', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/reminders.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/email', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/email.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/welcome', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      otherwise({redirectTo: '/mywishlist', templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}});
  }).run(function($route, $rootScope){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        $rootScope.templates = newRoute.$route.templates;
        $rootScope.layoutController = newRoute.$route.controller;
    });
    
});

angular.module('datetime', [])
       .directive('datePicker', function () {
         return function (scope, element, attrs) {
           var propName = attrs.datePicker;
           element.val(scope[propName]);
           element.datepicker().change(function (evt) {
             scope.$apply(function (scope) {
               scope[propName] = element.val();
             });
           });
         };
       }); 
       
angular.module('UserModule', ['ngResource', 'ngCookies', 'ui', 'angularBootstrap.modal']).
  factory('User', function($resource) {
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', fbreqid:'@fbreqid', friends:'@friends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
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
  factory('Logout', function($resource) {
      var Logout = $resource('/gf/logout', {}, {logout: {method:'POST'}});
      return Logout;
  }).
  factory('Circle', function($resource) {
      var Circle = $resource('/gf/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });

      return Circle;
  }).
  factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/gf/circleparticipants/:circleId', {circleId:'@circleId', userId:'@userId', inviterId:'@inviterId', 
                                         participationLevel:'@participationLevel', who:'@who', email:'@email', circle:'@circle', adder:'@adder',
                                         notifyonaddtoevent:'@notifyonaddtoevent'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Reminder', function($resource) {
      var Reminder = $resource('/gf/reminders/:circleId', {circleId:'@circleId', userId:'@userId', remind_date:'@remind_date', people:'@people'},
                     {
                       query: {method:'GET', isArray:true},
                       delete: {method:'DELETE'},
                       save: {method:'POST', isArray:true}
                     });
                     
      return Reminder;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });

      return Gift;
  }).
  factory('Email', function($resource) {
      var Email = $resource('/gf/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  })
  .directive('btnEditCircle', function(){
      return {
        scope: false,
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
        scope: { btnText:'@' },
        templateUrl: 'templates/ddbtn-user.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('friendStuff', function(){
      return {
        replace: false,
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
  .directive('giftActions', function(){
      return {
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('searchUsers', function(){
      return {
        controller: CircleCtrl,
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

function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, User ) {
  
  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
  });
  
  $scope.notifyonaddtoevent = $scope.user.notifyonaddtoevent;
  $scope.notifyondeletegift = $scope.user.notifyondeletegift;
  $scope.notifyoneditgift = $scope.user.notifyoneditgift;
  $scope.notifyonreturngift = $scope.user.notifyonreturngift;
  
  $scope.updateemailprefs = function() {
    $scope.user.notifyonaddtoevent = $scope.notifyonaddtoevent;
    $scope.user.notifyondeletegift = $scope.notifyondeletegift;
    $scope.user.notifyoneditgift = $scope.notifyoneditgift;
    $scope.user.notifyonreturngift = $scope.notifyonreturngift;
    $scope.user = User.save({userId:$scope.user.id, notifyonaddtoevent:$scope.user.notifyonaddtoevent, notifyondeletegift:$scope.user.notifyondeletegift, notifyoneditgift:$scope.user.notifyoneditgift, notifyonreturngift:$scope.user.notifyonreturngift}, 
                                  function() {
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  $scope.save = function(user) {
    $scope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}





function RegisterCtrl($scope, User, $rootScope, $location) {
  $scope.save = function(newuser) {
    $scope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    User.showUser = $scope.user;
                                    User.currentUser = $scope.user;
                                    $location.url('welcome');
                                  }
                                );
  }
  
  // duplicated in UserCtrl
  $scope.isUsernameUnique = function(user, form) {
    if(!angular.isDefined(user.username)) {
      return;
    }
    checkUsers = User.query({username:user.username}, 
                                        function() {
                                          if(checkUsers.length > 0) { form.username.$error.taken = 'true'; }
                                          else { form.username.$error.taken = 'false'; }
                                        });
  } 

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
  });
}

function EmailCtrl($scope, Email) {
  $scope.email = {to:'bdunklau@yahoo.com', from:'info@littlebluebird.com',
                  subject:'Check out LittleBlueBird.com',
                  message:'Hey, Check out http://www.littlebluebird.com'};
                  
  $scope.send = function() {
    Email.send({to:$scope.email.to, from:$scope.email.from, subject:$scope.email.subject, message:$scope.email.message});
  }
}

// source:  http://jsfiddle.net/mkotsur/Hxbqd/
angular.module('FacebookModule', []).factory('facebookConnect', function() {
    return new function() {
        this.askFacebookForAuthentication = function(fail, success) {
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            }, {scope:'email',perms:'publish_stream'});
        }
    }
})
.factory('facebookFriends', function() {
  return new function() {
    this.getfriends = function(fail, success) {
      FB.api('/me/friends', success);
    }
  }
})
.factory('facebookAppRequest', function() {
  return new function() {
    this.getfriends = function(fail, success) {
      FB.api('/me/friends', success);
    }
  }
});



ConnectCtrl.$inject = ['facebookConnect', 'facebookFriends', '$scope', '$rootScope', '$location', '$resource', 'UserSearch', 'User'];

function NavCtrl($scope) {
  $scope.navstate = function(compare) {
    return $scope.activenav == compare ? 'active' : '';
  }
}

function GettingStartedCtrl($scope) { 
  $scope.createevent = false;
  $scope.addyourself = false;
  $scope.addpeople = false;
  $scope.additems = false;
  $scope.whydoweneedtoknow = false; // see whoareyou.html
  $scope.whatifidontwantto = false; // see whoareyou.html
}

function fooctrl($scope, $location, $route) {
  console.log("fooctrl: fooid="+$route.current.params.fooid);
  
  $scope.urlbar = function() {
    $location.url('bar/4/5');
  }
  
  $scope.urlfoo = function() {
    $location.url('foo/3');
  }
  
}

function barctrl($scope, $location, $route) {
  console.log("barctrl: fooid="+$route.current.params.fooid+", barid="+$route.current.params.barid);
  
  $scope.urlbar = function() {
    $location.url('bar/4/5');
  }
  
  $scope.urlfoo = function() {
    $location.url('foo/3');
  }
}

function bazctrl($scope, $location, $route) {
  console.log("bazctrl: fooid="+$route.current.params.fooid+", barid="+$route.current.params.barid+", bazid="+$route.current.params.bazid);
  
  $scope.baz = function() {
    $location.url('baz');
  }
}