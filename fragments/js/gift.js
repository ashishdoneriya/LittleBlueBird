
  
  
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
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    var savedgift = Gift.save(saveparms,
               function() {
                 if(add) {$scope.gifts.reverse();$scope.gifts.push(savedgift);$scope.gifts.reverse();}
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
    $scope.gifts.splice($scope.index, 1);
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
  
  
  // 2013-08-08  taken from app-GiftCtrl.js
  $scope.giftlist = function(circle, participant) {
    
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
  
    $scope.gifts = Gift.query({viewerId:$rootScope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              $scope.gifts.ready = true;
                              $scope.circle = circle;
                              $rootScope.showUser = participant;
                              if($rootScope.user.id == participant.id) { $scope.gifts.mylist=true; } else { $scope.gifts.mylist=false; } 
                              
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 402)");});
  }
  
  
  $scope.mywishlist = function() {
      $rootScope.showUser = $rootScope.user;
      $scope.gifts = Gift.query({viewerId:$rootScope.user.id}, 
                            function() { 
                              $scope.gifts.mylist=true;
                              $scope.gifts.ready="true";
                              delete $scope.circle;
                              jQuery("#wishlistview").hide();
                              setTimeout(function(){
                                jQuery("#wishlistview").listview("refresh");
                                jQuery("#wishlistview").show();
                              },0);
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 501)");});
  }