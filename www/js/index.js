//User Interface for BART Trip Planner
// Name: Dipal Patel
// ID: W1233023

var bart = angular.module('bart', ['timer', 'ngStorage', 'ngAnimate']);
// Using bart.dipalpatel.com/stations API
bart.factory("station", ["$http", "$log", function($http, $log) {
  return {
    query: function(runAfter) {
      return $http.get('https://bart.dipalpatel.com/stations');
    }
  }
}]);

// Setting controller and initializing scope objects

bart.controller('BartCtrl', ["$scope", "$log", "$http", "station", '$sce', '$localStorage', '$timeout', function($scope, $log, $http, Station, $sce, $localStorage, $timeout) {
  // Object for Source station
  $scope.selectedFromStation = {};
  // Object for Destination station
  $scope.selectedToStation = {};
  // Object for map
  $scope.stationMap = {}
  // Object for list of trains
  $scope.trains = [];
  // Object for the time of next train and location of next train
  $scope.nextTrain = null;
  $scope.nextTrainAt = null;
  // object initialization for calculating visit count on bart.dipalpatel.com
  $scope.$storage = $localStorage.$default({
    visitCounter: 0
  });
  $scope.$storage.visitCounter++;

  // Objects initinalization for refreshing website and getting latest BART API every 30 seconds
  var refreshTimeout;
  var refreshInterval = 30;
  $scope.refreshCount = 0;
  $scope.timerStopped = true;
  // Station information (name,abbr, gtfs_latitude, longitude, address, city, county,state, zipcode) in stations object
  Station.query().then(function(data) {
    var stations = data.data.root.stations.station;
    $scope.stations = stations;
  // Storing information of station's abbr into station map object
    $scope.stations.forEach(function(station) {
      $scope.stationMap[station.abbr] = station.name;
    });
  // Getting values of source station abbr and destination station abbr
    angular.forEach(stations, function(currentStation) {
      if ($scope.selectedFromStation && currentStation.abbr === $scope.selectedFromStation.abbr) {
        $scope.selectedFromStation = currentStation;
      }
      if ($scope.selectedToStation && currentStation.abbr === $scope.selectedToStation.abbr) {
        $scope.selectedToStation = currentStation;
      }
    });
  });
//To be secure by default, AngularJS makes sure bindings go through that sanitization, or any similar validation process, unless there's a good reason to trust the given value in this context.
//Then, to audit your code for binding security issues, you just need to ensure the values you mark as trusted indeed are safe - because they were received from your server, sanitized by your library, etc.
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
  // If Go button is cliked - It should not work is source or destination station values are not givem
  $scope.onClickGo = function() {
    if (!$scope.selectedFromStation.abbr || !$scope.selectedToStation.abbr) {
      return;
    }
    $scope.storeStations();
    window.location="routes.html";
    return;
  }

   // Stop timer
  $scope.stopTimer = function() {
    $scope.timerStopped = true;
    $scope.refreshCount = 0;
    $scope.refreshMessage = '';
  }

  // Store station selection
  $scope.storeStations = function() {
    localStorage.setItem("FromStation", JSON.stringify($scope.selectedFromStation));
    localStorage.setItem("ToStation", JSON.stringify($scope.selectedToStation));
  }

  $scope.onTimeout = function() {
    if ($scope.timerStopped) {
      return;
    }
    $scope.refreshCount++;
    $scope.refreshMessage = "Last refreshed " + new Date().toLocaleTimeString();
    $scope.onClickGo();
  }
}]);
