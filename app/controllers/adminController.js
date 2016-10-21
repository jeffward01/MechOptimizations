'use strict';
app.controller('adminController', ['$scope', 'licenseesService', 'contactsService', 'safeService', 'notyService', '$filter', function ($scope, licenseesService, contactsService, safeService, notyService, $filter) {
    $scope.safeauthentication = safeService.getAuthentication();
    checkUser();
    $scope.licensees = [];
    $scope.pagination = {
        currentPage: 1,
        totalItems: 0,
        numPerPage: 100,
        maxSize: 5,
        pageSizeList: [10, 20, 50, 100],
        isCollapsed: true
    };

    $scope.showCollapseButton = toggleCollapseAll();

    $scope.initialContacts = [];
    $scope.allContacts = [];
    $scope.selectedContact = {
        firstName: "",
        lastName: "",
        contactPhone: {
            phoneNumber: ""
        },
        contactEmail: {
            emailAddress: ""
        },
        contactAddress: {
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
        }
    };
    $scope.labelGroups = [];
    $scope.selectedLicenseeLabelGroup = {};
    $scope.addLicenseeVisible = false;
    $scope.addLabelGroupVisible = false;
    $scope.newLicenseeName = "";
    $scope.newLabelGroupName = "";
    $scope.pageChanged = function () {
        $scope.getLicensees();
    };
    $scope.changePageSize = function (pageSize) {
        $scope.pagination.numPerPage = pageSize;
        $scope.getLicensees();
    }
    $scope.searchRequest = {
        PageNo: $scope.pagination.currentPage - 1,
        PageSize: $scope.pagination.numPerPage,
    }

    function toggleCollapseAll() {
        var counter = 0;
        angular.forEach($scope.licensees,
            function (licensee, index) {
                if (!licensee.contactsCollapsed || !licensee.groupCollapsed) {
                    counter++;
                }
            });
        if (counter > 2) {
            $scope.showCollapseButton = true;
        } else {
            $scope.showCollapseButton = false;
        }
    }

    function checkUser() {
        try {
            if ($scope.safeauthentication.roleId < 3) {
                var currentUrl = window.location.href.toLowerCase();
                var newUrl = currentUrl.replace("#/admin", "");
                window.location.href = newUrl;
            }
        } catch (e) {
            goToLogIn();
        }
    };

    function goToLogIn() {
        var currentUrl = window.location.href.toLowerCase();
        var newUrl = currentUrl.replace("#/admin", "#/login");
        window.location.href = newUrl;
    }

    $scope.getLicensees = function () {
        $scope.searchRequest.PageNo = $scope.pagination.currentPage - 1;
        $scope.searchRequest.PageSize = $scope.pagination.numPerPage;
        licenseesService.getPagedLicensees($scope.searchRequest)
            .then(function (response) {
                angular.forEach(response.data.results,
                    function (licensee) {
                        var contacts = [];
                        licensee.selectedContact = {
                            firstName: "",
                            lastName: "",
                            contactPhone: {
                                phoneNumber: ""
                            },
                            contactEmail: {
                                emailAddress: ""
                            },
                            contactAddress: {
                                address1: "",
                                address2: "",
                                city: "",
                                state: "",
                                country: "",
                                postalCode: "",
                            }
                        };

                        angular.forEach(licensee.licenseeContactsFiltered,
                            function (contact) {
                                contact.newContact = {
                                    firstName: "",
                                    lastName: "",
                                    contactPhone: {
                                        phoneNumber: "",
                                        phoneId: ""
                                    },
                                    contactEmail: {
                                        emailAddress: ""
                                    },
                                    contactAddress: {
                                        address1: "",
                                        address2: "",
                                        city: "",
                                        state: "",
                                        country: "",
                                        postalCode: "",
                                    }
                                };

                                if (contact.phone.length > 0) {
                                    contact.phone = contact.phone[0];
                                }

                                if (contact.email.length > 0) {
                                    contact.email = contact.email[0];
                                }

                                if (contact.address.length > 0) {
                                    contact.address = contact.address[0];
                                }
                            });

                        licensee.newLabelGroupName = "";
                        angular.forEach(licensee.licenseeLabelGroupFiltered,
                            function (lbg) {
                                lbg.selectedContact = {
                                    firstName: "",
                                    lastName: "",
                                    contactPhone: {
                                        phoneNumber: ""
                                    },
                                    contactEmail: {
                                        emailAddress: ""
                                    },
                                    contactAddress: {
                                        address1: "",
                                        address2: "",
                                        city: "",
                                        state: "",
                                        country: "",
                                        postalCode: "",
                                    }
                                };
                                lbg.editLabelGroupVisible = false;
                                lbg.newLabelGroupName = "";
                                lbg.contactsCollapsed = true;
                                licensee.addLicenseeBtn = false;
                                if (lbg.labelGroupLinksFiltered.length > 0) {
                                    angular.forEach(lbg.labelGroupLinksFiltered,
                                        function (lbglk) {
                                            lbg.addContactVisible = false;
                                            lbg.editContactVisible = false;
                                            lbglk.addContactBtn = false;
                                            lbglk.editContactBtn = false;
                                            if (lbglk.contact) {
                                                lbglk.newContact = {
                                                    firstName: "",
                                                    lastName: "",
                                                    contactPhone: {
                                                        phoneNumber: ""
                                                    },
                                                    contactEmail: {
                                                        emailAddress: ""
                                                    },
                                                    contactAddress: {
                                                        address1: "",
                                                        address2: "",
                                                        city: "",
                                                        state: "",
                                                        country: "",
                                                        postalCode: "",
                                                    }
                                                };
                                                lbglk.contactPhone = { phoneNumber: "" };
                                                lbglk.contact.contactAddress = {};
                                                lbglk.contact.contactEmail = {};
                                                // this is because one to manny relation;
                                                if (lbglk.contact.phone.length > 0) {
                                                    lbglk.contact.contactPhone = lbglk.contact.phone[0];
                                                }
                                                if (lbglk.contact.address.length > 0) {
                                                    lbglk.contact.contactAddress = lbglk.contact.address[0];
                                                }
                                                if (lbglk.contact.email.length > 0) {
                                                    lbglk.contact.contactEmail = lbglk.contact.email[0];
                                                }
                                                contacts.push(lbglk.contact);
                                            }
                                        });
                                }
                            });
                        licensee.editContactVisible = false;
                        licensee.addLabelGroupVisible = false;
                        licensee.addContactVisible = false;
                        licensee.contactsCollapsed = true;
                        licensee.contacts = $filter('unique')(contacts, 'contactId');
                        licensee.groupCollapsed = true;
                        licensee.newName = "";
                        licensee.editLicenseeVisible = false;
                    });
                $scope.licensees = response.data.results;
                getFullNames($scope.licensees);
                toggleCollapseAll();
                $scope.pagination.totalItems = response.data.total;
            },
                function (response) {
                    var errors = [];
                    for (var key in response.data.modelState) {
                        for (var i = 0; i < response.data.modelState[key].length; i++) {
                            errors.push(response.data.modelState[key][i]);
                        }
                    }
                });
    };

    $scope.is_valid_field = USL.Common.isValidField;
    $scope.is_valid_email = USL.Common.isValidEmail;
    $scope.is_valid_phone = USL.Common.isValidPhone;
    $scope.submit_saveNewContact = false;
    $scope.submit_saveNewLabelGroup = false;
    $scope.submit_saveNewLicensee = false;

    $scope.valid_contact_fields = function (contact) {
        if (!$scope.is_valid_field(contact.firstName)) return false;
        if (!$scope.is_valid_field(contact.lastName)) return false;
        //if (!$scope.is_valid_phone(contact.contactPhone.phoneNumber)) return false;
        if (!$scope.is_valid_email(contact.contactEmail.emailAddress)) return false;

        return true;
    };

    $scope.loadLabelGroups = function () {
        if ($scope.labelGroups.length == 0) {
            contactsService.getAllLabelGroups()
                .then(function (results) {
                    $scope.labelGroups = results.data;
                },
                    function (error) {
                    });
        }
    };
    $scope.saveNewLicensee = function () {
        $scope.submit_saveNewLicensee = true;
        if (!$scope.is_valid_field($scope.newLicenseeName)) {
            return;
        }

        var request = {
            name: $scope.newLicenseeName,
            createdBy: $scope.safeauthentication.contactId
        };
        licenseesService.addLicensee(request)
            .then(function (results) {
                var newLicensee = results.data;
                $scope.submit_saveNewLicensee = false;
                notyService.success("Licensee saved.");
                $scope.getLicensees();
                $scope.closeSaveNewLicensee();
            },
                function (error) {
                    notyService.error("Error when saving the Licensee.");
                });
    };

    $scope.closeSaveNewLicensee = function () {
        $scope.submit_saveNewLicensee = false;
        $scope.newLicenseeName = "";
        $scope.addLicenseeVisible = !$scope.addLicenseeVisible;
    };

    $scope.saveEditedLicensee = function (licensee) {
        licensee.name = licensee.newName;
        licensee.modifiedBy = $scope.safeauthentication.contactId;
        licenseesService.editLicensee(licensee)
            .then(function (results) {
                var newLicensee = results.data;
                licensee.editLicenseeVisible = !licensee.editLicenseeVisible;
                notyService.success("Licensee updated.");
                $scope.getLicensees();
            },
                function (error) {
                    notyService.error("Error when updating Licensee.");
                });
    };
    $scope.deleteLicensee = function (licensee) {
        licensee.modifiedBy = $scope.safeauthentication.contactId;
        notyService
            .modalConfirm("You are about to delete the Licensee, all related labels and all contacts. Are you sure?")
            .then(function () {
                licenseesService.deleteLicensee(licensee)
                    .then(function (results) {
                        var newLicensee = results.data;
                        notyService.success("Licensee deleted.");
                        $scope.getLicensees();
                    },
                        function (error) {
                            notyService.error("Error when deleting Licensee.");
                        });
            });
    };

    $scope.closeEditLicensee = function (licensee) {
        licensee.newName = "";
        licensee.editLicenseeVisible = !licensee.editLicenseeVisible;
    };

    $scope.collapseContacts = function (labelGroup) {
        labelGroup.contactsCollapsed = !labelGroup.contactsCollapsed;
        if (labelGroup.labelGroupLinksFiltered.length == 0) {
            labelGroup.addContactVisible = true;
        }

        toggleCollapseAll();
    };

    $scope.collapseAll = function () {
        angular.forEach($scope.licensees,
            function (licensee) {
                if (!licensee.contactsCollapsed || !licensee.groupCollapsed) {
                    licensee.groupCollapsed = true;
                    licensee.contactsCollapsed = true;
                    licensee.addContactVisible = false;
                    licensee.addLabelGroupVisible = false;
                }
            });
        toggleCollapseAll();
    }

    $scope.collapseLicenseContacts = function (licensee) {
        licensee.groupCollapsed = true;
        licensee.contactsCollapsed = !licensee.contactsCollapsed;
        if (licensee.licenseeContactsFiltered.length == 0) {
            licensee.addContactVisible = true;
        }
        toggleCollapseAll();
    }

    $scope.collapseLabelGroups = function (licensee) {
        licensee.contactsCollapsed = true;
        licensee.groupCollapsed = !licensee.groupCollapsed;
        if (licensee.licenseeLabelGroupFiltered.length == 0) {
            licensee.addLabelGroupVisible = true;
        }
        toggleCollapseAll();
    };
    $scope.selectLicenseeLabelGroup = function (l) {
        $scope.selectedLicenseeLabelGroup = l;
    };

    $scope.addLicenseeShow = function () {
        $scope.addLicenseeVisible = !$scope.addLicenseeVisible;
        //licensee.editLicenseeBtn = false;
    };
    $scope.editLicenseeShow = function (licensee) {
        licensee.editLicenseeVisible = !licensee.editLicenseeVisible;
        licensee.newName = licensee.name;
    };

    $scope.editContactShow = function (link) {
        link.editContactVisible = !link.editContactVisible;
        if (!link.newContact) {
            link.newContact = {
                contactPhone: {},
                contactEmail: {},
                contactAddress: {}
            };
        }
        link.newContact.firstName = link.contact.firstName;
        link.newContact.lastName = link.contact.lastName;
        if (link.contact.contactPhone) {
            link.newContact.contactPhone.phoneNumber = link.contact.contactPhone.phoneNumber;
        }
        link.newContact.contactEmail.emailAddress = link.contact.contactEmail.emailAddress;
        if (link.contact.contactAddress) {
            link.newContact.contactAddress.address1 = link.contact.contactAddress.address1;
            link.newContact.contactAddress.address2 = link.contact.contactAddress.address2;
            link.newContact.contactAddress.city = link.contact.contactAddress.city;
            link.newContact.contactAddress.state = link.contact.contactAddress.state;
            link.newContact.contactAddress.country = link.contact.contactAddress.country;
            link.newContact.contactAddress.postalCode = link.contact.contactAddress.postalCode;
        }
    };

    $scope.editLicenseeContactShow = function (link) {
        link.editContactVisible = !link.editContactVisible;
        if (!link.newContact) {
            link.newContact = {
                contactPhone: {},
                contactAddress: {},
                contactEmail: {}
            };
        }
        link.newContact.firstName = link.firstName;
        link.newContact.lastName = link.lastName;
        if (link.phone) {
            link.newContact.contactPhone.phoneNumber = link.phone.phoneNumber;
        }
        link.newContact.contactEmail.emailAddress = link.email.emailAddress;
        if (link.address) {
            link.newContact.contactAddress.address1 = link.address.address1;
            link.newContact.contactAddress.address2 = link.address.address2;
            link.newContact.contactAddress.city = link.address.city;
            link.newContact.contactAddress.state = link.address.state;
            link.newContact.contactAddress.country = link.address.country;
            link.newContact.contactAddress.postalCode = link.address.postalCode;
        }
    };

    $scope.saveEditedcontact = function (licensee, link) {
        contactsService.emailExists(licensee.licenseeId, link.newContact.contactEmail.emailAddress)
            .then(function (result) {
                if (result.data == "true") {
                    notyService.error("This email is used on another licensee contact.");
                    return;
                }
                if (!$scope.valid_contact_fields(link.newContact)) {
                    return;
                }
                var count = 0;
                var localcontacts = angular.toJson(licensee.licenseeContactsFiltered);
                var l = angular.fromJson(localcontacts);
                angular.forEach(l,
                    function (c) {
                        if (c.email.emailAddress.toLowerCase() == link.newContact.contactEmail.emailAddress &&
                            c.contactId != link.contactId) {
                            count++;
                        }
                    });
                if (count > 0) {
                    notyService.error("Email already exists.");
                    return;
                }
                link.contact.firstName = link.newContact.firstName;
                link.contact.lastName = link.newContact.lastName;

                if (link.newContact.contactPhone) {
                    link.contact.contactPhone = {};
                    link.contact.contactPhone.phoneNumber = "";
                    link.contact.contactPhone.phoneNumber = link.newContact.contactPhone.phoneNumber;
                }
                link.contact.contactEmail.emailAddress = link.newContact.contactEmail.emailAddress;
                if (link.contact.contactAddress) {
                    link.contact.contactAddress.address1 = link.newContact.contactAddress.address1;
                    link.contact.contactAddress.address2 = link.newContact.contactAddress.address2;
                    link.contact.contactAddress.city = link.newContact.contactAddress.city;
                    link.contact.contactAddress.state = link.newContact.contactAddress.state;
                    link.contact.contactAddress.country = link.newContact.contactAddress.country;
                    link.contact.contactAddress.postalCode = link.newContact.contactAddress.postalCode;
                }
                if (link.contact.phone) {
                    link.contact.phone[0] = link.contact.contactPhone;
                } else {
                    link.contact.phone = [];
                    link.contact.phone.push(link.contact.contactPhone);
                }
                if (link.contact.address) {
                    link.contact.address[0] = link.contact.contactAddress;
                } else {
                    link.contact.address = [];
                    link.contact.address.push(link.contact.contactAddress);
                }
                if (link.contact.email) {
                    link.contact.email[0] = link.contact.contactEmail;
                } else {
                    link.contact.email = [];
                    link.contact.email.push(link.contact.contactEmail);
                }

                //licensee.modifiedBy = $scope.safeauthentication.contactId;

                contactsService.editContact(link.contact)
                    .then(function (results) {
                        var newLicensee = results.data;
                        angular.forEach(licensee.licenseeContactsFiltered,
                            function (contact) {
                                if (contact.contactId == link.contactId) {
                                    contact.firstName = link.contact.firstName;
                                    contact.lastName = link.contact.lastName;
                                    var phone = contact.phone;
                                    console.log(JSON.stringify(contact));
                                    //if (phone) {
                                    //     if (contact.phone) {
                                    contact.phone.phoneNumber = link.contact.contactPhone.phoneNumber;
                                    //       }
                                    //     }
                                    var email = contact.email;
                                    contact.email.emailAddress = link.contact.contactEmail.emailAddress;
                                    var address = contact.address;
                                    if (contact.address) {
                                        contact.address.address1 = link.contact.contactAddress.address1;
                                        contact.address.address2 = link.contact.contactAddress.address2;
                                        contact.address.city = link.contact.contactAddress.city;
                                        contact.address.state = link.contact.contactAddress.state;
                                        contact.address.country = link.contact.contactAddress.country;
                                        contact.address.postalCode = link.contact.contactAddress.postalCode;
                                    }
                                }
                            });
                        notyService.success("Contact updated.");
                        link.editContactVisible = !link.editContactVisible;
                    },
                        function (error) {
                            notyService.error("Error when updating Contact.");
                        });
            },
                function (error) {
                });
    };
    $scope.saveEditedLicenseeContact = function (licensee, contact) {
        contactsService.emailExists(licensee.licenseeId, contact.newContact.contactEmail.emailAddress)
            .then(function (result) {
                if (result.data == "true") {
                    notyService.error("This email is used on another licensee contact.");
                    return;
                }
                var jcontact = angular.toJson(contact);
                var lcontact = angular.fromJson(jcontact);
                if (!$scope.valid_contact_fields(contact.newContact)) {
                    return;
                }
                var count = 0;
                var localcontacts = angular.toJson(licensee.licenseeContactsFiltered);
                var l = angular.fromJson(localcontacts);
                angular.forEach(l,
                    function (c) {
                        if (c.email.emailAddress.toLowerCase() == contact.newContact.contactEmail.emailAddress &&
                            c.contactId != contact.contactId) {
                            count++;
                        }
                    });
                if (count > 0) {
                    notyService.error("Email already exists.");
                    return;
                }
                contact.firstName = contact.newContact.firstName;
                contact.lastName = contact.newContact.lastName;
                lcontact.firstName = contact.newContact.firstName;
                lcontact.lastName = contact.newContact.lastName;
                var phone = contact.phone;
                if (contact.phone) {
                    contact.phone.phoneNumber = contact.newContact.contactPhone.phoneNumber;
                }
                var email = contact.email;
                contact.email.emailAddress = contact.newContact.contactEmail.emailAddress;
                var address = contact.address;
                if (contact.address) {
                    contact.address.address1 = contact.newContact.contactAddress.address1;
                    contact.address.address2 = contact.newContact.contactAddress.address2;
                    contact.address.city = contact.newContact.contactAddress.city;
                    contact.address.state = contact.newContact.contactAddress.state;
                    contact.address.country = contact.newContact.contactAddress.country;
                    contact.address.postalCode = contact.newContact.contactAddress.postalCode;
                }

                lcontact.phone = [];
                lcontact.phone.push(contact.phone);
                lcontact.address = [];
                lcontact.address.push(contact.address);
                lcontact.email = [];
                lcontact.email.push(contact.email);

                //licensee.modifiedBy = $scope.safeauthentication.contactId;

                contactsService.editContact(lcontact)
                    .then(function (results) {
                        var newLicensee = results.data;
                        angular.forEach(licensee.licenseeLabelGroupFiltered,
                            function (lg) {
                                angular.forEach(lg.labelGroupLinksFiltered,
                                    function (link) {
                                        if (link.contactId == lcontact.contactId) {
                                            link.contact.firstName = lcontact.firstName;
                                            link.contact.lastName = lcontact.lastName;
                                            link.contact.modifiedBy = $scope.safeauthentication.contactId;
                                            if (link.contact.contactPhone) {
                                                link.contact.contactPhone
                                                    .phoneNumber = lcontact.phone[0].phoneNumber;
                                            }
                                            link.contact.contactEmail
                                                .emailAddress = lcontact.email[0].emailAddress;
                                            if (link.contact.contactAddress) {
                                                link.contact.contactAddress
                                                    .address1 = lcontact.address[0].address1;
                                                link.contact.contactAddress
                                                    .address2 = lcontact.address[0].address2;
                                                link.contact.contactAddress.city = lcontact.address[0].city;
                                                link.contact.contactAddress.state = lcontact.address[0].state;
                                                link.contact.contactAddress
                                                    .country = lcontact.address[0].country;
                                                link.contact.contactAddress
                                                    .postalCode = lcontact.address[0].postalCode;
                                            }
                                            if (link.contact.phone) {
                                                link.contact.phone[0] = link.contact.contactPhone;
                                            } else {
                                                link.contact.phone = [];
                                                link.contact.phone.push(link.contact.contactPhone);
                                            }
                                            if (link.contact.address) {
                                                link.contact.address[0] = link.contact.contactAddress;
                                            } else {
                                                link.contact.address = [];
                                                link.contact.address.push(link.contact.contactAddress);
                                            }
                                            if (link.contact.email) {
                                                link.contact.email[0] = link.contact.contactEmail;
                                            } else {
                                                link.contact.email = [];
                                                link.contact.email.push(link.contact.contactEmail);
                                            }
                                        }
                                    });
                            });
                        notyService.success("Contact updated.");
                        contact.editContactVisible = !contact.editContactVisible;
                    },
                        function (error) {
                            notyService.error("Error when updating Contact.");
                        });
            },
                function (error) {
                });
    };
    $scope.closeEditContact = function (link) {
        link.newContact = {
            firstName: "",
            lastName: "",
            contactPhone: {
                phoneNumber: ""
            },
            contactEmail: {
                emailAddress: ""
            },
            contactAddress: {
                address1: "",
                address2: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
            }
        };
        link.editContactVisible = !link.editContactVisible;
    };

    //lg
    $scope.saveEditedLabelGroup = function (labelGroup) {
        $scope.submit_saveNewLabelGroup = true;
        if (!$scope.is_valid_field(labelGroup.newLabelGroupName)) {
            return;
        }

        // TODO: next validation won't work because labelGroup.licenseeLabelGroupFiltered dont'n have licenseeLabelGroupName
        var validLabelGroupName = true;
        angular.forEach(labelGroup.licenseeLabelGroupFiltered,
            function (licenseeLabelGroupFiltered) {
                if (labelGroup.newLabelGroupName == licenseeLabelGroupFiltered.licenseeLabelGroupName) {
                    validLabelGroupName = false;
                }
            });
        if (!validLabelGroupName) {
            notyService.error("LabelGroup name already exists");
            return;
        }

        labelGroup.licenseeLabelGroupName = labelGroup.newLabelGroupName;
        labelGroup.modifiedBy = $scope.safeauthentication.contactId;
        contactsService.editLabelGroup(labelGroup)
            .then(function (results) {
                var lg = results.data;
                notyService.success("Label Group updated.");
                labelGroup.editLabelGroupVisible = !labelGroup.editLabelGroupVisible;
                // $scope.getLicensees();
            },
                function (error) {
                    notyService.error("Error when updating Label Group.");
                });
    };

    $scope.saveNewLabelGroup = function (licensee) {
        $scope.submit_saveNewLabelGroup = true;
        if (!$scope.is_valid_field(licensee.newLabelGroupName)) {
            return;
        }

        var validLabelGroupName = true;
        angular.forEach(licensee.licenseeLabelGroupFiltered,
            function (licenseeLabelGroupFiltered) {
                if (licensee.newLabelGroupName == licenseeLabelGroupFiltered.licenseeLabelGroupName) {
                    validLabelGroupName = false;
                }
            });
        if (!validLabelGroupName) {
            notyService.error("LabelGroup name already exists");
            return;
        }

        var request = {
            LicenseeId: licensee.licenseeId,
            createdBy: $scope.safeauthentication.contactId,
            licenseeLabelGroupName: licensee.newLabelGroupName
        };
        contactsService.addLabelGroup(request)
            .then(function (results) {
                var lg = results.data;
                $scope.submit_saveNewLabelGroup = false;
                notyService.success("Label Group saved.");

                // add new LabelGroup to UI
                var newLabelGroup = {
                    contactsCollapsed: true,
                    createdBy: lg.createdBy,
                    createdDate: lg.createdDate,
                    deleted: lg.deleted,
                    editLabelGroupVisible: false,
                    labelGroupLinks: [],
                    labelGroupLinksFiltered: [],
                    licenseeId: lg.licenseeId,
                    licenseeLabelGroupId: lg.licenseeLabelGroupId,
                    licenseeLabelGroupName: lg.licenseeLabelGroupName,
                    modifiedBy: lg.modifiedBy,
                    modifiedDate: lg.modifiedDate,
                    newLabelGroupName: "",
                    selectedContact: {}
                }
                licensee.licenseeLabelGroupFiltered.push(newLabelGroup);

                $scope.closeNewLabelGroup(licensee);
            },
                function (error) {
                    notyService.error("Error when saving Label Group.");
                });
    };

    $scope.closeNewLabelGroup = function (licensee) {
        // clear new LabelGroup field
        licensee.newLabelGroupName = "";

        // collapse new LabelGroup  fields
        $scope.submit_saveNewLabelGroup = false;
        licensee.addLabelGroupVisible = !licensee.addLabelGroupVisible;
    };

    $scope.deleteLabelGroup = function (licensee, labelGroup) {
        labelGroup.modifiedBy = $scope.safeauthentication.contactId;
        notyService.modalConfirm("Are you sure you want to delete this Label Group?")
            .then(function () {
                contactsService.deleteLabelGroup(labelGroup)
                    .then(function (results) {
                        var lg = results.data;
                        notyService.success("Label Group deleted.");
                        $scope.getLicensees();
                    },
                        function (error) {
                            notyService.success("Error when deleting Label Group.");
                        });
            });
    };

    $scope.closeEditLabelGroup = function (lg) {
        lg.newLabelGroupName = "";
        lg.editLabelGroupVisible = !lg.editLabelGroupVisible;
    };
    $scope.addLabelGroupNameShow = function (licensee) {
        $scope.submit_saveNewLabelGroup = false;
        licensee.addLabelGroupVisible = !licensee.addLabelGroupVisible;
    };
    $scope.editLabelGroupNameShow = function (labelGroup) {
        labelGroup.editLabelGroupVisible = !labelGroup.editLabelGroupVisible;
        labelGroup.newLabelGroupName = labelGroup.licenseeLabelGroupName;
    };

    $scope.addContactShow = function (labelGroup) {
        console.log(JSON.stringify(labelGroup));
        $scope.submit_saveNewContact = false;
        labelGroup.addContactVisible = !labelGroup.addContactVisible;
    };

    $scope.addLicenseeContactShow = function (licensee) {
        licensee.addContactVisible = !licensee.addContactVisible;
    };

    $scope.saveNewLicenseeContact = function (licensee) {
        $scope.submit_saveNewContact = true;
        if (!$scope.valid_contact_fields(licensee.selectedContact)) {
            return;
        }

        var isAddExisting = false;
        var contactts = licensee.licenseeContactsFiltered;
        var contactRequest = licensee.selectedContact;
        angular.forEach(contactts,
            function (contact) {
                if (contact.email.emailAddress.toLowerCase() ==
                    licensee.selectedContact.contactEmail.emailAddress.toLowerCase()) {
                    isAddExisting = true;
                    contactRequest = contact;
                }
            });
        var request;
        if (isAddExisting) {
            notyService
                .error("Please check your data. You are not allowed to add contact with the same email address on this level.");
            return;
            request = {
                licenseeId: licensee.licenseeId,
                isAddExisting: true,
                contact: contactRequest,
                createdBy: $scope.safeauthentication.contactId,
            };
        } else {
            var email = [];
            email.push(licensee.selectedContact.contactEmail);
            var phone = [];
            phone.push(licensee.selectedContact.contactPhone);
            var address = [];
            address.push(licensee.selectedContact.contactAddress);
            request = {
                licenseeId: licensee.licenseeId,
                isAddExisting: false,
                createdBy: $scope.safeauthentication.contactId,
                contact: {
                    firstName: licensee.selectedContact.firstName,
                    lastName: licensee.selectedContact.lastName,
                    fullName: licensee.selectedContact.firstName + " " + licensee.selectedContact.lastName,
                    phone: phone,
                    email: email,
                    address: address
                }
            };
        }
        contactsService.emailExists(request.licenseeId, request.contact.email[0].emailAddress)
            .then(function (result) {
                if (result.data == "true") {
                    notyService.error("This email is used on another licensee contact.");
                    return;
                }
                contactsService.addLicenseeContactAndLink(request)
                    .then(function (results) {
                        $scope.submit_saveNewContact = false;
                        notyService.success("Contact saved.");

                        // add new contact to UI
                        var newContact = results.data;
                        if (results.data.phone) {
                            newContact.phone = results.data.phone[0];
                        }
                        if (results.data.address) {
                            newContact.address = results.data.address[0];
                        }
                        newContact.email = results.data.email[0];
                        licensee.licenseeContactsFiltered.push(newContact);

                        $scope.closeSaveNewContact(licensee);
                    },
                        function (error) {
                            notyService.error("Error when saving Contact.");
                        });
            },
                function (error) {
                });
    };

    $scope.closeSaveNewLicenseeContact = function (licensee) {
        // clear new contact fields
        licensee.selectedContact.firstName = "";
        licensee.selectedContact.lastName = "";
        licensee.selectedContact.contactPhone.phoneNumber = "";
        licensee.selectedContact.contactEmail.emailAddress = "";
        licensee.selectedContact.contactAddress.address1 = "";
        licensee.selectedContact.contactAddress.address2 = "";
        licensee.selectedContact.contactAddress.city = "";
        licensee.selectedContact.contactAddress.state = "";
        licensee.selectedContact.contactAddress.country = "";
        licensee.selectedContact.contactAddress.postalCode = "";

        // collapse new contact fields
        $scope.submit_saveNewContact = false;
        licensee.addContactVisible = !licensee.addContactVisible;
    };

    $scope.saveNewContact = function (licensee, labelGroup) {
        $scope.submit_saveNewContact = true;
        if (!$scope.valid_contact_fields(labelGroup.selectedContact)) {
            return;
        }
        var isInLabelGroup = false;
        var isAddExisting = false;
        var contactts = labelGroup.labelGroupLinksFiltered;
        var contactRequest = labelGroup.selectedContact;
        angular.forEach(contactts,
            function (contact) {
                if (contact.contact.email) {
                    if (contact.contact.email.length > 0) {
                        if (contact.contact.email[0].emailAddress.toLowerCase() ==
                            labelGroup.selectedContact.contactEmail.emailAddress.toLowerCase()) {
                            isInLabelGroup = true;
                            contactRequest = contact;
                        }
                    }
                } else {
                    if (contact.contact.contactEmail.emailAddress.toLowerCase() ==
                        labelGroup.selectedContact.contactEmail.emailAddress.toLowerCase()) {
                        isInLabelGroup = true;
                        contactRequest = contact;
                    }
                }
            });
        var c = angular.fromJson($scope.initialContacts);
        angular.forEach(c,
            function (contact) {
                if (contact.email.length > 0) {
                    if (contact.email[0].emailAddress.toLowerCase() ==
                        labelGroup.selectedContact.contactEmail.emailAddress.toLowerCase() &&
                        contact.firstName == labelGroup.selectedContact.firstName) {
                        isAddExisting = true;
                        contactRequest = contact;
                    }
                }
            });
        var request;
        if (isInLabelGroup) {
            notyService
                .error("Please check your data. You are not allowed to add contact with the same email address on this level.");
            return;
            request = {
                labelGroupId: labelGroup.licenseeLabelGroupId,
                licenseeId: labelGroup.licenseeId,
                isAddExisting: true,
                contact: contactRequest,
                createdBy: $scope.safeauthentication.contactId,
            };
        } else if (!isInLabelGroup && isAddExisting) {
            request = {
                labelGroupId: labelGroup.licenseeLabelGroupId,
                licenseeId: labelGroup.licenseeId,
                isAddExisting: true,
                contact: contactRequest,
                createdBy: $scope.safeauthentication.contactId,
            };
        } else {
            var email = [];
            email.push(labelGroup.selectedContact.contactEmail);
            var phone = [];
            phone.push(labelGroup.selectedContact.contactPhone);
            var address = [];
            address.push(labelGroup.selectedContact.contactAddress);
            request = {
                labelGroupId: labelGroup.licenseeLabelGroupId,
                licenseeId: labelGroup.licenseeId,
                isAddExisting: false,
                createdBy: $scope.safeauthentication.contactId,
                contact: {
                    firstName: labelGroup.selectedContact.firstName,
                    lastName: labelGroup.selectedContact.lastName,
                    fullName: labelGroup.selectedContact.firstName + " " + labelGroup.selectedContact.lastName,
                    phone: phone,
                    email: email,
                    address: address
                }
            };
        }
        contactsService.emailExists(request.licenseeId, request.contact.email[0].emailAddress)
            .then(function (result) {
                if (result.data == "true") {
                    notyService.error("This email is used on another licensee contact.");
                    return;
                }
                contactsService.addContactAndLink(request)
                    .then(function (results) {
                        var contact = results.data;
                        $scope.submit_saveNewContact = false;
                        notyService.success("Contact saved.");

                        if (!contact.address[0]) {
                            contact.address[0] = {};
                            contact.address[0].address1 = null;
                            contact.address[0].address2 = null;
                            contact.address[0].city = null;
                            contact.address[0].state = null;
                            contact.address[0].country = null;
                            contact.address[0].postalCode = null;
                        }

                        // add new contact to UI
                        var newContact = {
                            firstName: contact.firstName,
                            lastName: contact.lastName,
                            contactId: contact.contactId,
                            contactPhone: {
                                phoneNumber: contact.phone[0].phoneNumber
                            },
                            contactEmail: {
                                emailAddress: contact.email[0].emailAddress
                            },
                            contactAddress: {
                                address1: contact.address[0].address1,
                                address2: contact.address[0].address2,
                                city: contact.address[0].city,
                                state: contact.address[0].state,
                                country: contact.address[0].country,
                                postalCode: contact.address[0].postalCode,
                            }
                        };

                        labelGroup.labelGroupLinksFiltered
                            .push({ contact: newContact, contactId: results.data.contactId });
                        if (!isAddExisting) {
                            var nContact = results.data;
                            if (results.data.phone) {
                                nContact.phone = results.data.phone[0];
                            }
                            if (results.data.address) {
                                nContact.address = results.data.address[0];
                            }
                            nContact.email = results.data.email[0];
                            licensee.licenseeContactsFiltered.push(nContact);
                        }
                        $scope.closeSaveNewContact(labelGroup);
                    },
                        function (error) {
                            notyService.error("Error when saving Contact.");
                        });
            },
                function (error) {
                });
    };

    $scope.closeSaveNewContact = function (labelGroup) {
        if (!labelGroup.selectedContact.contactPhone) {
            labelGroup.selectedContact.contactPhone = {};
            labelGroup.selectedContact.contactEmail = {};
            labelGroup.selectedContact.contactAddress = {};
        }

        // clear new contact fields
        labelGroup.selectedContact.firstName = "";
        labelGroup.selectedContact.lastName = "";
        labelGroup.selectedContact.contactPhone.phoneNumber = "";
        labelGroup.selectedContact.contactEmail.emailAddress = "";
        if (labelGroup.selectedContact.contactAddress) {
            labelGroup.selectedContact.contactAddress.address1 = "";
            labelGroup.selectedContact.contactAddress.address2 = "";
            labelGroup.selectedContact.contactAddress.city = "";
            labelGroup.selectedContact.contactAddress.state = "";
            labelGroup.selectedContact.contactAddress.country = "";
            labelGroup.selectedContact.contactAddress.postalCode = "";
        }

        // collapse new contact fields
        $scope.submit_saveNewContact = false;
        if (labelGroup.labelGroupLinksFiltered) {
            if (labelGroup.labelGroupLinksFiltered.length == 0)
                $scope.collapseContacts(labelGroup);
            else
                labelGroup.addContactVisible = !labelGroup.addContactVisible;
        } else
            labelGroup.addContactVisible = !labelGroup.addContactVisible;
    };

    $scope.deleteContact = function (licensee, labelgroup, contactId) {
        notyService.modalConfirm("Are you sure you want to delete this Contact?")
            .then(function () {
                var request = {
                    contactId: contactId,
                    modifiedBy: $scope.safeauthentication.contactId
                }
                contactsService.deleteContactAndLink(request)
                    .then(function (results) {
                        for (var i = 0; i < labelgroup.labelGroupLinksFiltered.length; i++) {
                            if (labelgroup.labelGroupLinksFiltered[i].contact.contactId == contactId) {
                                labelgroup.labelGroupLinksFiltered.splice(i, 1);
                            }
                        }

                        if (labelgroup.labelGroupLinksFiltered.length == 0) {
                            $scope.collapseContacts(labelgroup);
                        }

                        USL.Common.FindAndRemove(licensee.licenseeContactsFiltered, 'contactId', contactId);
                        angular.forEach(licensee.licenseeLabelGroupFiltered,
                            function (lg) {
                                USL.Common.FindAndRemove(lg.labelGroupLinksFiltered, 'contactId', contactId);
                            });
                        notyService.success("Contact deleted.");
                    },
                        function (error) {
                            notyService.error("Error when deleting Contact.");
                        });
            });
    };

    $scope.uniqueAdvFilter = function(value, index) {
        var output = [];
        var match = [];
        output.push(value);
        angular.forEach(output,
            function(item) {
                angular.forEach(output,
                    function (compareItem) {
                        if (item
                            .fullName ===
                            compareItem.fullName &&
                            item.email.emailAddress === compareItem.email.emailAddress) {
                            if (match.indexOf(item) === -1) {
                                match.push(item);
                            }
                        }
                    });
            });
        return match;
    }

    $scope.deleteContactFromLabelGroup = function (licensee, licenseeLabelGroupId, contactId) {
        notyService.modalConfirm("Are you sure you want to remove this Contact from this LabelGroup?")
            .then(function () {
                var request = {
                    contactId: contactId,
                    modifiedBy: $scope.safeauthentication.contactId,
                    licenseeLabelGroupId: licenseeLabelGroupId
                }
                contactsService.deleteContactFromLabelGroup(request)
                    .then(function (response) {
                        removeContactFromLabelGroup(licensee, licenseeLabelGroupId, contactId);
                        notyService.success("Contact removed from LabelGroup.");
                    }, function () {
                        notyService.error("Error when removing Contact from LabelGroup.");
                    });
            });
    }

    $scope.deleteLicenseeContact = function (licensee, contactId) {
        notyService.modalConfirm("Are you sure you want to delete this Contact?")
            .then(function () {
                var request = {
                    contactId: contactId,
                    modifiedBy: $scope.safeauthentication.contactId
                }
                contactsService.deleteContactAndLink(request)
                    .then(function (results) {
                        for (var i = 0; i < licensee.licenseeContactsFiltered.length; i++) {
                            if (licensee.licenseeContactsFiltered[i].contactId == contactId) {
                                licensee.licenseeContactsFiltered.splice(i, 1);
                            }
                        }

                        if (licensee.licenseeContactsFiltered.length == 0) {
                            $scope.collapseLicenseContacts(licensee);
                        }
                        angular.forEach(licensee.licenseeLabelGroupFiltered,
                            function (lg) {
                                USL.Common.FindAndRemove(lg.labelGroupLinksFiltered, 'contactId', contactId);
                            });
                        notyService.success("Contact deleted.");
                    },
                        function (error) {
                            notyService.error("Error when deleting Contact.");
                        });
            });
    };

    $scope.getContacts = function () {
        contactsService.getContacts()
            .then(function (results) {
                $scope.initialContacts = angular.toJson(results.data);
                $scope.allContacts = results.data;
            },
                function (error) {
                });
    };
    $scope.getContactsForLicensee = function (licensee) {
        contactsService.getContactsForLicensee(licensee.licenseeId)
            .then(function (results) {
                $scope.initialContacts = angular.toJson(results.data);
                $scope.allContacts = results.data;
            },
                function (error) {
                });
    };
    $scope.selectContact = function (labelgroup, c) {
        if (c.phone && c.phone.length > 0) {
            c.contactPhone = c.phone[0];
        }
        if (c.address && c.address.length > 0) {
            c.contactAddress = c.address[0];
        }
        if (c.email.length > 0) {
            c.contactEmail = c.email[0];
        }
        labelgroup.selectedContact = c;
    };

    $scope.setCaret = function (collapsed) {
        if (collapsed == true) {
            return "caret";
        } else {
            return "caret caret-up";
        }
    }
    $scope.getLicensees();

    function getFullNames(licensees) {
        angular.forEach(licensees,
            function (licnesee) {
                angular.forEach(licnesee.licenseeContactsFiltered,
                    function (filteredContact) {
                        if (filteredContact.fullName == null) {
                            filteredContact.fullName = filteredContact.firstName.trim() +
                                " " +
                                filteredContact.lastName.trim();
                        }
                    });
            });
      unique(licensees);
    };

    function unique(origArr) {
        var newArr = [],
            origLen = origArr.length,
            found, x, y;

        for (x = 0; x < origLen; x++) {
            found = undefined;
            for (y = 0; y < newArr.length; y++) {
                if (origArr[x].fullName === newArr[y].fullName) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newArr.push(origArr[x]);
            }
        }
        return newArr;
    }



    function removeContactFromLabelGroup(licensee, licenseeLabelGroupId, contactId) {
        angular.forEach(licensee.licenseeLabelGroupFiltered,
                                            function (lg) {
                                                if (lg.licenseeLabelGroupId == licenseeLabelGroupId) {
                                                    USL.Common
                                                        .FindAndRemove(lg.labelGroupLinksFiltered,
                                                            'contactId',
                                                            contactId);
                                                }
                                            });
    }
}]);