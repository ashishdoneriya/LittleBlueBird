
// Every page that contains this controller creates its own instantiation.  So you if you don't do anything
// about the setInterval()'s, you will keep kicking off one setInterval() after another.
// So in app.js, in the routeChangeStart handler, we always cancel any existing timer.  Notice that the return
// value of setInterval() is $rootScope.timerId  2013-10-09
function PingCtrl($rootScope, $scope, Server) {
  $rootScope.ping = "";
  
  // get maint messages right away, don't wait for setInterval to fire
  res = Server.ping({}, 
              function(){ $rootScope.ping=res.downmessage; }, // yes, server is still there
              function() { $rootScope.ping = "You are offline" } // uh oh, the server is gone!
          );
  
  
  // 2013-10-14
  // capture the timerId so that you can cancel it in app.js routeChangeStart.  Otherwise, you'll have multiple instances of this function being called - we only need one
  $rootScope.timerId = setInterval(function(){
      console.log('pinging...'+new Date());
      $rootScope.$apply(function() {
          res = Server.ping({}, 
              function(){ $rootScope.ping=res.downmessage; }, // yes, server is still there
              function() { $rootScope.ping = "You are offline" } // uh oh, the server is gone!
          );
      });
  }, 120000);
  
}


function CarouselCtrl($scope) {


    // Don't know how to actually pause the carousel - nothing seems to work - so cycle very slowly in app.js:routeChangeStart

}


LoginCtrl = function($rootScope, $cookieStore, $scope, $location, User, Logout, Email, facebookConnect, $window, $timeout) { 

    $scope.fbuser = {}
    $scope.error = null;
    $rootScope.loginoption = '';
    
    
  $scope.showModal = function(tf) {
    $rootScope.xxxModalShown = tf;
    console.log('$rootScope.xxxModalShown = ', $rootScope.xxxModalShown);
  }
  
  $scope.mobileanswer = function(yn) {
    if(yn == 'yes') {
  
      // LBB IS NOT -> https://itunes.apple.com/us/app/nfl-pro-2014-ultimate-football/id518244464?mt=8&uo=4
      var appStoreURL = "https://itunes.apple.com/us/app/nfl-pro-2014-ultimate-football/id518244464?mt=8&uo=4";
      
      // http://stackoverflow.com/questions/13044805/how-to-check-if-an-app-is-installed-from-a-web-page-on-an-iphone
      // Replace the link below with the link to LittleBlueBird in the app store
      // Use this if you have to figure out what the LBB link is: https://linkmaker.itunes.apple.com/us/
      setTimeout(function () { window.location = appStoreURL; }, 25);
      window.location = "littlebluebird://";
    }
    else if(yn == 'no') {}
  }
    
  $scope.loginhelpbox = function(showhide) {
    console.log("scope.loginhelpbox, using rootScope -----------------------------");
    $rootScope.loginhelp = showhide;
  }
  
  $scope.setloginsectiontwo = function(somename) { $rootScope.loginsectiontwo = somename; }
  
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      
      console.log("scope.login:  didn't want this to happen");
      return;
    }
    
      console.log("scope.login:  made it this far at least");
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user;  
                                           console.log("scope.login:  set 'user' cookie");
                                           $cookieStore.put("user", $rootScope.user.id);
                                           $cookieStore.put("showUser", $rootScope.showUser.id);
                                           console.log("scope.login:  go to 'welcome'");
                                           
                                           // Now see if there was a 'proceedTo' url that the user was trying to go to before being redirected to the login page...
                                           // See app-FacebookModule.js.  We also check for this variable there.
										   if(angular.isDefined($rootScope.proceedTo)) {
										       $location.url($rootScope.proceedTo);
										       delete $rootScope.proceedTo;
										   }
                                           else
                                               $location.url('welcome'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  // 2013-07-19 duplicated in the mobile version ForgotCtrl
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
};