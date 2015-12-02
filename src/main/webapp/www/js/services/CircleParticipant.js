angular.module('CircleParticipant', ['ngResource'])
.factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('http://www.littlebluebird.com/gf/rest/circleparticipants/:circleId', 
                                        {circleId:'@circleId', 
                                         inviterId:'@inviterId', 
                                         userId:'@userId', 
                                         participationLevel:'@participationLevel', 
                                         who:'@who',
                                         notifyonaddtoevent:'@notifyonaddtoevent', 
                                         email:'@email', 
                                         circle:'@circle', 
                                         adder:'@adder'}, 
                                         
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  });