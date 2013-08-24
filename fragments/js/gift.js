
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function
  $scope.initNewGift = function() {
    delete $scope.currentgift;
    if(angular.isDefined($scope.circle)) {
      $scope.currentgift = {addedBy:$rootScope.user, circle:$scope.circle};
      $scope.currentgift.recipients = angular.copy($scope.circle.participants.receivers);
    }
    else {
      $scope.currentgift = {addedBy:$rootScope.user};
      $scope.currentgift.recipients = [$rootScope.showUser];
    }
    
    for(var i=0; i < $scope.currentgift.recipients.length; i++) {
      if($scope.currentgift.recipients[i].id == $rootScope.showUser.id)
        $scope.currentgift.recipients[i].checked = true;
    }
    
    console.log();
    
    // you need to specify who the gift is for if there is a circle and if there is more than one receiver in the circle
    $scope.needToSpecifyWhoTheGiftIsFor = angular.isDefined($scope.currentgift) && angular.isDefined($scope.currentgift.circle) 
           && angular.isDefined($scope.currentgift.recipients) && $scope.currentgift.recipients.length > 1;
  }
  
  
  $scope.beginreserving = function(gift) {
	jQuery(function(){
	    jQuery("#givedatepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
	});
	gift.senderName = $rootScope.user.fullname;
	$scope.reserving = true;
  }
  
  
  refreshWishlist = function() {
      console.log('refreshWishlist called');
      jQuery("#wishlistview").hide();
      setTimeout(function(){
        jQuery("#wishlistview").listview("refresh");
        jQuery("#wishlistview").show();
      },0);
  }
  
  
  
  //2013-08-11  taken from app-GiftCtrl $scope.buygift()
  $scope.reservegift = function(index, gift) {
    console.log('$scope.buygift ------------------------- called');
    
    if($scope.circle)
      gift.receivedate = new Date($scope.circle.date);
    else
      gift.receivedate = new Date(jQuery("#givedatepicker").mobiscroll('getDate'));
      
    gift.senderId = $rootScope.user.id;
    // gift.senderName set by the input field on the html page 
    
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    var parms = {giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id, senderId:gift.senderId, senderName:gift.senderName, receivedate:gift.receivedate.getTime()};
    console.log('parms: ', parms);
    var savedgift = Gift.save(parms, 
                      function() { $scope.currentgift = savedgift; 
                                   $scope.gifts.splice(index, 1, savedgift);
                                   refreshWishlist();   });
    delete $scope.reserving;
  }
  
  
  // taken from app-GiftCtrl $scope.returngift()
  $scope.returngift = function(index, gift) {
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    var savedgift = Gift.save({giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, 
                               recipientId:$rootScope.showUser.id, senderId:-1, senderName:''},
                      function() { $scope.currentgift = savedgift; 
                                   $scope.gifts.splice(index, 1, savedgift);
                                   refreshWishlist();   });
  }
  
  
  $scope.viewonline = function(url, event) {
    event.preventDefault();
    window.open(url, '_blank', 'location=yes');
    return false;
  }
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.addgift() function
  $scope.savegift = function(gift) {    
    successFn = function() {
                 if(add) {$scope.gifts.reverse();$scope.gifts.push(savedgift);$scope.gifts.reverse();}
                 $scope.currentgift = {};
                 $scope.currentgift.recipients = [];
                 refreshWishlist();
               };
    
    $scope.savegift_takingargs(gift, successFn);
  }   
  
  
  // by 'takingargs', we mean this function is like $scope.savegift() except that $scope.savegift_takingargs() takes args,
  // namely the success function that will be called after the gift is saved
  $scope.savegift_takingargs = function(gift, successFn) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    
    var saveparms = {giftId:gift.id, updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$rootScope.user.id, 
               senderId:gift.sender, senderName:gift.sender_name};
               
    console.log('savegift_takingargs: saveparms=', saveparms);
               
               
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    var savedgift = Gift.save(saveparms, successFn);
               
  } 
  
  
  
  // 2013-08-22: 'product' is the result of a barcode scan
  $scope.showproduct = function(product) {
    $scope.product = product;
  }
  
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.deletegift() function
  $scope.deletegift = function(gift) {
    $scope.gifts.splice($scope.index, 1);
    Gift.delete({giftId:gift.id, updater:$rootScope.user.fullname}, 
                  function() {
                    refreshWishlist();
                  } // end success function
               );
  }
  
  
  // simple setter as we go from the wishlist page to the gift (details) page
  $scope.setcurrentgift = function(index, gift) {
    $scope.index = index; // so that if we delete the gift we know where it is in the list 'gifts'
    $scope.currentgift = gift;
    console.log('currentgift:', gift);
  }
  
  
  // 2013-08-08  taken from app-GiftCtrl.js
  $scope.giftlist = function(circle, participant) {
    
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
  
    $scope.gifts = Gift.query({viewerId:$rootScope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              $scope.gifts.ready = true;
                              $scope.circle = circle;
                              $rootScope.showUser = participant;
                              if($rootScope.user.id == participant.id) { $scope.gifts.mylist=true; } 
                              else { $scope.gifts.mylist=false; } 
                              console.log(JSON.stringify($rootScope.showUser));
                              refreshWishlist();
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 402)");});
  }
  
  
  $scope.mywishlist_takingargs = function(successFn) {
      $rootScope.showUser = $rootScope.user;
      console.log('mywishlist_takingargs: set $rootScope.showUser = $rootScope.user', $rootScope.showUser);
      $scope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            successFn,
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }
  
  
  $scope.mywishlist = function() {
      successFn = function() { 
                              $scope.gifts.mylist=true;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              console.log("mywishlist with successFn");
                              refreshWishlist();
                            };
      $scope.mywishlist_takingargs(successFn);
  }
  
  
  // 2013-08-22: originally created to pass in a barcode-scanned product.  product has 'name' and 'url'
  $scope.addtomywishlist = function(product) {
    delete $scope.circle;                     // have to prep before you call initNewGift()
    $rootScope.showUser = $rootScope.user;    // have to prep before you call initNewGift()
    $scope.initNewGift(); // produces $scope.currentgift
    successFn = function() {
	    $scope.currentgift.description = product.name;
	    $scope.currentgift.url = product.url;
	    $scope.currentgift.affiliateUrl = product.url;
        $scope.gifts.mylist=true;
        $scope.gifts.ready="true";
        delete $scope.circle;
        console.log('success: deleted the current circle');
	    $scope.savegift_takingargs($scope.currentgift, 
	        function() {
                $scope.gifts.reverse();$scope.gifts.push($scope.currentgift);$scope.gifts.reverse();
                $scope.currentgift = {};
                $scope.currentgift.recipients = [];
	            refreshWishlist();
	        }
	    );
    }
    // we don't have to check to see if the 'showUser' is the current user; we make them equal if they aren't
    // and if they are already, setting them equal in the function below is of no consequence
    $scope.mywishlist_takingargs(successFn);
  }