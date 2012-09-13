var app = angular.module('project', ['UserModule', 'datetime', 'FacebookModule']).
  config(function($routeProvider){
    $routeProvider.
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html', three:'partials/LittleBlueBird.html', four:'partials/navbar.html'}}).
      when('/whoareyou', {templates: {layout: 'layout-whoareyou.html', one: 'partials/login.html', two: 'partials/whoareyou.html', four:'partials/navbar.html'}}).
      when('/circles', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/friends', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/friends.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/gettingstarted', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/gettingstarted.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/giftlist/:showUserId/:circleId', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/myaccount/main.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/mywishlist', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/reminders', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/reminders.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/email', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/email.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      when('/welcome', {templates: {layout: 'layout.html', three: 'partials/mycircles.html', four: 'partials/welcome.html', five:'partials/navbar.html', six:'partials/profilepic.html'}}).
      otherwise({redirectTo: '/login', templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html', three:'partials/LittleBlueBird.html', four:'partials/navbar.html'}});
  }).run(function($route, $rootScope){    
    $rootScope.$on('$routeChangeStart', function(scope, newRoute){
        if (!newRoute || !newRoute.$route) return;
        $rootScope.templates = newRoute.$route.templates;
        $rootScope.layoutController = newRoute.$route.controller;
    });
    
});

angular.module('datetime', [])
       .directive('datePicker', function () {
         return function (scope, element, attrs) {
           var propName = attrs.datePicker;
           element.val(scope[propName]);
           element.datepicker().change(function (evt) {
             scope.$apply(function (scope) {
               scope[propName] = element.val();
             });
           });
         };
       }); 
       
angular.module('UserModule', ['ngResource', 'ngCookies', 'ui', 'angularBootstrap.modal']).
  factory('User', function($resource) {
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', fbreqid:'@fbreqid', friends:'@friends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('UserSearch', function($resource) {
      var UserSearch = $resource('/gf/usersearch', {search:'@search'}, 
                    {
                      query: {method:'GET', isArray:true}
                    });

      return UserSearch;
  }).
  factory('Logout', function($resource) {
      var Logout = $resource('/gf/logout', {}, {logout: {method:'POST'}});
      return Logout;
  }).
  factory('Circle', function($resource) {
      var Circle = $resource('/gf/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });

      return Circle;
  }).
  factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('/gf/circleparticipants/:circleId', {circleId:'@circleId', userId:'@userId', inviterId:'@inviterId', 
                                         participationLevel:'@participationLevel', who:'@who', email:'@email', circle:'@circle', adder:'@adder'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Reminder', function($resource) {
      var Reminder = $resource('/gf/reminders/:circleId', {circleId:'@circleId', userId:'@userId', remind_date:'@remind_date', people:'@people'},
                     {
                       query: {method:'GET', isArray:true},
                       delete: {method:'DELETE'},
                       save: {method:'POST', isArray:true}
                     });
                     
      return Reminder;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });

      return Gift;
  }).
  factory('Email', function($resource) {
      var Email = $resource('/gf/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  })
  .directive('btnEditCircle', function(){
      return {
        scope: false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('btnUser', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: UserCtrl,
        scope: { btnText:'@' },
        templateUrl: 'templates/ddbtn-user.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('friendStuff', function(){
      return {
        replace: false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('btnAddCircle', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: false,
           controller: CircleCtrl,
        scope: false,
     templateUrl: 'templates/ddbtn-addcircle.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('giftActions', function(){
      return {
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('searchUsers', function(){
      return {
        controller: CircleCtrl,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs, controller) {
           element.bind("keyup", 
             function() {
               scope.query();
             }
           );
        }
      }
  });

function RetrieveUser($scope, $cookieStore, User, defaultValue, key) {
  if(angular.isDefined(defaultValue)) {
    return defaultValue;
  }
  else if(angular.isDefined($cookieStore.get(key))) {
    defaultValue = User.find({userId:$cookieStore.get(key)});
    return defaultValue;
    //return {};
  }
  else
  {
    return {}; 
  }
}

function MyAccountCtrl( $rootScope, $scope, $cookies, $cookieStore, User ) {
  
  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
  });
  
  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  $scope.notifyonaddtoevent = $scope.user.notifyonaddtoevent;
  $scope.notifyondeletegift = $scope.user.notifyondeletegift;
  $scope.notifyoneditgift = $scope.user.notifyoneditgift;
  $scope.notifyonreturngift = $scope.user.notifyonreturngift;
  
  $scope.updateemailprefs = function() {
    $scope.user.notifyonaddtoevent = $scope.notifyonaddtoevent;
    $scope.user.notifyondeletegift = $scope.notifyondeletegift;
    $scope.user.notifyoneditgift = $scope.notifyoneditgift;
    $scope.user.notifyonreturngift = $scope.notifyonreturngift;
    $scope.user = User.save({userId:$scope.user.id, notifyonaddtoevent:$scope.user.notifyonaddtoevent, notifyondeletegift:$scope.user.notifyondeletegift, notifyoneditgift:$scope.user.notifyoneditgift, notifyonreturngift:$scope.user.notifyonreturngift}, 
                                  function() {
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
  
  $scope.save = function(user) {
    $scope.user = User.save({userId:user.id, fullname:user.fullname, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirthStr, profilepic:user.profilepic}, 
                                  function() {
                                    //alert("Your profile has been updated"); 
                                    if(user.dateOfBirth == 0) { user.dateOfBirth = ''; } 
                                    User.currentUser = $scope.user;
                                    $rootScope.$emit("userchange");
                                  },
                                  function() {alert("Uh oh - had a problem updating your profile");}
                                );
  }
    
}


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


function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, UserSearch, Circle, Gift, CircleParticipant, Reminder, $route) {              
             
  
  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  // ugly hack - set fields in the Create Account form so the outer circleForm will pass validation in the USUAL event
  // that the user doesn't try to create an account on the fly.  If the user DOES try to create an account on the fly,
  // we will set newuser = {}
  $scope.newuserstub = {fullname:' ', email:'a@a.com', username:new Date().getTime()+'', password:' ', passwordAgain:' '};
  $scope.newuser = $scope.newuserstub;
  
  if(angular.isDefined(Circle.currentCircle)) {
    $scope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    $scope.circle = Circle.query({circleId:$route.current.params.circleId}, function() {Circle.currentCircle = $scope.circle;}, function() {alert("Could not find Event "+$route.current.params.circleId);})
  }
  
  
  $scope.addreminder = function() {
    var remind_date = new Date($scope.remdate).getTime();
    var people = [];
    for(var i=0; i < $scope.circle.participants.receivers.length; i++) {
      var p = $scope.circle.participants.receivers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $scope.circle.reminders.length; j++) {
          var rem = $scope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    for(var i=0; i < $scope.circle.participants.givers.length; i++) {
      var p = $scope.circle.participants.givers[i];
      if(p.checked) {
        var contains = false;
        for(var j=0; j < $scope.circle.reminders.length; j++) {
          var rem = $scope.circle.reminders[j];
          if(p.id == rem.person.id && rem.remind_date == remind_date) contains = true;
        }
        if(!contains) people.push(angular.copy(p));
      }
    }
    
    for(var i=0; i < $scope.circle.participants.receivers.length; i++) {
      $scope.circle.participants.receivers[i].checked = false;
    }
    for(var i=0; i < $scope.circle.participants.givers.length; i++) {
      $scope.circle.participants.givers[i].checked = false;
    }
    
    $scope.remdate = '';
    
    if(people.length == 0) return;
    
    var reminders = Reminder.save({circleId:$scope.circle.id, remind_date:remind_date, people:people}, 
                                   function(){$scope.circle.reminders = reminders;}, 
                                   function(){alert("Uh Oh!\nHad a problem updating the reminders")});
  }
  
  
  $scope.removereminder = function(reminder, index) {
    $scope.circle.reminders.splice(index, 1)
    Reminder.delete({circleId:$scope.circle.id, userId:reminder.person.id, remind_date:reminder.remind_date});
  }
    
  
  $scope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
    
  $scope.beginnewuser = function() {
    $scope.addmethod = 'createaccount';
    $scope.newuser = {};
  }
  
  $scope.cancelnewuser = function() {
    $scope.addmethod = 'byname';
    $scope.usersearch = ''; 
    $scope.search = '';
    $scope.newuser = {};
  }
  
  $scope.createonthefly = function(newuser, thecircle) {
    anewuser = User.save({fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth, creatorId:$scope.user.id, creatorName:$scope.user.fullname}, 
                                  function() {$scope.addparticipant2(anewuser, thecircle); $scope.addmethod = 'byname'; $scope.usersearch = ''; $scope.search = '';}
                                );
  }
  
  $scope.isExpired = function() { 
    return angular.isDefined($scope.circle) && $scope.circle.date < new Date().getTime(); 
  }
  
  $scope.nocircle = function() {
    return !angular.isDefined($scope.circle);
  }
  
  $scope.currentCircle = function() { 
    return Circle.currentCircle;
  }
  
  $scope.makeActive = function(index, circle) {
    circle.index = index; // for deleting
    Circle.currentCircle = circle;
    Circle.currentCircle.isExpired = circle.date < new Date();
    $rootScope.$emit("circlechange");
  }

  $rootScope.$on("circlechange", function(event) {
    $scope.circle = Circle.currentCircle;
    $scope.gifts = Circle.gifts;
  });

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
  });

  //$rootScope.$on("usersearchresults", function(event) {
  //  $scope.people = UserSearch.results;
  //});
  
  $scope.usersearch = '';
  $scope.people = [];
  
  $scope.query = function() {
    $scope.usersearch = 'loading';
    var lbbpeople = UserSearch.query({search:$scope.search}, 
                      function() {
                        $scope.usersearch = 'loaded'; 
                        $scope.people.splice(0, $scope.people.length); // effectively refreshes the people list
                        
                        // uncomment for facebook integration
                        //for(var i=0; i < $scope.user.friends.length; i++) {
                        //  if(!lbbNamesContainFbName(lbbpeople, $scope.user.friends[i].fullname))
                        //    $scope.people.push($scope.user.friends[i]);
                        //}
                        for(var i=0; i < lbbpeople.length; i++) {
                          $scope.people.push(lbbpeople[i]);
                        }
                        $scope.noonefound = $scope.people.length==0 ? true : false; 
                      }, 
                      function() {$scope.people.splice(0, $scope.people.length);$scope.usersearch = '';});
  }
  
         
  // helper function:  If there's overlap between the LBB users and FB friends, we want to know
  // about it.  Use the LBB user and ignore the FB user.  In the future, we'll want to add to the person table: facebook id
  // so we can tell for sure if the LBB 'Eric Moore' equals the FB 'Eric Moore'       
  function lbbNamesContainFbName(lbbnames, fbname) {
    for(var i=0; i < lbbnames.length; i++) {
      var convertedFbName = fbNameToLbbName(fbname);
      var lbbfullname = lbbnames[i].first + " " + lbbnames[i].last;
      if(lbbfullname == convertedFbName)
        return true;
    }
    return false;
  }
  
  function fbNameToLbbName(fbname) {
    var n = fbname.split(" ");
    var first = n[0];
    var last = n.length == 2 ? n[1] : n[2];
    return first + " " + last;
  }
  
  $scope.activeOrNot = function(circle) {
    if(!angular.isDefined(circle) || !angular.isDefined(Circle.currentCircle))
      return false;
    return circle.id == Circle.currentCircle.id ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id}, 
                                                  function() {$scope.giftlist(circle, circle.participants.receivers[0]);});
  }
  
  $scope.savecircle = function(circle, expdate) {
    console.log("expdate = "+expdate);
    circle.expirationdate = new Date(expdate);
    console.log("circle.expirationdate.getTime() = "+circle.expirationdate.getTime());
    var savedcircle = Circle.save({circleId:circle.id, name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:Circle.circleType, 
                 participants:circle.participants, creatorId:circle.creatorId},
                 function() {
                   if(!angular.isDefined(circle.id))
                     $scope.user.circles.push(savedcircle); 
                   User.currentUser=$scope.user; 
                   $rootScope.$emit("userchange");
                 } 
               );
    console.log("end of $scope.savecircle()");
  }
  
  $scope.newcircleFunction = function(thetype, limit) {
    $scope.search = '';
    $scope.people = {};
    Circle.circleType = thetype;
    $location.url($location.path());
    $scope.newcircle = {name:'', creatorId:$scope.user.id, receiverLimit:limit, participants:{receivers:[], givers:[]}};
    $scope.circlecopies = angular.copy($scope.user.circles);
  }
  
  $scope.editcircleFunction = function(circle) {
    $scope.thecircle = circle;
    $scope.expdate = circle.dateStr;
    for(var i=0; i < $scope.thecircle.participants.receivers.length; i++) {
      console.log($scope.circle.participants.receivers[i]);
    }
    $scope.circlecopies = angular.copy($scope.user.circles);
  }
  
  // TODO add reminder
  $scope.addmyselfasreceiver = function(circle) {
    $scope.participationlevel = 'Receiver'
    $scope.addparticipant2($scope.user, circle)
    //circle.participants.receivers.push($scope.user);
  }
  
  // TODO add reminder
  $scope.addmyselfasgiver = function(circle) {
    $scope.participationlevel = 'Giver'
    $scope.addparticipant2($scope.user, circle)
    //circle.participants.givers.push($scope.user);
  }
  
  $scope.getType = function() {return Circle.circleType;}
  
  $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0',
        dateFormat : 'mm/dd/yy'
    };
    
  $scope.cancelnewcircle = function() {
    $scope.circle = {participants:[]};
    $scope.expdate = undefined;
  }
    
  $scope.addparticipant = function(index, person, circle) {
    //alert("$scope.addparticipant:  person.first="+person.first);
    if(!angular.isDefined(circle.participants))
      circle.participants = {receivers:[], givers:[]};
    if($scope.participationlevel == 'Giver')
      circle.participants.givers.push(person);
    else circle.participants.receivers.push(person);
    
    if(index != -1) {
      console.log("index = "+index);
      $scope.people[index].hide = true;
    }
    
    // if the circle already exists, add the participant to the db immediately
    if(angular.isDefined(circle.id)) {
      //alert("circle.id="+circle.id+"\n $scope.participationlevel="+$scope.participationlevel);
      var newcp = CircleParticipant.save({circleId:circle.id, inviterId:$scope.user.id, userId:person.id, participationLevel:$scope.participationlevel,
                                         who:person.fullname, email:person.email, circle:circle.name, adder:$scope.user.fullname},
                                         function() {$scope.circle.reminders = Reminder.query({circleId:$scope.circle.id})});
    }
  }
    
  // when you're creating a new user and then immediately adding them to the circle
  $scope.addparticipant2 = function(person, circle) {
    $scope.addparticipant(-1, person, circle);
  }
  
  // add all the participants in the 'fromcircle' to the 'tocircle'
  $scope.addparticipants = function(fromcircle, tocircle) {
    for(var i=0; i < fromcircle.participants.receivers.length; i++) {
      var hasLimit = angular.isDefined(tocircle.receiverLimit) && tocircle.receiverLimit != -1;
      if(hasLimit && tocircle.participants.receivers.length == tocircle.receiverLimit)
        tocircle.participants.givers.push(fromcircle.participants.receivers[i]);
      else tocircle.participants.receivers.push(fromcircle.participants.receivers[i]);
    }
    for(var i=0; i < fromcircle.participants.givers.length; i++) {
      if(!angular.isDefined(tocircle.receiverLimit) || tocircle.receiverLimit == -1)
        tocircle.participants.receivers.push(fromcircle.participants.givers[i]);
      else
        tocircle.participants.givers.push(fromcircle.participants.givers[i]);
    }
  }
  
  $scope.canaddreceiver = function(circle) {
    var isdefined = angular.isDefined(circle) && angular.isDefined(circle.receiverLimit) && angular.isDefined(circle.participants.receivers)
    return isdefined && (circle.receiverLimit == -1 || circle.receiverLimit > circle.participants.receivers.length);
  }
  
  $scope.removereceiver = function(index, circle, participant) {
    circle.participants.receivers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  $scope.removegiver = function(index, circle, participant) {
    circle.participants.givers.splice(index, 1)
    if(angular.isDefined(circle.id)) {
      CircleParticipant.delete({circleId:circle.id, userId:participant.id}, function() {Reminder.delete({circleId:$scope.circle.id, userId:participant.id})});
      // now remove person from circle.reminders...
      removeremindersforperson(participant);
    }
  }
  
  function removeremindersforperson(person) {
    $scope.circle.newreminders = [];
    for(var i=0; i < $scope.circle.reminders.length; i++) {
      if($scope.circle.reminders[i].viewer != person.id) {
        $scope.circle.newreminders.push(angular.copy($scope.circle.reminders[i]));
        console.log($scope.circle.reminders[i]);
      }
    }
    $scope.circle.reminders = angular.copy($scope.circle.newreminders);
  }
  
  // TODO delete reminders
  $scope.deletecircle = function(circle, index) {
    Circle.save({circleId:circle.id, datedeleted:new Date().getTime()},
                function() {$scope.user.circles.splice(index, 1); 
                            User.currentUser=$scope.user; 
                            if($scope.user.circles.length > 0) {circle = $scope.user.circles[0]; Circle.currentCircle = $scope.user.circles[0];}
                            else {circle = {}; Circle.currentCircle = {};}
                            $rootScope.$emit("userchange"); 
                            $rootScope.$emit("circlechange");});
                
    $location.url($location.path());
  }
  
  $scope.userfieldsvalid = function(newuser) {
    var ret = angular.isDefined(newuser) && angular.isDefined(newuser.fullname) && angular.isDefined(newuser.email)
          && angular.isDefined(newuser.username) && angular.isDefined(newuser.password) 
          && angular.isDefined(newuser.passwordAgain) && newuser.fullname != '' && newuser.email != '' && newuser.username != ''
          && newuser.password != '' && newuser.passwordAgain != '' && newuser.password == newuser.passwordAgain;
    return ret;
  }
  
}

function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, Email, Gift, Circle, CircleParticipant) {
  
  $scope.showUser = User.showUser;
  $scope.showUserF = function() { return User.showUser; }
  $scope.multipleusers = function() { console.log("multipleusers() called"); return User.multipleUsers; }
  $scope.sharedemail = function() { return User.email; }
  
  $scope.showaccepted = function() {
    console.log("$scope.user.friends.length="+$scope.user.friends.length);
    for(var i=0; i < $scope.user.friends.length; i++) {
      if($scope.user.friends[i].email != '')
        $scope.user.friends[i].show = true;
      else
        $scope.user.friends[i].show = false;
    }
  }
  
  $scope.showinvited = function() {
    for(var i=0; i < $scope.user.friends.length; i++) {
      if($scope.user.friends[i].fbreqid != '' && $scope.user.friends[i].email == '')
        $scope.user.friends[i].show = true;
      else
        $scope.user.friends[i].show = false;
    }
  }
  
  $scope.showall = function() {
    for(var i=0; i < $scope.user.friends.length; i++) {
      $scope.user.friends[i].show = true;
    }
  }
  
  $scope.resendWelcomeEmail = function() {
    Email.send({type:'welcome', from:'info@littlebluebird.com', user:$scope.user}, function() {}, function() {});
  }
  
  $scope.mergeaccount = function(user) {
    user.facebookId = User.facebookId;
    User.currentUser = user;
    User.save({userId:user.id, facebookId:user.facebookId});
    $rootScope.$emit("userchange");                    
    $rootScope.$emit("mywishlist");                    
    $location.url('mywishlist');
  }
  
  $scope.nocirclemessage = {title:'', message:''};
  $scope.hasActiveCircles = function() {
    for(var i=0; i < $scope.user.circles.length; i++) {
      if($scope.user.circles[i].date > new Date().getTime()) {
        $scope.nocirclemessage = {title:'', message:''};
        return;
      }
      $scope.nocirclemessage = {title:'All Events Passed', message:'Create more events'};
    }
    if($scope.nocirclemessage.message == "") $scope.nocirclemessage = {title:'No Events', message:"Create some events"};
  }
  
  // adjust dims for large profile pics
  $scope.adjustedheight = function(auser, limit) { 
    if(!angular.isDefined(auser))
      return -1;
    var mindim = auser.profilepicheight < auser.profilepicwidth ? auser.profilepicheight : auser.profilepicwidth
    var ratio = mindim > limit ? limit / mindim : 1;
    var adj = ratio * auser.profilepicheight;
    return adj;
  }
  
  $scope.adjustedwidth = function(auser, limit) {
    if(!angular.isDefined(auser))
      return -1;
    var mindim = auser.profilepicheight < auser.profilepicwidth ? auser.profilepicheight : auser.profilepicwidth
    var ratio = mindim > limit ? limit / mindim : 1;
    var adj = ratio * auser.profilepicwidth;
    return adj;
  }
  
  // "my wish list" call
  $scope.mywishlist = function() {
    console.log("check scope.user.id...");
    console.log($scope.user.id);
    gifts = Gift.query({viewerId:$scope.user.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true;
                              var x;
                              Circle.currentCircle = x; 
                              User.currentUser = $scope.user;
                              User.showUser = $scope.user;
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+User.currentUser.first+"'s list\n  Try again  (error code 301)");});
  }
  
  $scope.myaccount = function() {
    User.currentUser = $scope.user;
    User.showUser = $scope.user;
    $rootScope.$emit("userchange");
  }
  
  $scope.loginpage = function() {
    $location.url('login');
  }
  
  $scope.save = function(user) {
    $scope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('giftlist'); 
                                  }
                                );
  }

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
  });

  $rootScope.$on("mywishlist", function(event) {
    $scope.mywishlist();
  });
  
  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  if(angular.isDefined($route.current.params.showUserId) && !angular.isDefined($scope.showUser)) {
    $scope.showUser = User.find({userId:$route.current.params.showUserId}, function() {}, function() {alert("Could not find user "+$route.current.params.showUserId);})
  }
  
  // duplicated in RegisterCtrl
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
  
  $scope.userExists = function() {
    return angular.isDefined($scope.user) && angular.isDefined($scope.user.id)
  }
}

// This is LittleBlueBird login - don't confuse with FB login.  FB login goes through ConnectCtrl
function LoginCtrl($document, $window, $rootScope, $cookieStore, $scope, $location, User, Circle, Logout, Email, CircleParticipant, facebookConnect) { 
  
  $scope.comingfromfacebook = function() {
    if(angular.isDefined($scope.facebookreqids))
      return;
    $scope.facebookreqids = [];
    console.log($scope.facebookreqids);
    var parms = $window.location.search.split("&")
    if(parms.length > 0) {
      for(var i=0; i < parms.length; i++) {
        if(parms[i].split("=").length > 1 && (parms[i].split("=")[0] == 'request_ids' || parms[i].split("=")[0] == '?request_ids')) {
          fbreqids_csv = parms[i].split("=")[1].split("%2C")
          for(var j=0; j < fbreqids_csv.length; j++) {
            $scope.facebookreqids.push(fbreqids_csv[j]);
          }  
        }
      }
    }
  
    for(var k=0; k < $scope.facebookreqids.length; k++) {
      console.log("$scope.facebookreqids["+k+"] = "+$scope.facebookreqids[k]);
    }
    console.log("here's where we'd call user.query()");
    if($scope.facebookreqids.length == 0)
      return;
    var someusers = User.query({fbreqid:$scope.facebookreqids}, 
                               function() {
                                 // TODO might be good to have an "oops" page just in case the request_ids doesn't match anyone - if someone is monkeying with the url
                                 $scope.user = someusers[0]; 
                                 
                                 // We've identified the new user by facebook request id.  Now we're going to go through the FB login process
                                 // because we know the person is logged in to FB (they just came from there).
						         facebookConnect.askFacebookForAuthentication(
						             function(reason) { // fail
						               $scope.error = reason;
						             }, 
						             function(userfromfb) { // success
						             
                                       // I only need these 3 parms...
                                       saveduser = User.save({login:true, userId:$scope.user.id, email:userfromfb.email}, 
                                                             function() { 
                                                               User.showUser = saveduser;
                                                               User.currentUser = saveduser;
                                                               $rootScope.$emit("userchange"); 
                                                               $rootScope.$emit("getfriends");                                           
                                                               $rootScope.$emit("mywishlist"); 
                                                               $location.url('welcome');
                                                             });

						             });
        
                               }, 
                               function() {console.log("didn't find anybody")});
  }
  
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || ! angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      return;
    }
    
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($scope.users[0].dateOfBirth == 0) { $scope.users[0].dateOfBirth = ''; }
                                           
                                           User.currentUser = $scope.users[0];
                                           User.showUser = User.currentUser;  
                                           // uncomment for facebook integration
                                           //$scope.getfriends(User.currentUser);                                       
                                           $rootScope.$emit("userchange");                                          
                                           $rootScope.$emit("mywishlist");
                                           $location.url('gettingstarted'); 
                                          }, 
                               function() {$scope.loginfail=true;}  );
                               
  }
  
  $scope.logout = function() {
    Logout.logout({});                                          
    $rootScope.$emit("userchange");
    //alert("logout");
    User.currentUser = {};
  }
  
  $scope.emailIt = function(email) {
    Email.send({type:'passwordrecovery', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
}

function RegisterCtrl($scope, User, $rootScope, $location) {
  $scope.save = function(newuser) {
    $scope.user = User.save({login:true, fullname:newuser.fullname, first:newuser.first, last:newuser.last, username:newuser.username, email:newuser.email, password:newuser.password, bio:newuser.bio, dateOfBirth:newuser.dateOfBirth}, 
                                  function() { 
                                    User.showUser = $scope.user;
                                    User.currentUser = $scope.user;
                                    $location.url('welcome');
                                  }
                                );
  }
  
  // duplicated in UserCtrl
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

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
  });
}

function EmailCtrl($scope, Email) {
  $scope.email = {to:'bdunklau@yahoo.com', from:'info@littlebluebird.com',
                  subject:'Check out LittleBlueBird.com',
                  message:'Hey, Check out http://www.littlebluebird.com'};
                  
  $scope.send = function() {
    Email.send({to:$scope.email.to, from:$scope.email.from, subject:$scope.email.subject, message:$scope.email.message});
  }
}

// source:  http://jsfiddle.net/mkotsur/Hxbqd/
angular.module('FacebookModule', []).factory('facebookConnect', function() {
    return new function() {
        this.askFacebookForAuthentication = function(fail, success) {
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            }, {scope:'email',perms:'publish_stream'});
        }
    }
})
.factory('facebookFriends', function() {
  return new function() {
    this.getfriends = function(fail, success) {
      FB.api('/me/friends', success);
    }
  }
})
.factory('facebookAppRequest', function() {
  return new function() {
    this.getfriends = function(fail, success) {
      FB.api('/me/friends', success);
    }
  }
});


