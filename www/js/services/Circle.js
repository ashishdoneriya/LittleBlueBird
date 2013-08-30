angular.module('Circle', ['ngResource', 'CircleParticipant'])
.factory('Circle', function($resource, CircleParticipant, Reminder) {
      var Circle = $resource('http://www.littlebluebird.com/gf/rest/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });
        
      
      // 2013-08-29
      Circle.initParticipants = function(circle) {
        if(!angular.isDefined(circle.participants))
          circle.participants = {receivers:[], givers:[]};
        if(!angular.isDefined(circle.participants.receivers))
          circle.participants.receivers = [];
        if(!angular.isDefined(circle.participants.givers))
          circle.participants.givers = [];
        return circle;
      }
      
      
      // 2013-08-29
      Circle.alreadyParticipating = function(circle, person) {
        for(var i=0; i < circle.participants.receivers.length; ++i) {
          if(circle.participants.receivers[i].id == person.id) {
            return true;
          }
        }
        for(var i=0; i < circle.participants.givers.length; ++i) {
          if(circle.participants.givers[i].id == person.id) {
            return true;
          }
        }
        return false;
      }
      
      
      // 2013-08-29
      Circle.addParticipants = function(parms) {
        var people = parms.people;
        var circle = parms.circle;
        var level = parms.level;
        var inviter = parms.inviter;
        var successFn = parms.successFn;
        
        // can assumed that circle.participants has already been init-ed because you can't get to this fn
        // except by way of the #participants page
        for(var i=0; i < people.length; i++) {
          if(!Circle.alreadyParticipating(circle, people[i])) {
          
		    if(level=='Giver') parms.circle.participants.givers.push(people[i]);
		    else parms.circle.participants.receivers.push(people[i]);
		                                           
            console.log('parms.people[i]: ', parms.people[i]);
		    CircleParticipant.save({circleId:circle.id, inviterId:inviter.id, userId:people[i].id, participationLevel:level,
		                                         who:inviter.fullname, notifyonaddtoevent:people[i].notifyonaddtoevent, email:people[i].email, circle:circle.name, adder:inviter.fullname},
		                                         function() {
		                                           // don't mess with reminders right now
		                                           // YOU CAN'T REFER TO LOOP VARIABLES HERE BECAUSE THIS IS A CALLBACK FN
		                                           successFn();
		                                         });
            
          }
        }
      }
      
      
      // 2013-08-29
      Circle.addParticipant = function(parms) {
        var userisparticipant = parms.userisparticipant;
        var userishonoree = parms.userishonoree;
        var newparticipant = parms.user;
        var level = parms.level;
        var inviter = parms.inviter;
        var circle = parms.circle;
        var saveParticipant = parms.saveParticipant;
        var onSuccessfulParticipantSave = parms.onSuccessfulParticipantSave;
        
        console.log("Circle.addParticipant:  begin");
        
        circle = Circle.initParticipants(circle);
        if(Circle.alreadyParticipating(circle, newparticipant))
          return circle;
          
        console.log("Circle.addParticipant:  111111111");
        
        if(angular.isDefined(userisparticipant)) {
		    if(userisparticipant=='true') {
		      if(userishonoree=='true') {circle.participants.receivers.push(newparticipant); level = 'Receiver';}
		      else if(userishonoree=='false') {circle.participants.givers.push(newparticipant); level = 'Giver';}
		      else  {circle.participants.receivers.push(newparticipant); level = 'Receiver';}
		    }
        console.log("Circle.addParticipant:  22222222");
		}
		else if(!angular.isDefined(level)) {
		    // when the newparticipant isn't explicitly classified as either Giver or Receiver, assume Receiver.  If we've reached the limit on Receivers
		    // then make the newparticipant a Giver
		    if(Circle.receiverLimitReached(circle))  {circle.participants.givers.push(newparticipant); level = 'Giver';}
		    else  {circle.participants.receivers.push(newparticipant); level = 'Receiver';}
        console.log("Circle.addParticipant:  3333333333");
		}
		else if(level == 'Receiver') circle.participants.receivers.push(newparticipant);
		else circle.participants.givers.push(newparticipant);
		
        console.log("Circle.addParticipant:  44444444444");
        
		if(angular.isDefined(saveParticipant) && saveParticipant) {
				    
		    CircleParticipant.save({circleId:circle.id, inviterId:inviter.id, userId:newparticipant.id, participationLevel:level,
		                                         who:inviter.fullname, notifyonaddtoevent:newparticipant.notifyonaddtoevent, email:newparticipant.email, circle:circle.name, adder:inviter.fullname},
		                                         function() {
		                                           circle.reminders = Reminder.query({circleId:circle.id});
		                                           onSuccessfulParticipantSave();
        console.log("Circle.addParticipant:  5555555555555555");
		                                         });
		}
		
        console.log("Circle.addParticipant:  circle.participants:", circle.participants);
	    return circle;
      }
      
      
      // 2013-08-27
      Circle.receiverLimitReached = function(circle) {
          circle = Circle.initParticipants(circle);
		  if(circle.receiverLimit == -1) return false;
		  else if(circle.receiverLimit > circle.participants.receivers.length) return false;
		  else return true;
      }
      
      
      // doesn't call the db, just removes the people from the participant receiver/giver arrays and gets all this boring loop logic out of the controller
      Circle.removePeople = function(people, circle) {

        remove = function(people, arr) {
		    for(i=0; i < people.length; ++i ) {
		      var total = arr.length
		      for(var j=0; j < total; j++) {
		        if(people[i].id == arr[j].id) {
		          arr.splice(j, 1);
		          --total;
		        }
		      }
		    } 
        }
        
        remove(people, circle.participants.receivers);
        remove(people, circle.participants.givers);
        
        return circle;
      }
                    
      return Circle;
  }).
  factory('Reminder', function($resource) {
      var Reminder = $resource('http://www.littlebluebird.com/gf/rest/reminders/:circleId', {circleId:'@circleId', userId:'@userId', remind_date:'@remind_date', people:'@people'},
                     {
                       query: {method:'GET', isArray:true},
                       delete: {method:'DELETE'},
                       save: {method:'POST', isArray:true}
                     });
                     
      return Reminder;
  });