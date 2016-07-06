'use strict';
app.factory('reportsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var reportsService = {};

    var _addReport = function (request) {

        var url = serviceBase + 'api/licenseCTRL/Reports/AddReport';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    reportsService.addReport = _addReport;

    return reportsService;

}]);