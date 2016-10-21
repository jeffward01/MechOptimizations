'use strict';
app.factory('labelsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var labelsServiceFactory = {};

    var _getLabels = function () {
        return $http.get(serviceBase + 'api/RECsCTRL/Labels').then(function (results) {
            return results;
        });
    };
    var _getPublishers = function (query) {
        return $http.get(serviceBase + 'api/RECsCTRL/Labels/GetPublishers', { params: { "query": query} }).then(function (results) {
            return results;
        });
    };
    var _getConfigurations = function () {
        return $http.get(serviceBase + 'api/RECsCTRL/Labels/GetRecsConfigurations').then(function (results) {
            return results;
        });
    };
    var _labelGroupSuggest = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/LabelGroups';
        return $http.post(url, '"' + request + '"',  {
            ignoreLoadingBar: true
        })
        //return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    labelsServiceFactory.getLabels = _getLabels;
    labelsServiceFactory.getPublishers = _getPublishers;
    labelsServiceFactory.getConfigurations = _getConfigurations;
    labelsServiceFactory.labelGroupAutosuggest = _labelGroupSuggest;
    return labelsServiceFactory;

}]);