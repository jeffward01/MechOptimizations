'use strict';
app.factory('editRatesService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', function ($http, ngAuthSettings, $state, localStorageService) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var editRatesServiceFactory = {};

    var _getRatesData = function (request) {
        var url = serviceBase + 'api/licenseCTRL/Rates/GetRates';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });

    };

    var _getRateTypes = function (request) {
        var url = serviceBase + 'api/LookupCTRL/RateTypes';
        return $http.get(url, request)
        .then(function (response) {
            return response;
        });

    };

    var _getSpecialStatus = function (request) {
        var url = serviceBase + 'api/LookupCTRL/SpecialStatuses';
        return $http.get(url, request)
        .then(function (response) {
            return response;
        });

    };

    var _getLicenseRelatedIds = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetAllLicenseRecordingRelatedIds';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });

    };


    /*
    var _updateLocalStorage = function (configData) {
        localStorageService.remove(CONFIG_DATA);
        localStorageService.set(CONFIG_DATA, configData);
    };
    */

    var _update = function () {
       // var configData = localStorageService.get(CONFIG_DATA);


    };


    var _cancel = function () {
       // localStorageService.remove();
    };



    editRatesServiceFactory.update = _update;
    editRatesServiceFactory.cancel = _cancel;
    editRatesServiceFactory.getRatesData = _getRatesData;
    editRatesServiceFactory.getRateTypes = _getRateTypes;
    editRatesServiceFactory.getSpecialStatus = _getSpecialStatus;
    editRatesServiceFactory.getLicenseRelatedIds = _getLicenseRelatedIds;

    //editRatesServiceFactory.updateLocalStorage = _updateLocalStorage;

    return editRatesServiceFactory;

}]);