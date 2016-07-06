'use strict';
app.controller('loginController', ['$scope', 'safeService', '$stateParams', 'data' , function ($scope, safeService, $stateParams, data) {
//app.controller('loginController', ['$scope', '$location', 'safeService', 'ngAuthSettings', 'data', function ($scope, $location, safeService, ngAuthSettings, data) {

    $scope.message = "";

    $scope.safeLogin = {
        Username: "",
        Password: ""
    };

    var errorlist = [];

    $scope.ok = function () {
        safeService.login($scope.safeLogin.Username, $scope.safeLogin.Password).then(function (result) {
            if (result.data.success) {
                $location.path('/search-myView');
            }
            else {
                for (var i = 0; i < result.data.errorList.length; i++) {
                    errorlist.push({ message: result.data.errorList[i] });
                }
                for (var i = 0; i < result.data.globalErrors.length; i++) {
                    errorlist.push({ message: result.data.globalErrors[i] });
                }
            }
        }, function (err) {
            errorlist.push({ message: "Error" });
        });

        $scope.errors = errorlist;
    };

    $scope.cancel = function () {

    };

}]);

