
// delete app requests: http://developers.facebook.com/docs/requests/#deleting
// source:  http://jsfiddle.net/mkotsur/Hxbqd/
angular.module('FacebookModule', ['UserModule']).factory('facebookConnect', [function() {
    return new function() {
        this.askFacebookForAuthentication = function(fail, success) {
            console.log("askFacebookForAuthentication:  FB...");
            console.log(FB);
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            }, {scope:'email',perms:'publish_stream'});
        }
        
        this.getLoginStatus = function(connected, notauthorized, unknown) {
          if(FB == undefined) console.log("this.getLoginStatus:  FB == undefined");
          if(FB === undefined) console.log("this.getLoginStatus:  FB === undefined");
          FB.getLoginStatus(function(response) {
            if(response.status == 'connected') {
              connected(response);
            }
            else if(response.status == 'not_authorized') {
              notauthorized(response);
            }
            else {
              unknown(response);
            }
          });
          console.log("this.getLoginStatus: NNNNNNNNNNNNNNNNNNNNNNNN");
        }
        
        this.logout = function(response) {
          console.log("this.logout = function(response) ----------------");
          
        }
        
    } // return new function()
    
}])
.factory('facebookFriends', function() {
  return new function() {
    this.getfriends = function(offset, limit, success, fail) {
      var url = '/me/friends?offset='+offset+'&limit='+limit;
      console.log("facebookFriends.getfriends(): 3333333333333 url="+url);
      FB.api(url, success);
    };
    // FB breaking change: limit=0 no longer returns all friends -> https://developers.facebook.com/roadmap/#q4_2013
    this.get10Friends = function(success, fail) {
      return this.getfriends(0, 10, success, fail);
    }
  }
}).run(function($rootScope, $window, $cookieStore, $location, facebookConnect, facebookFriends, AppRequest, UserSearch, User, FacebookServerSide) {
    
    // 3/12/13 This function will actually log the user out of Facebook - not sure if this really what we want to do.
    // Other sites don't behave this way, even when you login via fb.
    $rootScope.fblogout = function() {
      $cookieStore.remove("user");
      $cookieStore.remove("showUser");
      if(!angular.isDefined($rootScope.user.facebookId) || $rootScope.user.facebookId==null) {
        console.log("user's facebook id is undefined - returning early - don't try FB.logout()");
        $location.url('home');
        return;
      }
      console.log("$rootScope.user.facebookId="+$rootScope.user.facebookId+" - therefore we ARE going to do FB.logout()");
      console.log("FB.logout ---------------- FB = ...");
      console.log(FB);
      FB.logout(function(response){
        console.log("FB.logout:  response...");
        console.log(response);
        $location.url('home');
      });
    }
    
        
    $rootScope.fbinviteasfriend = function() { $rootScope.fbinvite(false, ''); }
    
    $rootScope.fbinviteasgiver = function() { $rootScope.fbinvite(true, 'Giver'); }
    
    $rootScope.fbinviteasreceiver = function() { $rootScope.fbinvite(true, 'Receiver'); }

    $rootScope.fbinvite = function(includeinevent, participationlevel) {
      
      console.log('$rootScope.fbinvite(): THIS WHOLE FUNCTION HAS BEEN COMMENTED OUT');
      // this works - sends a private message
      //FB.ui({app_id:'136122483829', method:'send', link:'http://www.littlebluebird.com/gf/index.html', message:'dude this is awesome'})
      
    }
    
    $rootScope.sendFacebookMessage = function(person) {
      FB.ui({to:person.facebookId, method:'send', link:'http://www.littlebluebird.com/gf/'})
    }
    
    
    $rootScope.registerWithFacebook = function() {
        facebookConnect.askFacebookForAuthentication(
          function(reason) { // fail
            $rootScope.error = reason;
            console.log("Facebook Module:  $rootScope.registerWithFacebook:  reason="+reason);
          }, 
          function(user) { // success
            console.log("app-FacebookModule.js:  $rootScope.registerWithFacebook:  success...");
            $rootScope.initfbuser(user);
            //$rootScope.$apply() // Manual scope evaluation - commented out on 11/30/12 - experimenting
          }
        );
    } 
    
    
    // can also supply a "to" argument with value of someone's facebook id whose wall/timeline you want to post on
    // but beware, that person may not allow that
    $rootScope.fbsharelist = function(showUser) {
      FB.ui({
          method:'feed',
          name:'I\'ve updated my wish list. Check it out on LittleBlueBird.com [FREE for all subscribers]',
          caption:'Give what THEY want - Get what YOU want',
          description:'This is the site my friends and family use to keep track of everyone\'s wish list',
          link:'http://www.littlebluebird.com/gf/giftlist/'+showUser.id+'/',
          picture:'http://www.littlebluebird.com/gf/img/logo-whitebackground.gif',
          //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
          user_message_prompt:'user message prompt?'},
        function(response) {
          if(response && response.post_id) {
            console.log('$rootScope.fbsharelist():  post was successful');
          }
          else {
            console.log('$rootScope.fbsharelist():  post was not published');
          }
        });
    }
    
    $rootScope.initfbuser = function(user) {
      $rootScope.fbuser = user;
      console.log("$rootScope.initfbuser...");
      console.log($rootScope.fbuser);
      
      var fbLoginStatus = function() {
	    //get access token and pass to the server; get all friends on the server not the client
	    // so I can make a call like this on the server:
	    // 		https://graph.facebook.com/569956369/friends?limit=0&offset=0&access_token=CAAAAH7GIRHUBAEJqVt3iB3Lut0BkFoSMFW0gM32LNpZATLoe140CTMAUe3QSxK1qnficW9wr9ZApT4xG1CUgaiuMoL3e7zoxV8jZAfDulYGD8czWpZAxB8aLIP5f4TFkajsJDf5OaRnpHOPXqmdO3bpagMJnNnM3ho8PgXBixF3exAUrr3vfXG4TnC8xZBHzcIDTV1p05oAZDZD&__after_id=100005734893581%22
	    FB.getLoginStatus(function(response) {
	      console.log("access token:", response.authResponse.accessToken);
	       var peopleToFollow = FacebookServerSide.friends({accessToken:response.authResponse.accessToken, facebookId:user.id, userId:$rootScope.user.id, queryType:'peopleToFollow'},
	                  function() {$rootScope.user.peopleToFollow = peopleToFollow; console.log("FacebookServerSide SUCCESS: $rootScope.user.peopleToFollow", $rootScope.user.peopleToFollow)},
	                  function() {console.log("FacebookServerSide FAIL: $rootScope.peopleToFollow -------------------------")});
	                  
	       var peopleToInvite = FacebookServerSide.friends({accessToken:response.authResponse.accessToken, facebookId:user.id, userId:$rootScope.user.id, queryType:'peopleToInvite'},
	                  function() {$rootScope.user.peopleToInvite = peopleToInvite; console.log("FacebookServerSide SUCCESS: $rootScope.user.peopleToInvite", $rootScope.user.peopleToInvite)},
	                  function() {console.log("FacebookServerSide FAIL: $rootScope.peopleToInvite --------------------")});
	    });
      }
      
      // could get more than one person back - parent + children
      // So this method allows for the fact that the user may have an LBB account that has not yet
      // been "merged" with the FB account.  That's why we're querying by email and not fb id: because person.facebook_id
      // may be null
      // UserSearch.query DOESN'T TAKE A LOGIN:TRUE PARAMETER
      $rootScope.users = UserSearch.query({login:true, search:$rootScope.fbuser.email}, 
                    function() {
                      console.log("$rootScope.initfbuser:  var users = UserSearch.query(): $rootScope.users...");
                      console.log($rootScope.users);
                      var alreadymergedaccount = false;
                      for(var i=0; i < $rootScope.users.length; i++) {
                        if($rootScope.users[i].facebookId == $rootScope.fbuser.id) {
                          alreadymergedaccount = true;
                          $rootScope.user = angular.copy($rootScope.users[i]);
                          $rootScope.showUser = angular.copy($rootScope.users[i]);
                          $cookieStore.put("user", $rootScope.user.id);
                          $cookieStore.put("showUser", $rootScope.showUser.id);
                        }
                      }
                      console.log("$rootScope.initfbuser():  $rootScope.user="+$rootScope.user);
                      if(alreadymergedaccount) {
                        console.log("app-FacebookModule:  this is already a merged account, so going now to mywishlist");
					
					    
					    //get access token and pass to the server; get all friends on the server not the client
					    // so I can make a call like this on the server:
					    // 		https://graph.facebook.com/569956369/friends?limit=0&offset=0&access_token=CAAAAH7GIRHUBAEJqVt3iB3Lut0BkFoSMFW0gM32LNpZATLoe140CTMAUe3QSxK1qnficW9wr9ZApT4xG1CUgaiuMoL3e7zoxV8jZAfDulYGD8czWpZAxB8aLIP5f4TFkajsJDf5OaRnpHOPXqmdO3bpagMJnNnM3ho8PgXBixF3exAUrr3vfXG4TnC8xZBHzcIDTV1p05oAZDZD&__after_id=100005734893581%22
			            fbLoginStatus();
			            
					      
                        $location.url('me'); // TODO invalid url as of 2013-09-09
                      } 
                      else { // ...but in the beginning, this is what will happen - no record in our person table contains this facebookId
                        if($rootScope.users.length == 0) {
                           // need to create account for this person in LBB
                                                       
                           $rootScope.user = User.save({login:true, fullname:$rootScope.fbuser.first_name+' '+$rootScope.fbuser.last_name, first:$rootScope.fbuser.first_name, last:$rootScope.fbuser.last_name, username:$rootScope.fbuser.email, email:$rootScope.fbuser.email, password:$rootScope.fbuser.email, bio:'', profilepic:'http://graph.facebook.com/'+$rootScope.fbuser.id+'/picture?type=large', facebookId:$rootScope.fbuser.id}, 
                                               function() { 
                                                 $rootScope.showUser = angular.copy($rootScope.user);
                                                 $cookieStore.put("user", $rootScope.user.id);
                                                 $cookieStore.put("showUser", $rootScope.showUser.id);
                                                 console.log("just created an LBB account, check $rootScope.user", $rootScope.user);
                                                 $location.url('welcome');
                                               }
                                             );
                                             
                                             
						    fbLoginStatus();
                                             
                                             
                        }
                        else if($rootScope.users.length == 1) {  // easy... we found exactly one person with this email - set the facebookid
                          $rootScope.users[0].facebookId = $rootScope.fbuser.id;
                          $rootScope.user = angular.copy($rootScope.users[0]);
                          $rootScope.showUser = angular.copy($rootScope.users[0]);
                          $cookieStore.put("user", $rootScope.user.id);
                          $cookieStore.put("showUser", $rootScope.showUser.id);
                          console.log("$rootScope.users.length == 1:  $rootScope.users[0].profilepicUrl...");
                          console.log($rootScope.users[0].profilepicUrl);
                          var placeholderPic = "http://www.littlebluebird.com/gf/img/Silhouette-male.gif";
                                                         
                          console.log("$rootScope.users[0].profilepicUrl != placeholderPic...");
                          console.log($rootScope.users[0].profilepicUrl != placeholderPic);
                                                         
                          var pic = $rootScope.users[0].profilepicUrl != placeholderPic ? $rootScope.users[0].profilepicUrl : "http://graph.facebook.com/"+$rootScope.fbuser.id+"/picture?type=large";
                          
                          // TODO WHY ARE WE DOING THIS ????
                          var uagain = User.save({userId:$rootScope.user.id, facebookId:$rootScope.fbuser.id, profilepic:pic}, 
	                                       function() {
	                                         $rootScope.user = angular.copy(uagain); 
	                                         $rootScope.showUser = angular.copy(uagain);
										     //$rootScope.$emit("userchange"); // commented out on 11/30/12 - experimenting                                       
										     //$rootScope.$emit("mywishlist"); // commented out on 11/30/12 - experimenting
	                                         console.log("444444444444444444444444444444444444444");
										     $location.url('mywishlist');
										   });
										   
							
						    fbLoginStatus();
                                             
										   
										   
                        }
                        else if($rootScope.users.length > 1) {
                          // And if we happen to find several people all with the same email address and no FB id,
                          // we have to ask the user "who are you" and display all the people that have this email address
                          // "Why are you asking me?"... "What is a 'merged' account?"...  "Why do I need to 'merge' my accounts?"...
                          // These are all things we have to explain to the user on the mergeaccount page
                          $location.url('/whoareyou'); 
                        }
                      }
                    },
                    function() {alert("Could not log you in at this time (error 201)");});
    
    }
    

  })
	.run(function($rootScope) {
	  
	    $rootScope.$on('$routeChangeStart', function(scope, newRoute){ 
	    })   
	});