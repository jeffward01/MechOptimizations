describe("loginController Test", function () {
    var scope,
        ngAuthSettings,
        $location,
        authService,
        $timeout,
        q,
        controller;

    beforeEach(function () {
        var authServiceMock = {};
        var locationMock = {};
        authServiceMock.login = function () {
        };
        authServiceMock.fillAuthData = function () { };
        locationMock.path = function () { };

        module('AngularAuthApp', function ($provide) {
            $provide.value('authService', authServiceMock);
            $provide.value('$location', locationMock);
        });


    });
    beforeEach(inject(function ($rootScope, $controller, _authService_, _$timeout_, _$q_, _$location_) {
        authService = _authService_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        $location = _$location_;
        q = _$q_;
        controller = $controller('loginController', { $scope: scope, authService: authService, $timeout: $timeout, $location: $location });
    }));

    it('login should call authService.login"', function () {
        var deferred = q.defer();
        spyOn(authService, 'login').and.returnValue(deferred.promise);
        deferred.resolve();
        scope.login();
        expect(authService.login).toHaveBeenCalled();
    });
    it('if call for authService.login returns true then we should redirect', function () {
        var deferred = q.defer();
        spyOn(authService, 'login').and.returnValue(deferred.promise);
        spyOn($location, 'path').and.callThrough();
        deferred.resolve();
        scope.login();
        scope.$root.$digest();196
        expect($location.path).toHaveBeenCalled();
    });
    it('if call for authService.login returns false then we should show error messages', function () {
        var deferred = q.defer();
        var errorData = { error_description: 'error 1' };
        spyOn(authService, 'login').and.returnValue(deferred.promise);
        deferred.reject(errorData);
        scope.login();
        scope.$root.$digest();
        expect(scope.message).toBe(errorData.error_description);
    });

});

