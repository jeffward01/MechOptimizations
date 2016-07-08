'use strict';
app.factory('licensesService', ['$http', 'ngAuthSettings','$state', function ($http, ngAuthSettings,$state) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licensesServiceFactory = {};

    var _getLicenses = function (searchParams) {

        return $http.get(serviceBase + 'api/licenseCTRL/licenses').then(function (results) {
                  return results;
        });
    };

    var _getLicenseDetail = function (licenseId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/GetLicenseDetails/' + licenseId;
        return $http.get(url).error(function(data, status, headers, config) {
            alert(data.message);
        })
        .then(function (response) {
            return response;
        });
    };
    
    var _searchLicenses = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licenses/PagedSearch';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _searchInboxLicenses = function (assigneeId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/GetInboxLicenses/' + assigneeId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    
    var _getlicenseAttachments = function (licenseId) {
        var url = serviceBase + 'api/licenseCTRL/licenseAttachments/GetAllAttachmentsByLicenseId/'+ licenseId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };


    //todo: to be deleted... the method is in licenseproductservice

    //var _getProducts = function (licenseId) {
    //    var url = serviceBase + 'api/licenseCTRL/licenses/GetProducts/'+licenseId;
    //    return $http.get(url)
    //    .then(function (response) {
    //        return response;
    //    });
    //};

    //var _getRecordings = function (licenseproductId) {
    //    var url = serviceBase + 'api/licenseCTRL/licenses/GetLicenseProductRecordings/' + licenseproductId;
    //    return $http.get(url)
    //    .then(function (response) {
    //        return response;
    //    });
    //};
    //todo: to be deleted... never used
    var _getLicensesForProducts = function (productId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/GetProductLicenses/' + productId;
        return $http.get(url)
        .then(function (response) {
                console.log("LOG MW!" + JSON.stringify(response));
            return response;
        });
    };

    var _updateLicensesAsignee = function(assigneeId, priorityId, licenses, note,contactId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/UpdateLicense';
        var request = {
            priorityId: priorityId,
            newAssigneeId: assigneeId,
            licenseIds: licenses,
            note: note,
            createdBy: contactId,
            modifiedBy: contactId
    };
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _updateLicenseStatus = function (license) {
        var url = serviceBase + 'api/licenseCTRL/licenses/EditStatus';
       
        return $http.post(url, license)
       .then(function (response) {
           return response;
       });
    };

    var _uploadGeneratedLicensePreview = function (data) {
        var url = serviceBase + 'api/licenseCTRL/licenses/UploadGeneratedLicensePreview';
        return $http.post(url, data)
       .then(function (response) {
           return response;
       });
    }

    
    var _updateGeneratedLicenseStatus = function (licenseId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/UpdateGeneratedLicenseStatus';
        return $http.post(url, licenseId)
       .then(function (response) {
           return response;
       });
    }

    var _getLicenseProductConfigurations = function (licenseId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseProductConfigurations/' + licenseId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _updateLicenseProductConfigurations = function (licenseProductConfigurationId, reportField, fieldValue) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/UpdateLicenseProductConfigurations';
        var request = {
            licenseProductConfigurationId: licenseProductConfigurationId,
            reportField: reportField,
            fieldValue: fieldValue
        };
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };


    // LICENSE NOTE ADD
    var _addLicenseNote = function (licenseId,note,contactId,noteTypeId) {
        var url = serviceBase + 'api/licenseCTRL/licenseNote/addLicenseNote';
        var noteRequest = { LicenseId: licenseId, LicenseNote: note, ContactId: contactId, NoteTypeId: noteTypeId };
        return $http.post(url, noteRequest)
       .then(function (response) {
           return response;
       });
    };
    var _getNoteTypes = function () {
        var url = serviceBase + 'api/licenseCTRL/licenseNote/GetLicenseNoteTypes';
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    };
    var _deleteLicenseNotes = function (licenseNoteIds) {
        var url = serviceBase + 'api/licenseCTRL/licenseNote/DeleteLicenseNotes';
        return $http.post(url, licenseNoteIds)
       .then(function (response) {
           return response;
       });
    };
    
    var _editLicenseNote = function (licenseNote) {
        var url = serviceBase + 'api/licenseCTRL/licenseNote/EditLicenseNote';
        return $http.post(url, licenseNote)
       .then(function (response) {
           return response;
       });
    };



    //Product Records Writer Notes
    var _addPRWriterLicenseNote = function (licenseWriterId, note, configuration_id, noteAction) {
        var url = serviceBase + 'api/licenseCTRL/licensePRWriterNote/addLicenseNote';
        var noteRequest = { LicenseWriterId: licenseWriterId, Note: note, Configuration_id: configuration_id };
        return $http.post(url, noteRequest, noteAction)
       .then(function (response) {
           return response;
       });
    };
    
    var _getAllPRWriterLicenseNote = function (licenseWriterId) {
        var url = serviceBase + 'api/licenseCTRL/licensePRWriterNote/getAllLicenseNote';
        return $http.post(url, licenseWriterId)
       .then(function (response) {
           return response;
       });
    };

    var _removePRWriterLicenseNote = function (licenseWriterNoteId) {
        var url = serviceBase + 'api/licenseCTRL/licensePRWriterNote/removeLicenseNote';
        return $http.post(url, licenseWriterNoteId)
       .then(function (response) {
           return response;
       });
    };


    var _editPRWriterLicenseNote = function (licenseWriterId, note, configuration_id, licenseWriterNoteId) {
        var url = serviceBase + 'api/licenseCTRL/licensePRWriterNote/editLicenseNote';
        var noteRequest = { LicenseWriterId: licenseWriterId, Note: note, Configuration_id: configuration_id, LicenseWriterNoteId: licenseWriterNoteId };
        return $http.post(url, noteRequest)
       .then(function (response) {
           return response;
       });
    };

    //end licenseNotes
    var _editLicense = function (license) {
        var url = serviceBase + 'api/licenseCTRL/licenses/EditLicense';
        var request = license;
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };
    var _createLicense = function (license) {
        var url = serviceBase + 'api/licenseCTRL/licenses/CreateLicense';
        var request = license;
        //temp to keep create license from blowing up.
        if (license.licensee.contactId == null)  {
            license.licensee.contactId = 1;
        }
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };
    var _copyLicense = function (licenseId,clonetype,contactid) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/CloneLicense/' + licenseId + '/' + clonetype + '/' + contactid;
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    };

    var _getSendLicenseInfo = function (licenseId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/GetSendLicenseInfo/' + licenseId;
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    };

    var _saveSendLicenseInfo = function (request) {
        var url = serviceBase + 'api/licenseCTRL/licenses/SaveSendLicenseInfo';
        return $http.post(url, request)
       .then(function (response) {
           return response;
       });
    };

    var _getQuarters = function(request) {
        var url = serviceBase + '/api/LookUpCTRL/paidquarters/GetRolling10years';
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    }
    var _getSchedules = function (request) {
        var url = serviceBase + '/api/LookUpCTRL/schedules';
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    }
    var _updateLicenseStatusReport = function (licenseId) {
        var url = serviceBase + 'api/licenseCTRL/licenses/EditLicenseStatusReport/' + licenseId;
        return $http.post(url)
       .then(function (response) {
           return response;
       });
    };

    licensesServiceFactory.getlicenseAttachments = _getlicenseAttachments;
    licensesServiceFactory.getLicenses = _getLicenses;
    licensesServiceFactory.getLicenseDetail = _getLicenseDetail;
    licensesServiceFactory.searchLicenses = _searchLicenses;
    licensesServiceFactory.searchInboxLicenses = _searchInboxLicenses;
    //licensesServiceFactory.getProducts = _getProducts;
    //licensesServiceFactory.getRecordings = _getRecordings;
    licensesServiceFactory.getLicensesForProduct = _getLicensesForProducts;
    licensesServiceFactory.updateLicensesAsignee = _updateLicensesAsignee;
    licensesServiceFactory.updateLicenseStatus = _updateLicenseStatus;
    licensesServiceFactory.uploadGeneratedLicensePreview = _uploadGeneratedLicensePreview;
    licensesServiceFactory.updateGeneratedLicenseStatus = _updateGeneratedLicenseStatus;
    licensesServiceFactory.getLicenseProductConfigurations = _getLicenseProductConfigurations;
    licensesServiceFactory.getQuarters = _getQuarters;
    licensesServiceFactory.getSchedules = _getSchedules;

    licensesServiceFactory.addLicenseNote = _addLicenseNote;
    licensesServiceFactory.getNoteTypes = _getNoteTypes;
    licensesServiceFactory.deleteLicenseNotes = _deleteLicenseNotes;
    licensesServiceFactory.editLicenseNote = _editLicenseNote;

    licensesServiceFactory.addPRWriterLicenseNote = _addPRWriterLicenseNote;
    licensesServiceFactory.getAllPRWriterLicenseNote = _getAllPRWriterLicenseNote;
    licensesServiceFactory.removePRWriterLicenseNote = _removePRWriterLicenseNote;
    licensesServiceFactory.editPRWriterLicenseNote = _editPRWriterLicenseNote;


    licensesServiceFactory.updateLicenseProductConfigurations = _updateLicenseProductConfigurations;

    licensesServiceFactory.editLicense = _editLicense;
    licensesServiceFactory.createLicense = _createLicense;
    licensesServiceFactory.copyLicense = _copyLicense;
    licensesServiceFactory.saveSendLicenseInfo = _saveSendLicenseInfo;
    licensesServiceFactory.getSendLicenseInfo = _getSendLicenseInfo;
    licensesServiceFactory.updateLicenseStatusReport = _updateLicenseStatusReport;

    // put in separate contactDefaultsService.js
     var _saveContactDefaults = function (request) {
        var url = serviceBase + 'api/contactCTRL/ContactDefaults/Save';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };



    return licensesServiceFactory;

}]);