'use strict';
app.controller('indexController', ['$scope', '$state', '$location', '$modal', 'safeService', function ($scope, $state, $location, $modal, safeService) {

    $scope.logOut = function () {
        safeService.logout();
        $state.go("LoginModal.Login");
    }

    $scope.safeauthentication = safeService.safeauthentication;

    $scope.openRegister = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-Register.html',
            controller: 'registerController',
            size: size,
            resolve: {
                data: function () {
                    //return [$scope.licenseDetail];
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };

    /*
    $scope.openLogin = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-Login.html',
            controller: 'loginController',
            size: size,
            resolve: {
                data: function () {
                    //return [$scope.licenseDetail];
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };
    */

}]);