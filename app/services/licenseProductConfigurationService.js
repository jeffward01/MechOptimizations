'use strict';
app.factory('licenseProductConfigurationService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var productConfigurationServiceFactory = {};

    var _getProductConfigurations = function (licenseProductId) {

        return $http.get(serviceBase + 'api/licenseProductConfigurationCTRL/GetLicenseProductConfiguration/'+licenseProductId).then(function (results) {
            return results;

        });

    };

    var _getProductConfigurationList = function (licenseProductIds) {

        var request = {
            licenseProductIds: licenseProductIds
        };
        var url = serviceBase + 'api/licenseProductConfigurationCTRL/GetLicenseConfigurationList';
        return $http.post(url, licenseProductIds)
        .then(function (response) {
            return response;
        });


    };



    productConfigurationServiceFactory.getProductConfigurations = _getProductConfigurations;

    productConfigurationServiceFactory.getProductConfigurationList = _getProductConfigurationList;

    return productConfigurationServiceFactory;

}]);