// see:  http://jsfiddle.net/Hxbqd/6/
function ConnectCtrl(facebookConnect, facebookFriends, $scope, $rootScope, $location, $resource, UserSearch, User) {

    $scope.fbuser = {}
    $scope.error = null;
    
    
    $scope.fbinvite = function(friend) {
      FB.ui({method: 'apprequests', to: friend.facebookId, message: 'Check out LittleBlueBird - You\'ll love it!'}, 
            function callback(response) {
              // response.to:  an array of fb id's
              // response.request:  the request id returned by fb
              friend.fbreqid = response.request;
              User.save({userId:friend.id, fbreqid:friend.fbreqid});
            });
    }

    $rootScope.$on("getfriends", function(event) {
      $scope.user = User.currentUser;
      $scope.getfriends($scope.user);
    });
    
    $scope.getfriends = function(user) {
      facebookFriends.getfriends(function(fail){alert(fail);}, 
                                 function(friends) {
                                   //if(angular.isDefined(user.friends)) user.friends.splice(0, user.friends.length); else user.friends = [];
                                   var savethesefriends = [];
                                   for(var i=0; i < friends.data.length; i++) {
                                     //console.log("friends.data[i].name="+friends.data[i].name);
                                     friends.data[i].fullname = friends.data[i].name;
                                     friends.data[i].profilepicUrl = "http://graph.facebook.com/"+friends.data[i].id+"/picture?type=large";
                                     savethesefriends.push(friends.data[i]);
                                   }
                                   
                                   console.log("saving friends 1");
                                   // will write each friend to the person table and write a record to the friends table for each friend to associate the user with all his friends
                                   var saveduser = User.save({userId:user.id, friends:savethesefriends}, 
                                             function() {user = saveduser; console.log("user.friends.length="+user.friends.length)});
                                   
                                 }
                                )
    }

    $scope.registerWithFacebook = function() {
        facebookConnect.askFacebookForAuthentication(
        function(reason) { // fail
            $scope.error = reason;
        }, 
        function(user) { // success
            $scope.fbuser = user
            console.log(user);
            console.log("$scope.fbuser.id = "+$scope.fbuser.id);
            
            // could get more than one person back - parent + children
            var users = UserSearch.query({search:user.email}, 
                                          function(){//console.log(users[0]); 
                                                     // Now look for the user that has the right facebook id.  There might not be one though - if the user hasn't yet "merged" his LBB account with his FB account
                                                     var mergedaccount = false;
                                                     for(var i=0; i < users.length; i++) {
                                                       if(users[i].facebookId == $scope.fbuser.id) {
                                                         mergedaccount = true;
                                                         User.currentUser = users[i]; // this is what we want to happen... we found a record in our person table that has this email AND facebookId
                                                       }
                                                     }
                                                     if(mergedaccount) {
                                                       $scope.getfriends(User.currentUser);
                                                       $rootScope.$emit("userchange");
                                                       $rootScope.$emit("mywishlist");
                                                       $location.url('mywishlist');
                                                     }
                                                     else { // ...but in the beginning, this is what will happen - no record in our person table contains this facebookId
                                                       if(users.length == 0) {
                                                         // need to create account for this person in LBB
                                                       
                                                         $scope.user = User.save({login:true, fullname:user.first_name+' '+user.last_name, first:user.first_name, last:user.last_name, username:user.email, email:user.email, password:user.email, bio:'', profilepic:'http://graph.facebook.com/'+user.id+'/picture?type=large', facebookId:user.id}, 
                                                                                function() { 
                                                                                   $scope.getfriends($scope.user);
                                                                                   User.showUser = $scope.user;
                                                                                   User.currentUser = $scope.user;
                                                                                   $rootScope.$emit("userchange");                                           
                                                                                   $rootScope.$emit("mywishlist"); 
                                                                                   $location.url('welcome');
                                                                                }
                                                                               );
                                                       }
                                                       else if(users.length == 1) {  // easy... we found exactly one person with this email - set the facebookid
                                                         users[0].facebookId = $scope.fbuser.id;
                                                         User.currentUser = users[0];
                                                         User.showUser = users[0];
                                                         $scope.getfriends(User.currentUser);
                                                         console.log("users[0].profilepicUrl...");
                                                         console.log(users[0].profilepicUrl);
                                                         var placeholderPic = "http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg";
                                                         
                                                         console.log("users[0].profilepicUrl != placeholderPic...");
                                                         console.log(users[0].profilepicUrl != placeholderPic);
                                                         
                                                         var pic = users[0].profilepicUrl != placeholderPic ? users[0].profilepicUrl : "http://graph.facebook.com/"+$scope.fbuser.id+"/picture?type=large";
                                                         var uagain = User.save({userId:User.currentUser.id, facebookId:$scope.fbuser.id, profilepic:pic}, 
                                                                                function() {User.currentUser = uagain; 
                                                                                            User.showUser = uagain;
									                                                        $rootScope.$emit("userchange");                                          
									                                                        $rootScope.$emit("mywishlist");
									                                                        $location.url('mywishlist');});
                                                       }
                                                       else if(users.length > 1) {
                                                         // And if we happen to find several people all with the same email address and no FB id,
                                                         // we have to ask the user "who are you" and display all the people that have this email address
                                                         // "Why are you asking me?"... "What is a 'merged' account?"...  "Why do I need to 'merge' my accounts?"...
                                                         // These are all things we have to exlain to the user on the mergeaccount page
                                                         User.multipleUsers = users;
                                                         User.email = $scope.fbuser.email;
                                                         User.facebookId = $scope.fbuser.id;
                                                         $location.url('whoareyou'); 
                                                       }
                                                     }
                                                    },
                                          function() {alert("problem with UserSearch.query");});
            $scope.$apply() // Manual scope evaluation
        });
    }
    
}

ConnectCtrl.$inject = ['facebookConnect', 'facebookFriends', '$scope', '$rootScope', '$location', '$resource', 'UserSearch', 'User'];

function NavCtrl($scope) {
  $scope.navstate = function(compare) {
    return $scope.activenav == compare ? 'active' : '';
  }
}

function GettingStartedCtrl($scope) { 
  $scope.createevent = false;
  $scope.addyourself = false;
  $scope.addpeople = false;
  $scope.additems = false;
  $scope.whydoweneedtoknow = false; // see whoareyou.html
  $scope.whatifidontwantto = false; // see whoareyou.html
}