// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};


var app = angular.module('project', ['UserModule']).
  config(function($routeProvider, $locationProvider, $rootScopeProvider, $cookieStoreProvider){
    
    
    $routeProvider
      .when('/forgot', {templates: {layout: 'layout1', one: 'partials/forgot.html'}})
      .when('/lbblogin', {templates: {layout: 'layout1', one: 'partials/lbblogin.html'}})
      .when('/register', {templates: {layout: 'layout1', one: 'partials/register.html'}})
      .when('/welcome', {templates: {layout: 'layout1', one: 'partials/welcome.html'}})
      .when('/', {templates: {layout: 'layout1', one: 'partials/home.html'}})
      .otherwise({redirectTo: '/woops', templates: {layout: 'layout1', one: 'partials/woops.html'}})
      ;
      
      
      $locationProvider.html5Mode(true);
  
  })
  .run(function($window, $route, $rootScope, $cookieStore, $location){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        
        if(!newRoute) return;
        
        
        $rootScope.currentlocation = "/gf" + $location.path();
  
        
    }); // $rootScope.$on('$routeChangeStart', function(scope, newRoute){
    
  });
  
  
  
angular.module('UserModule', ['ngResource']).
  factory('User', function($resource) {
      var User = $resource('/gf/rest/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', friends:'@friends', lbbfriends:'@lbbfriends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('Email', function($resource) {
      var Email = $resource('/gf/rest/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  });
  
  
function ForgotCtrl($scope, Email) {

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
}


function LbbLoginCtrl($scope, $rootScope, User, $location) {

  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user;  
                                           $location.url('welcome'); 
                                          }, 
                               function() {alert('Wrong user/pass');}  );
                               
  }
}

