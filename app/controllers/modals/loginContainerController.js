'use strict';
app.controller('loginContainerController', ['$scope', '$modalInstance', 'licensesService','$state','$stateParams', function ($scope, $modalInstance, licensesService, $state, $stateParams) {

   

    $scope.cancel = function () {
        $state.go('SearchMyView.Tabs.MyViewTab');
    };

    $scope.ok = function () {

    }
}]);