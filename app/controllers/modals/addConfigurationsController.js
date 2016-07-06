'use strict';
app.controller('addConfigurationsController', ['$scope', '$filter', 'licensesService', 'addConfigurationsService', '$stateParams', '$state', function ($scope, $filter, licensesService, addConfigurationsService, $stateParams, $state) {

    // values from routes in app.js
    //$scope.licenseId = $scope.selectedLicense.licenseId;
    //$scope.productsParams = $scope.selectedProducts;


    $scope.ok = function () {
        
        /*
        var request = [];
        angular.forEach($scope.selectedProducts, function (product) {
            angular.forEach($scope.configurations, function (config) {
                if (config.Selected && product.product_id === config.product_id && config.licenseProductConfiguration === null) {
                    request.push({
                        licenseId: $scope.selectedLicense.licenseId,
                        productId: product.product_id,
                        productConfigurationId: config.product_configuration_id,
                        configurationId: config.configuration_Id,
                        configurationName: config.configuration_name
                    })
                }
            });
        });

        if (request.length > 0) {
            addConfigurationsService.updateconfigs(request);
        }

        $state.reload().then(function () {
            $state.go('SearchMyView.DetailLicense');
        });
        */
    };


    $scope.validconfigs = function (productId) {
        return function (config) {
            return config.productId === productId;
        }
    };

    $scope.configurations = []

    $scope.getConfigurations = function () {

        $scope.selectedAll.length = 0;

        var productIds = [];
        angular.forEach($scope.selectedProducts, function (product) {
            productIds.push(product.product_id);
        });
        var request = {
            licenseId: $scope.selectedLicense.licenseId,
            productIds: productIds
        };

        addConfigurationsService.getconfigs(request).then(function (result) {
            $scope.configurations.length = 0;

            angular.forEach(result.data, function(item) {
                $scope.configurations.push(item);
            });

        }, function (error) {
            alert(error.data.message);
        });
    };


    $scope.selectedAll = [];

    $scope.selectAll = function (product) {

        if ($scope.selectedAll.indexOf(product) === -1) {
            $scope.selectedAll.push(product);
            product.Selected = true;
        }
        else {
            $scope.selectedAll.splice($scope.selectedAll.indexOf(product), 1);
            product.Selected = false;
        }
        
        angular.forEach($scope.configurations, function (config) {
            if (config.product_id === product.product_id && config.licenseProductConfiguration === null) {
                config.Selected = product.Selected;
            }
        });
    };


    $scope.hasProductConfigurations = function (p) {
        var count = 0;

        angular.forEach($scope.configurations, function (config) {
            if (config.product_id === p.product_id && config.licenseProductConfiguration === null) {
                count++;
            }
        });

        if (count > 0) {
            return true;
        }
        else {
            return false;
        }
    };

    $scope.licenseProductConfigurationFilter = function (productId) {
        return function (config) {
            return config.product_id === productId && config.licenseProductConfiguration === null;
        }
    };


    $scope.getConfigurations();

//    $scope.addConfigurations = function () {
//        $scope.$broadcast('modalAddConfigurationsEvent', { licenseId: $scope.selectedLicense.licenseId });
//    }
}]);
