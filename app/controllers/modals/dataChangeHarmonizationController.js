'use strict';
app.controller('dataChangeHarmonizationController', ['$scope', '$filter', 'licensesService', 'licenseProductsService', 'productsService', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licenseStatusService', 'auditService', 'safeService', '$state', 'notyService', 'filesService', '$sce', 'smoothScroll', '$timeout', '$window', '$http', '$rootScope',  function ($scope, $filter, licensesService, licenseProductsService, productsService, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService, licenseStatusService, auditService, safeService, $state, notyService, filesService, $sce, smoothScroll, $timeout, $window, $http, $rootScope) {


    $scope.dataChanges = $stateParams.data;
    $scope.licenseId = $stateParams.licenseId;

    $scope.exitDataHarmonization = function() {
        $rootScope.$broadcast('DataHarmonizationModalOpen');
        $scope.goToParent(null, false);
      //  $modalInstance.dismiss('cancel');
    }
}]);