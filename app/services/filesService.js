'use strict';
app.factory('filesService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', '$q', 'safeService', function ($http, ngAuthSettings, $state, localStorageService, $q, safeService) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var filesServiceFactory = {};

    var _getTokenId = function () {
        var authToken = localStorageService.get('authToken');
        if (authToken) return authToken;
        return "";
    }
    var _upload = function (licenseId, fileElementId, progressBarId, attachmentTypeId) {
        var deferred = $q.defer();
        var xhr = new XMLHttpRequest();
        var file = document.getElementById(fileElementId);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var loaded = Math.round(parseFloat(e.loaded / e.total).toFixed(2) * 100) + "%";
                document.getElementById(progressBarId).value = loaded;
                document.getElementById(progressBarId).style.width = loaded;
                document.getElementById(progressBarId).textContent = document.getElementById(progressBarId).value; // Fallback for unsupported browsers.
            }
        }
        xhr.addEventListener("load", function () {
            deferred.resolve({ success: true, file: file.files[0] });
        }, false);
        xhr.addEventListener("error", function () {
            deferred.reject({ success: false, error: 'fail' });
        }, false);
        xhr.addEventListener("abort", function () {
            deferred.reject({ success: false, error: 'abort' });
        }, false);
        var fd = new FormData();
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/UploadAttachmentsByLicenseId/' + licenseId + "/" + attachmentTypeId;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Token", _getTokenId());
        fd.append("upload_file0", file.files[0]);
        var safeauthentication = safeService.getAuthentication();
        fd.append("CreatedBy", safeauthentication.contactId);
        xhr.send(fd);
        return deferred.promise;
    }
  
    var _remove = function (attachment) {
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/RemoveAttachment';
        return $http.post(url, attachment);
    }

    var _removeMultiple = function (attachments) {
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/RemoveAttachments';
        return $http.post(url, attachments);
    }


    var _getAllAttachmentTypes = function() {
        var url = serviceBase + 'api/attachmentTypeCTRL/attachmentTypes';
        return $http.get(url);
    }

    var _validSize = function (fileElementId) {
        var file = document.getElementById(fileElementId);
        var validSize = true;
        var i = 0;
        while (i < file.files.length && validSize) {
            //20971520 bytes = 20MB
            if (file.files[i].size > 20971520) {
                validSize = false;
            }
            i++;
        }
        return validSize;
    }
    var _isNewFile = function (fileElementId, files) {
        var file = document.getElementById(fileElementId);
        var newFile = null;
        var i = 0;
        while (i < files.length && newFile == null) {
            var j = 0;
            while (j < file.files.length && newFile == null) {
                if ((files[i].fileName + files[i].fileType) === (file.files[j].name)) {
                    newFile = file.files[j].name;
                }
                j++;
            }
            i++;
        }
        return newFile;
    }

    var _isFileSelected = function (fileElementId) {
        var file = document.getElementById(fileElementId);
        return (file.files[0] != null);
    }

    var _downloadAttachment = function(id) {
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/DownloadLicenseAttachment/'+id;
        return $http.get(url).then(function (response) {
            return response;
        });
    }

    var _updateAttachment = function(licenseAttachment) {
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/UpdateLicenseAttachment';
        console.log(JSON.stringify(licenseAttachment));
        return $http.post(url, licenseAttachment);
    }

    filesServiceFactory.updateLicenseAttachment = _updateAttachment;
    filesServiceFactory.upload = _upload;
    filesServiceFactory.remove = _remove;
    filesServiceFactory.getAllAttachmentTypes = _getAllAttachmentTypes;
    filesServiceFactory.removeMultiple = _removeMultiple;
    filesServiceFactory.validSize = _validSize;
    filesServiceFactory.isFileSelected = _isFileSelected;
    filesServiceFactory.isNewFile = _isNewFile;
    filesServiceFactory.downloadAttachment = _downloadAttachment;
    return filesServiceFactory;
}]);