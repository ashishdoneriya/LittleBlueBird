
  
  
  // copied/adapted from $rootScope.createonthefly() in app-UserModule.js 2013-08-05
  $scope.invite = function(invitename, inviteemail, thecircle) {
      anewuser = User.save({fullname:invitename, email:inviteemail, creatorId:$rootScope.user.id, creatorName:$rootScope.user.fullname}, 
                                  function() {
                                    if(thecircle) {
                                      //$rootScope.addparticipant(-1, anewuser, thecircle, $rootScope.participationLevel); 
                                    }
                                    $rootScope.user.friends.push(anewuser);
                                  } // end success function
                                );
  }
  
  
  // the only reason this function is here is to kick jquery to reapply the listview style to the friend list
  $scope.events = function() {
                              jQuery("#eventview").hide();
                              setTimeout(function(){
                                jQuery("#eventview").listview("refresh");
                                jQuery("#eventview").show();
                              },0);
  }
  
  
  // 2013-08-04 see http://docs.mobiscroll.com/datetime
  // see also http://docs.mobiscroll.com/26/mobiscroll-core
  $scope.initNewEvent = function() {
    $scope.thecircle = {};
    //The Javascript: initializing the scroller
	jQuery(function(){
	    jQuery("#datepicker").mobiscroll().date({dateOrder:'MM d yyyy', maxDate:new Date(new Date().getFullYear()+3,12,31)});
	});
  }
  
  $scope.setdate = function(form, dp) {
    console.log('datepicker.mobiscroll(getvalue): ', jQuery("#datepicker").mobiscroll('getValue'));
    console.log('new Date(): ', new Date(jQuery("#datepicker").mobiscroll('getDate')));
    console.log('datepicker.mobiscroll(getTime): ', jQuery("#datepicker").mobiscroll('getTime'));
  }
  
  $scope.eventDateFilter = function(circle) {
    if($scope.eventfilter=='all') return true;
    else if($scope.eventfilter=='current') return circle.date > new Date().getTime();
    else if($scope.eventfilter=='past') return circle.date < new Date().getTime();
  }