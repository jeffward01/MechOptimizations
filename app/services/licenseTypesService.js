'use strict';
app.factory('licenseTypesService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licenseTypesService = {};

    var _getLicenseTypes = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/LicenseTypes').then(function (results) {
            return results;
        });
    };

    licenseTypesService.getLicenseTypes = _getLicenseTypes;

    return licenseTypesService;

}]);