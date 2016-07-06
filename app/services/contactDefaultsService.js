'use strict';
app.factory('contactDefaultsService', ['$q','$http', 'ngAuthSettings','localStorageService', function ($q, $http, ngAuthSettings, localStorageService) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var localStorageDefaults = "CONTACT_DEFAULTS_OPTIONS";
    var sessionStorageDefaults = "CONTACT_DEFAULTS_OPTIONS_SESSION";
    var contactDefaultsServiceFactory = {};

    var _saveContactDefaults = function (request) {
        var url = serviceBase + 'api/contactCTRL/ContactDefaults/Save';
        localStorageService.set(localStorageDefaults, request);
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getContactDefaults = function (contactId) {
        var deffered = $q.defer(); 
        var url = serviceBase + 'api/contactCTRL/ContactDefaults/GetDefault/' + contactId;
        var localStorageData = localStorageService.get(localStorageDefaults);
        if (localStorageData) {
            deffered.resolve({ data: localStorageData });
            return deffered.promise;
        } else {
            return $http.get(url)
        .then(function (response) {
            localStorageService.set(localStorageDefaults, response.data);
            return response;
            });
        }
    };
    var _getSessionDefaults = function() {
      return localStorageService.get(sessionStorageDefaults);
    }
    var _saveSessionDefaults = function(data) {
        localStorageService.set(localStorageDefaults, data);
    }
    contactDefaultsServiceFactory.saveContactDefaults = _saveContactDefaults;
    contactDefaultsServiceFactory.getContactDefaults = _getContactDefaults;
    contactDefaultsServiceFactory.saveDefaultsSession = _saveSessionDefaults;
    contactDefaultsServiceFactory.getDefaultsSession = _getSessionDefaults;
    return contactDefaultsServiceFactory;

}]);