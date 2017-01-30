'use strict';
app.controller('indexController', ['$scope', '$state', '$location', '$modal', 'safeService', 'localStorageService', 'processorService', '$interval', function ($scope, $state, $location, $modal, safeService, localStorageService, processorService, $interval) {

    $scope.logOut = function () {
        safeService.logout();
        $state.go("LoginModal.Login");
    }

    $scope.safeauthentication = safeService.safeauthentication;

    //Set auth data to show app Management or not to show it
    var authenticationData = localStorageService.get("authenticationData");
    if (authenticationData == null) {
        var checkAdminInterval = $interval(function () {
            authenticationData = localStorageService.get("authenticationData");
            if (authenticationData != null) {
                if (authenticationData.authenticated) {
                    setAdminData(authenticationData);
                    $interval.cancel(checkAdminInterval);
                } else {
                    $scope.IsAdmin = false;
                }
            }
        },4000,20);
    } else {
        setAdminData(authenticationData);
    }

    function setAdminData(authenticationData) {
        processorService.isAdmin(authenticationData.contactId).then(function (result) {
            $scope.IsAdmin = result.data;
        });
    }

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