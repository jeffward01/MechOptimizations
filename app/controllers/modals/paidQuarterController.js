'use strict';
app.controller('padiQuarterController', ['$scope', 'ngAuthSettings', '$stateParams', 'licensesService', 'licenseProductsService', 'licenseWritersConsentTypesService', 'notyService', '$timeout', function ($scope, ngAuthSettings, $stateParams, licensesService, licenseProductsService,licenseWritersConsentTypesService, notyService, $timeout) {
    $scope.recording = $stateParams.recording;
    $scope.writers = $stateParams.recording.licensePRWriters;
    $scope.stateCallbackArguments = {
        method: 'editWriterRates',
        writer: {},
        productId: $stateParams.product.productId,
        recordingId: $stateParams.recording.id
    }
    $scope.product = $stateParams.product;
    $scope.licenseDetail = $stateParams.licenseData;
    $scope.writer = $stateParams.writer;
    $scope.rate = $stateParams.rate;
    $scope.saveWriterIds = [];

    $scope.consentTypes = [];

    $scope.selectedConsentType = {
        writersConsentTypeId: -1,
        writersConsentType: 'Select Type',
        description: ''
    };
    
    $scope.getQuarters = function() {
        if ($scope.quarters == null) {
            licensesService.getQuarters().then(function (result) {
                result.data.unshift({ paidQuarter: "N/A" });
                $scope.quarters = result.data;
            });
        }
    };
    $scope.getConsentTypes = function () {
        if ($scope.consentTypes.length == 0) {
            licenseWritersConsentTypesService.getLicensePaidQuarterTypes().then(function (results) {
                $scope.consentTypes = results.data;
            }, function (error) {
            });
        }

    };
    $scope.EditData = {
        saveWriterIds: [],
        selectedConsentTypeId: 0,
        paidQuarter: $stateParams.config.paidQuarter,
        selecterWriterCae: "",
        selectedRecordingIds: [],
        selectedConfigId: 0,
        licenseId: $stateParams.licenseId
    }
    $scope.selectQuarter = function (qtr) {
        if (qtr.paidQuarter == "N/A") {
            $scope.EditData.paidQuarter = null;
        } else {
            $scope.EditData.paidQuarter = qtr.paidQuarter;
        }
       
    };

    $scope.is_valid_field = USL.Common.isValidField;
    $scope.modal_submit = false;

    $scope.ok = function () {
     
        $scope.modal_submit = true;
        if (!$scope.is_valid_field($scope.selectedConsentType.writersConsentType)) {
            return;
        }
        $scope.EditData.saveWriterIds = [];
        //
        // Depending on the Type, depends on what you do
        $scope.EditData.selectedConsentTypeId = $scope.selectedConsentType.writersConsentTypeId;
        switch ($scope.selectedConsentType.writersConsentTypeId) {
            case 1:  // (Applies consent to only this track and this configuration)
                $scope.EditData.saveWriterIds.push($scope.writer.licenseProductRecordingWriter.licenseWriterId);
                //$scope.EditData.selectedConfigId = $stateParams.config.configuration_id;
                $scope.EditData.selectedConfigId = $stateParams.config.product_configuration_id;
        
                break;
            case 2:  // (Applies consent to the track, including all configurations )
                angular.forEach($scope.recording.licensePRWriters, function (writer) {
                    if (writer.controlled) {
                        $scope.EditData.saveWriterIds.push(writer.licenseProductRecordingWriter.licenseWriterId);
                    }
                });
                break;
            case 3:  // (Applies consent to all like configurations for that writer)
                angular.forEach($scope.product.recordings, function (recording) {
                    if (recording.licenseRecording) {
                        $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
                    }
                });
                $scope.EditData.selecterWriterCae = $scope.writer.caeNumber;
                //$scope.EditData.selectedConfigId = $stateParams.config.configuration_id;
                $scope.EditData.selectedConfigId = $stateParams.config.product_configuration_id;
                break;
            case 4:  // (Applies consent to that Writer across all tracks)
                angular.forEach($scope.product.recordings, function (recording) {
                    if (recording.licenseRecording) {
                        $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
                    }
                });
                $scope.EditData.selecterWriterCae = $scope.writer.caeNumber;
                break;
            case 5:  // (Clears All)
                angular.forEach($scope.product.recordings, function (recording) {
                    $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
                });
                $scope.EditData.selecterWriterCae = $scope.writer.caeNumber;
                break;
        };

        licenseProductsService.editPaidQuarter($scope.EditData).then(function (result) {
            var l = result;
            var message = "Paid quarter applied";

            $scope.stateCallbackArguments.writer = $scope.writer;
            $scope.stateCallbackArguments.consent = $scope.selectedConsentType.writersConsentType;
            $scope.stateCallbackArguments.configuration = $stateParams.config.configuration_name;
            $scope.stateCallbackArguments.paidQuarter = $scope.EditData.paidQuarter ? $scope.EditData.paidQuarter : "N/A";
            $stateParams.stateCallbackArguments = $scope.stateCallbackArguments;
           
            $scope.goToParent({ writer: $scope.writer }, true);

            noty({
                text: message,
                type: 'success',
                timeout: 2500,
                layout: "top"
            });
        }, function (error) {
        });

    };
   
    $scope.selectConsentType = function (p) {
        $scope.selectedConsentType = p;
    };
}]);

