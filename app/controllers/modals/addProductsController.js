'use strict';
app.controller('addProductsController', ['$scope', 'licensesService','$stateParams', function ($scope, licensesService, $stateParams) {

  
    $scope.addProducts = function () {
        $scope.$broadcast('modalAddProductsEvent', { licenseId: $scope.selectedLicense.licenseId });
    }
}]);