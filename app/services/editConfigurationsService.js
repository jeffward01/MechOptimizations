'use strict';
app.factory('editConfigurationsService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', function ($http, ngAuthSettings, $state, localStorageService) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var editConfigurationsServiceFactory = {};
  

    var _getConfigs = function (licenseId) {
        var url = serviceBase + 'api/LicenseProductCTRL/licenseproducts/GetLicenseProductConfigurationsAll/' + licenseId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };


    var _addNewConfig = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/AddProductConfiguration';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _addExistingConfig = function (request) {
        var url = serviceBase + 'api/licenseProductConfigurationCTRL/AddLicenseProductConfiguration';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };


    var _deleteExistingConfig = function (request) {
        var url = serviceBase + 'api/licenseProductConfigurationCTRL/DeleteLicenseProductConfiguration';
        //alert(request.licenseId + ' ' + request.licenseProductId + ' ' + request.licenseProductConfigurationId);
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _updateConfig = function (request) {
        var url = serviceBase + 'api/licenseProductConfigurationCTRL/UpdateLicenseProductConfiguration';
        //alert(request.licenseId + ' ' + request.licenseProductId + ' ' + request.licenseProductConfigurationId);
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    }

    var _update = function (request) {

         var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/UpdateLicenseProductConfigurationsAll';
            return $http.post(url, request)
           .then(function (response) {
               return response;
           });
    };

    var _cancel = function () {

    };

    var _getRecsProductHeader = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/Products/GetProductHeader/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _getAllRecsConfigurations = function () {
        var url = serviceBase + 'api/RECsCTRL/Configurations';
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    editConfigurationsServiceFactory.update = _update;
    editConfigurationsServiceFactory.cancel = _cancel;
    editConfigurationsServiceFactory.getConfigs = _getConfigs;
    editConfigurationsServiceFactory.getAllRecsConfigurations = _getAllRecsConfigurations;
    editConfigurationsServiceFactory.getRecsProductHeader = _getRecsProductHeader;
    editConfigurationsServiceFactory.addExistingConfig = _addExistingConfig;
    editConfigurationsServiceFactory.deleteExistingConfig = _deleteExistingConfig;
    editConfigurationsServiceFactory.addNewConfig = _addNewConfig;
    editConfigurationsServiceFactory.updateConfig = _updateConfig;

    return editConfigurationsServiceFactory;

}]);