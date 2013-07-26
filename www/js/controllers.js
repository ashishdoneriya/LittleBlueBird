// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};


// 2013-07-23  $location is causing problems with jquery mobile: the browser back button stops working.  I think all links/routing stopped working.
//function LbbController($scope, Email, $rootScope, User, $location) {

// 2013-07-23  weird syntax needed for minification
var LbbController = ['$scope', 'Email', '$rootScope', 'User', 'Gift', function($scope, Email, $rootScope, User, Gift) {

  $scope.email = 'bdunklau@yahoo.com';
  $scope.username = 'bdunklau@yahoo.com';
  $scope.password = 'bdunklau@yahoo.com';
  

  // 2013-07-19 copied from app-LoginCtrl.js
  $scope.emailIt = function(email) {
    console.log(Email);
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, 
      function() {alert("User/Pass has been sent.  Check your email.");}, 
      function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }


  // 2013-07-19 copied from app-LoginCtrl.js, but there the method is just called login
  $scope.lbblogin = function() {
    console.log("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user;  
                                           //$location.url('welcome'); 
                                          }, 
                               function() {alert('Wrong user/pass');}  );
                               
  }
  
  
  // 2013-07-23  copied/adapted from scope.login() in app-LoginCtrl.js
  $scope.login = function() {      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {
                                 if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                 $rootScope.showUser = $rootScope.user;  
                               }, 
                               function() {}  );
                               
  }
  
  
  // 2013-07-23  copied/adapted from $rootScope.friendwishlist in app.js
  $scope.friendwishlist = function(friend) {
      $rootScope.showUser = friend;
      $rootScope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=false;
                              $rootScope.gifts.ready="true";
                              delete $rootScope.circle;
                              $("#listview1").hide();
                              setTimeout(function(){
                                $("#listview1").listview("refresh");
                                $("#listview1").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
}];
