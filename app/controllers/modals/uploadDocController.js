'use strict';
app.controller('uploadDocController', ['$scope', 'ngAuthSettings', '$stateParams', 'licensesService', 'filesService','notyService','$timeout', function ($scope, ngAuthSettings, $stateParams, licensesService, filesService, notyService, $timeout) {
    $scope.progressVisible = false;
   // $scope.safeauthentication = safeService.safeauthentication;

    $scope.checkIfValidFile = function () {
        var element = document.getElementById('fileToUpload');
        var input = document.getElementsByClassName('form-control')[0];

        if (!USL.Common.isValidField(element.value)) {
            input.classList.add('field-error');
            return false;
        }
        else {
            input.classList.remove('field-error');
            return true;
        }
    };

    $scope.upload = function () {

        var validFile = $scope.checkIfValidFile();

        var fileId = "fileToUpload";
        var progressBarId = 'progressbar';
        var licenseId = $stateParams.licenseId;
        var otherFiles = $stateParams.files;
        var validSize = filesService.validSize(fileId);
        var fileExists = filesService.isNewFile(fileId, otherFiles);
        var fileSelected = filesService.isFileSelected(fileId);

        //if (!fileSelected) {
        //    var message = "No file has been selected for upload. Please select a file.";
        //    notyService.error(message);
        //}
        if (validSize && fileExists==null && fileSelected) {
            uploadFiles(licenseId, fileId, progressBarId);
        }

        if (!validSize) {
            var message = "The file which were you trying to upload exceeds the maximum admited size.";
            notyService.error(message);
        }

        if (fileExists!=null) {
            var text = 'We have found an existing file with the same name: "' + fileExists + '". Would you like to overwrite it?';
            notyService.modalConfirm(text).then(function() {
                uploadFiles(licenseId, fileId, progressBarId);
            });
        }
    };

    var uploadFiles = function (licenseId, fileId, progressBarId) {
        $scope.progressVisible = true;
        filesService.upload(licenseId, fileId, progressBarId).then(uploadComplete, errorUpload).finally(function() {
            $timeout(function () {
                $scope.progressVisible = false;
            }, 1000);
        });
    }

    var errorUpload = function(evt) {
        if (evt.error == "fail") {
             uploadFailed();
        }
        else if (evt.error == "abort") {
            uploadCanceled();
        }
    }

    var uploadComplete = function (evt) {
        /* This event is raised when the server send back a response */

        var message = "Upload Completed";
        notyService.success(message);
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }
        $scope.goToParent(null, false);
    }

    var uploadFailed = function(evt) {
        var message = "There was an error attempting to upload the file.";
        notyService.error(message);
    }

    var uploadCanceled = function (evt) {
        var message = "The upload has been canceled by the user or the browser dropped the connection.";
        notyService.error(message);

    }

}]);

