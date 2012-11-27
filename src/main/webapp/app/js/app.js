var app = angular.module('project', ['UserModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    //$locationProvider.html5Mode(true);
    
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}}).
      when('/foo/:fooid', {templates: {layout: 'foo', foo: 'partials/foo/foo.html'}}).
      when('/bar/:fooid/:barid', {templates: {layout: 'foo', foo: 'partials/foo/bar.html'}}).
      when('/baz/:fooid/:barid/:bazid', {templates: {layout: 'foo', foo: 'partials/foo/foo.html', bar: 'partials/foo/bar.html'}}).
      when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', one: 'partials/login.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}}).
      when('/circles', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/friends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/friends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/fbfriends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/fbfriends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/gettingstarted', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/gettingstarted.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/myaccount/main.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/mywishlist', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/reminders', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/reminders.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/email', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/email.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/welcome', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      otherwise({redirectTo: '/mywishlist', templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}});
  
  })
  .run(function($window, $route, $rootScope, $cookieStore, $location, $rootScope, facebookConnect, User){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        console.log("$routechangestart: $rootScope...");
        console.log($rootScope);
        console.log("$location.url()="+$location.url());
        
          console.log("HA HA:  $window.location.search = "+$window.location.search);
        if($window.location.search == '') console.log("HUHHHHHHHHHHH XXXXX? $window.location.search="+$window.location.search);
        if($window.location.search != '') {
          console.log("HA HA ----------------------------------");
          var s = $window.location.search;
          $cookieStore.put("window.location.search", s); 
          $window.location.search = '';
          console.log("app.js:  cookieStore(window.location.search)...");
          console.log($cookieStore.get("window.location.search"));
        }
        
        if(angular.isDefined($rootScope.user) || $location.url()=='/login' || $location.url()=='/whoareyou' || $location.url()=='/foo/1') {
          // don't do anything - we have what we need
          $rootScope.templates = newRoute.$route.templates;
          $rootScope.layoutController = newRoute.$route.controller;
        }
        else if(angular.isDefined($cookieStore.get("user"))) {
          $rootScope.user = User.find({userId:$cookieStore.get("user")}, function(){console.log("FOUND user from $cookieStore.get('user')...");console.log($rootScope.user);});
          $rootScope.templates = newRoute.$route.templates;
          $rootScope.layoutController = newRoute.$route.controller;
        }
        else {
          console.log("$location.url()="+$location.url());
          // here's where you check to see if the user is logged in to fb
          connected = function(res) {
                console.log("connected()---");
                $rootScope.templates = newRoute.$route.templates;
                $rootScope.layoutController = newRoute.$route.controller;
          }
          notauthorized = function(res) {
                console.log("notauthorized()---");
                $location.url('login');
                $rootScope.templates = newRoute.$route.templates;
                $rootScope.layoutController = newRoute.$route.controller;
          }
          unknown = function(res) {
                console.log("unknown()---");
                $location.url('login');
                $rootScope.templates = newRoute.$route.templates;
                $rootScope.layoutController = newRoute.$route.controller;
          }
          facebookConnect.getLoginStatus(connected, notauthorized, unknown);
          
          //$location.url('login');
          //$rootScope.templates = newRoute.$route.templates;
          //$rootScope.layoutController = newRoute.$route.controller;
        }


        
    }); // $rootScope.$on('$routeChangeStart', function(scope, newRoute)
    
  }) 
  .run(function($route, $rootScope, $location, $rootScope, facebookConnect) { 
    $rootScope.$on('$routeChangeSuccess', function(scope, newRoute) {
      console.log("routeChangeSuccess");
    } )
  })
  .run(function($rootScope, dimAdjuster) {

    // adjust dims for large profile pics
    $rootScope.adjustedheight = function(auser, limit) { 
      return dimAdjuster.adjustedheight(auser, limit);
    }
    
    $rootScope.adjustedwidth = function(auser, limit) { 
      return dimAdjuster.adjustedwidth(auser, limit);
    }
    
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
  factory('UserSearch', function($resource) {
      var UserSearch = $resource('/gf/usersearch', {search:'@search'}, 
                    {
                      query: {method:'GET', isArray:true}
                    });

      return UserSearch;
  }).
  factory('User', function($resource) {
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', friends:'@friends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('AppRequest', function($resource){
      var AppRequest = $resource('/gf/apprequest/:fbreqid/:parentId', {parentId:'@parentId', facebookIds:'@facebookIds', fbreqid:'@fbreqid'}, 
                       {
                         save: {method:'POST'}
                       });
      return AppRequest;
  }).
  factory('AppRequestAccepted', function($resource){
      var AppRequestAccepted = $resource('/gf/apprequestaccepted/:facebookId/:name', {facebookId:'@facebookId', email:'@email', name:'@name', fbreqids:'@fbreqids'}, 
                       {
                         save: {method:'POST', isArray:true}
                       });
      return AppRequestAccepted;
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
  .factory('dimAdjuster', function() {
    var obj = {};
    
    obj.adjustedwidth = function(auser, limit) {
      if(!angular.isDefined(auser))
        return -1;
      var image = new Image();
      image.src = auser.profilepicUrl;
      var mindim = image.height < image.width ? image.height : image.width;
      if(auser.fullname == 'Eric Moore') {console.log(auser); console.log("mindim: "+mindim);}
      var ratio = mindim > limit ? limit / mindim : 1;
      if(auser.fullname == 'Eric Moore') console.log("ratio: "+ratio);
      var adj = ratio * image.width;
      if(auser.fullname == 'Eric Moore') console.log("adj: "+adj);
      return adj;
    };
    
    obj.adjustedheight = function(auser, limit) {
      if(!angular.isDefined(auser))
        return -1;
      var image = new Image();
      image.src = auser.profilepicUrl;
      var mindim = image.height < image.width ? image.height : image.width;
      var ratio = mindim > limit ? limit / mindim : 1;
      var adj = ratio * image.height;
      return adj;
    }; // obj.adjustHeight
    
    return obj;
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




function RegisterCtrl($scope, User, $rootScope, $location, $cookieStore) {
  $scope.save = function(newuser) {
    var userwas = $cookieStore.get("user");
    var showuserwas = $cookieStore.get("showUser");
    $cookieStore.put("userwas", userwas);
    $cookieStore.put("showuserwas", showuserwas);
    $cookieStore.remove("user");
    $cookieStore.remove("showUser");
    console.log("REMOVED user COOKIE -----------------------");
    console.log("$cookieStore.get(\"userwas\")="+$cookieStore.get("userwas"));
    console.log("$cookieStore.get(\"user\")="+$cookieStore.get("user"));
    console.log("$cookieStore.get(\"showuserwas\")="+$cookieStore.get("showuserwas"));
    console.log("$cookieStore.get(\"showUser\")="+$cookieStore.get("showUser"));
    
    $rootScope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    $rootScope.showUser = $rootScope.user;
                                    User.currentUser = $rootScope.user;
                                    User.showUser = $rootScope.showUser;
                                    $cookieStore.put("user", $rootScope.user.id);
                                    $cookieStore.put("showUser", $rootScope.showUser.id);
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
    $rootScope.user = User.currentUser;
    $rootScope.showUser = User.showUser;
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



// These args need to be in the same order and the same number as the arg's in the function decl in app-LoginCtrl
LoginCtrl.$inject = ['$rootScope', '$cookieStore', '$scope', '$location', 'User', 'Logout', 'Email', 'facebookConnect'];

function NavCtrl($scope, $window) {
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

function fooctrl($scope, $location, $route, UserSearch, facebookConnect) {
  console.log("fooctrl: fooid="+$route.current.params.fooid);
  
  $scope.foo = function() { console.log("$scope.foo"); }
  

    $scope.registerWithFacebook = function() {
        facebookConnect.askFacebookForAuthentication(
          function(reason) { // fail
            $scope.error = reason;
            console.log("$scope.registerWithFacebook:  reason="+reason);
          }, 
          function(user) { // success
            console.log("$scope.registerWithFacebook:  success...");
            $scope.fbuser = user;
            $scope.$apply() // Manual scope evaluation
          }
        );
    }
    
    $scope.testsearch = function() {
      UserSearch.search({search:'bdunklau@gmail.com'}, function(){console.log("$scope.testsearch:  success :)");}, function(){console.log("$scope.testsearch:  failed :(");});
    }
    
    
  $scope.urlbar = function() {
    $location.url('bar/4/5');
  }
  
  $scope.urlfoo = function() {
    $location.url('foo/3');
  }
  
}

function barctrl($scope, $location, $route, $cookieStore) {

  console.log("barctrl: fooid="+$route.current.params.fooid+", barid="+$route.current.params.barid);
  
  console.log("barctrl:  before:  cookie="+$cookieStore.get("cookie")+",  $scope.blah="+$scope.blah);
  $cookieStore.put("cookie", "yum 3333");  
  $scope.blah = 'whatever!';
  console.log("barctrl:  after:  cookie="+$cookieStore.get("cookie")+",  $scope.blah="+$scope.blah);
  
  
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