'use strict';
app.controller('licenseInfoController', ['$scope', '$state', '$stateParams', 'licensesService', 'contactsService', 'prioritiesService', 'licenseesService', 'licenseStatusService', 'safeService',
    function ($scope, $state, $stateParams, licensesService, contactsService, prioritiesService, licenseesService, licenseStatusService, safeService) {

        $scope.safeauthentication = safeService.safeauthentication;
        $scope.stateName = $state.current.name;
        $scope.selectedProductsFromsSearch = [];
        if ($stateParams.products) {
            angular.forEach($stateParams.products, function (item) {
                if (item.selected) {
                    $scope.selectedProductsFromsSearch.push(item);
                }
                
            });
        }
        $scope.assigneeAutosugest = "";
        $scope.IsEdit = false;
        if ($scope.selectedLicense) {
            $scope.license = $scope.selectedLicense;
            $scope.selectedAssignee = $scope.license.contact;
            $scope.selectedLicensee = $scope.license.licensee;
            $scope.selectedLicenseeLabel = $scope.license.licenseeLabelGroup;
            $scope.selectedPriority = $scope.license.licensePriority;
            $scope.selectedLicenseStatus = $scope.license.licenseStatus;
            $scope.selectedLicenseType = $scope.license.licenseType;
            $scope.selectedLicenseMethod = $scope.license.licenseMethod;
            $scope.IsEdit = true;
            contactsService.getLabelsForLicensee($scope.selectedLicensee.licenseeId).then(function (result) {
                $scope.licenseeLabels = result.data;
            });
            contactsService.getContactsForLicensee($scope.selectedLicensee.licenseeId).then(function (result) {
                $scope.licenseeContacts = result.data;
            });
            // handling null dates
            var date;
            var lday;
            var lyear;
            var lmonth;
            if ($scope.license.effectiveDate) {
                $scope.dt = moment.utc($scope.license.effectiveDate).format("YYYY-MM-DD");
            } else {
                $scope.dt = null;
            }
            if ($scope.license.receivedDate) {
                $scope.dtReceived = moment.utc($scope.license.receivedDate).format("YYYY-MM-DD");
              
            } else {
                $scope.dtReceived = null;
            }
            if ($scope.license.signedDate) {
                $scope.dtSigned = moment.utc($scope.license.signedDate).format("YYYY-MM-DD");

            } else {
                $scope.dtSigned =null;
            }


            if (angular.isUndefined($scope.selectedLicenseeLabel)) {
                $scope.selectedLicenseeLabel = { licenseeLabelGroupName: "Select Label" };
                contactsService.getLabelsForLicensee($scope.selectedLicense.licenseeId).then(function (result) {
                    $scope.licenseeLabels = result.data;
                });
                $scope.selectedLicenseeLabel = { licenseeLabelGroupName: "Select Label" };

            } else {
                contactsService.getLabelsForLicensee($scope.selectedLicense.licenseeId).then(function (result) {
                    $scope.licenseeLabels = result.data;
                });
                if ($scope.selectedLicenseeLabel == null) {
                    $scope.selectedLicenseeLabel = { licenseeLabelGroupName: "Select Label" };
                };

               // $scope.selectedLicenseeLabel = $scope.selectedLicense.licenseeLabel;
            };


            $scope.selectedLicenseeContact = $scope.selectedLicense.licenseeContact;

        } else {
            $scope.license = {};
            if ($scope.stateName == "SearchMyView.Tabs.ProductsTab.StepsModal.CreateLicense" || $scope.stateName == "SearchMyView.DetailProduct.StepsModal.CreateLicense") {
                if ($scope.selectedProducts.length == 1) {
                    $scope.license.licenseName = $scope.selectedProducts[0].recsArtist.name + " - " + $scope.selectedProducts[0].title;
                } else if ($scope.selectedProducts.length>1) {
                    var firstProd = $scope.selectedProducts[0];
                    var count = 0;
                    for (var i = 0; i < $scope.selectedProducts.length; i++) {
                        if ($scope.selectedProducts[i].recsArtist.name == firstProd.recsArtist.name) {
                            count++;
                        }
                    }
                    if (count == $scope.selectedProducts.length) {
                        $scope.license.licenseName = $scope.selectedProducts[0].recsArtist.name + " - ";
                    }
                } else {
                    $scope.license.licenseName = "";
                }

            } else {
                $scope.license.licenseName = "";
            }
            $scope.license.assignedToId = $scope.safeauthentication.contactId;

            $scope.selectedAssignee = {
                fullName: $scope.safeauthentication.userName, assignedToId: $scope.safeauthentication.contactId
            };
            $scope.selectedLicensee = "";
            $scope.selectedLicenseeLabel = { licenseeLabelGroupName: "Select Label" };
            $scope.selectedPriority = {
                priority: 'Medium', priorityId: 2
            };
            $scope.selectedLicenseStatus = {
                licenseStatus: 'Select status', licenseStatusId: -1
            };
            $scope.selectedLicenseType = {
                licenseType: 'Standard', licenseTypeId: 1
            };
            $scope.selectedLicenseMethod = {
                licenseMethod: 'Direct', licenseMethodId: 2
            };
            $scope.dt = "";
            $scope.dtSigned = "";
            $scope.dtReceived = "";
            //$scope.selectedLicenseeLabel = { fullName: "Select Label" };
            $scope.selectedLicenseeContact = { fullName: "Select Licensee Contact" };
        }
        
        $scope.licenseStatuses = [];
        $scope.licenseTypes = [];
        $scope.licenseMethods = [];
        $scope.contacts = [];
        $scope.priorities = [];
        $scope.licensees = [];
        $scope.licenseeContacts = [];

        $scope.getAssignees = function () {
            if ($scope.contacts.length == 0) {
                contactsService.getAssignees().then(function (results) {
                    $scope.contacts = results.data;
                }, function (error) {
                    //alert(error.data.message);
                });
            }
        };

        $scope.getPriorities = function () {
            if ($scope.priorities.length == 0) {
                prioritiesService.getPriorities().then(function (results) {
                    $scope.priorities = results.data;
                }, function (error) {
                });
            }

        };

        $scope.getLicensees = function () {
                licenseesService.getLicensees().then(function (results) {
                    $scope.licensees = results.data;
                }, function (error) {
                });

        };

        $scope.getLicenseStatuses = function () {
            if ($scope.licenseStatuses.length == 0) {
                licenseStatusService.getLicenseStatuses().then(function (result) {
                    $scope.licenseStatuses = result.data;
                });
            }
        };

        $scope.getLicenseTypes = function () {
            if ($scope.licenseTypes.length == 0) {
                licenseStatusService.getLicenseTypes().then(function (result) {
                    $scope.licenseTypes = result.data;
                });
            }
        };

        $scope.getLicenseMethods = function () {
            if ($scope.licenseMethods.length == 0) {
                licenseStatusService.getLicenseMethods().then(function (result) {
                    $scope.licenseMethods = result.data;
                });
            }
        };

        $scope.selectPriority = function (p) {
            $scope.selectedPriority = p;
        };

        $scope.selectLicensee = function (l) {
            $scope.selectedLicensee = l;

            $scope.selectedLicenseeLabel = { licenseeLabelGroupName: "Select Label" };
            contactsService.getLabelsForLicensee(l.licenseeId).then(function (result) {
                $scope.licenseeLabels = result.data;
            });

            $scope.selectedLicenseeContact = { fullName: "Select Licensee Contact" };
            contactsService.getContactsForLicensee(l.licenseeId).then(function(result) {
                $scope.licenseeContacts = result.data;
            });
        };

        $scope.selectLicenseeLabel = function (l) {
            $scope.selectedLicenseeLabel = l;

            $scope.selectedLicenseeContact = { fullName: "Select Licensee Contact" };
            contactsService.getContactsForLicenseeLabel(l.licenseeLabelGroupId).then(function (result) {
                $scope.licenseeContacts = result.data;
            });

        };

        //$scope.selectLicenseeLabel = function (label) {
        //    $scope.selectedLicenseeLabel = label;
        //};

        $scope.selectLicenseeContact = function (contact) {
            $scope.selectedLicenseeContact = contact;
        };

        $scope.selectAsignee = function (assignee) {
            $scope.selectedAssignee = assignee;
        };
        $scope.selectLicenseStatus = function (status) {
            $scope.selectedLicenseStatus = status;
        };
        $scope.selectLicenseType = function (type) {
            $scope.selectedLicenseType = type;
        };
        $scope.selectLicenseMethod = function (method) {
            $scope.selectedLicenseMethod = method;
        };

        $scope.is_valid_field = USL.Common.isValidField;
        $scope.modal_submit = false;

        $scope.valid_fields = function () {

            if (!$scope.is_valid_field($scope.license.licenseName)) return false;
            if (!$scope.is_valid_field($scope.selectedAssignee.fullName)) return false;
            if (!$scope.is_valid_field($scope.selectedLicensee.name)) return false;
            if (!$scope.is_valid_field($scope.selectedLicenseeContact.fullName)) return false;

            return true;
        };

        $scope.ok_select = function () { // same as ok_close() at this point

            var date1 = $("#date14").val();
            var date2 = $("#date15").val();
            var date3 = $("#date16").val();

            //console.log("Date 1:" + date1);
            //console.log("Date 2:" + date2);
            //console.log("Date 3:" + date3);

            if (isNotADate(date1) && date1.length >= 1 || isNotADate(date2) && date2.length >= 1 || isNotADate(date3) && date3.length >= 1) {
                dateErrorMessage();
                return;
            }

            $scope.modal_submit = true;
            var validated = $scope.valid_fields();

            $scope.license.contact = $scope.selectedAssignee;
            $scope.license.assignedToId = $scope.selectedAssignee.contactId;
            if ($scope.license.assignedToId == null) {
                $scope.license.assignedToId = $scope.safeauthentication.contactId;
            };

            $scope.license.licensePriority = $scope.selectedPriority;
            $scope.license.priorityId = $scope.selectedPriority.priorityId;
            $scope.license.licensee = $scope.selectedLicensee;
            $scope.license.LicenseeLabelGroup = $scope.selectedLicenseeLabel;
            $scope.license.licenseeId = $scope.selectedLicensee.licenseeId;
            $scope.license.licenseStatus = $scope.selectedLicenseStatus;
            $scope.license.licenseStatusId = $scope.selectedLicenseStatus.licenseStatusId;
            $scope.license.licenseType = $scope.selectedLicenseType;
            $scope.license.licenseTypeId = $scope.selectedLicenseType.licenseTypeId;
            $scope.license.licenseMethod = $scope.selectedLicenseMethod;
            $scope.license.licenseMethodId = $scope.selectedLicenseMethod.licenseMethodId;
            setTime();
            $scope.license.effectiveDate = $scope.dt;
            $scope.license.signedDate = $scope.dtSigned;
            $scope.license.receivedDate = $scope.dtReceived;
            $scope.license.contactId = $scope.selectedLicenseeContact.contactId;
            $scope.license.modifiedBy = $scope.safeauthentication.contactId;

            // Check if passes validation
            if (validated) {
                $scope.license.modifiedDate = moment().format();
                $scope.license.createdDate = moment().format();
                if ($scope.IsEdit) {

                    licensesService.editLicense($scope.license).then(function (result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });

                            $scope.modalNextStep();
                                //$state.go('SearchMyView.DetailLicense.StepsModal.AddProducts', { licenseId: result.config.data.licenseId, products: null });
                            
                        }

                    }, function (error) { });
                } else {
                    licensesService.createLicense($scope.license).then(function (result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            $scope.setParameter('selectedLicense', result.data);
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });
                            $scope.modalNextStep();
                        }

                    }, function (error) {
                        var message = "License could not be saved, Error (passed validation) (click to close)";
                        noty({
                            text: message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    });
                };
            }; // validated


        };
        $scope.ok_selectConfig = function () {
            $scope.modal_submit = true;
            var validated = $scope.valid_fields();

            $scope.license.contact = $scope.selectedAssignee;
            $scope.license.assignedToId = $scope.selectedAssignee.contactId;
            if ($scope.license.assignedToId == null) {
                $scope.license.assignedToId = $scope.safeauthentication.contactId;
            };

            $scope.license.licensePriority = $scope.selectedPriority;
            $scope.license.priorityId = $scope.selectedPriority.priorityId;
            $scope.license.licensee = $scope.selectedLicensee;
            $scope.license.LicenseeLabelGroup = $scope.selectedLicenseeLabel;
            $scope.license.licenseeId = $scope.selectedLicensee.licenseeId;
            $scope.license.licenseStatus = $scope.selectedLicenseStatus;
            $scope.license.licenseStatusId = $scope.selectedLicenseStatus.licenseStatusId;
            $scope.license.licenseType = $scope.selectedLicenseType;
            $scope.license.licenseTypeId = $scope.selectedLicenseType.licenseTypeId;
            $scope.license.licenseMethod = $scope.selectedLicenseMethod;
            $scope.license.licenseMethodId = $scope.selectedLicenseMethod.licenseMethodId;
            setTime();
            $scope.license.effectiveDate = $scope.dt;
            $scope.license.signedDate = $scope.dtSigned;
            $scope.license.receivedDate = $scope.dtReceived;
            $scope.license.contactId = $scope.selectedLicenseeContact.contactId;
            $scope.license.modifiedBy = $scope.safeauthentication.contactId;

            // Check if passes validation
            if (validated) {
                $scope.license.modifiedDate = moment().format();
                $scope.license.createdDate = moment().format();

                if ($scope.IsEdit) {                  
                    licensesService.editLicense($scope.license).then(function (result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });
                            var selectedProductsList = [];
                                angular.forEach($scope.selectedProductsFromsSearch, function (item) {
                                    var newItem = {};
                                    newItem.key = item.product_id;
                                    if (item.recordings) {
                                        newItem.Value = USL.Common.SingleFieldArray(item.recordings, 'track_id', false);
                                    } else {
                                        newItem.Value = [];
                                    }
                                    selectedProductsList.push(newItem);
                                });

                              $state.go('SearchMyView.Tabs.ProductsTab.StepsModal.EditConfigsInProducts', { licenseId: result.data, products: selectedProductsList });
                        }

                    }, function(error) {
                    });
                } else {
                    licensesService.createLicense($scope.license).then(function(result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            $scope.setParameter('selectedLicense', result.data);
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });
                            var selectedProductsList = [];
                            angular.forEach($scope.selectedProductsFromsSearch, function(item) {
                                var newItem = {};
                                newItem.key = item.product_id;
                                if (item.recordings) {
                                    newItem.Value = USL.Common.SingleFieldArray(item.recordings, 'track_id', false);
                                } else {
                                    newItem.Value = [];
                                }
                                selectedProductsList.push(newItem);
                            });

                            $state.go('SearchMyView.Tabs.ProductsTab.StepsModal.EditConfigsInProducts', { licenseId: result.data, products: selectedProductsList });
                        }

                    }, function(error) {
                        var message = "License could not be saved, Error (passed validation) (click to close)";
                        noty({
                            text: message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    });

                }
                ; // validated
            }
        };
        var dateErrorMessage = function (evt) {
            var message = "Invalid Date, use mm/dd/yyyy format";
            noty({
                text: message,
                type: 'error',
                timeout: 2500,
                layout: "top"
            });
        }
        var isNotADate = function (date) {
            if (date.length != 10 || date.length == 0) {
                return true;
            }
        }

        $scope.ok_close = function () {
            var date1 = $("#date14").val();
            var date2 = $("#date15").val();
            var date3 = $("#date16").val();

            //console.log("Date 1:" + date1);
            //console.log("Date 2:" + date2);
            //console.log("Date 3:" + date3);

            if (isNotADate(date1) && date1.length >= 1 || isNotADate(date2) && date2.length >= 1 || isNotADate(date3) && date3.length >= 1) {
                dateErrorMessage();
                return;
            }



            $scope.modal_submit = true;
            var validated = $scope.valid_fields();

            $scope.license.contact = $scope.selectedAssignee;
            $scope.license.assignedToId = $scope.selectedAssignee.contactId;
            if ($scope.license.assignedToId == null) {
                $scope.license.assignedToId = $scope.safeauthentication.contactId;
            };
            $scope.license.licensePriority = $scope.selectedPriority;
            $scope.license.priorityId = $scope.selectedPriority.priorityId;
            $scope.license.licensee = $scope.selectedLicensee;
            $scope.license.LicenseeLabelGroup = $scope.selectedLicenseeLabel;
            $scope.license.licenseeId = $scope.selectedLicensee.licenseeId;
            $scope.license.licenseStatus = $scope.selectedLicenseStatus;
            $scope.license.licenseStatusId = $scope.selectedLicenseStatus.licenseStatusId;
            $scope.license.licenseType = $scope.selectedLicenseType;
            $scope.license.licenseTypeId = $scope.selectedLicenseType.licenseTypeId;
            $scope.license.licenseMethod = $scope.selectedLicenseMethod;
            $scope.license.licenseMethodId = $scope.selectedLicenseMethod.licenseMethodId;
            setTime();
            $scope.license.effectiveDate = $scope.dt;
            $scope.license.signedDate = $scope.dtSigned;
            $scope.license.receivedDate = $scope.dtReceived;
            $scope.license.contactId = $scope.selectedLicenseeContact.contactId;
            $scope.license.modifiedBy = $scope.safeauthentication.contactId;

            //// Check for License Name
            //if ($scope.license.licenseName == "") {
            //    validated = false;
            //    var message = "License must have a Name (Click to close)";
            //    noty({
            //        text: message,
            //        type: 'error',
            //        timeout: false,
            //        layout: "top"

            //    });
            //};

            //// Check for Assignee
            //if (angular.isUndefined($scope.license.assignedToId)) {
            //    validated = false;
            //    var message = "License must have an assignee (Click to close)";
            //    noty({
            //        text: message,
            //        type: 'error',
            //        timeout: false,
            //        layout: "top"

            //    });
            //};

            //// Check for Licensee
            //if (angular.isUndefined($scope.license.licenseeId)) {
            //    validated = false;
            //    var message = "License must have a Licensee (Click to close)";
            //    noty({
            //        text: message,
            //        type: 'error',
            //        timeout: false,
            //        layout: "top"

            //    });

            //};

            //// Check for Contact
            //if (angular.isUndefined($scope.license.contactId)) {
            //    validated = false;
            //    var message = "License must have a Contact (Click to close)";
            //    noty({
            //        text: message,
            //        type: 'error',
            //        timeout: false,
            //        layout: "top"

            //    });

            //};

            // Check if passes validation
            if (validated) {
                $scope.license.modifiedDate = moment().format();
                $scope.license.createdDate = moment().format();
                if ($scope.IsEdit) {

                    licensesService.editLicense($scope.license).then(function (result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });

                            $scope.$parent.cancel();
                            //$state.go('SearchMyView.DetailLicense', { licenseId: result.data.licenseId });
                            $state.go('SearchMyView.DetailLicense', { licenseId: result.config.data.licenseId }).then(function() {
                                $state.reload();
                            });
                        }

                    }, function (error) { });
                } else {
                    licensesService.createLicense($scope.license).then(function (result) {
                        var message = "License saved";
                        if (result.data.licenseId == -1) {
                            message = "License name already exists.";
                            noty({
                                text: message,
                                type: 'error',
                                timeout: 2500,
                                layout: "top"
                            });
                        } else {
                            $scope.setParameter('selectedLicense', result.data);
                            noty({
                                text: message,
                                type: 'success',
                                timeout: 2500,
                                layout: "top"
                            });
                            $scope.$parent.cancel();
                            $state.go('SearchMyView.DetailLicense', { licenseId: result.data.licenseId });
                        }

                    }, function (error) {
                        var message = "License could not be saved, Error (passed validation) (click to close)";
                        noty({
                            text: message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    });
                };
            }; // validated


        };
        
        function setTime() {
            if ($scope.dt) {
                $scope.dt = moment($scope.dt).format("YYYY-MM-DD");
            }
            if ($scope.dtSigned) {
                $scope.dtSigned = moment($scope.dtSigned).format("YYYY-MM-DD");
            }
            if ($scope.dtReceived) {
                $scope.dtReceived = moment($scope.dtReceived).format("YYYY-MM-DD");
            }
            
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
        $scope.format = "MM/dd/yyyy";
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 0,
        };
    }]);