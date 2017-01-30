'use strict';
app.controller('processorEntryController', ['$scope', 'licensesService', 'notyService', 'safeService', '$stateParams', 'processorService', '$timeout',
    function ($scope, licensesService, notyService, safeService, $stateParams, processorService, $timeout) {
        $scope.ProcessorName = $stateParams.processorName;

        $scope.SolrProcessorFailedItems = {};
        $scope.SolrProcessorUnProcessedItems = {};
        $scope.LicenseProcessorFailedItems = {};
        $scope.LicenseProcessorUnProcessedItems = {};
        $scope.DataHarmonizationProcessorFailedItems = {};
        $scope.DataHarmonizationUnProcessedItems = {};

        fillData();

        function fillData() {
            $timeout(function () {
                processorService.getSolrUnProcessed().then(function (result) {
                    $scope.SolrProcessorUnProcessedItems = result;
                });
                processorService.getSolrFailed().then(function (result) {
                    $scope.SolrProcessorFailedItems = result;
                });
                processorService.getDhFailed().then(function (result) {
                    $scope.DataHarmonizationProcessorFailedItems = result;
                });
                processorService.getDhUnProcessed().then(function (result) {
                    $scope.DataHarmonizationUnProcessedItems = result;
                });
                processorService.getLicenseUnProcessed().then(function (result) {
                    $scope.LicenseProcessorUnProcessedItems = result;
                });
                processorService.getLicenseFailed().then(function (result) {
                    $scope.LicenseProcessorFailedItems = result;
                });
            }, 1700);
        }

        $scope.getActionType = function (actionTypeId) {
            if (actionTypeId === 1) {
                return "Create";
            } else {
                return "Delete";
            }
        }
        $scope.getStatus = function (status) {
            if (status === 1) {
                return "Pending";
            } else if (status === 2) {
                return "In Process";
            } else if (status === 3) {
                return "Complete";
            } else if (status === 4) {
                return "Error";
            }
        };

        //********LP
        //--FAILED
        //Set All Failed to Pending
        $scope.setAllFailedLicenseItemsToPending = function () {
            fillData();
        }

        $scope.deleteSingleLicenseItem = function (id) {
            processorService.deleteSingleUnProcessedLicenseItem(id);
            fillData();
        }

        //Delete All Failed
        $scope.deleteAllFailedLicenseItems = function () {
            processorService.deleteAllFailedLicenseItems();

            fillData();
        }
        //Set individual failed to pending
        $scope.setFailedLicenseItemToPending = function (licenseItemId) {
            processorService.setSingleUnProcessedLicenseItemToPending(licenseItemId);

            fillData();
        }
        //DeleteIndividual
        $scope.deleteFailedLicenseItem = function (licenseItemId) {
            processorService.deleteSingleUnProcessedLicenseItem(licenseItemId);
            fillData();
        }

        $scope.deleteAllUnProcessedLicenseItems = function () {
            processorService.deleteAllFailedLicenseItems();
            fillData();
        }

        $scope.resetAllUnprocessedLicenseItems = function () {
            processorService.
            fillData();
        }

        //********SOLR
        //--UNPROCESSED
        //Set All UnProcessed (1,2) to Pending
        $scope.setAllUnProcessedSolrItemsToPending = function () {
            processorService.setAllUnProcessedSolrItemsToPending();

            fillData();
        }
        //Delete All UnProcessed (1,2)
        $scope.deleteAllUnprocesedSolrItem = function () {
            processorService.deleteAllUnprocesedSolrItems();
            fillData();
        }
        $scope.deleteAllFailedSolrItems = function () {
            processorService.deleteAllFailedSolrItems();
            fillData();
        }

        $scope.setAllFailedSolrItemsPending = function () {
            processorService.setAllFailedSolrItemsToPending();
            fillData();
        }

        $scope.resetIndivdualSolrItem = function (id) {
            processorService.setSingleSolrItemToPending(id);
            fillData();
        }

        $scope.deleteIndividualSolrItem = function (id) {
            processorService.deleteSingleUnProcessedSolrItem(id);
            fillData();
        }

        //********DHP
        //--FAILED
        $scope.setAllDHUnProcessedItemsToPending = function () {
            processorService.setAllUnProcessedDHItemsToPending();

            fillData();
        }

        $scope.deleteAllUnProcessedDhItems = function () {
            processorService.deleteAllUnProcessedDHItems();

            fillData();
        }

        //Set All Failed to Pending
        $scope.setAllFailedDhItemsToPending = function () {
            processorService.setAllFailedDhItemsToPending();

            fillData();
        }
        //Delete All Failed
        $scope.deleteAllFailedDhItems = function () {
            processorService.deleteAllFailedDhItems();

            fillData();
        }
        //Set individual failed to pending
        $scope.setIndividualFailedDhItemToPending = function (dataHarmonizingQueueId) {
            processorService.setSingleUnProcessedDHItemToPending(dataHarmonizingQueueId);

            fillData();
        }
        //DeleteIndividual
        $scope.deleteIndividualFailedDhItem = function (dataHarmonizingQueueId) {
            processorService.deleteSingleDhItem(dataHarmonizingQueueId);

            fillData();
        }
    }]);