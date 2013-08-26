  
angular.module('Email', ['ngResource']).
  factory('Email', function($resource) {
      var Email = $resource('http://www.littlebluebird.com/gf/rest/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  });
