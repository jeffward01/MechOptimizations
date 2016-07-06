
describe("signup Controller", function () {
    var scope,
        ngAuthSettings,
        $location,
        authService,
        $timeout,
        q,
        controller;
   
    beforeEach(function () {
        var authServiceMock = {};
        var timerMock = function () { };
        module('AngularAuthApp', function ($provide) {
            $provide.value('authService', authServiceMock);
            $provide.value('$timeout', timerMock);
        });
        authServiceMock.saveRegistration = function () {
         
        };
        authServiceMock.fillAuthData = function () { };

    });
    beforeEach(inject(function ($rootScope, $controller, _authService_,_$timeout_,_$q_) {
        authService = _authService_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        q = _$q_;
        controller = $controller('signupController', { $scope: scope, authService: authService, $timeout: $timeout});
    }));

    it('save registration should be called"', function () {
        var deferred = q.defer();
        spyOn(authService, 'saveRegistration').and.returnValue(deferred.promise);
        deferred.resolve();
        scope.signUp();
        expect(authService.saveRegistration).toHaveBeenCalled();
    });
    it('if call for saveRegistration return true then savedSuccesfully should be true', function () {
        var deferred = q.defer();
        spyOn(authService, 'saveRegistration').and.returnValue(deferred.promise);
        deferred.resolve();
        scope.signUp();
        scope.$root.$digest();
        expect(scope.savedSuccessfully).toBeTruthy();
    });
    it('if call for saveRegistration return false then savedSuccesfully should be false', function () {
        var deferred = q.defer();
        var rejectData = { data: { modelState: {} } };
        spyOn(authService, 'saveRegistration').and.returnValue(deferred.promise);
        deferred.reject(rejectData);
        scope.signUp();
        scope.$root.$digest();
        expect(!scope.savedSuccessfully).toBeTruthy();
    });

});
