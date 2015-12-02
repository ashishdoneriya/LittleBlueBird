
angular.module('User', ['ngResource']).
  factory('User', function($resource) {
      var User = $resource('http://www.littlebluebird.com/gf/rest/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', friends:'@friends', lbbfriends:'@lbbfriends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });
                  
                    
      User.addfriend = function(user, friend) {
        if(!User.alreadyfriends(user, friend)) 
          User.save({userId:user.id, lbbfriends:[friend]}, function() {user.friends.push(friend);});
      }
      
      
      User.alreadyfriends = function(usera, userb) {
        for(var i=0; i < usera.friends.length; ++i) {
          if(usera.friends[i].id == userb.id) {
            return true;
          }
        }
        return false;
      }

      return User;
  });