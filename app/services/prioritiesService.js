'use strict';
app.factory('prioritiesService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var prioritiesService = {};

    var _getPriorities = function () {

        return $http.get(serviceBase + 'api/LookUpCTRL/priorities').then(function (results) {
            return results;
        });
    };

    prioritiesService.getPriorities = _getPriorities;

    return prioritiesService;

}]);