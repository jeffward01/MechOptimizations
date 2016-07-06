'use strict';
app.factory('licenseMethodsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licenseMethodsService = {};

    var _getLicenseMethods = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/licenseMethods').then(function (results) {
            return results;
        });
    };

    licenseMethodsService.getLicenseMethods = _getLicenseMethods;

    return licenseMethodsService;

}]);