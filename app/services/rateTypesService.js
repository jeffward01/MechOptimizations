'use strict';
app.factory('rateTypesService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var rateTypesService = {};

    var _getRateTypes = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/rateTypes').then(function (results) {
            return results;
        });
    };

    rateTypesService.getRateTypes = _getRateTypes;

    return rateTypesService;

}]);