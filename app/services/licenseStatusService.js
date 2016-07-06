app.factory('licenseStatusService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {
    //todo: add here all the calls for the lookup data tables
    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var staticDataService = {};

    var _getLicenseStatuses = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/licensestatuses').then(function (results) {
            return results;
        });
    };
    
    var _getLicenseTypes= function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/licensetypes').then(function (results) {
            return results;
        });
    };
    
    var _getLicenseMethods = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/licensemethods').then(function (results) {
            return results;
        });
    };

    staticDataService.getLicenseStatuses = _getLicenseStatuses;
    staticDataService.getLicenseTypes = _getLicenseTypes;
    staticDataService.getLicenseMethods = _getLicenseMethods;
    return staticDataService;

}]);