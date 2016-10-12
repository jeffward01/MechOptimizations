'use strict';
app.controller('executeLicenseController', ['$scope', '$stateParams', 'ngAuthSettings', 'licensesService', 'filesService', 'notyService', '$timeout', function ($scope, $stateParams, ngAuthSettings, licensesService, filesService, notyService, $timeout) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.licenseDetail = $stateParams.licenseData;
    $scope.errorPresent = false;
    $scope.chosenAttachment = {
        attachmentType: "Select Attachment Type",
        attachmentTypeId: 0
    };
    $scope.isCollapsed = false;
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    };
    var day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    };

    var date;
    var lday;
    var lyear;
    var lmonth;
    if ($scope.licenseDetail.effectiveDate) {
        $scope.dt = moment.utc($scope.licenseDetail.effectiveDate).format("YYYY-MM-DD");
    } else {
        $scope.dt = moment().format();
    }
    if ($scope.licenseDetail.receivedDate) {
        $scope.dtReceived = moment.utc($scope.licenseDetail.receivedDate).format("YYYY-MM-DD");
    } else {
        $scope.dtReceived = moment().format();
    }
    if ($scope.licenseDetail.signedDate) {
        $scope.dtSigned = moment.utc($scope.licenseDetail.signedDate).format("YYYY-MM-DD");
    } else {
        $scope.dtSigned = moment().format();
    }

    $scope.selectAttachmentType = function (attachmentType) {
        $scope.chosenAttachment = attachmentType;
        attachmentValidation();
    }

    var dateErrorMessage = function (evt) {
        var message = "Invalid Date, use mm/dd/yyyy format (click to close)";
        notyService.error(message);
    }

    $scope.ok = function () {
        var form1 = $scope.someForm11;
        var form2 = $scope.someForm12;
        var form3 = $scope.someForm13;

        var date1 = $("#date11").val();
        var date2 = $("#date12").val();
        var date3 = $("#date13").val();

        if (form1.$invalid && date1.length >= 1 || form2.$invalid && date2.length >= 1 || form3.$invalid && date3.length >= 1) {
            dateErrorMessage();
            return;
        }

        if ($scope.licenseDetail.licenseStatusId == 6) {
            var data = {
                licenseId: $scope.licenseDetail.licenseId,
                userAction: 3
            }
            licensesService.updateGeneratedLicenseStatus(data);
        }

        $scope.licenseDetail.licenseStatusId = 5;
        $scope.licenseDetail.licenseStatus.licenseStatus = "Executed";
        $scope.licenseDetail.effectiveDate = $scope.dt;
        $scope.licenseDetail.signedDate = $scope.dtSigned;
        $scope.licenseDetail.receivedDate = $scope.dtReceived;
        licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
            $scope.goToParent({}, true);
        }, function (error) { });
    };
    $scope.progressVisible = false;
    //upload File section
    $scope.licenseAttachments = $stateParams.files;

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

    $scope.upload = function () {
        if (attachmentValidation()) {
            var fileId = 'fileToUpload';
            var progressId = 'progressbar';
            var licenseId = $stateParams.licenseId;
            var validSize = filesService.validSize(fileId);
            var fileExists = filesService.isNewFile(fileId, $scope.licenseAttachments);
            var fileSelected = filesService.isFileSelected(fileId);
            var attachmentTypeId = $scope.chosenAttachment.attachmentTypeId;

            if (validSize && fileExists == null && fileSelected) {
                uploadFiles(licenseId, fileId, progressId, attachmentTypeId);
            }

            if (!validSize) {
                var message = "The file which were you trying to upload exceeds the maximum admited size.";
                notyService.error(message);
            }

            if (fileExists) {
                var text = 'We have found an existing file with the same name: "' +
                    fileExists +
                    '". Would you like to overwrite it?';
                notyService.modalConfirm(text)
                    .then(function () {
                        uploadFiles(licenseId, fileId, progressId, attachmentTypeId);
                    });
            }

            if (!fileSelected) {
                var message = "No file has been selected for upload. Please select a file.";
                notyService.error(message);
            }
        }
        return;
    };


    var uploadFiles = function (licenseId, fileId, progressId, attachmentTypeId) {
        $scope.progressVisible = true;
        filesService.upload(licenseId, fileId, progressId, attachmentTypeId).then(uploadComplete, uploadError).finally(function () {
            $timeout(function () {
                $scope.progressVisible = false;
            }, 1000);
        });
    }
    function attachmentValidation() {
        if (!validateAttachmentType()) {
            var attachmentTypeErrorMessage = "Please select an Attachment Type";
            $scope.errorPresent = true;
            notyService.error(attachmentTypeErrorMessage);
            return false;
        } else {
            $scope.errorPresent = false;
            return true;
        }
    }
    function validateAttachmentType() {
        if ($scope.chosenAttachment.attachmentTypeId == 0) {
            return false;
        }
        return true;
    };

    var uploadComplete = function (evt) {
        /* This event is raised when the server send back a response */
        $scope.populatelicenseAttachments($stateParams.licenseId);

        var message = "Upload Completed";
        notyService.success(message);
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }
    }

    getAllAttchmentTypes();

    function getAllAttchmentTypes() {
        filesService.getAllAttachmentTypes()
            .then(function (res) {
                console.log(JSON.stringify(res.data));
                $scope.AttachmentTypes = res.data;
            },
                function (err) {
                    console.log("An error occurred retrieving licenseAttachmentTypes. Error: " + err.toString());
                });
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
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
        $scope.openedSigned = false;
        $scope.openedReceived = false;
    };

    $scope.openSigned = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = false;
        $scope.openedSigned = true;
        $scope.openedReceived = false;
    };
    $scope.openReceived = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = false;
        $scope.openedSigned = false;
        $scope.openedReceived = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0,
    };
    $scope.cancel = function () {
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }
        $scope.goToParent(null, false);
    }

    $scope.setCaret = function (collapsed) {
        if (!collapsed) {
            return "caret";
        } else {
            return "caret caret-up";
        }
    }
    $scope.format = 'MM/dd/yyyy';
}]);