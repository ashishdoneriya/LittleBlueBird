
  
  
  // 2013-07-26  copied/adapted from app-GiftCtrl's $scope.initNewGift() function
  $scope.initNewGift = function() {
    delete $scope.currentgift;
    if(angular.isDefined($scope.circle)) {
      $scope.currentgift = {addedBy:$rootScope.user.id, circle:$scope.circle};
      $scope.currentgift.recipients = angular.copy($scope.circle.participants.receivers);
    }
    else {
      $scope.currentgift = {addedBy:$rootScope.user.id};
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
    successFn = function(savedgift) {
                 add = true;
                 for(var i=0; i < $scope.gifts.length; ++i) {
                   if($scope.gifts[i].id == savedgift.id) {
                     add = false;
                     break;
                   }
                 }
                 
                 if(add) {
                   $scope.gifts.reverse();
                   $scope.gifts.push(gift);
                   $scope.gifts.reverse();
                 }
                 
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
    
    for(var i=0; i < gift.recipients.length; ++i) {
      gift.recipients[i].checked = true;
    }
    
    // we need recipientId for gift.edbr on the server side
    var saveparms = {giftId:gift.id, updater:$rootScope.user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy, recipientId:$rootScope.showUser.id, recipients:gift.recipients, viewerId:$rootScope.user.id, 
               senderId:gift.sender, senderName:gift.sender_name};
               
    console.log('savegift_takingargs: saveparms=', saveparms);
               
               
    if($scope.circle != undefined)
      saveparms.circleId = $scope.circle.id;
    
    console.log(saveparms);
    
    savedgift = Gift.save(saveparms, 
        function() {
            console.log('got this savedgift', savedgift); // we do get this
            successFn(savedgift);
        }, 
        function() {console.log("$scope.savegift_takingargs: FAIL FUNCTION")});
               
  } 
  
  
  
  // 2013-08-22: 'product' is the result of a barcode scan
  $scope.convertProductToGift = function(product) {
    $scope.currentgift = Gift.convertProductToGift(product, $scope.circle, $rootScope.user);
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
  
  
  $scope.selectrecipient = function(recipient, gift, isnewperson) {
      delete $scope.circle;                  
      delete $scope.mayberecipients;
      if(!angular.isDefined(gift.recipients))
        gift.recipients = [];
      gift.recipients.push(recipient);
    
    
      if(isnewperson) {
        // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
        
        onSuccessfulSaveOfNewUser = function() {    
                                $rootScope.showUser = anewuser;
                                User.addfriend($rootScope.user, anewuser);
                                $scope.friendwishlist(anewuser);
                              }
        
        anewuser = User.save({fullname:recipient.name, email:recipient.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                              onSuccessfulSaveOfNewUser
                            );
      }
      else {
        // In this case, the user has chosen an existing user to be the recipient of the gift
        // Make the user and the recipient friends if they aren't already
        User.addfriend($rootScope.user, recipient);
        
        
        $rootScope.showUser = recipient;
        
		onsuccessfulWishlistQuery = function() {
	        $scope.gifts.mylist=false;
	        $scope.gifts.ready="true";
		    refreshWishlist();
		}
		
        failWishlistQuery = function() {alert("Hmmm... Had a problem getting "+recipient.fullname+"'s list\n  Try again  (error code 502)");};
        
		onsuccessfulSave = function(savedgift) {
	      $scope.currentgift = {};
	      $scope.currentgift.recipients = [];
		  // now requery for the recipient's wishlist
	      $scope.friendwishlist_takingargs(recipient, onsuccessfulWishlistQuery, failWishlistQuery);
		};
        
        $scope.savegift_takingargs(gift, onsuccessfulSave);
        
      }
    
  }
  
  
  // 2013-08-22: originally created to pass in a barcode-scanned product.  product has 'name' and 'url'
  $scope.addtomywishlist = function(gift) {
    delete $scope.circle;                     
    $rootScope.showUser = $rootScope.user; 
    if(!angular.isDefined(gift.recipients)) gift.recipients = [];
    gift.recipients.push($rootScope.user);
    console.log('gift.recipients:', gift.recipients);
    
	onsuccessfulWishlistQuery = function() {
        $scope.gifts.mylist=true;
        $scope.gifts.ready="true";
        delete $scope.circle;
        console.log('success: deleted the current circle');
	    refreshWishlist();
	}
	    
	onsuccessfulSave = function(savedgift) {
	  // now requery for my wishlist
      $scope.currentgift = {};
      $scope.currentgift.recipients = [];
      $scope.mywishlist_takingargs(onsuccessfulWishlistQuery);
	};
	    
    $scope.savegift_takingargs(gift, onsuccessfulSave);
    
  }
  
  
  // If someone is already friends with the person they are making the recipient, don't ask them if the person we found is the person they want - we know it is
  // We have to check the user's list of friends
  $scope.addRecipientByEmail = function(recipient, gift) {
      console.log('addRecipientByEmail: recipient=', recipient);
      $scope.searching = true;
      $scope.mayberecipients = User.query({email:recipient.email},
          function() {
              if(!angular.isDefined(gift.recipients)) gift.recipients = [];
              if($scope.mayberecipients.length==0) {
                  // if no one comes back in this query, then 'recipient' is a brand new user whose account needs to be created for him
                  
		          // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
		          anewuser = User.save({fullname:recipient.name, email:recipient.email, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                              function() {
                                // now that the new user's account has been created, he has to be made a recipient of the gift
                                $rootScope.user.friends.push(anewuser);
                                gift.recipients.push(anewuser);
                                $scope.savegift(gift);
                                $scope.friendwishlist(anewuser);
                              } // end success function
                            );
              }
              else {
                  // Here, we need to see if exactly one person came back and if that person is already a friend of the user,
                  // because if the user and this person are already friends, we don't have to ask the user if "this is the person you want" - we know it is
                  var alreadyfriends = User.alreadyfriends($rootScope.user, $scope.mayberecipients[0]);
                  if(alreadyfriends) {

			        $rootScope.showUser = $scope.mayberecipients[0];
			        
		            var parms = {recipient:$rootScope.showUser, gift:gift, user:$rootScope.user, 
		                         saveGiftSuccessFn:onsuccessfulSave};
			        
                    Gift.addrecipient(parms);
                    
                    delete $scope.circle; 
                    delete $scope.mayberecipients;
                  }
                  else {// FYI - this 'else' doesn't matter.  If we hit this block, there's nothing to do.  It means the email address
	                  // we entered returned 1 or more people.  In that event, the wishlist page displays the list of 'mayberecipients'
	                  // There is nothing for us to do in this 'else' case except refresh the list of 'mayberecipients' to ensure the css styles are still applied
			          jQuery("#mayberecipientsview").hide();
			            setTimeout(function(){
			              jQuery("#mayberecipientsview").listview("refresh");
			              jQuery("#mayberecipientsview").show();
			          },0);
                  }
              
	                  
		      }
		      delete $scope.searching;
          });
  }
  
  
  var onsuccessfulWishlistQuery = function() {
				        $scope.gifts.mylist=false;
				        $scope.gifts.ready="true";
					    refreshWishlist();
					};
					
  var failWishlistQuery = function() {alert("Hmmm... Had a problem getting "+recipient.fullname+"'s list\n  Try again  (error code 502)");};
  
  var onsuccessfulSave = function(savedgift) {
				      $scope.currentgift = {};
				      $scope.currentgift.recipients = [];
					  // now requery for the recipient's wishlist
				      $scope.friendwishlist_takingargs($rootScope.showUser, onsuccessfulWishlistQuery, failWishlistQuery);
					};
  
  
  $scope.addrecipient = function(recipient, gift) {
    $rootScope.showUser = recipient;
    var parms = {recipient:$rootScope.showUser, gift:gift, user:$rootScope.user, 
                 saveGiftSuccessFn:onsuccessfulSave};
                 
    Gift.addrecipient(parms);
    
    delete $scope.circle; 
  }
  
  
  $scope.prepareMultipleRecipients = function(recipient, gift) {
    if(!angular.isDefined($scope.recipientstoadd))
      $scope.recipientstoadd = [];
    if('checked' == jQuery("#makefriendrecipient-"+recipient.id).attr('checked'))
      $scope.recipientstoadd.push(recipient);
    else {
      for(var i=0; i < $scope.recipientstoadd.length; i++ ) {
        var ff = $scope.recipientstoadd[i].id;
        if(ff == recipient.id) {
          $scope.recipientstoadd.splice(i, 1);
          break;
        }
      }
    }
    
    console.log('$scope.recipientstoadd', $scope.recipientstoadd);
  }
  
  
  refreshRecipientList = function() {
	  jQuery("#recipientsview").hide();
	    setTimeout(function(){
	      jQuery("#recipientsview").listview("refresh");
	      jQuery("#recipientsview").show();
	  },0);
  }
  
  
  // 2013-08-26 
  // We don't need to also query for a wishlist because there are several recipients.  We let the user tap one of the recipients on the next page, #recipients
  $scope.addrecipients = function(recipients, gift) {
    $scope.loading = true;
    var onsuccessfulGiftSave = function(savedgift) {
      $scope.recipientsjustadded = angular.copy(recipients);
      recipients.splice(0, recipients.length);
      refreshRecipientList();
      delete $scope.loading;
    }
    var parms = {recipients:recipients, gift:gift, user:$rootScope.user, saveGiftSuccessFn: onsuccessfulGiftSave};
    Gift.addrecipients(parms);
  }
  
  
  // 2013-08-26 
  $scope.beginAddingRecipients = function(gift) {
    
  }
  
  
  
  // 2013-08-26 modeled after $scope.prepareDeleteFriends 
  $scope.prepareDeleteRecipients = function() {
    $scope.recipientstodelete = [];
  }
  
  
  // 2013-08-26 modeled after $scope.prepareDeleteFriend
  $scope.prepareDeleteRecipient = function(recipient) {
    if('checked' == jQuery("#deleterecipient-"+recipient.id).attr('checked'))
      $scope.recipientstodelete.push(recipient);
    else {
      for(var i=0; i < $scope.recipientstodelete.length; i++ ) {
        var ff = $scope.recipientstodelete[i].id;
        if(ff == recipient.id) {
          $scope.recipientstodelete.splice(i, 1);
          break;
        }
      }
    }
  } 
  
  
  $scope.removeRecipients = function(gift, recipients) {
    onsuccessfulRemoval = function(savedgift) {recipients.splice(0, recipients.length);$scope.currentgift = savedgift;}
    parms = {deleteRecipients:recipients, 
             gift:gift, 
             recipients:recipients, 
             updaterName:$rootScope.user.fullname, 
             viewerId:$rootScope.user.id,
             successFn:onsuccessfulRemoval};
    $scope.currentgift = Gift.removeRecipients(parms);
  }