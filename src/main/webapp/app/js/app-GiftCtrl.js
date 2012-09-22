
function GiftCtrl($rootScope, $route, $cookieStore, $scope, Circle, Gift, User) { 

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
  
  $scope.alertcannotedit = function() {alert('Cannot edit this item because you didn\'t add it');}
  
  $scope.alertcannotdelete = function() {alert('Cannot delete this item because you didn\'t add it');}
  
  $scope.initNewGift = function() {
    $scope.newgift = {addedBy:$scope.user, circle:$scope.circle};
    $scope.newgift.recipients = angular.copy($scope.circle.participants.receivers);
    for(var i=0; i < $scope.newgift.recipients.length; i++) {
      if($scope.newgift.recipients[i].id == $scope.showUser.id)
        $scope.newgift.recipients[i].checked = true;
    }
  }
  
  
  $scope.addgift = function(gift) {
    // the 'showUser' doesn't have to be a recipient - only add if it is
    var add = false;
    for(var i=0; i < gift.recipients.length; i++) {
      if(gift.recipients[i].checked && gift.recipients[i].id == $scope.showUser.id) {
        add = true;
        //alert(" gift.recipients["+i+"].checked="+gift.recipients[i].checked+"\n gift.recipients["+i+"].id="+gift.recipients[i].id+"\n $scope.showUser.id="+$scope.showUser.id);
      }
    }
    
    var savedgift = Gift.save({updater:$scope.user.fullname, circleId:$scope.circle.id, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id},
               function() {
                 if(add) {$scope.gifts.reverse();$scope.gifts.push(savedgift);$scope.gifts.reverse();}
                 $scope.newgift = {};
                 $scope.newgift.recipients = [];
               });
               
  }
  
  
  $scope.updategift = function(index, gift) {
    // the 'showUser' may not be a recipient anymore - have to check and remove from the showUser's list if so
    var remove = true;
    
    for(var i=0; i < gift.possiblerecipients.length; i++) {
      if(gift.possiblerecipients[i].checked) {
        gift.recipients.push(gift.possiblerecipients[i]);
        if(gift.possiblerecipients[i].id == $scope.showUser.id) {
          remove = false;
        }
      }
    }
    
    var savedgift = Gift.save({giftId:gift.id, updater:$scope.user.fullname, circleId:$scope.circle.id, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id, 
               senderId:gift.sender, senderName:gift.sender_name},
               function() {
                 if(remove) $scope.gifts.splice(index, 1);
                 else $scope.gifts.splice(index, 1, savedgift);
               });
  }
  
  
  $scope.startbuying = function(gift) {
    gift.buying = true;
    gift.senderId = $scope.user.id;
    gift.senderName = $scope.user.first;
  }
  
  
  $scope.buygift = function(index, gift, recdate) {
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    gift.receivedate = new Date(recdate);
    var savedgift = Gift.save({giftId:gift.id, updater:$scope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id, senderId:gift.senderId, senderName:gift.senderName, receivedate:gift.receivedate.getTime()},
               function() { $scope.gifts.splice(index, 1, savedgift); });
  }
  
  
  $scope.returngift = function(index, gift) {
    var circleId = angular.isDefined($scope.circle) ? $scope.circle.id : -1;
    var savedgift = Gift.save({giftId:gift.id, updater:$scope.user.fullname, circleId:circleId, recipients:gift.recipients, viewerId:$scope.user.id, 
                               recipientId:$scope.showUser.id, senderId:-1, senderName:''},
               function() { $scope.gifts.splice(index, 1, savedgift); });
  }
    
  
  $scope.editgift = function(gift) {
    gift.possiblerecipients = angular.copy($scope.circle.participants.receivers)
      
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
    $scope.gifts.splice(index, 1);
    Gift.delete({giftId:gift.id, updater:$scope.user.fullname});
  }
       
  $scope.canceleditgift = function(gift) {
    gift.editing=false;
    $scope.gift.description = $scope.giftorig.description;
    $scope.gift.url = $scope.giftorig.url;
  }     
                  
  
  // duplicated in CircleCtrl
  $scope.giftlist = function(circle, participant) {
  
    // We're expanding this to allow for null circle
    // How do we tell if there's no circle?
  
    $scope.gifts = Gift.query({viewerId:$scope.user.id, circleId:circle.id, recipientId:participant.id}, 
                            function() { 
                              Circle.gifts = $scope.gifts; 
                              Circle.currentCircle = circle;
                              User.currentUser = $scope.user;
                              User.showUser = participant;
                              if($scope.user.id == participant.id) { Circle.gifts.mylist=true; } else { Circle.gifts.mylist=false; } 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again  (error code 101)");});
  }
  
  // just like $scope.giftlist above but no circle here
  $scope.friendwishlist = function(friend) {
    gifts = Gift.query({recipientId:friend.id, viewerId:$scope.user.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=false;
                              var x;
                              Circle.currentCircle = x; 
                              User.currentUser = $scope.user;
                              User.showUser = friend;
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+friend.first+"'s list\n  Try again  (error code 201)");});
  }
}