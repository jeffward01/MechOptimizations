'use strict';
//app.controller('loginController', ['$scope', '$modalInstance', 'safeService', 'ngAuthSettings', 'data', function ($scope, $modalInstance, safeService, ngAuthSettings, data) {
app.controller('loginController', ['$scope', '$state', 'safeService', 'licensesService', '$stateParams', function ($scope, $state, safeService, licensesService, $stateParams) {

    $scope.message = "";

    $scope.safeLogin = {
        Username: "",
        Password: ""
    };

    var errorlist = [];

    $scope.ok = function () {
        var valid = true;
        errorlist.length = 0;
        if ($scope.safeLogin.Username.length == 0) {
            errorlist.push({ message: "Enter Username" });
            valid = false;
        }

        if ($scope.safeLogin.Password.length < 6) {
            errorlist.push({ message: "Enter Password" });
            valid = false;
        }

        if (valid) {
            var rememberMe = true;
            safeService.login(true, $scope.safeLogin.Username, $scope.safeLogin.Password, rememberMe).then(function (result) {
                if (result.data.success) {

                    $state.reload().then(function () {
                        $state.go('SearchMyView.Tabs.MyViewTab');
                    });
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
        }
        $scope.errors = errorlist;
    };
    /*
    $scope.cancel = function () {
        alert('cancel');
        //$modalInstance.dismiss('cancel');
    };
    */
}]);
