'use strict';
app.factory('notyService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', '$q', function ($http, ngAuthSettings, $state, localStorageService, $q) {
    var notyServiceFactory = {};
    var _modalConfirm = function (text, timeout, layout) {
        var deferred = $q.defer();
        noty({
            text: text,
            type: 'confirm',
            modal: true,
            timeout: timeout || 5000,
            layout: layout || "center",
            buttons: [
        {
            addClass: 'btn-default', text: 'Ok', onClick: function ($noty) {
                $noty.close();
                deferred.resolve();
            }
        },
        {
            addClass: 'btn-default', text: 'Cancel', onClick: function ($noty) {
                $noty.close();
                deferred.reject();

            }
        }
            ]
        });
        return deferred.promise;
    }
    var _notyError = function(message, timeout, layout) {
        noty({
            text: message,
            type: 'error',
            timeout: timeout || false,
            layout: layout || "top"

        });
    }

    var _notySuccess = function(message, timeout, layout) {
        noty({
            text: message,
            type: 'success',
            timeout: timeout || 3500,
            layout: layout || "top"

        });
    }
    notyServiceFactory.modalConfirm = _modalConfirm;
    notyServiceFactory.error = _notyError;
    notyServiceFactory.success = _notySuccess;

    return notyServiceFactory;
}]);