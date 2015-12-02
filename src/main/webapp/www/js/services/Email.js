  
angular.module('Email', ['ngResource']).
  factory('Email', function($resource) {
      var Email = $resource('http://www.littlebluebird.com/gf/rest/email', {to:'@to', 
                                                                            email:'@email', 
                                                                            from:'@from', 
                                                                            subject:'@subject', 
                                                                            message:'@message', 
                                                                            wishlistId:'@wishlistId',
                                                                            whosList:'@whosList',
                                                                            type:'@type', 
                                                                            user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  });
