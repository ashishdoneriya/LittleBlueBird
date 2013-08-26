
angular.module('Gift', ['ngResource']).
  factory('Gift', function($resource) {
      var Gift = $resource('http://www.littlebluebird.com/gf/rest/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });
                    
      // product is a barcode-scanned product              
      Gift.convertProductToGift = function(product, circle, user) {
        var gift = {addedBy:user.id};
	    if(angular.isDefined(circle))
	      gift.circle = circle;
		gift.description = product.name;
		gift.url = product.url;
		gift.affiliateUrl = product.url;
		gift.canedit = true;
	    console.log('Gift.convertProductToGift: gift=', JSON.stringify(gift))
		return gift;
      }
      
      
      
      Gift.addrecipient = function(parms) {
          var recipient = parms.recipient;
          var gift = parms.gift;
          var user = parms.user;
          var saveGiftSuccessFn = parms.saveGiftSuccessFn;
          
	      if(!angular.isDefined(gift.recipients))
	        gift.recipients = [];
	      gift.recipients.push(recipient);
	      
	      for(var i=0; i < gift.recipients.length; ++i) {
	        gift.recipients[i].checked = true;
	      }
	      
	      // we need recipientId for gift.edbr on the server side
	      var saveparms = {giftId:gift.id, updater:user.fullname, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy, recipientId:recipient.id, recipients:gift.recipients, viewerId:user.id, 
               senderId:gift.sender, senderName:gift.sender_name};
          
          // not even going to mess with whether there is a circle or not
          
	      savedgift = Gift.save(saveparms, 
	        function() {
	            console.log('Gift.addrecipient: got this savedgift', savedgift); // we do get this
	            saveGiftSuccessFn(savedgift);
	        }, 
	        function() {console.log("$scope.savegift_takingargs: FAIL FUNCTION")});
      }
      

      return Gift;
  });