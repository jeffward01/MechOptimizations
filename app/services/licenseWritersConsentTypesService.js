'use strict';
app.factory('licenseWritersConsentTypesService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licenseWritersConsentTypesService = {};

    var _getLicenseWritersConsentTypes = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/WritersConsentTypes/GetWritersConsentForLookup').then(function (results) {
            return results;
        });
    };

    var _getLicensePaidQuarterTypes = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/WritersConsentTypes/GetPaidQuarterForLookup').then(function (results) {
            return results;
        });
    };

    var _getLicenseIncludeExcludeTypes = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/WritersConsentTypes/GetWritersIncludeExcludeForLookup').then(function (results) {
            return results;
        });
    };

    var _editWriterConsent = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/EditWriterConsent';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _editWriterIncluded = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/EditWriterIncluded';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    }
    

    licenseWritersConsentTypesService.getLicenseWritersConsentTypes = _getLicenseWritersConsentTypes;
    licenseWritersConsentTypesService.getLicensePaidQuarterTypes = _getLicensePaidQuarterTypes;
    licenseWritersConsentTypesService.getLicenseIncludeExcludeTypes = _getLicenseIncludeExcludeTypes;
    licenseWritersConsentTypesService.editWriterConsent = _editWriterConsent;
    licenseWritersConsentTypesService.editWriterIncluded = _editWriterIncluded;
    return licenseWritersConsentTypesService;

}]);