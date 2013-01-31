function GiftListCtrl($window, $location, $route, $scope, Gift, User, Circle, $rootScope, facebookConnect, $cookieStore) {
  
  
  if(angular.isDefined(Circle.currentCircle)) {
    $rootScope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    // circleId parm will have a & on the end that needs to be stripped off when coming to someone's 
    // wish list FROM FACEBOOK.  I set $window.location.search to '' in app.js:run()
    // THIS CODE IS DUPLICATED IN app-GiftCtrl:Gift2Ctrl
    var circleId = $route.current.params.circleId;
    console.log("GiftListCtrl:  BEFORE circleId="+circleId);
    if(circleId.substring(circleId.length - 1) == '&') circleId = circleId.substring(0, circleId.length-1);
    console.log("GiftListCtrl:  AFTER circleId="+circleId);
    $rootScope.circle = Circle.query({circleId:circleId}, function() {Circle.currentCircle = $rootScope.circle;console.log("GiftListCtrl: $rootScope.circle....");console.log($rootScope.circle);}, function() {alert("Could not find Event "+circleId);});
  }
  else {
    delete $rootScope.circle;
  }
  
  
  // to recreate the giftlist if the user hits refresh or if the user comes to this page via a link FB or wherever
  if(angular.isDefined($route.current.params.showUserId)) {
    var queryparams = {recipientId:$route.current.params.showUserId, viewerId:$cookieStore.get("user")};

    if(angular.isDefined($route.current.params.circleId)) {
      queryparams.circleId = $rootScope.circle.id;
    }
    
    console.log("Gift2Ctrl: queryparams...  look for viewerId");
    console.log(queryparams);
    
    $rootScope.gifts = Gift.query(queryparams, 
                            function() { 
                              Circle.gifts = $rootScope.gifts; 
                              console.log("$rootScope.gifts.length = "+$rootScope.gifts.length);
                              console.log($rootScope.gifts);
                              //if($rootScope.user.id == participant.id) { Circle.gifts.mylist=true; } else { Circle.gifts.mylist=false; } 
                              //$rootScope.$emit("circlechange");   // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting this person's list\n  Try again  (error code 301)");});
                            
  }
  else if($location.url()=='/mywishlist' && $cookieStore.get("user")!=null) {
    
    $rootScope.gifts = Gift.query({viewerId:$cookieStore.get("user")}, 
                            function() { 
                              Circle.gifts = $rootScope.gifts; 
                              Circle.gifts.mylist=true;
                              delete $rootScope.circle;
                              console.log($rootScope.circle);
                              $rootScope.showUser = $rootScope.user;
                              //$rootScope.$emit("circlechange");   // commented out on 11/30/12 - experimenting
                              //$rootScope.$emit("userchange");  // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+$rootScope.user.fullname+"'s list\n  Try again  (error code 302)");});
  }
  
  
  // BEGIN: Check for facebook request id in url.  If it's there, delete it.  The logged in user is the person
  // who received the request.  This is pretty nice clean up of request id's.
  
  //$scope.acceptAppRequest($window, facebookConnect);
  
  // END: Cleaning up facebook request id's.  This may end up getting moved somewhere else, but it's a nice demonstration
  // of how you delete app requests once they've been accepted.
  
  $scope.reminders = function(circle) {
    $rootScope.circle = circle;
    $location.url('/reminders');
  }
  
  $scope.initNewGift = function() {
    console.log("initnewgift() ------------------------");
    console.log($rootScope.circle);
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
    console.log("scope.needToSpecifyWhoTheGiftIsFor = "+$scope.needToSpecifyWhoTheGiftIsFor);
  }
  
  $scope.updategift = function(index, gift) {
    // the 'showUser' may not be a recipient anymore - have to check and remove from the showUser's list if so
    var remove = true;
    
    for(var i=0; i < gift.possiblerecipients.length; i++) {
      if(gift.possiblerecipients[i].checked) {
        gift.recipients.push(gift.possiblerecipients[i]);
        if(gift.possiblerecipients[i].id == $rootScope.showUser.id) {
          remove = false;
        }
      }
    }
    
    var savedgift = Gift.save({giftId:gift.id, updater:$rootScope.user.fullname, circleId:$rootScope.circle.id, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id, 
               senderId:gift.sender, senderName:gift.sender_name},
               function() {
                 if(remove) $rootScope.gifts.splice(index, 1);
                 else $rootScope.gifts.splice(index, 1, savedgift);
               });
  }
  
  $scope.addgift = function(gift) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    var add = false;
    console.log("$scope.addgift:  gift="+gift);
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
    
    var savedgift = Gift.save(saveparms,
               function() {
                 if(add) {$rootScope.gifts.reverse();$rootScope.gifts.push(savedgift);$rootScope.gifts.reverse();}
                 $scope.newgift = {};
                 $scope.newgift.recipients = [];
               });
               
  }
  
       
  $scope.canceleditgift = function(gift) {
    gift.editing=false;
    $scope.gift.description = $scope.giftorig.description;
    $scope.gift.url = $scope.giftorig.url;
  }     
  
  $rootScope.$on("circlechange", function(event) {
    console.log("GiftListCtrl: circlechange event received --------------------------------");
    $rootScope.gifts = Circle.gifts;
    //$rootScope should be updated by the function that triggered this event
  });
  
  
}

function GiftCtrl($rootScope, $location, $route, $cookieStore, $scope, Circle, Gift, User) { 

  $scope.popoverOptions = function(idx, gift) {
    var recipients = [];
    for(var i=0; i < gift.recipients.length; i++) {
      recipients.push(gift.recipients[i].first);
    }
    
    var date = new Date(gift.dateCreated);
    var datestr = date.toString('MMM d, yyyy');
    var surprise = gift.issurprise ? '<tr><td><B>DON\'T SAY ANYTHING!</B><P><B>'+gift.addedByName+' added this as a surprise</B></P><P>&nbsp;</P></td></tr>' : '';
    var availability = gift.sender_name!='' ? '<tr><td><P>&nbsp;</P><P><B>Not Available</B></P>This gift has already been bought by: '+gift.sender_name+'</P></td></tr>' : '<tr><td><P>&nbsp;</P><P><B>This item is Available</B></P><P>Reserve this item by clicking "Reserve"</P></td></tr>';
    var status = gift.canseestatus ? availability : '';
    var buyonline = gift.affiliateUrl=='' ? '<tr><td><P>&nbsp;</P><P><B>No Link Provided</B></P><P>'+gift.addedByName+' did not provide a link for this item</P></td></tr>' : '<tr><td><P>&nbsp;</P><P><B>Buy Online!</B></P><P>Click the item to buy it online</P></td></tr>'
     
    var cnt = '<table border="0" width="100%"><tr><td align="right">Added: '+datestr+'</td></tr>'
             + surprise
             + '<tr><td>'+gift.description+'</td></tr>'
             + status
             + buyonline
             +'</table>';
    var plcmt = idx < 2 ? 'bottom' : 'right';
    return {title:'Gift for '+recipients.join(','), content:cnt, placement:plcmt}
  }
  
  $rootScope.$on("circlechange", function(event) {
    $rootScope.gifts = Circle.gifts;
    //console.log("GiftCtrl:  notified of 'circlechange'...  $rootScope.gifts=...");
    //console.log($rootScope.gifts);
  });
  
  $scope.alertcannotedit = function() {alert('Cannot edit this item because you didn\'t add it');}
  
  $scope.alertcannotdelete = function() {alert('Cannot delete this item because you didn\'t add it');}
  
  
  
  $scope.startbuying = function(gift) {
    gift.buying = true;
    gift.senderId = $rootScope.user.id;
    gift.senderName = $rootScope.user.first;
  }
  
  
  $scope.buygift = function(index, gift, recdate) {
    var circleId = angular.isDefined($rootScope.circle) ? $rootScope.circle.id : -1;
    gift.receivedate = new Date(recdate);
    var savedgift = Gift.save({giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, recipientId:$rootScope.showUser.id, senderId:gift.senderId, senderName:gift.senderName, receivedate:gift.receivedate.getTime()},
               function() { $rootScope.gifts.splice(index, 1, savedgift); });
  }
  
  
  $scope.returngift = function(index, gift) {
    var circleId = angular.isDefined($rootScope.circle) ? $rootScope.circle.id : -1;
    var savedgift = Gift.save({giftId:gift.id, updater:$rootScope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$rootScope.user.id, 
                               recipientId:$rootScope.showUser.id, senderId:-1, senderName:''},
               function() { $rootScope.gifts.splice(index, 1, savedgift); });
  }
    
  
  $scope.editgift = function(gift) {
    gift.possiblerecipients = angular.copy($rootScope.circle.participants.receivers)
      
    for(var j=0; j < gift.recipients.length; j++) {
      for(var i=0; i < gift.possiblerecipients.length; i++) {
        if(gift.recipients[j].id == gift.possiblerecipients[i].id)
          gift.possiblerecipients[i].checked = true;
      }
    }
    gift.editing = true;
    $scope.gift = gift;
    $scope.giftorig = angular.copy(gift);
  }
  
  $scope.deletegift = function(index, gift) {
    $rootScope.gifts.splice(index, 1);
    Gift.delete({giftId:gift.id, updater:$rootScope.user.fullname});
  }
                  
  
  $scope.giftlist = function(circle, participant) {
    
    console.log("$scope.giftlist(): $rootScope.gifts.......commented out stuff");
  
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
  
    $rootScope.gifts = Gift.query({viewerId:$rootScope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              //console.log("scope.giftlist: SETTING path to '/giftlist/#/#/'");
                              //$location.path('/giftlist/'+participant.id+'/'+circle.id);
                              //Circle.gifts = $rootScope.gifts; 
                              //Circle.currentCircle = circle; // phase this strategy out
                              $rootScope.gifts.ready = true;
                              $rootScope.circle = circle;
                              $rootScope.showUser = participant;
                              if($rootScope.user.id == participant.id) { $rootScope.gifts.mylist=true; } else { $rootScope.gifts.mylist=false; } 
                              //$rootScope.$emit("giftlist2");
                              //$rootScope.$emit("circlechange");   // commented out on 11/30/12 - experimenting
                              //$rootScope.$emit("userchange");     // commented out on 11/30/12 - experimenting
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 401)");});
  }
}