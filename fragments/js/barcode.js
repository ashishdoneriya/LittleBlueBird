


// see https://github.com/phonegap-build/BarcodeScanner/blob/master/README.md

  $scope.scanner = function() {
    console.log('window:', window);
    var scanner = window.cordova.require("cordova/plugin/BarcodeScanner");

    scanner.scan(
      function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
      }, 
      function (error) {
          alert("Scanning failed: " + error);
      }
    );
  }