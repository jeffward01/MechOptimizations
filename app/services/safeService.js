'use strict';
app.factory('safeService', ['$http', '$q', 'localStorageService', 'ngAuthSettings', '$state', function ($http, $q, localStorageService, ngAuthSettings, $state) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var safeServiceFactory = {};

    var _safeauthentication = {
        authenticated: false,
        userName: "",
        email: "",
        contactId: -1,
        safeId: "",
        roleId: "",
        contactActions: [],
        userApps:[],
        rememberMe: null
};

    var _safelocalstorage = {
        safeId: "",
        roleId: "",
        rememeberMe: false
    };

    var _login = function (isInternal, email, password, rememberMe) {
        var url = serviceBase + 'api/AuthenticateCTRL/authenticate/Login';

        var request = {
            isInternal: true,
            username: email,
            password: password
        };

        var rememberMe = rememberMe;
        _safeauthentication.rememberMe = rememberMe;
        return $http.post(url, request)
       .then(function (response) {
           if (response.data.success) {
               _safeauthentication.authenticated = true;
               _safeauthentication.userName = response.data.contactContext.contact.fullName;
               _safeauthentication.contactId = response.data.contactContext.contact.contactId;
               _safeauthentication.safeId = response.data.contactContext.contact.safeId;
               _safeauthentication.email = email;
               _safeauthentication.contactActions = response.data.contactContext.role.actions;
               _safeauthentication.roleId = response.data.contactContext.role.roleId;
               _safeauthentication.userApps = response.data.userApps;
               localStorageService.clearAll();
               //$urlRouterProvider.otherwise("/search-MyView/Tabs/MyViewTab");

               //_safeauthentication.roleId = ??
           }
           else {
               _safeauthentication.authenticated = false;
               _safeauthentication.userName = "";
               _safeauthentication.contactId = -1;
               _safeauthentication.safeId = "";
               _safeauthentication.email = "";
               _safeauthentication.roleId = "";
               _safeauthentication.contactActions = [];
               _safeauthentication.userApps = [];
               //localStorageService.remove('authenticationData');
               $state.go("LoginModal.Login");

           }
           USL.Common.ClearCookie('mechs');
           USL.Common.SetCookie('mechs', _safeauthentication.safeId, 200);
           localStorageService.set('authenticationData',_safeauthentication);

           return response;
       });
    };


    var _register = function (request) {
        var url = serviceBase + 'api/RegistrationCTRL/registration/Register';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _logout = function () {

        USL.Common.ClearCookie('mechs');
        localStorageService.clearAll();

        _safeauthentication.authenticated = false;
        _safeauthentication.userName = "";
        _safeauthentication.contactId = 0;
        _safeauthentication.email = "";
        _safeauthentication.contactId = -1;
        _safeauthentication.safeId = "";
        _safeauthentication.roleId = "";
        _safeauthentication.contactActions = [];
        _safeauthentication.userApps = [];
    };


    var _checkAuthentication = function () {
        var authData = localStorageService.get('authenticationData');

        var cookieValue = USL.Common.GetCookie('mechs');
        if (authData != null && authData.safeId != null && cookieValue != authData.safeId) {
            _logout();
            $state.go("LoginModal.Login");
            return { safeId: "", roleId: "", rememberMe: true }
            }

        if (authData && authData.safeId) {
            var url = serviceBase + 'api/AuthenticateCTRL/authenticate/ValidateSafeId';
            var safeId = authData.safeId;
            var roleId = authData.roleId;
            var request = {
                safeId: safeId
            };
            return $http.post(url, request)
            .then(function (response) {
                if (response.data.success) {
                    _safeauthentication.authenticated = true;
                    _safeauthentication.userName = response.data.contactContext.contact.fullName;
                    _safeauthentication.email = "";
                    _safeauthentication.contactId = response.data.contactContext.contact.contactId;
                    _safeauthentication.safeId = response.data.contactContext.contact.safeId;
                    _safeauthentication.roleId = response.data.contactContext.contact.roleId;
                    _safeauthentication.contactActions = response.data.contactContext.role.actions;
                    _safeauthentication.userApps = response.data.userApps;
                    if ($state.current.name == "") {
                        $state.go("SearchMyView.Tabs.MyViewTab");
                    } else {
                        $state.go($state.current.name);
                    }

                }
                else {
                    _safeauthentication.authenticated = false;
                    _safeauthentication.userName = "";
                    _safeauthentication.email = "";
                    _safeauthentication.contactId = -1;
                    _safeauthentication.safeId = "";
                    _safeauthentication.roleId = "";
                    _safeauthentication.contactActions = [];
                    _safeauthentication.userApps = [];
                    //localStorageService.remove('authenticationData');
                    $state.go("LoginModal.Login");

                }
                localStorageService.set('authenticationData', _safeauthentication);

                return response;
            });
        }
        else {
            $state.go("LoginModal.Login");

            return { safeId: "", roleId: "", rememberMe: true }
        }

    };

    var _getAuthentication = function () {

        var authData = localStorageService.get('authenticationData');
        return authData;
    }

    var _goLogin = function () {
        $state.go("LoginModal.Login");
    }


    safeServiceFactory.safeauthentication = _safeauthentication;
    safeServiceFactory.safelocalstorage = _safelocalstorage;
    safeServiceFactory.login = _login;
    safeServiceFactory.logout = _logout;
    safeServiceFactory.register = _register;
    safeServiceFactory.checkAuthentication = _checkAuthentication;
    safeServiceFactory.goLogin = _goLogin;
    safeServiceFactory.getAuthentication = _getAuthentication;

    return safeServiceFactory;
}]);