'use strict';
app.controller('licenseWriterController', ['$scope', 'ngAuthSettings', '$stateParams', 'licensesService', 'licenseWritersConsentTypesService', 'filesService', 'notyService', '$timeout', function ($scope, ngAuthSettings, $stateParams, licensesService, licenseWritersConsentTypesService, filesService, notyService, $timeout) {
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
    $scope.rate1 = $stateParams.rate1;
    $scope.saveWriterIds = [];

    $scope.consentTypes = [];

    $scope.selectedConsentType = {
        writersConsentTypeId: -1,
        writersConsentType: 'Select Type',
        description: ''
    };
    $scope.EditData = {
        saveWriterIds: [],
        selectedConsentTypeId: 0,
        selecterWriterCae: "",
        selectedRecordingIds: [],
        selectedConfigId: 0,
        isIncluded: false,
}
    $scope.getConsentTypes = function () {
        if ($scope.consentTypes.length == 0) {
            licenseWritersConsentTypesService.getLicenseIncludeExcludeTypes().then(function (results) {
                $scope.consentTypes = results.data;
            }, function (error) {
            });
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
        $scope.EditData.isIncluded = $scope.selectedWriterInclude.isIncluded;


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
                    $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
                });
                $scope.EditData.selecterWriterCae = $scope.writer.caeNumber;
                //$scope.EditData.selectedConfigId = $stateParams.config.configuration_id;
                $scope.EditData.selectedConfigId = $stateParams.config.product_configuration_id;
                break;
            case 4:  // (Applies consent to that Writer across all tracks)
                angular.forEach($scope.product.recordings, function (recording) {
                    $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
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

        licenseWritersConsentTypesService.editWriterIncluded($scope.EditData).then(function (result) {
            var l = result;
            var message = "Writer Include Change Applied";

            $scope.stateCallbackArguments.writer = $scope.writer;
            $scope.stateCallbackArguments.consent = $scope.selectedConsentType.writersConsentType;
            $scope.stateCallbackArguments.configuration = $stateParams.config.configuration_name;
            $scope.stateCallbackArguments.isIncluded = $scope.selectedWriterInclude.isIncluded;
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
        
        //$scope.goToParent(null, false);
    };
    $scope.progressVisible = false;
    //upload File section
    $scope.licenseAttachments = $stateParams.files;

    //  writerconsenttypes


    $scope.selectConsentType = function (p) {
        $scope.selectedConsentType = p;
    };

    $scope.getIncludedIcon = function (writerIncludeChoice) {
        if (writerIncludeChoice.isIncluded == true) {
            return "include";
        }

        return "exclude";
    }

    $scope.writerIncludedChoices = [
        { name: "Include Writer(s)", isIncluded: true },
        { name: "Exclude Writer(s)", isIncluded: false }
    ];
    //TODO: to be deleted after pass of QA
    //if ($scope.rate.rates[0].writerRateInclude) {
    //    $scope.selectedWriterInclude = $scope.writerIncludedChoices[0];
    //}
    //console.log(JSON.stringify($scope.rate)); //this is null for some reason' 
    if ($scope.rate1.writerRateInclude) {
        $scope.selectedWriterInclude = $scope.writerIncludedChoices[0];
    }
    else {
        $scope.selectedWriterInclude = $scope.writerIncludedChoices[1];
    }

    $scope.selectWriterInclude = function (p) {
        $scope.selectedWriterInclude = p;
    }

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

}]);

