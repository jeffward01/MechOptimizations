'use strict';
app.factory('headerProvider', ['$state', 'localStorageService', function ($state, localStorageService) {

    var safeId = localStorageService.get("authenticationData").safeId;
    if (safeId === null) {
        safeId = {};
        safeId.safeId = null;
    }


    var headerProviderFactory = {};

    var _configureXmodifiedByHeader = function () {
        var config = {
            headers: {
                "x-modified-by": safeId
            }
        };
        return config;

    };

    
    headerProviderFactory.configureXModifedByHeader = _configureXmodifiedByHeader;

    return headerProviderFactory;

}]);