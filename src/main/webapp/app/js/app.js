var app = angular.module('project', ['UserModule', 'CircleModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    //$locationProvider.html5Mode(true);
    
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}}).
      when('/foo/:fooid', {templates: {layout: 'foo',               menu: 'partials/foo/menu.html', body:'partials/foo/foo.html'}}).
      when('/bar/:fooid/:barid', {templates: {layout: 'foo',        menu: 'partials/foo/menu.html', body:'partials/foo/bar.html'}}).
      when('/baz/:fooid/:barid/:bazid', {templates: {layout: 'foo', menu: 'partials/foo/menu.html', body:'partials/foo/baz.html'}}).
      when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', one: 'partials/login.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}}).
      when('/circles', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/friends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/friends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/fbfriends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/fbfriends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/gettingstarted', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/gettingstarted.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/event/:circleId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/managepeople/', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/managepeople.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/myaccount/main.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/mywishlist', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/reminders', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/reminders.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/email', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/email.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/welcome', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .otherwise({redirectTo: '/mywishlist', templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      ;
  
  })
  .run(function($window, $route, $rootScope, $cookieStore, $location, $rootScope, facebookConnect, User){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        
        if($window.location.search != '') {
          var s = $window.location.search;
          $cookieStore.put("window.location.search", s); 
          $window.location.search = '';
        }
        
        if(angular.isDefined($rootScope.user) || $location.url()=='/login' || $location.url()=='/whoareyou' || $location.url().indexOf('foo')!=-1  || $location.url().indexOf('bar')!=-1  || $location.url().indexOf('baz')!=-1 ) {
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
      console.log("routeChangeSuccess:  newRoute...............");
      console.log(newRoute);
    } )
  })
  .run(function($rootScope, $location, dimAdjuster) {

    // adjust dims for large profile pics
    $rootScope.adjustedheight = function(auser, limit) { 
      return dimAdjuster.adjustedheight(auser, limit);
    }
    
    $rootScope.adjustedwidth = function(auser, limit) { 
      return dimAdjuster.adjustedwidth(auser, limit);
    }
    
    $rootScope.gotoFriends = function() { $location.url('friends') }
    
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

function menuctrl($rootScope, $scope, $location, $route) {
  console.log("menuctrl: fooid="+$route.current.params.fooid);
  
  $scope.fooid = $route.current.params.fooid;
  
  $scope.ngclick_url = function(where) {  
    $location.url(where); console.log("$scope.ngclick_url():  where="+where); 
    $rootScope.$emit("change");
  }
  
  $scope.ngclick_path = function(where) {  
    $location.path(where); console.log("$scope.ngclick_path():  where="+where); 
    $rootScope.$emit("change");
  }
  
  $scope.reload = function(where) { 
    console.log("scope.reload ---------------------------------------");
    $location.path(where);
    $rootScope.$emit("change");
  }
  
}

function fooctrl($rootScope, $scope, $location, $route, UserSearch, facebookConnect) {
  console.log("fooctrl: fooid="+$route.current.params.fooid);
  
  $scope.fooid = $route.current.params.fooid;
  $scope.barid = $route.current.params.barid;
  
  $rootScope.$on("change", function(event){
    $scope.fooid = $route.current.params.fooid;
    console.log("fooctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.fooid="+$route.current.params.fooid);
	console.log($route);
  });
  
}

function barctrl($rootScope, $scope, $location, $route, $cookieStore) {

  console.log("barctrl: $route.current.params.fooid="+$route.current.params.fooid+", $route.current.params.barid="+$route.current.params.barid);
  
  $scope.fooid = $route.current.params.fooid;
  $scope.barid = $route.current.params.barid;
  
  $rootScope.$on("change", function(event){
    $scope.fooid = $route.current.params.fooid;
    $scope.barid = $route.current.params.barid;
    console.log("barctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.fooid="+$route.current.params.fooid);
	console.log("barctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.barid="+$route.current.params.barid);
	console.log($route);
  });
}

function bazctrl($rootScope, $scope, $location, $route) {
  console.log("bazctrl: fooid="+$route.current.params.fooid+", barid="+$route.current.params.barid+", bazid="+$route.current.params.bazid);
  
  $scope.fooid = $route.current.params.fooid;
  $scope.barid = $route.current.params.barid;
  $scope.bazid = $route.current.params.bazid;
  
  $rootScope.$on("change", function(event){
    $scope.fooid = $route.current.params.fooid;
    $scope.barid = $route.current.params.barid;
    $scope.bazid = $route.current.params.bazid;
    console.log("bazctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.fooid="+$route.current.params.fooid);
	console.log("bazctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.barid="+$route.current.params.barid);
    console.log("bazctrl: $rootScope.$on() DETECTED CHANGE: $route.current.params.bazid="+$route.current.params.bazid);
	console.log($route);
  });
}