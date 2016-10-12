'use strict';
app.factory('contactsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var contactsServiceFactory = {};

    var _getContacts = function () {

        return $http.get(serviceBase + 'api/contactCTRL/contacts').then(function (results) {
            return results;
        });
    };

    var _getAssignees = function () {

        return $http.get(serviceBase + 'api/ContactCTRL/contacts/getAssignees').then(function (results) {
            return results;
        });
    };
    
    var _searchContacts = function (query) {
        var url = serviceBase + 'api/contactCTRL/contacts/Search';
        return $.post(url, { '': query })
        .then(function (response) {
            return response;
        });
    };
    
    var _emailExists = function (licenseeId,email) {
        var url = serviceBase + 'api/contactCTRL/contacts/EmailExists/' + licenseeId;
        return $http.post(url, '"' + email + '"').then(function (results) {
            return results;
        });
    };
    var _getLabelsForLicensee = function (licenseeId) {
        var url = serviceBase + 'api/contactCTRL/contacts/GetLabelsForLicensee/' + licenseeId;
        return $http.get(url).then(function (results) {
            return results;
        });
    };
    var _getContactsForLicenseeLabel = function (licenseeLabelId) {
        var url = serviceBase + 'api/contactCTRL/contacts/GetContactsForLicenseeLabel/' + licenseeLabelId;
        return $http.get(url).then(function (results) {
            return results;
        });
    };

    var _getContactsWithRoleId = function (roleId) {
        var url = serviceBase + 'api/contactCTRL/contacts/GetContactsWithRole/' + roleId;
        return $http.post(url).then(function (results) {
            return results;
        });
    };

    var _getContactsForLicensee = function (licenseeId) {
        var url = serviceBase + 'api/contactCTRL/contacts/GetContactsForLicensee/' + licenseeId;
        return $http.get(url).then(function (results) {
            return results;
        });
    };
    var _getAllLabelGroups = function (licenseeLabelId) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/GetAllLabelGroups';
        return $http.get(url).then(function (results) {
            return results;
        });
    };
    var _editContact = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/EditContact';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _editLabelGroup = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/EditLabelGroup';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _addLabelGroup = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/AddLabelGroup';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _deleteLabelGroup = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/DeleteLabelGroup';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _addContactAndLink = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/AddContactAndLink';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _addLicenseeContactAndLink = function (request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/AddLicenseeContactAndLink';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _deleteContactAndLink = function (contact) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/DeleteContactAndLink';
        return $http.post(url, contact)
        .then(function (response) {
            return response;
        });
    };

    var _deleteLicenseeContactAndLink = function (contact) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/DeleteLicenseeContactAndLink';
        return $http.post(url, contact)
        .then(function (response) {
            return response;
        });
    };

    var _deleteContactFromLabelGroup = function(request) {
        var url = serviceBase + 'api/ContactCTRL/Contacts/DeleteContactFromLabelGroup';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    }

    contactsServiceFactory.getContacts = _getContacts;
    contactsServiceFactory.emailExists = _emailExists;
    contactsServiceFactory.getAssignees = _getAssignees;
    contactsServiceFactory.searchContacts = _searchContacts;
    contactsServiceFactory.getContactsForLicenseeLabel = _getContactsForLicenseeLabel;
    contactsServiceFactory.getContactsWithRoleId = _getContactsWithRoleId;
    contactsServiceFactory.getContactsForLicensee = _getContactsForLicensee;
    contactsServiceFactory.getLabelsForLicensee = _getLabelsForLicensee;
    contactsServiceFactory.getAllLabelGroups = _getAllLabelGroups;
    contactsServiceFactory.editContact = _editContact;
    contactsServiceFactory.editLabelGroup = _editLabelGroup;
    contactsServiceFactory.addLabelGroup = _addLabelGroup;
    contactsServiceFactory.deleteLabelGroup = _deleteLabelGroup;
    contactsServiceFactory.addContactAndLink = _addContactAndLink;
    contactsServiceFactory.addLicenseeContactAndLink = _addLicenseeContactAndLink;
    contactsServiceFactory.deleteContactAndLink = _deleteContactAndLink;
    contactsServiceFactory.deleteLicenseeContactAndLink = _deleteLicenseeContactAndLink;
    contactsServiceFactory.deleteContactFromLabelGroup = _deleteContactFromLabelGroup;
    return contactsServiceFactory;

}]);