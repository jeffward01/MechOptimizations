'use strict';
app.controller('dataChangeHarmonizationController', ['$scope', '$filter', 'licensesService', 'licenseProductsService', 'productsService', '$modal', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licenseStatusService', 'auditService', 'safeService', '$state', 'notyService', 'filesService', '$sce', 'smoothScroll', '$timeout', '$window', '$http', function($scope, $filter, licensesService, licenseProductsService, productsService, $modal, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService, licenseStatusService, auditService, safeService, $state, notyService, filesService, $sce, smoothScroll, $timeout, $window, $http) {


    $scope.dataChanges = $stateParams.data;
    $scope.licenseId = $stateParams.licenseId;


}]);