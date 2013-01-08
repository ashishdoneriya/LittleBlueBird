var app = angular.module('project', ['UserModule', 'CircleModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    //$locationProvider.html5Mode(true);
    
    $routeProvider
      .when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .when('/foo/:fooid', {templates: {layout: 'foo',               menu: 'partials/foo/menu.html', body:'partials/foo/foo.html'}})
      .when('/bar/:fooid/:barid', {templates: {layout: 'foo',        menu: 'partials/foo/menu.html', body:'partials/foo/bar.html'}})
      .when('/baz/:fooid/:barid/:bazid', {templates: {layout: 'foo', menu: 'partials/foo/menu.html', body:'partials/foo/baz.html'}})
      .when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}})
      .when('/circles', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/circledetails.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/emailprefs', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/myaccount/emailprefs.html', five:'partials/navbar.html'}})
      .when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/friends', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/fbfriends', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/fbfriends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/gettingstarted', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/gettingstarted.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/event/:circleId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/events/event.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/events', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/events/events.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/giftlist/:showUserId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}})
      .when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/managepeople/', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/managepeople.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/me', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/myaccount/me.html', five:'partials/navbar.html'}})
      .when('/mywishlist', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/personalinfo', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/myaccount/personalinfo.html', five:'partials/navbar.html'}})
      .when('/reminders', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/reminders.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/email', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/email.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/welcome', {templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      .when('/test', {templates: {layout: 'layout-nli.html', one: 'partials/test.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .otherwise({redirectTo: '/welcome', templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      //.otherwise({redirectTo: '/mywishlist', templates: {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}})
      ;
  
  })
  .run(function($rootScope, Facebook) {
    $rootScope.Facebook = Facebook;
  })
  .run(function($window, $route, $rootScope, $cookieStore, $location, $rootScope, facebookConnect, $timeout, User, FacebookUser){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        console.log("FINAL ROUTECHANGESTART FUNCTION ----------------------------");    
        
        if (!newRoute || !newRoute.$route) return;
        
        if($window.location.search != '') {
          var s = $window.location.search;
          $cookieStore.put("window.location.search", s); 
          $window.location.search = '';
        }
    
        // Rule:  
        //      First see if $rootScope.user is defined
        //		If not, then see if someone is logged in to FB => that is the user we'll assume is using LBB
        // 			If someone is logged in to FB, we need to see if they're responding to an app request
        //		If there is no FB user, then we'll check the $cookieStore
        
        
        // Applying the rule above: First see if $rootScope.user is defined
        if(angular.isDefined($rootScope.user)) {
          console.log("routeChangeStart:  $rootScope.user defined");
          $rootScope.templates = newRoute.$route.templates;
          $rootScope.layoutController = newRoute.$route.controller;
        } // if(angular.isDefined($rootScope.user))
        
        else { // $rootScope.user is undefined
          // Applying the rule above: see if the user is logged in to FB
          var p2 = $rootScope.Facebook.status();
          p2.then(
            function(fbresponse) { // called if user is logged in and has authorized the app
              // Yes: we have someone logged in to FB.
              
              // Get facebook request id's.  If there are any, it means user is responding to an app request.  We need to mark the app request as accepted.
              fbreqids_csv = [];
              
              // Applying the rule above: If someone is logged in to FB, we need to see if they're responding to an app request
	          if($cookieStore.get("window.location.search")==undefined || $cookieStore.get("window.location.search").indexOf("request_ids")==-1) {
	            // no special handling required.  The user is not coming to us from an app request
	          }
	          else {  // SPECIAL HANDLING REQUIRED HERE: The user is responding to a app request on FB.  First get the facebook request id(s)...
	            var parms = $cookieStore.get("window.location.search").split("&")
                var facebookreqids = [];
		        if(parms.length > 0) {
		          for(var i=0; i < parms.length; i++) {
		            if(parms[i].split("=").length > 1 && (parms[i].split("=")[0] == 'request_ids' || parms[i].split("=")[0] == '?request_ids')) {
		              fbreqids_csv = parms[i].split("=")[1].split("%2C")
		              for(var j=0; j < fbreqids_csv.length; j++) {
		                facebookreqids.push(fbreqids_csv[j]);
		              }  
		            }      
		          }
		        } // if(parms.length > 0)
                     
                if(facebookreqids.length > 0) {
                  var fbid = fbresponse.authResponse.userID;
                  for(var i=0; i < facebookreqids.length; i++) {
                    var reqid_plus_fbid = facebookreqids[i]+'_'+fbid;
                    $rootScope.Facebook.deleteAppRequest(reqid_plus_fbid);
                  } // for(var i=0; i < facebookreqids.length; i++)
                        
                } // if(facebookreqids.length > 0)
		                
	          } // SPECIAL HANDLING REQUIRED HERE: The user is responding to a app request on FB.  First get the facebook request id(s)...
                      
              
              
              // Does this person match anyone in the LBB database?
              $rootScope.Facebook.getMe(
                function(meresponse) { // function inside of $rootScope.Facebook.getMe()
                  var fbuserparms = {facebookId:meresponse.id, email:meresponse.email, name:meresponse.name};
                  if(fbreqids_csv != []) fbuserparms.fbreqids = fbreqids_csv;
                  
                  console.log("routeChangeStart:  $rootScope.Facebook.getMe() ------------------");
                  
                  $rootScope.fbuser = angular.copy(meresponse);
                  
                  $rootScope.users = FacebookUser.save(fbuserparms,
                    function(){ // success function of $rootScope.users = FacebookUser.save()
                      console.log("$rootScope.users.................");
                      console.log($rootScope.users);
                      if($rootScope.users.length == 1) {
                        $rootScope.user = angular.copy($rootScope.users[0]);
                        $rootScope.showUser = angular.copy($rootScope.users[0]);
                        // how do we know if they've never logged in before?  if so, we want to send them to welcome
                        //$rootScope.templates = {layout: 'layout.html', three: 'partials/sidemenu.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'};
                        $rootScope.templates = newRoute.$route.templates;
                        $rootScope.layoutController = newRoute.$route.controller;
                        //$location.path('/mywishlist');
                      } // if($rootScope.users.length == 1)
                      else if($rootScope.users.length > 1) {
                        // who are you? you have an email that is shared with multiple people
                        // Applying the rule above: If someone is logged in to FB, we need to see if they're responding to an app request. HOW DO YOU DO THIS FOR PEOPLE THAT SHARE EMAILS?
                        $rootScope.sharedemail = meresponse.email;
                        $rootScope.user = {fullname:meresponse.name, email:meresponse.email, facebookId:meresponse.id};
                        console.log("WATCH FOR /whoareyou:  $rootScope.users = FacebookUser.save(): $rootScope.user = ..."); 
                        console.log($rootScope.user);
                        $rootScope.templates = {layout: 'layout-whoareyou.html', one: 'partials/login.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'};
                        $rootScope.layoutController = newRoute.$route.controller;
                      } // else if($rootScope.users.length > 1)
                      
                      // We don't handle the length==0 case because RestService.handleFacebookUser always returns a list with at least one user in it.
                      
                    }, // success function of $rootScope.users = FacebookUser.save()
                    
                    function(){ // fail function of $rootScope.users = FacebookUser.save()
                      // TODO Do something more here.  This is just a silent failure.
                      console.log("$rootScope.users = FacebookUser.save(): woops! got the fail function!");
                    } // fail function of $rootScope.users = FacebookUser.save()
                  ); // $rootScope.users = FacebookUser.save()
                } // function inside of $rootScope.Facebook.getMe()
              ); // $rootScope.Facebook.getMe()
              
            }, // function(fbresponse) { // called if user is logged in and has authorized the app
          
            function(fbresponse) { // called if user is not logged in or has not authorized the app
              // No: no one is logged in to FB, or has not authorized the app
              // So is there a user in the $cookieStore?
              // Yes $cookieStore user: This is an LBB user => allow entry
              if(angular.isDefined($cookieStore.get("user"))) {
                console.log("routeChangeStart:  Yes $cookieStore user: This is an LBB user => allow entry");
                $rootScope.user = User.find({userId:$cookieStore.get("user")}, function(){console.log("FOUND user from $cookieStore.get('user')...");console.log($rootScope.user);});
                $rootScope.templates = newRoute.$route.templates;
                $rootScope.layoutController = newRoute.$route.controller;
              }
              else { // No $cookieStore user: No one is logged in => person has to login or register (WHAT ABOUT VIEW AS GUEST?)
                console.log("routeChangeStart:  No $cookieStore user: No one is logged in");
                $rootScope.templates = {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'};
                $rootScope.layoutController = newRoute.$route.controller;
              } // else { // No $cookieStore user: No one is logged in => person has to login or register (WHAT ABOUT VIEW AS GUEST?)
              
            } // function(fbresponse) { // called if user is not logged in or has not authorized the app
          
          ); // p2.then();        
        } // else { // $rootScope.user is undefined
        
        
    }); // $rootScope.$on('$routeChangeStart', function(scope, newRoute){
    
  }) 
  .run(function($route, $rootScope, $location, $rootScope, facebookConnect) { 
    $rootScope.$on('$routeChangeSuccess', function(scope, newRoute) {
      console.log("routeChangeSuccess:  newRoute...............");
      console.log(newRoute);
    } )
  })
  .run(function($rootScope, $location, dimAdjuster, UserSearch) {
    $rootScope.menuitems = ['me', 'friends', 'events'];
    $rootScope.activeitem = 'me';

    $rootScope.setactive = function(menuitem) {
      for(var i=0; i < $rootScope.menuitems.length; i++) {
        if(menuitem == $rootScope.menuitems[i]) $rootScope.activeitem = menuitem;
      }
    }
  
    $rootScope.state = function(menuitem) {
      if(menuitem == $rootScope.activeitem) return 'active';
      else return '';
    }

    // adjust dims for large profile pics
    $rootScope.adjustedheight = function(auser, limit) { 
      return dimAdjuster.adjustedheight(auser, limit);
    }
    
    $rootScope.adjustedwidth = function(auser, limit) { 
      return dimAdjuster.adjustedwidth(auser, limit);
    }
    
    $rootScope.gotoFriends = function() { $location.url('/friends') }
    
    // general function trying to determine if we're on the last row of a list or not
    $rootScope.isLastRow = function(style, index, size) {
      lastrow = index == size-1;
      if(lastrow) return style + ' lastrow'; 
      else return style;
    }
  
    // returns the selected or not-selected style of a person's row
    $rootScope.selectedOrNotStyle = function(style, index, size, person) {
      if(angular.isDefined(person.selected) && person.selected==true)
        style = style + ' selected';
      return $rootScope.isLastRow(style, index, size);
    }
    
    
    $rootScope.friendwishlist = function(friend) {
      $rootScope.showUser = friend;
      console.log("app.js: viewerId:$rootScope.user.id="+$rootScope.user.id);
      $rootScope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=false;
                              $rootScope.gifts.ready="true";
                              delete $rootScope.circle;
                              console.log("$rootScope.friendwishlist():  delete $rootScope.circle - check below");
                              console.log($rootScope.circle);
                              //$rootScope.$emit("circlechange"); // commented out on 11/30/12 - experimenting
                              //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
    }
    
    
    $rootScope.usersearch = '';
  
    $rootScope.query = function(sss) {
      var trimmed = sss.replace(/^\s+|\s+$/g,"");
      if(trimmed == '') return

      $rootScope.foo = 'else';
      $rootScope.usersearch = 'loading';
      $rootScope.peoplesearchresults = UserSearch.query({search:sss}, 
                      function() {
                        $rootScope.usersearch = 'loaded'; 
                        $rootScope.noonefound = $rootScope.peoplesearchresults.length==0 ? true : false; 
                        console.log($rootScope.peoplesearchresults);
                      }, 
                      function() {
                        $rootScope.usersearch = '';
                      }
                    );
    };
    
  });


app.factory('Facebook', 
  function($rootScope, $q) {

    return {
      login: function() {

        var resp = $q.defer();

        FB.login(function(response) {
          setTimeout(function() {
            $rootScope.$apply(function() {
              resp.resolve(response.authResponse);
            });
          },1);
        });

        $rootScope.Facebook.token = resp.promise;

      },
      logout: function() {

        var resp = $q.defer();

        FB.logout(function(response) {
          setTimeout(function() {
            $rootScope.$apply(function() {
              resp.resolve(response.authResponse);
            });
          },1);
        });

        $rootScope.Facebook.token = null;   

      },
      status: function() {
        console.log("BBBBBBBBBBBBBBBBBBBBBBB");
        
        var deferred = $q.defer();
      
        setTimeout(function() {
          // since this fn executes async in a future turn of the event loop, we need to wrap
          // our code into an $apply call so that the model changes are properly observed.
          $rootScope.$apply(function() {
            
            FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
                deferred.resolve(response);
              } else if (response.status === 'not_authorized') {
                deferred.reject(response);
              } else {
                deferred.reject(response);
              }
            });
            
          });
        }, 1000);
 
        return deferred.promise;
        
      }, // status: function()
      
      deleteAppRequest: function(requestId) {
        FB.api(requestId, 'delete', function(resp) {});
      } // deleteAppRequest: function()
      ,
      getMe: function(callback) {
        FB.api('/me', function(meresponse) {
          callback(meresponse);
        }) // FB.api('/me', function(meresponse)
        
      } // getMe: function()
  
    } // return {
  
  } // function($rootScope, $q) {
  
) // app.factory('Facebook'





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

function WelcomeCtrl($scope) {
  console.log("WelcomeCtrl");
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

function FBCtrl($rootScope, $scope) {
 // see test.html
}

function SideMenuCtrl($scope) {
  console.log("SideMenuCtrl: everything commented out");
}