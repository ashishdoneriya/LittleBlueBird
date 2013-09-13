// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};


var app = angular.module('project', ['UserModule', 'CircleModule', 'GiftModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    
    
    $routeProvider
      .when('/accountinfo', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/myaccount/accountinfo.html', five:'partials/navbar.html'}})
      .when('/addfacebookfriends', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/friends/addfacebookfriends.html', five:'partials/navbar.html'}})
      .when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}})
      .when('/circles', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/circledetails.html', five:'partials/navbar.html'}})
      .when('/currentevent', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/events/event.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/editevent', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/events/newevent.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/email', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/email.html', five:'partials/navbar.html'}})
      .when('/emailit', {templates: {layout: 'home', one: 'partials/emailMyUsernameAndPassword.html', two: 'partials/loginWithFacebook.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .when('/emailprefs', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/myaccount/emailprefs.html', five:'partials/navbar.html'}})
      .when('/event/:circleId', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/events/event.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/events', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/events/events.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/foo/events', {templates: {layout: 'foo.html', four: 'partials/events/whatareevents.html', one: 'partials/events/events.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/foo/friends', {templates: {layout: 'foo.html', four: 'partials/friends/whatarefriends.html', one: 'partials/events/events.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/giftlist/:showUserId', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}})
      .when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}})
      .when('/home', {templates: {layout: 'home', one: 'partials/loginWithLittleBlueBird.html', two: 'partials/loginWithFacebook.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      // get rid of /login route
      .when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .when('/managepeople/', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/managepeople.html', five:'partials/navbar.html'}})
      .when('/marketing', {templates: {layout: 'support', one:'partials/marketing.html', four:'partials/navbar-nli.html'}})
      .when('/newevent/:type', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/events/newevent.html', two: 'partials/friends/friends.html', five:'partials/navbar.html'}})
      .when('/peopleToInvite', {templates: {layout: 'layout2', four: 'partials/friends/peopleToInvite.html', five:'partials/navbar.html'}})
      .when('/personalinfo', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/myaccount/personalinfo.html', five:'partials/navbar.html'}})
      .when('/privacy', {templates: {layout: 'support', one:'partials/privacy.html', four:'partials/navbar-nli.html'}})
      .when('/register', {templates: {layout: 'home', one: 'partials/register.html', two: 'partials/loginWithFacebook.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .when('/reminders', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/reminders.html', five:'partials/navbar.html'}})
      .when('/state', {templates: {layout: 'foo',               menu: 'partials/foo/menu.html', body:'partials/foo/foo.html'}})
      .when('/support', {templates: {layout: 'support', one:'partials/support.html', four:'partials/navbar-nli.html'}})
      .when('/test', {templates: {layout: 'layout-nli.html', one: 'partials/test.html', two: 'partials/loginsectiontwo.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .when('/welcome', {templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/welcome.html', five:'partials/navbar.html'}})
      .when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}})
      .when('/', {templates: {layout: 'home', one: 'partials/loginWithLittleBlueBird.html', two: 'partials/loginWithFacebook.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}})
      .otherwise({redirectTo: '/welcome', templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', two: 'partials/friends/friends.html', four: 'partials/welcome.html', five:'partials/navbar.html'}})
      //.otherwise({redirectTo: '/mywishlist', templates: {layout: 'layout.html', one: 'partials/friends/addfacebookfriends.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}})
      ;
      
      
      $locationProvider.html5Mode(true);
  
  })
  .run(function($rootScope, Facebook) {
    $rootScope.Facebook = Facebook;
  })
  .run(function($window, $route, $rootScope, $cookieStore, $location, facebookConnect, $timeout, User, FacebookServerSide){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        console.log("FINAL ROUTECHANGESTART FUNCTION ----------------------------");   
        
        // Allow anonymous access and do NOT assume the FB user is the person behind the keyboard
        // If we are going to any of these pages, we do NOT want to see if someone is logged in to FB
        var nonsecure =  ['home', 'emailit', 'register', 'marketing', 'privacy', 'support'];
        var allowAnonymousAccess = $location.url() == '/';
        console.log("location.url(): ", $location.url());
        for(var i=0; i < nonsecure.length; ++i) {
          if($location.url().indexOf(nonsecure[i]) != -1) {
            allowAnonymousAccess = true;
            break;
          }
        }
        
        /**********************************
        console.log("routeChangeStart:  newRoute...............");
        console.log(newRoute);
        console.log($window.navigator);
        console.log("$window.navigator.appName = ...");
        console.log($window.navigator.appName);
        console.log("$window.navigator.appVersion = ...");
        console.log($window.navigator.appVersion);
        console.log("$window.navigator.userAgent = "+$window.navigator.userAgent);
        console.log("$window.navigator.userAgent = ...");
        console.log($window.navigator.userAgent);
        console.log("$window.location = ...");
        console.log($window.location);
        **********************************/
        
        // 2013-05-29: IE9 does serve up the home page, but FB login is messed up - not sure why
        // 2013-06-03 SCREW IT FOR NOW - NO IE
        if($window.navigator.userAgent.indexOf('MSIE') != -1) {
          var sss = $window.navigator.userAgent.substring($window.navigator.userAgent.indexOf('MSIE'));
          var ttt = sss.indexOf(';');
          var version = parseFloat(sss.substring('MSIE '.length, ttt)); // 2013-06-03 This is the version but we don't care right now - no IE
          if(true) {
            $rootScope.templates = {layout: 'internetexplorer', one: 'partials/internetexplorer.html'};
            $rootScope.layoutController = newRoute.controller;
            return;
          }
        }
              
        if(!newRoute) return;
        
        $rootScope.currentlocation = "/gf" + $location.path();
        
        if($window.location.search != '') {
          var s = $window.location.search;
          $cookieStore.put("window.location.search", s); 
          $window.location.search = '';
        }
            
        // Rule:  
        //		9/4/13  If $rootScope.user exists OR the requested page allows anonymous access, let the user through
        //      (3/12/13) If not, see if there is a "user" cookie in the cookieStore - points to current user id
        //      (9/4/13) If there is no "user" cookie, we are going to see someone is logged in to FB.
        //				If a FB user can be identified, we will assume THAT is the person behind the keyboard
        //				We need to figure out if this FB user is responding to an app request.
        
        
        
        if(angular.isDefined($rootScope.user) || allowAnonymousAccess) {
          $rootScope.templates = newRoute.templates;
          $rootScope.layoutController = newRoute.controller;
        }
        
        // 2013-03-12:  next - check for "user" cookie
        // 2013-09-04:  Strictly speaking, we don't have to check 'allowAnonymousAccess' We know it's false because the 'if' block above didn't get called.
        else if(angular.isDefined($cookieStore.get("user"))) {
          $rootScope.user = User.find({userId:$cookieStore.get("user")}, 
                              function(){
                                  console.log("FOUND user from $cookieStore.get('user') BEFORE we checked Facebook");console.log($rootScope.user);
						          if($rootScope.user.facebookId != null) {
							  	      //get access token and pass to the server; get all friends on the server not the client
								      // so I can make a call like this on the server:
								      // 		https://graph.facebook.com/569956369/friends?limit=0&offset=0&access_token=CAAAAH7GIRHUBAEJqVt3iB3Lut0BkFoSMFW0gM32LNpZATLoe140CTMAUe3QSxK1qnficW9wr9ZApT4xG1CUgaiuMoL3e7zoxV8jZAfDulYGD8czWpZAxB8aLIP5f4TFkajsJDf5OaRnpHOPXqmdO3bpagMJnNnM3ho8PgXBixF3exAUrr3vfXG4TnC8xZBHzcIDTV1p05oAZDZD&__after_id=100005734893581%22
								      FB.getLoginStatus(function(response) {
							    	      console.log("access token:", response.authResponse.accessToken);
								          var peopleToFollow = FacebookServerSide.friends({accessToken:response.authResponse.accessToken, facebookId:$rootScope.user.facebookId, userId:$rootScope.user.id, queryType:'peopleToFollow'},
								                  function() {$rootScope.user.peopleToFollow = peopleToFollow; console.log("FacebookServerSide SUCCESS: $rootScope.user.peopleToFollow", $rootScope.user.peopleToFollow)},
								                  function() {console.log("FacebookServerSide FAIL: $rootScope.peopleToFollow -------------------------")});
								                  
								         var peopleToInvite = FacebookServerSide.friends({accessToken:response.authResponse.accessToken, facebookId:$rootScope.user.facebookId, userId:$rootScope.user.id, queryType:'peopleToInvite'},
								                  function() {$rootScope.user.peopleToInvite = peopleToInvite; console.log("FacebookServerSide SUCCESS: $rootScope.user.peopleToInvite", $rootScope.user.peopleToInvite)},
								                  function() {console.log("FacebookServerSide FAIL: $rootScope.peopleToInvite --------------------")});
								      });
						          }
                              }
                            );
          $rootScope.templates = newRoute.templates;
          $rootScope.layoutController = newRoute.controller;
          
          if(!angular.isDefined($rootScope.showUser) && angular.isDefined($cookieStore.get("showUser"))) {
            $rootScope.showUser = User.find({userId:$cookieStore.get("showUser")});
          }
          else if(!angular.isDefined($rootScope.showUser) && !angular.isDefined($cookieStore.get("showUser"))) {
            $rootScope.showUser = angular.copy($rootScope.user);
            $cookieStore.put("showUser", $rootScope.showUser.id);
          }
						          
          
          
        } // if: $cookieStore.get("user") exists
        
        // 2013-09-03 We can DEFINITELY get this far - when the user is a first-timer
        // 2013-03-12 Not sure if this will ever get called now that we have the else-if above.  app-LoginCtrl:$scope.login() and app-FacebookModule:$rootScope.initfbuser()
        // both set "user" cookies.  So I don't think this will ever get called.
       
        
        
    }); // $rootScope.$on('$routeChangeStart', function(scope, newRoute){
    
  }) 
  .run(function($route, $rootScope, $location, $rootScope, facebookConnect) { 
    $rootScope.$on('$routeChangeSuccess', function(scope, newRoute) {
      console.log("routeChangeSuccess:  newRoute...............");
      console.log(newRoute);
    } )
  })
  .run(function($rootScope, $location, dimAdjuster, UserSearch, Gift) {
    $rootScope.menuitems = ['me', 'friends', 'events'];
    $rootScope.activeitem = 'me';

    // TODO Repurpose this if necessary so that the links in the navbar.html have their active/inactive states change when this function is called
    // This function was originally developed for sidemenu.html, which only had links of "Events", "Friends" and "Me".  That menu has gone away.
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
    
    // 2013-09-06:  Figures out if the row is the first row or the last row AND figures out if the row is a selected row !
    $rootScope.styleRow = function(style, index, size, thing) {
      firstrow = index == 0;
      lastrow = index == size-1;
      if(firstrow) thestyle = style + ' firstrow'; 
      else if(lastrow) thestyle = style + ' lastrow'; 
      else thestyle = style;
      if(angular.isDefined(thing.selected) && thing.selected==true)
        thestyle = thestyle + ' selected';
      return thestyle;
    }
  
    // returns the selected or not-selected style of a person's row
    $rootScope.selectedOrNotStyle = function(style, index, size, person) {
      if(angular.isDefined(person.selected) && person.selected==true)
        style = style + ' selected';
      return $rootScope.isLastRow(style, index, size);
    }
    
    
    $rootScope.friendwishlist = function(friend) {
      /**************************
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
       *******************/
       console.log("app.js: $rootScope.friendwishlist() EVERYTHING COMMENTED OUT. IT'S ALL HANDLED BY app-GiftModule:routeChangeStart now");
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
                        //delete $rootScope.addmethod; // don't delete this. newevent.html needs this.  what is friends doing that we want to delete this?
                        $rootScope.noonefound = $rootScope.peoplesearchresults.length==0 ? true : false; 
                        console.log($rootScope.peoplesearchresults);
                      }, 
                      function() {
                        $rootScope.usersearch = '';
                      }
                    );
    };
    
  });
  
  
// purpose: to reset a gift's description and url if the user decides to cancel the edit
app.factory('GiftEditor', function() {
  var og = {};
  var editor = {};
  editor.reset = function() {
    return og;
  };
  editor.origGift = function(gift) {
    og = angular.copy(gift);
  }
  return editor
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

function WelcomeCtrl($rootScope, $scope, $location) {
  
  $scope.checkemail = false;
  console.log("WelcomeCtrl: $scope.checkemail = false");
  
  $scope.toggleemail = function() {
    if(!angular.isDefined($scope.checkemail) || !$scope.checkemail) $scope.checkemail = true;
    else $scope.checkemail = false;
  }
  
  $scope.togglefriends = function() {
    if(!angular.isDefined($scope.friends) || !$scope.friends) $scope.friends = true;
    else $scope.friends = false;
  }
  
  $scope.toggleevents = function() {
    if(!angular.isDefined($scope.events) || !$scope.events) $scope.events = true;
    else $scope.events = false;
  }
  
  $rootScope.$on("$routeChangeStart", function(scope, next, current){
    console.log('WelcomeCtrl:  Changing from '+angular.toJson(current)+' to '+angular.toJson(next));
  });
  
  $rootScope.$on("$routeChangeSuccess", 
    function( scope, newRoute ){
      console.log("WelcomeCtrl: routeChangeSuccess ----------------------------- doing nothing");
    }
  );
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


function FBCtrl($rootScope, $scope) {
 // see test.html
}

function SideMenuCtrl($scope) {
  console.log("SideMenuCtrl: everything commented out");
}
