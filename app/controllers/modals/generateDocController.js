'use strict';
app.controller('generateDocController', ['$scope', '$stateParams', 'ngAuthSettings', 'licensesService', 'contactsService', 'filesService', 'notyService', '$timeout', 'localStorageService', function ($scope, $stateParams, ngAuthSettings, licensesService, contactsService, filesService, notyService, $timeout, localStorageService) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var selectedLicense = $scope.selectedLicense;
    var authenticationData = localStorageService.get('authenticationData');

    $scope.licenseSentId = null;
    $scope.licenseSentContactId = null;
    $scope.progressVisible = false;
    $scope.licenseeContacts = [];
    $scope.fromContacts = [];
    //$scope.additionalEmails = [];li

    //$scope.selectedRecipients = [];
    $scope.newEmail = "";

    populateSubjectLineAndFileName();

    $scope.templates = [
{
    Name: 'US License Template',
    //Url: 'app/views/license-templates/template-1.html',
    Url: 'app/views/partials/license-template.html'
},
 {
     Name: 'US DVD License Template',
     //Url: 'app/views/license-templates/template-2.html'
     Url: 'app/views/partials/license-template.html'
 },
  {
      Name: 'Canadian License Template',
      //Url: 'app/views/license-templates/template-3.html'
      Url: 'app/views/partials/license-template.html'
  }
    ];
    $scope.errorPresent = false;

    $scope.chosenAttachment = {
        attachmentType: "Select Attachment Type",
        attachmentTypeId: 0
    };
    $scope.selectTemplate = function (t) {
        $scope.selectedTemplate = t;
        $scope.setParameter('templatePreviewData', t);
        $scope.setParameter('selectedTemplate', t);
        $scope.termOptions = [{ Name: 'Quarterly' }, { Name: 'Semi-annually' }];
        if ($scope.templatePreviewData.Name == 'US License Template') {
            $scope.termOptions = [{ Name: 'Quarterly' }, { Name: 'Semi-annually' }, { Name: 'Semi-annually (90 days)' }];
        }
    }

    $scope.selectAttachmentType = function (attachmentType) {
        $scope.chosenAttachment = attachmentType;
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.setCaret($scope.isCollapsed);
        attachmentValidation();
 
    }

    if (!$scope.selectedTemplate) {
        $scope.selectedTemplate = $scope.templates[0];
        $scope.setParameter('templatePreviewData', $scope.selectedTemplate);
        $scope.setParameter('selectedTemplate', $scope.selectedTemplate);
    }

    $scope.termOptions = [{ Name: 'Quarterly' }, { Name: 'Semi-annually' }];
    if ($scope.templatePreviewData.Name == 'US License Template') {
        $scope.termOptions = [{ Name: 'Quarterly' }, { Name: 'Semi-annually' }, { Name: 'Semi-annually (90 days)' }];
    }

    if (!$scope.selectedTermOption) {
        $scope.selectedTermOption = $scope.termOptions[0];
        $scope.setParameter('selectedTermOption', $scope.selectedTermOption);
    }

    $scope.selectTermOption = function (t) {
        $scope.selectedTermOption = t;
        $scope.setParameter('selectedTermOption', t);
    }

    $scope.selectFrom = function (t) {
        $scope.selectedFrom = t;
        $scope.setParameter('selectedFrom', t);
    }

    $scope.addSelectedRecipient = function (r) {
        var old = $scope.selectedRecipients[0];
        if (!old) {
            old = r;
        }
        $scope.selectedRecipients = [];

        r.action = 'UPDATE';
        r.selected = true;
        r.licenseSentContactId = old.licenseSentContactId;
        r.licenseSentId = old.licenseSentId;
        $scope.selectedRecipients.push(r);
    };

    /*
    $scope.addSelectedRecipient = function (r) {
        var exists = false;
        for (var i = 0; i < $scope.selectedRecipients.length; i++) {
            if (r.contactId == $scope.selectedRecipients.contactId) {
                exists = true;
                break;
            }
        }
        if (exists) {
            r.action = 'UPDATE';
            r.selected = true;
        }
        else {
            if (r.action == '') {
                r.action = 'ADD';
            }
            r.selected = true;
            $scope.selectedRecipients.push(r);
        }

        if (!r.selected) {
            r.action = 'DELETE';
        }
    };

*/
    $scope.isCollapsed = false;
    $scope.deleteSelectedRecipient = function (r) {
        var idx = $scope.selectedRecipients.indexOf(r);
        if (idx >= 0) {
            if ($scope.selectedRecipients[idx].action == 'ADD') {
                $scope.selectedRecipients.splice(idx, 1);
                r.selected = false;
                r.action = '';
            }
            else {
                r.selected = false;
                r.action = 'DELETE';
            }
        }
        else {
            r.selected = true;
            r.action = 'ADD';
        }
    };

    $scope.addNewAdditionalEmail = function (email) {
        var newContact = { licenseSentId: $scope.licenseSentId, licenseSentContactId: null, contactId: null, contactName: '', emailAddress: email, selected: true, action: 'ADD' };
        $scope.addAdditionalEmail(newContact);
    }

    $scope.addAdditionalEmail = function (newContact) {
        if (validEmail(newContact.emailAddress)) {
            var addemail = true;
            for (var i = 0; i < $scope.additionalEmails.length; i++) {
                var contact = $scope.additionalEmails[i];
                if (contact.emailAddress == newContact.emailAddress) {
                    if (contact.action == 'DELETE') {
                        contact.action = 'UPDATE';
                        contact.selected = true;
                        $scope.newEmail = "";
                    }
                    addemail = false;
                    break;
                }
            }
            if (addemail) {
                $scope.additionalEmails.push(newContact);
                $scope.newEmail = "";
            }
        }
    };
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
    $scope.deleteAdditionalEmail = function (contact) {
        var idx = $scope.additionalEmails.indexOf(contact);

        if (idx >= 0) {
            if ($scope.additionalEmails[idx].action == 'ADD') {
                $scope.additionalEmails.splice(idx, 1);
            }
            else {
                $scope.additionalEmails[idx].action = 'DELETE';
                $scope.additionalEmails[idx].selected = false;
            }
        }
    };
    $scope.setCaret = function (collapsed) {
        if (!collapsed) {
            return "caret";
        } else {
            return "caret caret-up";
        }
    }
    function validEmail(email) {
        if (email.length > 5) {
            if (email.indexOf("@") > 0) {
                if (email.indexOf(".") > 0) {
                    return true;
                }
            }
        }
        else {
            return false;
        }
    }

    //  get Licensee Contacts for Labels
    $scope.getContactsForLicenseeLabel = function (licenseeLabelId) {
        contactsService.getContactsForLicenseeLabel(licenseeLabelId).then(function (result) {
            $scope.licenseeContacts.length = 0;
            $scope.selectedRecipients.length = 0;
            $scope.additionalEmails.length = 0;
            var licenseeLabels = result.data;

            for (var i = 0; i < licensees.length; i++) {
                var contactType = { licenseSentId: null, licenseSentContactId: null, contactId: licensees[i].contactId, contactName: licensees[i].fullName, emailAddress: '', selected: false, action: '' };
                $scope.licenseeContacts.push(contactType);
            }
            // get any saved contacts/emails associated to the license
            $scope.getSendLicenseInfo($scope.selectedLicense.licenseId);
        });
    };

    //  get Licensee Contacts
    $scope.getContactsForLicensee = function (licenseeId) {
        contactsService.getContactsForLicensee(licenseeId).then(function (result) {
            $scope.licenseeContacts.length = 0;
            $scope.selectedRecipients.length = 0;
            $scope.additionalEmails.length = 0;
            var licensees = result.data;
            for (var i = 0; i < licensees.length; i++) {
                var contactType = { licenseSentId: null, licenseSentContactId: null, contactId: licensees[i].contactId, contactName: licensees[i].fullName, emailAddress: '', selected: false, action: '' };
                $scope.licenseeContacts.push(contactType);
            }
            // get any saved contacts/emails associated to the license
            $scope.getSendLicenseInfo($scope.selectedLicense.licenseId)
        });
    };

    // get any saved contacts/emails for this license
    $scope.getSendLicenseInfo = function (licenseId) {
        licensesService.getSendLicenseInfo(licenseId).then(function (result) {
            if (result.data != null) {
                $scope.oldLicenseSentContacts = result.data.sendLicenseContactList;
                $scope.licenseSentId = result.data.licenseSentId;
                var contacts = result.data.sendLicenseContactList;
                for (var i = 0; i < contacts.length; i++) {
                    if (contacts[i].contactId) {
                        for (var j = 0; j < $scope.licenseeContacts.length; j++) {
                            if (contacts[i].contactId == $scope.licenseeContacts[j].contactId) {
                                $scope.licenseeContacts[j].selected = true;
                                $scope.licenseeContacts[j].licenseSentId = contacts[i].licenseSentId;
                                $scope.licenseeContacts[j].licenseSentContactId = contacts[i].licenseSentContactId;
                                $scope.licenseeContacts[j].action = 'UPDATE';
                                $scope.selectedRecipients.push($scope.licenseeContacts[j]);
                                //$scope.addSelectedRecipient($scope.licenseeContacts[j]);
                                break;
                            }
                        }
                    }
                    else {
                        var contactType = { licenseSentId: contacts[i].licenseSentId, licenseSentContactId: contacts[i].licenseSentContactId, contactId: null, contactName: '', emailAddress: contacts[i].emailAddress, selected: true, action: 'UPDATE' };
                        $scope.addAdditionalEmail(contactType);
                    }
                }
            } else {
                $scope.licenseSentId = null;
            }

            if ($scope.selectedRecipients.length == 0) {
                angular.forEach($scope.licenseeContacts, function (contact) {
                    if (contact.contactId == $scope.selectedLicense.contactId) {
                        contact.selected = true;
                        $scope.addSelectedRecipient(contact);
                    }
                });
            }
        }, function (error) {
            noty({
                text: 'Error getting recipients ' + result.data.error,
                type: 'error',
                timeout: 2500,
                layout: "top"
            });
        });
    };

    $scope.validateAndDataProcess = function () {
        var validFields = true;

        if ($scope.newEmail) {
            validFields = false;
            document.getElementById('newEmail').classList.add('field-error');
        }
        else {
            document.getElementById('newEmail').classList.remove('field-error');
        }

        if (validFields) {
            $scope.saveLicenseAttachements();
            $scope.saveSendLicenseInfo();
        }
    }

    $scope.contactFilter = function (contact) {
        return contact.action == 'UPDATE' || contact.action == 'ADD';
    };

    //This saves licenses as 'included' if they are checked.
    $scope.saveLicenseAttachements = function () {
        angular.forEach($scope.licenseAttachments, function (licenseAttachment) {
            filesService.updateLicenseAttachment(licenseAttachment);
        });
    }

    // save contact / email info
    $scope.saveSendLicenseInfo = function () {
        var sendToContacts = [];
        for (var i = 0; i < $scope.selectedRecipients.length; i++) {
            var sendToContact = { licenseSentContactId: $scope.selectedRecipients[i].licenseSentContactId, licenseSentId: $scope.selectedRecipients[i].licenseSentId, contactId: $scope.selectedRecipients[i].contactId, emailAddress: '', action: $scope.selectedRecipients[i].action }
            sendToContacts.push(sendToContact);
        }
        for (var i = 0; i < $scope.additionalEmails.length; i++) {
            var sendToContact = { licenseSentContactId: $scope.additionalEmails[i].licenseSentContactId, licenseSentId: $scope.additionalEmails[i].licenseSentId, contactId: null, emailAddress: $scope.additionalEmails[i].emailAddress, action: $scope.additionalEmails[i].action }
            sendToContacts.push(sendToContact);
        }

        var differentContacts = [];
        angular.forEach($scope.oldLicenseSentContacts, function (oldContact) {
            angular.forEach(sendToContacts, function (newContact) {
                if (oldContact.emailAddress == '' && newContact.emailAddress == '' && oldContact.contactId != newContact.contactId && oldContact.licenseSentContactId != newContact.licenseSentContactId) {
                    oldContact.action = "DELETE";
                    differentContacts.push(oldContact);
                }
            });
        });

        if (differentContacts.length > 0) {
            sendToContacts = sendToContacts.concat(differentContacts);
        }

        var sendToLicense = { licenseSentId: $scope.licenseSentId, licenseId: $scope.selectedLicense.licenseId, licenseeId: $scope.selectedLicense.licenseeId, licenseTemplateId: 1, sendLicenseContactList: sendToContacts }

        var notymessage = 'Recipients Updated';
        var notytype = 'success';
        licensesService.saveSendLicenseInfo(sendToLicense)
            .then(function (result) {
                var contacts = result.data;

                if (contacts) {
                    noty({
                        text: notymessage,
                        type: notytype,
                        timeout: 2500,
                        layout: "top"
                    });
                }
                else {
                    noty({
                        text: 'Error updating recipients',
                        type: 'error',
                        timeout: 2500,
                        layout: "top"
                    });
                }
            }, function (error) {
                noty({
                    text: 'Error updating recipients ' + result.data.error,
                    type: 'error',
                    timeout: 2500,
                    layout: "top"
                });
            });

        $scope.modalNextStep();
    }

    // load the licensee and any previously saved contact info
    $scope.getContactsForLicensee($scope.selectedLicense.licenseeId);

    //upload File section

    $scope.upload = function () {
        if (attachmentValidation()) {
            var fileId = 'fileToUpload';
            var progressId = 'progressbar';
            var licenseId = $stateParams.licenseId;
            var validSize = filesService.validSize(fileId);
            var fileExists = filesService.isNewFile(fileId, $scope.licenseAttachments);
            var fileSelected = filesService.isFileSelected(fileId);
            var attachmentTypeId = $scope.chosenAttachment.attachmentTypeId;

            if (validSize && !fileExists && fileSelected) {
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
    var uploadFiles = function (licenseId, fileId, progressId, attachmentTypeId) {
        $scope.progressVisible = true;
        filesService.upload(licenseId, fileId, progressId, attachmentTypeId).then(uploadComplete, uploadError).finally(function () {
            $timeout(function () {
                $scope.progressVisible = false;
            }, 1000);
        });
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

    var uploadError = function (evt) {
        if (evt.error == "fail") {
            uploadFailed();
        }
        else if (evt.error == "abort") {
            uploadCanceled();
        }
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

    var uploadCanceled = function (evt) {
        var message = "The upload has been canceled by the user or the browser dropped the connection.";
        notyService.error(message);
    }

    $scope.populatelicenseAttachments = function (licenseId) {
        licensesService.getlicenseAttachments(licenseId).then(function (result) {
            $scope.setParameter('licenseAttachments', result.data);
        });
    }

    $scope.cancel = function () {
        $stateParams.stateCallbackArguments = {
            method: 'uploadAttachment'
        }
        $scope.goToParent(null, false);
    }

    function populateSubjectLineAndFileName() {
        if ($scope.adobeSubjectLine == null) {
            var firstProduct = $stateParams.products[0];
            var scheduleId = firstProduct.scheduleId;
            angular.forEach($stateParams.products, function (product) {
                if (scheduleId > product.scheduleId) {
                    scheduleId = product.scheduleId;
                    firstProduct = product;
                }
            });

            //subjectLine maximum length set to 110 characters
            var subjectLine = "";
            var filename = "";
            //prefixText maximum length set to 19 characters
            var prefixText = "UMPG Mechs License:";
            prefixText = prefixText.substring(0, 19);

            //artistText maximum length set to 20 characters
            var artistText = firstProduct.productHeader.artist.name;
            artistText = artistText.substring(0, 17);

            //productText maximum length set to 56 characters
            var productText = firstProduct.productHeader.title;
            productText = productText.substring(0, 53);

            //licenseText maximum length set to 15 characters
            var licenseText = $scope.selectedLicense.licenseNumber;
            licenseText = licenseText.substring(0, 10);

            subjectLine = prefixText + " " + artistText + " - " + productText + ", " + "Lic #" + licenseText;

            filename = artistText + " - " + productText + " - Lic ID " + licenseText;

            $scope.setParameter('adobeSubjectLine', subjectLine);
            $scope.setParameter('adobeContent', $scope.adobeContent);
            $scope.setParameter('fileName', removeRestrictedCharacters(filename));
        }
    }

    function removeRestrictedCharacters(filename) {
        var characters = "()“!:";
        var i = 0;
        while (i < characters.length) {
            filename = filename.split(characters[i]).join("");
            i++;
        }
        return filename;
    }

    $scope.getfromContacts = function () {
        contactsService.getContactsWithRoleId(3).then(function (result) {
            $scope.fromContacts = [];
            var fromContactsList = result.data;

            for (var i = 0; i < fromContactsList.length; i++) {
                $scope.fromContacts.push(fromContactsList[i]);
                if ($scope.selectedFrom == null && fromContactsList[i].contactId === authenticationData.contactId) {
                    $scope.setParameter('selectedFrom', fromContactsList[i]);
                }
            }
        });
    }

    $scope.getfromContacts();
}]);