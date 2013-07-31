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
  
  
  // 2013-07-31
  $scope.initNewUser = function() {
    $scope.newuser = {fullname:'Scott Tiger', username:'scott', password:'scott', email:'bdunklau@yahoo.com'};
    $scope.passagain = 'scott';
  }
  
  
  // copied/adapted from $rootScope.isUsernameUnique in app-UserModule.js  2013-07-31 
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
  
  
  // copied/adapted from $scope.save in app-UserCtrl.js  2013-07-31
  $scope.register = function(newuser) {
    $rootScope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    $rootScope.showUser = $rootScope.user;
                                    $scope.logingood = true; // don't forget this or else welcome page isn't going to show you anything
                                    $scope.initNewUser();
                                  },
                                  function() { 
                                    $scope.initNewUser();
                                  }
                                );
  }
  

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
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.friends = function() {
                              setTimeout(function(){
                                jQuery("#friendview").listview("refresh");
                              },0);
  }
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.events = function() {
                              jQuery("#eventview").hide();
                              setTimeout(function(){
                                jQuery("#eventview").listview("refresh");
                                jQuery("#eventview").show();
                              },0);
  }
  
  $scope.eventfilter = 'current';
  $scope.eventDateFilter = function(circle) {
    if($scope.eventfilter=='all') return true;
    else if($scope.eventfilter=='current') return circle.date > new Date().getTime();
    else if($scope.eventfilter=='past') return circle.date < new Date().getTime();
  }
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function
  $scope.initNewGift = function() {
    delete $scope.currentgift;
    if(angular.isDefined($rootScope.circle)) {
      $scope.currentgift = {addedBy:$rootScope.user, circle:$rootScope.circle};
      $scope.currentgift.recipients = angular.copy($rootScope.circle.participants.receivers);
    }
    else {
      $scope.currentgift = {addedBy:$rootScope.user};
      $scope.currentgift.recipients = [$rootScope.showUser];
    }
    
    for(var i=0; i < $scope.currentgift.recipients.length; i++) {
      if($scope.currentgift.recipients[i].id == $rootScope.showUser.id)
        $scope.currentgift.recipients[i].checked = true;
    }
    
    // you need to specify who the gift is for if there is a circle and if there is more than one receiver in the circle
    $scope.needToSpecifyWhoTheGiftIsFor = angular.isDefined($scope.currentgift) && angular.isDefined($scope.currentgift.circle) 
           && angular.isDefined($scope.currentgift.recipients) && $scope.currentgift.recipients.length > 1;
  }
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.addgift() function
  $scope.savegift = function(gift) {
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
                 $scope.currentgift = {};
                 $scope.currentgift.recipients = [];
                 setTimeout(function(){
                   jQuery("#wishlistview").listview("refresh");
                   jQuery("#wishlistview").show();
                 },0);
               });
               
  }    
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.deletegift() function
  $scope.deletegift = function(gift) {
    $rootScope.gifts.splice($scope.index, 1);
    Gift.delete({giftId:gift.id, updater:$rootScope.user.fullname}, 
                  function() {
                     setTimeout(function(){
                      jQuery("#wishlistview").listview("refresh");
                      jQuery("#wishlistview").show();
                    },0);
                  } // end success function
               );
  }
  
  
  // simple setter as we go from the wishlist page to the gift (details) page
  $scope.setcurrentgift = function(index, gift) {
    $scope.index = index; // so that if we delete the gift we know where it is in the list 'gifts'
    $scope.currentgift = gift;
    console.log('currentgift:', gift);
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
  
  
  
  $scope.footermenu = '';
  
  $scope.setfootermenu = function(selected) {
    $scope.footermenu = selected;
  }
  
  $scope.footermenustyle = function(menuitem) {
    return $scope.footermenu == menuitem ? 'ui-btn-active ui-state-persist' : '';
  }
  
  
}];

