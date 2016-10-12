'use strict';
app.factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService', function ($q, $injector, $location, localStorageService) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};
       
        var authToken= localStorageService.get('authToken');
        if (authToken) {
            config.headers.Token = authToken;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            //var authService = $injector.get('authService');
            //var authData = localStorageService.get('authTok');

            //if (authData) {
            //    if (authData.useRefreshTokens) {
            //       // $location.path('/refresh');
            //        return $q.reject(rejection);
            //    }
            //}
            //authService.logOut();
            $location.path('/login');
        //    $location.path('/search-MyView');
            
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);