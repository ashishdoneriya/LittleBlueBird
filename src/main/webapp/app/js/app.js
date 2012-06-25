var app = angular.module('project', ['UserModule', 'datetime']).
  config(function($routeProvider){
    $routeProvider.
      when('/date', {templates: {layout: 'date.html', one: 'partials/date.html'}}).
      when('/login', {templates: {layout: 'layout-nli.html', one: 'partials/login.html', two: 'partials/register.html', three:'partials/LittleBlueBird.html', four:'partials/navbar.html'}}).
      when('/circles', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html'}}).
      when('/buy/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}}).
      when('/editgift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}}).
      when('/deletegift/:circleId/:showUserId/:giftId', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}}).
      when('/event/:circleId', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/circledetails.html', five:'partials/navbar.html'}}).
      when('/giftlist/:circleId/:showUserId', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/giftlist.html', five:'partials/navbar.html'}}).
      when('/myaccount', {templates: {layout: 'layout.html', one: 'partials/myaccountheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/myaccount.html', five:'partials/navbar.html'}}).
      when('/email', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/email.html', five:'partials/navbar.html'}}).
      when('/welcome', {templates: {layout: 'layout.html', one: 'partials/userheader.html', two: 'partials/myexpiredcircles.html', three: 'partials/mycircles.html', four: 'partials/welcome.html', five:'partials/navbar.html'}}).
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
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic'}, 
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
      var CircleParticipant = $resource('/gf/circleparticipants/:circleId', {circleId:'@circleId'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/gifts/:giftId', {giftId:'@giftId', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return Gift;
  }).
  factory('Email', function($resource) {
      var Email = $resource('/gf/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', passwordrecovery:'@passwordrecovery'}, 
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
        controller: UserCtrl,
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


function CurrentCtrl($rootScope, $scope, $cookieStore, User, Circle, Gift, $route) {
  
  // "my wish list" call
  $scope.mywishlist = function() {
    alert("$scope.mywishlist");
    gifts = Gift.query({viewerId:User.currentUser.id}, 
                            function() { 
                              Circle.gifts = gifts; 
                              Circle.gifts.mylist=true; 
                              $rootScope.$emit("circlechange");  
                              $rootScope.$emit("userchange"); 
                            }, 
                            function() {alert("Hmmm... Had a problem getting "+User.currentUser.first+"'s list\n  Try again");});
  }

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
  });

  $rootScope.$on("circlechange", function(event) {
    $scope.circle = Circle.currentCircle;
    $scope.gifts = Circle.gifts;
  });
  
  $scope.isExpired = function() { 
    if(!angular.isDefined($scope.circle)) return false;
    return $scope.circle.date < new Date().getTime(); 
  }

  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  
  if(angular.isDefined(Circle.currentCircle)) {
    $scope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    $scope.circle = Circle.query({circleId:$route.current.params.circleId}, function() {Circle.currentCircle = $scope.circle;}, function() {alert("Could not find Event "+$route.current.params.circleId);})
  }
  
  
}


function GiftCtrl($rootScope, $route, $cookieStore, $scope, Circle, Gift, User) { 

  $scope.toggledetails = function(gift) {
    if(!angular.isDefined(gift.showdetails))
      gift.showdetails = false;
    gift.showdetails = !gift.showdetails;
    return gift.showdetails;
  }
  
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
        alert(" gift.recipients["+i+"].checked="+gift.recipients[i].checked+"\n gift.recipients["+i+"].id="+gift.recipients[i].id+"\n $scope.showUser.id="+$scope.showUser.id);
      }
    }
    
    var savedgift = Gift.save({circleId:$scope.circle.id, description:gift.description, url:gift.url, 
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
    
    var savedgift = Gift.save({giftId:gift.id, circleId:$scope.circle.id, description:gift.description, url:gift.url, 
               addedBy:gift.addedBy.id, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id, senderId:gift.sender, senderName:gift.sender_name},
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
  
  
  $scope.buygift = function(index, gift) {
    var savedgift = Gift.save({giftId:gift.id, circleId:$scope.circle.id, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id, senderId:gift.senderId, senderName:gift.senderName},
               function() { $scope.gifts.splice(index, 1, savedgift); });
  }
  
  
  $scope.returngift = function(index, gift) {
    var savedgift = Gift.save({giftId:gift.id, circleId:$scope.circle.id, recipients:gift.recipients, viewerId:$scope.user.id, recipientId:$scope.showUser.id},
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
    Gift.delete({giftId:gift.id});
  }
       
  $scope.canceleditgift = function(gift) {
    gift.editing=false;
    $scope.gift.description = $scope.giftorig.description;
    $scope.gift.url = $scope.giftorig.url;
  }                     
  
  $scope.giftlist = function(circle, participant) {
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
                            function() {alert("Hmmm... Had a problem getting "+participant.first+"'s list\n  Try again");});
  }
}


function CircleCtrl($location, $rootScope, $cookieStore, $scope, User, UserSearch, Circle, Gift, CircleParticipant, $route) {              
             
  
  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  if(angular.isDefined(Circle.currentCircle)) {
    $scope.circle = Circle.currentCircle; 
  }
  else if(angular.isDefined($route.current.params.circleId)) {
    $scope.circle = Circle.query({circleId:$route.current.params.circleId}, function() {Circle.currentCircle = $scope.circle;}, function() {alert("Could not find Event "+$route.current.params.circleId);})
  }
    
  
  $scope.toggleCircle = function(circle) {
    circle.show = angular.isDefined(circle.show) ? !circle.show : true;
  }
  
  $scope.isExpired = function() { 
    return $scope.circle.date < new Date().getTime(); 
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

  $rootScope.$on("usersearchresults", function(event) {
    $scope.people = UserSearch.results;
  });
  
  $scope.activeOrNot = function(circle) {
    if(!angular.isDefined(circle) || !angular.isDefined(Circle.currentCircle))
      return false;
    return circle.id == Circle.currentCircle.id ? "active" : "";
  }
  
  $scope.showParticipants = function(circle) {
    circle.participants = CircleParticipant.query({circleId:circle.id});
  }
  
  $scope.savecircle = function(circle, expdate) {
    circle.expirationdate = new Date(expdate);
    var savedcircle = Circle.save({name:circle.name, expirationdate:circle.expirationdate.getTime(), circleType:Circle.circleType, 
                 participants:circle.participants, creatorId:circle.creatorId},
                 function() {$scope.user.circles.push(savedcircle); User.currentUser=$scope.user; $rootScope.$emit("userchange");} );
  }
  
  $scope.newcircleFunction = function(thetype) {
    $scope.search = '';
    $scope.people = {};
    Circle.circleType = thetype;
    $location.url($location.path());
    $scope.newcircle = {name:'', creatorId:$scope.user.id, participants:[$scope.user]};          
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
  }
    
  $scope.addparticipant = function(index, person, circle) {
    if(!angular.isDefined(circle.participants))
      circle.participants = [];
    circle.participants.push(person);
    $scope.people.splice(index, 1);
  }
  
  $scope.removeparticipant = function(index, circle) {
    circle.participants.splice(index, 1)
  }
  
  $scope.deletecircle = function() {
    Circle.save({circleId:$scope.circle.id, datedeleted:new Date().getTime()},
                function() {$scope.user.circles.splice(Circle.currentCircle.index, 1); 
                            User.currentUser=$scope.user; 
                            if($scope.user.circles.length > 0) {$scope.circle = $scope.user.circles[0]; Circle.currentCircle = $scope.user.circles[0];}
                            else {$scope.circle = {}; Circle.currentCircle = {};}
                            $rootScope.$emit("userchange"); 
                            $rootScope.$emit("circlechange");});
                
    $location.url($location.path());
  }
  
}

function UserCtrl($route, $rootScope, $location, $cookieStore, $scope, User, UserSearch, Gift, CircleParticipant) {
  
  $scope.query = function() {
    if($scope.search.length > 1)
      UserSearch.results = UserSearch.query({search:$scope.search});
    else {
      UserSearch.results = {};
    }
    $rootScope.$emit("usersearchresults");
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
  
  $scope.user = RetrieveUser($scope, $cookieStore, User, User.currentUser, "userId");
  
  if(angular.isDefined($route.current.params.showUserId) && !angular.isDefined($scope.showUser)) {
    $scope.showUser = User.find({userId:$route.current.params.showUserId}, function() {}, function() {alert("Could not find user "+$route.current.params.showUserId);})
  }
  
  $scope.isUsernameUnique = function(user, form) {
    if(!angular.isDefined(user.username)) 
      return;
    checkUsers = User.query({username:user.username}, 
                                        function() {
                                          if(checkUsers.length > 0) { form.username.$error.taken = 'true'; }
                                          else { form.username.$error.taken = 'false'; }
                                        });
  } 
  
  $scope.userExists = function() {
    return angular.isDefined($scope.user.id)
  }
}

function LoginCtrl($document, $rootScope, $cookieStore, $scope, $location, User, Circle, Logout, Email, CircleParticipant) { 
 
  $scope.login = function() {
    //alert("login:  "+$scope.username+" / "+$scope.password);
    if(!angular.isDefined($scope.username) || ! angular.isDefined($scope.password)) {
      $scope.loginfail=true;
      return;
    }
    
    $scope.users = User.query({username:$scope.username, password:$scope.password}, 
                               function() {$scope.loginfail=false; 
                                           if($scope.users[0].dateOfBirth == 0) { $scope.users[0].dateOfBirth = ''; }                                           
                                           $rootScope.$emit("userchange");
                                           User.currentUser = $scope.users[0];
                                           $location.url('myaccount'); 
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
    Email.send({passwordrecovery:'true', to:email, from:'info@littlebluebird.com', subject:'Password Recovery', message:'Your password is...'}, function() {alert("Your password has been sent to: "+email);}, function() {alert("Email not found: "+email+"\n\nContact us at info@littlebluebird.com for help");});
  }
  
}

function RegisterCtrl($scope, User, $rootScope, $location) {
  $scope.save = function(user) {
    $scope.user = User.save({fullname:user.fullname, first:user.first, last:user.last, username:user.username, email:user.email, password:user.password, bio:user.bio, dateOfBirth:user.dateOfBirth}, 
                                  function() {
                                    $location.url('welcome'); 
                                  }
                                );
  }

  $rootScope.$on("userchange", function(event) {
    $scope.user = User.currentUser;
    $scope.showUser = User.showUser;
  });
}

function PrimaryReceiverCtrl($scope) {
}

function EmailCtrl($scope, Email) {
  $scope.email = {to:'bdunklau@yahoo.com', from:'info@littlebluebird.com',
                  subject:'Check out LittleBlueBird.com',
                  message:'Hey, Check out http://www.littlebluebird.com'};
                  
  $scope.send = function() {
    Email.send({to:$scope.email.to, from:$scope.email.from, subject:$scope.email.subject, message:$scope.email.message});
  }
}

function MainCtrl($scope) {}