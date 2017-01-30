'use strict';
app.controller('uploadDocController', ['$scope', 'ngAuthSettings', '$stateParams', 'licensesService', 'filesService', 'notyService', '$timeout', '$rootScope',  function ($scope, ngAuthSettings, $stateParams, licensesService, filesService, notyService, $timeout, $rootScope) {
    $scope.progressVisible = false;
    // $scope.safeauthentication = safeService.safeauthentication;
    $scope.errorPresent = false;
    $scope.modalState = $stateParams.state;
    
   getSelected($stateParams.files);

    function getSelected(files) {
        angular.forEach(files,
            function(file) {
                if (file.selected) {
                 
                    $scope.licenseAttachmentToEdit = file;
                }
            });
    }

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
    $scope.isCollapsed = false;
    $scope.setCaret = function (collapsed) {
        if (!collapsed) {
            return "caret";
        } else {
            return "caret caret-up";
        }
    }

    $scope.chosenAttachment = {
        attachmentType: "Select Attachment Type",
        attachmentTypeId: 0
    };

    getAllAttchmentTypes();

    $scope.selectAttachmentType = function (attachmentType) {
        $scope.chosenAttachment = attachmentType;
        if ($scope.licenseAttachmentToEdit != null) {
            $scope.licenseAttachmentToEdit.attachmentTypeId = attachmentType.attachmentTypeId;
            $scope.licenseAttachmentToEdit.attachmentType = attachmentType;
        }
        attachmentValidation();
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.setCaret($scope.isCollapsed);
    }

    $scope.upload = function () {
        var validFile = $scope.checkIfValidFile();
        if (attachmentValidation()) {
            var fileId = "fileToUpload";
            var progressBarId = 'progressbar';
            var licenseId = $stateParams.licenseId;
            var otherFiles = $stateParams.files;
            var validSize = filesService.validSize(fileId);
            var fileExists = filesService.isNewFile(fileId, otherFiles);
            var fileSelected = filesService.isFileSelected(fileId);
            var attachmentTypeId = $scope.chosenAttachment.attachmentTypeId;

            if (!fileSelected) {
                var message = "No file has been selected for upload. Please select a file.";
                notyService.error(message);
            }
     
            if (validSize && fileExists == null && fileSelected) {
          uploadFiles(licenseId, fileId, progressBarId, attachmentTypeId);
            }

            if (!validSize) {
                var message = "The file which were you trying to upload exceeds the maximum admited size.";
                notyService.error(message);
            }

            if (fileExists != null) {
                var text = 'We have found an existing file with the same name: "' +
                    fileExists +
                    '". Would you like to overwrite it?';
                notyService.modalConfirm(text)
                    .then(function() {
                        uploadFiles(licenseId, fileId, progressBarId, attachmentTypeId);
                    });
            }
            var file = document.getElementById(fileId);

           // $scope.uploadMultiFiles(file.files);
        }
        return;
    };



    // for multiple files:
    $scope.uploadMultiFiles = function (files) {
        var licenseId = $stateParams.licenseId;
      var attachmentTypeId = $scope.chosenAttachment.attachmentTypeId;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                Upload.upload({
                    url: 'spa.service/api/licenseCTRL/licenseAttachments/UploadAttachmentsByLicenseId/' +
                    licenseId +
                    "/" +
                    attachmentTypeId,
                    data: { file: files[i]}
                }).then(function (resp) {
                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
        }

}
}





    $scope.save = function() {
        licensesService.editAttachment($scope.licenseAttachmentToEdit)
            .then(function () {
                $rootScope.$broadcast("AttachmentUpdated");
                var message = "Edit Completed";
                notyService.success(message);
                $timeout(function() {
                        $scope.goToParent(null, false);
                    },
                    1200);
            });
    }

    var uploadFiles = function (licenseId, fileId, progressBarId, attachmentTypeId) {
        $scope.progressVisible = true;
        filesService.upload(licenseId, fileId, progressBarId, attachmentTypeId).then(uploadComplete, errorUpload).finally(function () {
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
        if ($scope.chosenAttachment.attachmentTypeId === 0) {
            $scope.chosenAttachment.attachmentTypeId = 1;
            return true;
        }
        return true;
    };

    var errorUpload = function (evt) {
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

    var uploadFailed = function (evt) {
        var message = "There was an error attempting to upload the file.";
        notyService.error(message);
    }

    var uploadCanceled = function (evt) {
        var message = "The upload has been canceled by the user or the browser dropped the connection.";
        notyService.error(message);
    }

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

    //function setDefault() {
    //    var attachmentDefault = {};
    //    angular.forEach($scope.AttachmentTypes,
    //        function (attachment) {
    //            if (attachment.attachmentTypeId === 1) {
    //                attachmentDefault = attachment;
    //            }
    //        });
    //    return attachmentDefault;
    //}
}]);