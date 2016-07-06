'use strict';
app.factory('licenseesService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licenseesServiceFactory = {};

    var _getLicensees = function () {

        return $http.get(serviceBase + 'api/licenseCTRL/licensees').then(function (results) {
            return results;
        });
    };

    var _getPagedLicensees = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licensees/PagedLicenees';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _searchContacts = function (query) {
        var url = serviceBase + 'api/licenseCTRL/licensees';
        return $.post(url, { '': query })
        .then(function (response) {
            return response;
        });
    };
    var _addLicensee = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licensees/AddLicensee';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _editLicensee = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licensees/EditLicensee';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _deleteLicensee = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licensees/DeleteLicensee';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    licenseesServiceFactory.getLicensees = _getLicensees;
    licenseesServiceFactory.getPagedLicensees = _getPagedLicensees;
    licenseesServiceFactory.searchLicensees = _searchContacts;
    licenseesServiceFactory.addLicensee = _addLicensee;
    licenseesServiceFactory.editLicensee = _editLicensee;
    licenseesServiceFactory.deleteLicensee = _deleteLicensee;

    return licenseesServiceFactory;

}]);