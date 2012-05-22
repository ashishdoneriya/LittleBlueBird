/* http://docs.angularjs.org/#!angular.service */

angular.service('Phone', function($resource){
  return $resource('phones/:phoneId.json', {}, {
    query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
  });
});

angular.service('User', function($resource){
  return $resource('/api/users/:userId', {userId:'@id', first:'@first', last:'@last', email:'@email', username:'@username', password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio'}, {
    query: {method:'GET', isArray:true},
    save: {method:'POST'}
  });

});