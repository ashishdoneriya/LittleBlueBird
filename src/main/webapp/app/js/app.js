var app = angular.module('project', ['UserModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    //$locationProvider.html5Mode(true);
    
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html', three:'partials/LittleBlueBird.html', four:'partials/navbar-nli.html'}}).
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
  .run(function($rootScope) {
    $rootScope.foobar = function() { console.log("foobarYY ----------------------"); };
  })
  .run(function($route, $rootScope, $cookieStore, $location, $rootScope, facebookConnect){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        console.log("$routechangestart: $rootScope...");
        console.log($rootScope);
        console.log("$rootScope.foobar() = "+$rootScope.foobar());
        console.log("$location.url()="+$location.url());
        if(angular.isDefined($rootScope.user) || $location.url()=='/login' || $location.url()=='/whoareyou' || $location.url()=='/foo/1') {
          // don't do anything - we have what we need
          $rootScope.templates = newRoute.$route.templates;
          $rootScope.layoutController = newRoute.$route.controller;
        }
        else if(angular.isDefined($cookieStore.get("user"))) {
          $rootScope.user = $cookieStore.get("user");
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
  .run(function($rootScope, $window, dimAdjuster, facebookConnect) {

    // adjust dims for large profile pics
    $rootScope.adjustedheight = function(auser, limit) { 
      return dimAdjuster.adjustedheight(auser, limit);
    }
    
    $rootScope.adjustedwidth = function(auser, limit) { 
      return dimAdjuster.adjustedwidth(auser, limit);
    }
    
    $rootScope.margintop = function(auser, limit) { 
      return dimAdjuster.margintop(auser, limit);
    }
    
    $rootScope.marginleft = function(auser, limit) { 
      return dimAdjuster.marginleft(auser, limit);
    }
    
    $rootScope.deleteAppRequests = function($window, facebookConnect) {
      
      var facebookreqids = [];
      console.log(facebookreqids);
      var parms = $window.location.search.split("&")
      if(parms.length > 0) {
        for(var i=0; i < parms.length; i++) {
          if(parms[i].split("=").length > 1 && (parms[i].split("=")[0] == 'request_ids' || parms[i].split("=")[0] == '?request_ids')) {
            fbreqids_csv = parms[i].split("=")[1].split("%2C")
            for(var j=0; j < fbreqids_csv.length; j++) {
              facebookreqids.push(fbreqids_csv[j]);
            }  
          }
        }
      }  
  
      for(var k=0; k < facebookreqids.length; k++) {
        console.log("facebookreqids["+k+"] = "+facebookreqids[k]);
      }
    
      if(facebookreqids.length > 0) {
        deleterequests = function(res) {
          console.log("app.js:  about to delete app requests.  res = ...");
          var fbid = res.authResponse.userID;
          console.log(res);
          for(var i=0; i < facebookreqids.length; i++) {
            var reqid_plus_fbid = facebookreqids[i]+'_'+fbid;
            console.log("app.js: deleting app request: "+reqid_plus_fbid);
            facebookConnect.deleteAppRequest(reqid_plus_fbid);
          }
        }
        notauthorized = function(res) { console.log("app.js: FB: not authorized"); }
        unknown = function(res) { console.log("app.js: FB: unknown"); }
          facebookConnect.getLoginStatus(deleterequests, notauthorized, unknown);
      }
      
    } // end $rootScope.deleteAppRequests()

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
  factory('AppRequest', function($resource){
      var AppRequest = $resource('/gf/apprequest/:facebookId/:fbreqid', {facebookId:'@facebookId', fbreqid:'@fbreqid'}, 
                       {
                         save: {method:'POST'}
                       });
      return AppRequest;
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
    
    obj.marginleft = function(auser, limit) {
      var adj = obj.adjustedwidth(auser,limit);
      if(adj > limit)
        left = -1 * Math.round((adj - limit)/2);
      else
        left = 0;
      var l = left + 'px';
      if(angular.isDefined(auser) && auser.fullname == 'Eric Moore') console.log("marginleft: "+l);
      return l;
    }
    
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
    
    obj.margintop = function(auser,limit) {
      var adj = obj.adjustedheight(auser,limit);
      if(adj > limit) {
        topmargin = -1 * Math.round((adj - limit)/2);
      }
      else {
        topmargin = 0;
      }
      return topmargin + 'px';
    }; // obj.margintop
    
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




function RegisterCtrl($scope, User, $rootScope, $location) {
  $scope.save = function(newuser) {
    $rootScope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    User.showUser = $rootScope.user;
                                    User.currentUser = $rootScope.user;
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

// delete app requests: http://developers.facebook.com/docs/requests/#deleting
// source:  http://jsfiddle.net/mkotsur/Hxbqd/
angular.module('FacebookModule', ['UserModule']).factory('facebookConnect', function() {
    return new function() {
        this.askFacebookForAuthentication = function(fail, success) {
            console.log("askFacebookForAuthentication:  FB...");
            console.log(FB);
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            }, {scope:'email',perms:'publish_stream'});
        }
        
        this.getLoginStatus = function(connected, notauthorized, unknown) {
          FB.getLoginStatus(function(response) {
            if(response.status == 'connected') {
              connected(response);
            }
            else if(response.status == 'not_authorized') {
              notauthorized(response);
            }
            else {
              unknown(response);
            }
          });
        }
        
        this.deleteAppRequest = function(requestId) {
          console.log("this.deleteAppRequest:  BEGIN:  requestId="+requestId+",  FB="+FB);
          FB.getLoginStatus(function(response) {
            if(response.status == 'connected') {
              console.log("this.deleteAppRequest:  connected...");
              FB.api(requestId, 'delete', function(resp2) {
                console.log("this.deleteAppRequest:  resp2...");
                console.log(resp2);
              });
            }
            else  {
              console.log("this.deleteAppRequest:  not connected...");
            }
            
          });
          
        }
        
    } // return new function()
    
})
.factory('facebookFriends', function() {
  return new function() {
    this.getfriends = function(offset, limit, fail, success) {
      var url = '/me/friends?offset='+offset+'&limit='+limit;
      console.log("facebookFriends.getfriends():  url="+url);
      FB.api(url, success);
    }
  }
});


// These args need to be in the same order and the same number as the arg's in the function decl in app-ConnectCtrl
ConnectCtrl.$inject = ['facebookConnect', 'facebookFriends', '$scope', '$rootScope', '$resource', '$location', 'UserSearch', 'User'];

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
    
    
    $scope.deleteAppRequest = function(requestId) {
      console.log("$scope.deleteAppRequest() ------------");
      facebookConnect.deleteAppRequest(requestId);
    }
    
    $scope.fbinvite = function() {
      FB.ui({method: 'apprequests', message: 'Check out LittleBlueBird - You\'ll love it!'}, 
            function callback(response) {
              // response.to:  an array of fb id's
              // response.request:  the request id returned by fb
              console.log("$scope.fbinvite:  response...");
              console.log(response);
              console.log("$scope.fbinvite:  $scope.$apply()...");
              $scope.$apply();
            });
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