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
  $scope.lbblogin = function(evt) {
    console.log("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || !angular.isDefined($scope.password)) {
      return;
    }
      
    $rootScope.user = User.find({username:$scope.username, password:$scope.password}, 
                               function() {$scope.logingood=true; 
                                           if($rootScope.user.dateOfBirth == 0) { $rootScope.user.dateOfBirth = ''; }
                                           $rootScope.showUser = $rootScope.user;  
                                           //$location.url('welcome'); 
                                          }, 
                               function() {$scope.logingood=false; alert('Wrong user/pass');}  );
                               
  }
    
  
  
  // 2013-07-23  copied/adapted from $rootScope.friendwishlist in app.js
  $scope.friendwishlist = function(friend) {
      $rootScope.showUser = friend;
      $rootScope.gifts = Gift.query({recipientId:friend.id, viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=false;
                              $rootScope.gifts.ready="true";
                              delete $rootScope.circle;
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  
  <!-- 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function -->
  $scope.initNewGift = function() {
    if(angular.isDefined($rootScope.circle)) {
      $scope.newgift = {addedBy:$rootScope.user, circle:$rootScope.circle};
      $scope.newgift.recipients = angular.copy($rootScope.circle.participants.receivers);
    }
    else {
      $scope.newgift = {addedBy:$rootScope.user};
      $scope.newgift.recipients = [$rootScope.showUser];
    }
    
    for(var i=0; i < $scope.newgift.recipients.length; i++) {
      if($scope.newgift.recipients[i].id == $rootScope.showUser.id)
        $scope.newgift.recipients[i].checked = true;
    }
    
    // you need to specify who the gift is for if there is a circle and if there is more than one receiver in the circle
    $scope.needToSpecifyWhoTheGiftIsFor = angular.isDefined($scope.newgift) && angular.isDefined($scope.newgift.circle) 
           && angular.isDefined($scope.newgift.recipients) && $scope.newgift.recipients.length > 1;
  }
  
  
  <!-- 2013-07-26  copied/adapted from app-GiftCtrl's $scope.addgift() function -->
  $scope.addgift = function(gift) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    var add = false;
    
    for(var i=0; i < gift.recipients.length; i++) {
      if(gift.recipients[i].checked && gift.recipients[i].id == $rootScope.showUser.id) {
        add = true;
        //alert(" gift.recipients["+i+"].checked="+gift.recipients[i].checked+"\n gift.recipients["+i+"].id="+gift.recipients[i].id+"\n $rootScope.showUser.id="+$rootScope.showUser.id);
      }
    }
    
    var saveparms = {updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id};
    if($rootScope.circle != undefined)
      saveparms.circleId = $rootScope.circle.id;
    
    console.log(saveparms);
    
    var savedgift = Gift.save(saveparms,
               function() {
                 if(add) {$rootScope.gifts.reverse();$rootScope.gifts.push(savedgift);$rootScope.gifts.reverse();}
                 $scope.newgift = {};
                 $scope.newgift.recipients = [];
                 setTimeout(function(){
                   jQuery("#wishlistview").listview("refresh");
                   jQuery("#wishlistview").show();
                 },0);
               });
               
  }  
  
  
  
  $scope.mywishlist = function() {
      $rootScope.showUser = $rootScope.user;
      $rootScope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            function() { 
                              $rootScope.gifts.mylist=true;
                              $rootScope.gifts.ready="true";
                              delete $rootScope.circle;
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  
}];

