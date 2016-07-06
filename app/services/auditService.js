'use strict';
app.factory('auditService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var auditServiceFactory = {};

    var _getAudit = function () {

        // gets top 100 descending order
        return $http.get(serviceBase + 'api/auditCTRL/audits').then(function (results) {
            return results;
        });
    };
    var _getLicenseAuditInfo = function (request) {
        var url = serviceBase + 'api/auditCTRL/audits/GetLicenseAudit';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _getProductAuditInfo = function (request) {
        var url = serviceBase + 'api/auditCTRL/audits/GetProductAudit';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    auditServiceFactory.getAudit = _getAudit;
    auditServiceFactory.getLicenseAuditInfo = _getLicenseAuditInfo;
    auditServiceFactory.getProductAuditInfo = _getProductAuditInfo;

    return auditServiceFactory;

}]);