
describe("associateController Test", function () {
    var scope,
        ngAuthSettings,
        $location,
        authService,
        $timeout,
        q,
        controller;

    beforeEach(function () {
        var authServiceMock = {};
        var locationMock = { };
        module('AngularAuthApp', function ($provide) {
            $provide.value('authService', authServiceMock);
            $provide.value('$location', locationMock);
        });
        authServiceMock.registerExternal = function () {

        };
        authServiceMock.externalAuthData = {};
        authServiceMock.fillAuthData = function () { };
        locationMock.path = function() {};

    });
    beforeEach(inject(function ($rootScope, $controller, _authService_, _$timeout_, _$q_, _$location_) {
        authService = _authService_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        $location = _$location_;
        q = _$q_;
        controller = $controller('associateController', { $scope: scope, authService: authService, $timeout: $timeout, $location: $location });
    }));

    it('registerExternal  should call authService.registerExternal"', function () {
        var deferred = q.defer();
        spyOn(authService, 'registerExternal').and.returnValue(deferred.promise);
        deferred.resolve();
       scope.registerExternal();
        expect(authService.registerExternal).toHaveBeenCalled();
    });
    it('if call for authService.registerExternal returns true then we should redirect and have savedSuccesfully', function () {
        var deferred = q.defer();
        spyOn(authService, 'registerExternal').and.returnValue(deferred.promise);
        spyOn($location, 'path').and.callThrough();
        deferred.resolve();
        scope.registerExternal();
        scope.$root.$digest();
        expect(scope.savedSuccessfully).toBe(true);
        $timeout.flush();
        expect($location.path).toHaveBeenCalled();
    });
    it('if call for authService.login returns false then we should show error messages', function () {
        var deferred = q.defer();
        var errorData = { modelState: new Array() };
        errorData.modelState.push('error #1');
        spyOn(authService, 'registerExternal').and.returnValue(deferred.promise);
        deferred.reject(errorData)
        scope.registerExternal();
        scope.$root.$digest();
        var regex = new RegExp(errorData.modelState[0], "g");
        expect(regex.test(scope.message)).toBe(true);
    });

});

