'use strict';
app.controller('writersConsentController', ['$scope', 'ngAuthSettings', '$stateParams', 'licensesService', 'licenseWritersConsentTypesService', 'filesService', 'notyService', '$timeout', function ($scope, ngAuthSettings, $stateParams, licensesService, licenseWritersConsentTypesService, filesService, notyService, $timeout) {
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
    $scope.EditData = {
        saveWriterIds: [],
        selectedConsentTypeId: 0,
        selecterWriterCae: "",
        selectedRecordingIds: [],
        selectedConfigId: 0,
    }
    $scope.getConsentTypes = function () {
        if ($scope.consentTypes.length == 0) {
            licenseWritersConsentTypesService.getLicenseWritersConsentTypes().then(function (results) {
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
                    console.log("Spit it out: " + JSON.stringify(recording.licenseRecording));
                    if (recording.licenseRecording != null) { //Jeff added if statement to stop a null value (the last recording.licenseRecording is null, and causes an error) | THis occured when we sped up product details with $sce
                        $scope.EditData.selectedRecordingIds.push(recording.licenseRecording.licenseRecordingId);
                    }
                });
                $scope.EditData.selecterWriterCae = $scope.writer.caeNumber;
                break;
        };
        $scope.EditData.LicenseId = $stateParams.licenseId;
        licenseWritersConsentTypesService.editWriterConsent($scope.EditData).then(function (result) {
            var l = result;
            var message = "Writer consent applied";

            $scope.stateCallbackArguments.writer = $scope.writer;
            $scope.stateCallbackArguments.consent = $scope.selectedConsentType.writersConsentType;
            $scope.stateCallbackArguments.configuration = $stateParams.config.configuration_name;
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


    $scope.upload = function () {
        var fileId = 'fileToUpload';
        var progressId = 'progressbar';
        var licenseId = $stateParams.licenseId;
        var validSize = filesService.validSize(fileId);
        var fileExists = filesService.isNewFile(fileId, $scope.licenseAttachments);
        var fileSelected = filesService.isFileSelected(fileId);

        if (validSize && fileExists == null && fileSelected) {
            uploadFiles(licenseId, fileId, progressId);
        }

        if (!validSize) {
            var message = "The file which were you trying to upload exceeds the maximum admited size.";
            notyService.error(message);
        }

        if (fileExists) {
            var text = 'We have found an existing file with the same name: "' + fileExists + '". Would you like to overwrite it?';
            notyService.modalConfirm(text).then(function () {
                uploadFiles(licenseId, fileId, progressId);
            });

        }

        if (!fileSelected) {
            var message = "No file has been selected for upload. Please select a file.";
            notyService.error(message);
        }

    };

    var uploadFiles = function (licenseId, fileId, progressId) {
        $scope.progressVisible = true;
        filesService.upload(licenseId, fileId, progressId).then(uploadComplete, uploadError).finally(function () {
            $timeout(function () {
                $scope.progressVisible = false;
            }, 1000);
        });
    }



    var uploadComplete = function (evt) {
        /* This event is raised when the server send back a response */
        $scope.populatelicenseAttachments($stateParams.licenseId);

        var message = "Upload Completed";
        notyService.success(message);
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }


    }

    var uploadFailed = function (evt) {

        var message = "There was an error attempting to upload the file.";
        notyService.error(message);
    }
    var uploadError = function (evt) {
        if (evt.error == "fail") {
            uploadFailed();
        }
        else if (evt.error == "abort") {
            uploadCanceled();
        }

    }
    var uploadCanceled = function (evt) {
        var message = "The upload has been canceled by the user or the browser dropped the connection.";
        notyService.error(message);

    }

    $scope.populatelicenseAttachments = function (licenseId) {
        licensesService.getlicenseAttachments(licenseId).then(function (result) {
            $scope.licenseAttachments = result.data;
        });
    }


    $scope.cancel = function () {
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }
        $scope.goToParent(null, false);
    }

    $scope.removeFile = function (attachment) {
        var text = 'Are you sure you want to remove "' + attachment.fileName + attachment.fileType + '"?';
        notyService.modalConfirm(text).then(function () {
            // Remove from UI
            for (var i = 0; i < $scope.licenseAttachments.length; i++) {
                if ($scope.licenseAttachments[i].licenseAttachmentId == attachment.licenseAttachmentId) {
                    $scope.licenseAttachments.splice(i, 1);
                    break;
                }
            }
            // Remove from DB
            filesService.remove(attachment);
        });
    }

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

}]);

