'use strict';
app.factory('addConfigurationsService', ['$http', 'ngAuthSettings', '$state', function ($http, ngAuthSettings, $state) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var addConfigurationsServiceFactory = {};
  
    var _getconfigs = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetProductConfigurationsAll';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _updateconfigs = function (request) {

         var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/UpdateProductConfigurationsAll';
            return $http.post(url, request)
           .then(function (response) {
               return response;
           });
    };

    addConfigurationsServiceFactory.updateconfigs = _updateconfigs;
    addConfigurationsServiceFactory.getconfigs = _getconfigs;

    return addConfigurationsServiceFactory;

}]);