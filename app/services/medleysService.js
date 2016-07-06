'use strict';
app.factory('medleysService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', function ($http, ngAuthSettings, $state, localStorageService) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var medleysServiceFactory = {};
    var _addMedleys = function (request) {
        var url = serviceBase + 'api/licenseCTRL/LicenseRecordingMedley/AddRecordingMedley';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };
    var _getMedleys = function (trackId) {
        var url = serviceBase + 'api/licenseCTRL/LicenseRecordingMedley/GetMedleysByTrackId/' + trackId;
        return $http.get(url).error(function (data, status, headers, config) {
        })
        .then(function (response) {
            return response;
        });
    };
   
    medleysServiceFactory.addMedleys = _addMedleys;
    medleysServiceFactory.getMedleys = _getMedleys;

    return medleysServiceFactory;

}]);