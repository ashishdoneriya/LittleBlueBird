
angular.module('GiftModule', ['UserModule']).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/rest/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });

      return Gift;
  })
.run(function($route, $cookieStore, $rootScope, $location, User, Gift, Circle) {
  
    // See events.html:  #/newevent/Christmas,Birthday,etc
    // This event is fired all the time, so make sure the url contains 'newevent' to proceed
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){ 
      if($location.url().indexOf("giftlist") != -1) {
      
      
	    // to recreate the giftlist if the user hits refresh or if the user comes to this page via a link FB or wherever
	    // 4/10/13: See also event.html - we list everyone in the event and their names are links.  When the user comes here from event.html, we have to construct the 'showUser' from a showUser id
		if(angular.isDefined(newRoute.params.showUserId)) {
	  
		    
		    if(angular.isDefined($rootScope.user) && angular.isDefined($rootScope.user.id)) {
		      queryparams = {recipientId:newRoute.params.showUserId, viewerId:$rootScope.user.id};
		      console.log("app-GiftModule: queryparams.viewerId = $rootScope.user.id: ", queryparams);
		    }
		    else if($cookieStore.get("user")!=null) {
		      queryparams = {recipientId:newRoute.params.showUserId, viewerId: $cookieStore.get("user")};
		      console.log("app-GiftModule: queryparams.viewerId = $cookieStore.get(\"user\"): ", queryparams);
		    }
		    else queryparams = {recipientId:newRoute.params.showUserId};
		    // and what if neither of these is true? not handled here !  2013-09-02
		
		
		    // 4/10/13: See also event.html - we list everyone in the event and their names are links.  
		    // When the user comes here from event.html, we have to construct the 'showUser' from a showUser id
		    $rootScope.showUser = User.find({userId:newRoute.params.showUserId}, function() {$cookieStore.put("showUser", $rootScope.showUser.id)});
		
		
		    if(angular.isDefined(newRoute.params.circleId)) {
		      queryparams.circleId = $rootScope.circle.id;
		    }
		    else delete $rootScope.circle;
		    
		    // you need a viewerId to figure out how the wishlist should look.  but we won't have a viewerId
		    // in posts to fb.  We have to get the viewerId from the fb user's info.  See routeChangeStart in app.js
		    // You'll see:  $rootScope.Facebook.getMe()
		    console.log("app-GiftModule: queryparams...  look for viewerId", queryparams);
		    
		    $rootScope.gifts = Gift.query(queryparams, 
		                            function() { 
		                              Circle.gifts = $rootScope.gifts; 
		                              console.log("app-GiftModule: $rootScope.gifts.length = "+$rootScope.gifts.length);
		                              console.log($rootScope.gifts);
		                              $rootScope.gifts.ready = true;
		                              $rootScope.gifts.mylist = $rootScope.user.id == newRoute.params.showUserId; 
		                            }, 
		                            function() {alert("Hmmm... Had a problem getting this person's list\n  Try again  (error code 301)");});
		                            
		}
		else if(($location.url()=='/mywishlist' || $location.url()=='/me') && $cookieStore.get("user")!=null) {
		    
		    $rootScope.gifts = Gift.query({viewerId:$cookieStore.get("user")}, 
		                            function() { 
		                              Circle.gifts = $rootScope.gifts; 
		                              Circle.gifts.mylist=true;
		                              delete $rootScope.circle;
		                              console.log($rootScope.circle);
		                              $rootScope.gifts.ready = true;
		                              $rootScope.showUser = $rootScope.user;
		                            }, 
		                            function() {alert("Hmmm... Had a problem getting "+$rootScope.user.fullname+"'s list\n  Try again  (error code 302)");});
		}
      
      
      
      
      
      
      
      
      
      
      
      
      } // if($location.url().indexOf("giftlist") != -1)
    })
 });