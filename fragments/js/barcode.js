


// see https://github.com/phonegap-build/BarcodeScanner/blob/master/README.md

  $scope.scan = function() {
  
    try {
	    var scanner = window.cordova.require("cordova/plugin/BarcodeScanner");
	
	    scanner.scan(
	      function (result) {
	        $scope.scanresult = result.text;
	        $scope.scanformat = result.format;
	      }, 
	      function (error) {
	          alert("Scanning failed: " + error);
	      }
	    );
	    
    }
    catch(err) {
      alert('Error:'+err.message);
    }
  }