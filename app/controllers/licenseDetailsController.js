'use strict';
app.controller('licenseDetailsController', ['$scope', '$filter', 'licensesService', 'licenseProductsService', 'productsService', '$modal', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licenseStatusService', 'auditService', 'safeService', '$state', 'notyService', 'filesService', '$sce', 'smoothScroll', function ($scope, $filter, licensesService, licenseProductsService, productsService, $modal, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService, licenseStatusService, auditService, safeService, $state, notyService, filesService, $sce, smoothScroll) {
    $scope.dt =
    {
        from: null,
        to: null
    };
    $scope.auditTables = ["License", "LicenseProduct"];
    $scope.selectedTable = "Please Select";

    //http://spa.local/#/search-MyView/detail-License/9642/ownLicense  <-- Jeff! expando writers automatically expand... why?

    $scope.expandAll = true;


    $scope.safeauthentication = safeService.getAuthentication();
    var compareQrt = function (qrt1, qrt2) {
        var year1 = Number(qrt1.substr(2, 2));
        var year2 = Number(qrt2.substr(2, 2));
        var qrta = Number(qrt1.substr(0, 1));
        var qrtb = Number(qrt2.substr(0, 1));
        if (year1 < year2) {
            return true;
        }
        if (year1 > year2) {
            return false;
        }
        if (qrta < qrtb) {
            return true;
        }
        return false;
    }
    $scope.paidQuarterDisabled = true;
    var getSmallesQuarter = function (paidQrts) {
        var lreturn = paidQrts[0];
        if (lreturn != null) {
            for (var i = 1; i < paidQrts.length; i++) {
                if (paidQrts[i] != null) {
                    if (compareQrt(paidQrts[i], lreturn)) {
                        lreturn = paidQrts[i];
                    }
                }
            }
        }
        return lreturn;
    }


    function isInArray(arr, item) {
        if (arr == null) {
            return false;
        }
        for (var i = 0; i < arr.length; i++) {
            if (item == arr[i]) {
                return true;
            }
            return false;
        }

    }

    function removeWriterId(arr, item) {
        for (var i = arr.length; i--;) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }

    var removeWriterIdFromLocalStorage = function (id) {
        var collapsedData = localStorageService.get("collapseData");
        for (var i = 0; i < collapsedData.length; i++) {
            if (id === collapsedData[i]) {
                return true;
            }
        }
        collapsedData.push(recording.id);
        localStorageService.set("collapseData", collapsedData);
    }



    $scope.goToLastModified = function () {

        var storage = localStorageService.get("lastMod");
        if (storage === null) {
            return;
        } else {
            var options = {
                duration: 700,
                easing: 'easeInOutQuad', //originally it was 'easeInQuad'
                offset: 120
            }
            var writerElement = document.getElementById(storage);
            smoothScroll(writerElement, options);
        }
    }
    $scope.toggleCollapsedWriters = function () {
        if ($scope.expandAll) {
            $scope.expandAllWriters();
            $scope.expandAll = false;
        } else {
            $scope.collapseAllWriters();
            $scope.expandAll = true;
        }
    }

    var writerIdExists = function (array, writerId) {
        if (array == null) {
            return false;
        }
        for (var i = 0; i < array.length; i++) {
            if (writerId === array[i]) {
                return true;
            }
        }
        return false;
    }



    $scope.collapseAllWriters = function () {
        angular.forEach($scope.products,
            function (product) {
                angular.forEach(product.recordings,
                    function (recording) {
                        recording.writersCollapsed = true;
                    });
            });
        localStorageService.remove("lastMod");
        localStorageService.remove("collapseData");
    }

    $scope.expandAllWriters = function () {
        angular.forEach($scope.products,
            function (product) {
                angular.forEach(product.recordings,
                    function (recording) {
                        recording.writersCollapsed = false;
                        addToLocalStorage(recording.id, "collapseData");
                    });
            });
    }

    function addToLocalStorage(item, nameOfStorage) {
        var collapsedData = localStorageService.get(nameOfStorage);
        if (collapsedData === null) {
            collapsedData = [];
            addIdToLocalStorage(nameOfStorage, collapsedData, item);
        } else {
            addIdToLocalStorage(nameOfStorage, collapsedData, item);
        }
    }

    function addIdToLocalStorage(nameOfStorage, array, item) {
        if (!writerIdExists(array, item)) {
            array.push(item);
            localStorageService.set(nameOfStorage, array);
        }
    }

    var dateErrorMessage = function (evt) {
        var message = "Invalid Date, use mm/dd/yyyy format";
        noty({
            text: message,
            type: 'error',
            timeout: false,
            layout: "top"
        });
    }

    var isNotADate = function (date) {
        if (date.length != 10 || date.length == 0) {
            return true;
        }
    }



    var getProductByProductId = function (array, productId) {
        var products = $.parseJSON(JSON.stringify(array));
        for (var i = 0; i < products.length; i++) {
            if (products[i].productId == productId) {
                return products[i];
            } else {
                return null;
            }
        }
    };

    var getRecordingbyRecordingId = function (array, recordingId) {
        var recordings = $.parseJSON(JSON.stringify(array));
        for (var i = 0; i < recordings.length; i++) {
            if (recordings[i].id == recordingId) {
                return recordings[i];
            } else {
                return null;
            }
        }
    };

    $scope.$on("$stateChangeStart",
        function ($event, toState, toParams, fromState, fromParams) {

            var statesArray = fromState.name.split(".");
            var stateName = statesArray[statesArray.length - 1];
            if (stateName == "EditWriterRate" ||
                stateName == "WritersConsent" ||
                stateName == "PaidQuarter" ||
                stateName == "WritersIsIncluded") {
                if (fromParams.stateCallbackArguments != null) {
                    var args = fromParams.stateCallbackArguments;


                    var product = getProductByProductId($scope.products, args.productId);
                    //Jeff added this error handing

                    if (product == null || product.recordings == null) {
                        return;
                    }
                    var recording = getRecordingbyRecordingId(product.recordings, args.recordingId);
                    recording.licenseRecording.statusRollup = args.trackRollupDict;
                    recording.recStatRollup = [];
                    for (var k in args.trackRollupDict) {
                        if (args.trackRollupDict[k] > 0) {
                            recording.recStatRollup.push(k);
                        }

                    }
                    $scope.licenseDetail.statusesRollup = args.rollupDictionary;
                    for (var key in $scope.licenseDetail.statusesRollup) {
                        if ($scope.licenseDetail.statusesRollup[key] == 0) {
                            var newList = $scope.licenseDetail.licenseSpecialStatusList.filter(function (item) {
                                return item.lU_SpecialStatuses.specialStatus.toLowerCase() != key;
                            });
                            $scope.licenseDetail.licenseSpecialStatusList = newList;
                        }
                        var lStatus;
                        if ($scope.licenseDetail.licenseSpecialStatusList == null) {
                            lStatus = {
                                lU_SpecialStatuses: {
                                    specialStatus: ""
                                }
                            };
                            lStatus.lU_SpecialStatuses.specialStatus = key.toUpperCase();
                            $scope.licenseDetail.licenseSpecialStatusList = [];
                            $scope.licenseDetail.licenseSpecialStatusList.push(lStatus);
                        } else if ($scope.licenseDetail.statusesRollup[key] > 0 &&
                            $scope.licenseDetail.licenseSpecialStatusList.filter(function (item) {
                                return item.lU_SpecialStatuses.specialStatus.toLowerCase() == key;
                        })
                            .length ==
                            0) {
                            lStatus = {
                                lU_SpecialStatuses: {
                                    specialStatus: ""
                                }
                            };
                            lStatus.lU_SpecialStatuses.specialStatus = key.toUpperCase();
                            $scope.licenseDetail.licenseSpecialStatusList.push(lStatus);
                        }
                    }

                    switch (args.consent) {
                        case "Configuration":
                        case "Writer":
                        case "N/A":
                            if (args.paidQuarter) { ///// Paid Quarter changed
                                angular.forEach(product.recordings,
                                    function (recording) {
                                        angular.forEach(recording.licensePRWriters,
                                            function (licensePRWriter) {
                                                if (args.writer.name == licensePRWriter.name) { // same writer


                                                    for (var i = 0;
                                                        i < licensePRWriter.licenseProductRecordingWriter.rateList.length;
                                                        i++) {
                                                        if (args
                                                            .consent ==
                                                            "Configuration") { // apply for same configuration
                                                            if (
                                                                licensePRWriter.licenseProductRecordingWriter.rateList[i]
                                                                    .configuration_name ==
                                                                    args.configuration) {
                                                                licensePRWriter.licenseProductRecordingWriter
                                                                    .ratesByConfiguration[i].paidQuarter = args.paidQuarter;
                                                            }
                                                        } else {
                                                            // apply for same writer but not same configuration necessary
                                                            licensePRWriter.licenseProductRecordingWriter
                                                                .ratesByConfiguration[i].paidQuarter = args.paidQuarter;
                                                        }
                                                    }


                                                }
                                            });
                                    });
                            } else if (!angular.isUndefined(args.isIncluded)) { ///// Include/Exclude Writer changed
                                angular.forEach(product.recordings,
                                    function (recording) {
                                        angular.forEach(recording.licensePRWriters,
                                            function (licensePRWriter) {
                                                if (args.writer.name == licensePRWriter.name) { // same writer
                                                    angular.forEach(licensePRWriter.licenseProductRecordingWriter.rateList,
                                                        function (rateList) {
                                                            if (args.consent == "Configuration") {
                                                                // apply for same configuration
                                                                if (rateList.configuration_name == args.configuration) {
                                                                    rateList.writerRateInclude = args.isIncluded;
                                                                }
                                                            } else {
                                                                // apply for same writer but not same configuration necessary
                                                                rateList.writerRateInclude = args.isIncluded;
                                                            }
                                                        });
                                                }
                                            });
                                    });
                            } else { ///// Consent changed
                                angular.forEach(product.recordings,
                                    function (recording) {
                                        angular.forEach(recording.licensePRWriters,
                                            function (licensePRWriter) {
                                                if (args.writer.name == licensePRWriter.name) { // same writer
                                                    angular.forEach(licensePRWriter.licenseProductRecordingWriter.rateList,
                                                        function (rateList) {
                                                            if (args.consent == "Configuration") {
                                                                // apply for same configuration
                                                                if (rateList.configuration_name == args.configuration) {
                                                                    rateList.writersConsentType
                                                                        .writersConsentType = args.consent;
                                                                }
                                                            } else {
                                                                // apply for same writer but not same configuration necessary
                                                                rateList.writersConsentType
                                                                .writersConsentType = args.consent;
                                                            }
                                                        });
                                                }
                                            });
                                    });
                            }

                    }


                    //var writerIndex = 0;
                    // for (var i = 0; i < recording.licensePRWriters.length; i++) {
                    //    var writer = recording.licensePRWriters[i];
                    //    if (writer.licenseProductRecordingWriter.licenseWriterId == args.writer.licenseProductRecordingWriter.licenseWriterId) recording.licensePRWriters[i] = args.writer;
                    //}
                    licenseProductsService
                        .getLicenseWritersV2(recording.licenseRecording.licenseRecordingId,
                            recording.track.copyrights[0].workCode)
                        .then(function (result) {
                            var response = result.data;
                            angular.forEach(result.data,
                                function (item) {
                                    var escaladedCount = 0;
                                    var statPerCount = 0;

                                    if (item.licenseProductRecordingWriter != null) {

                                        //add rateList.configuration_upc here
                                        angular.forEach(item.licenseProductRecordingWriter.rateList,
                                            function (rateList) {
                                                rateList
                                                    .configuration_upc =
                                                    getProductConfigurationUpc(rateList.product_configuration_id);
                                            });

                                        item.licenseProductRecordingWriter.ratesByConfiguration = $scope
                                            .groupByConfigurations(item.licenseProductRecordingWriter.rateList);
                                        angular.forEach(item.licenseProductRecordingWriter.ratesByConfiguration,
                                            function (rate) {
                                                if (rate.paidQuarter == null) rate.paidQuarter = "N/A";
                                                if (rate.rates[0].rateTypeId == 2 || rate.rates[0].rateTypeId == 5) {
                                                    escaladedCount++;
                                                }
                                                switch (rate.rates[0].rateTypeId) {
                                                    case 3:
                                                    case 4:
                                                    case 6:
                                                    case 7:
                                                    case 10:
                                                    case 11:
                                                        statPerCount++;
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            });

                                    }
                                    if (escaladedCount > 0) {
                                        item.escalatedRateVisible = true;
                                    } else {
                                        item.escalatedRateVisible = false;
                                    }
                                    if (statPerCount > 0) {
                                        item.statPrcentageVisible = true;
                                    } else {
                                        item.statPrcentageVisible = false;
                                    }
                                    angular.forEach(item.originalPublishers,
                                        function (publisher) {
                                            publisher.SeExists = false;
                                            publisher.zeroValue = false;
                                            angular.forEach(publisher.administrators,
                                                function (subpub) {
                                                    var lpub = angular.toJson(publisher);
                                                    var llpub = angular.fromJson(lpub);
                                                    subpub.pub = llpub;
                                                    if (subpub.capacityCode == "SE") {
                                                        publisher.SeExists = true;
                                                    }
                                                    if (subpub.mechanicalCollectablePercentage == 0) {
                                                        publisher.zeroValue = true;
                                                    } else {
                                                        publisher.zeroValue = false;
                                                    }
                                                    if (subpub.name == publisher.name) {
                                                        publisher.sameName = true;
                                                    }
                                                });
                                        });
                                });

                            recording.licensePRWriters = result.data;

                            $scope.updateRecAndProdPaidQtr(product);

                        });
                }
            }

            if (stateName == "UploadDocument") {
                if (fromParams.stateCallbackArguments != null) {
                    $scope.populatelicenseAttachments($stateParams.licenseId);
                }
            }
            if (stateName == "GenerateDocument") {
                if (fromParams.stateCallbackArguments != null) {
                    $scope.populatelicenseAttachments($stateParams.licenseId);
                }
            }

            if (stateName == "ExecuteDocument") {
                if (fromParams.stateCallbackArguments != null) {
                    $scope.populatelicenseAttachments($stateParams.licenseId);
                }
            }

            if (stateName == "WritersConsent") {
                if (fromParams.stateCallbackArguments != null) {
                    $scope.populatelicenseAttachments($stateParams.licenseId);
                }
            }
        });


    $scope.updateRecAndProdPaidQtr = function (product) {
        var paidQuarters = [];
        var recPaidQuarters = [];
        var haveAPaidQuarter = false;
        var smallPaidQuarter = null;
        try {
            for (var i = 0; i < product.recordings.length; i++) {
                paidQuarters = [];
                if (product.recordings[i].licensePRWriters) {
                    for (var j = 0; j < product.recordings[i].licensePRWriters.length; j++) {
                        angular.forEach(product.recordings[i].licensePRWriters[j].licenseProductRecordingWriter
                            .ratesByConfiguration,
                            function (ratesByConfiguration) {
                                if (ratesByConfiguration.paidQuarter != "N/A") {
                                    paidQuarters.push(ratesByConfiguration.paidQuarter);
                                }
                            });
                    }
                }
                //BUG: Tom and Jeff reviewed this.  
                //Notes: Working Properly.  Find out why method is never hit.  
                if (paidQuarters.length) {
                    haveAPaidQuarter = true;
                    smallPaidQuarter = getSmallesQuarter(paidQuarters);
                    product.recordings[i].licenseRecording.paidQuarter = smallPaidQuarter;
                    recPaidQuarters.push(smallPaidQuarter);
                }
                    //Jeff, for some reason this gets hit, and the paidQuarter is repopulated w/ line: 308
                else {
                    //   product.recordings[i].licenseRecording.paidQuarter = "";
                    product.recordings[i].licenseRecording
                        .paidQuarter = product.recordings[i].licenseRecording.paidQuarter; //this line of code fixes it
                }
            }
            product.paidQuarter = getSmallesQuarter(recPaidQuarters);
            if (!haveAPaidQuarter) {
                product.paidQuarter = "";
            }
        } catch (e) {
            console.log("One of these tracks has a paidQuarter of N/A. " + e.message);
        }

        /* Jeff Look here http://blog.jetbrains.com/dotnet/2014/07/24/unusual-ways-of-boosting-up-app-performance-lambdas-and-linqs/
        //http://stackoverflow.com/questions/2433679/refactoring-nested-foreach-statement
            1) fix the long runing requests on the backend. 
            2) refactor of the frontend code : dont compute stuff in loops of loops of loops. use api to compute and get data with caching even if you have to
            create new endpoints.
            3) investigate licenseProductsService.getLicenseWritersV2
            4) use one way bindings, avoid computing inside the view
        */

    }

    $scope.auditDetail = {
        licenseAudit: [],
        licenseProductAudit: []
    };
    //  $scope.scheduleList = loadSchedules();  | Uncomment to load upfront
    $scope.scheduleList = [];
    $scope.licenseDetail = {
    };
    $scope.buttons = {
        proformaLicense: false,
        holdLicense: false,
        voidLicense: false,
        issueLicense: false,
        executeLicense: false,
        createLicense: true,
        editLicense: false,
        addRemoveProducts: false,
        editConfig: false,
        editRates: false,
        generateDocument: false,
        verifyLicense: false,
        addendumLicense: false,
        deleteLicense: false,
        acceptLicense: false,
        rejectLicense: false,
        copyLicense: false,
        addNotes: false,
        editNotes: false,
        deleteNotes: false,
        addAttachment: false,
        downloadAttachment: false,
        deleteAttachment: false,
        writerConsentBtn: false,
        writerNoteBtn: false,
        editIndividualRates: false,
    };

    $scope.proformaButtonName = "ProForma";
    $scope.holdButtonName = "Hold";
    $scope.voidButtonName = "Void";
    $scope.verifyButtonName = "Verify";
    $scope.addendumButtonName = "Addendum";
    $scope.deleteButtonName = "Delete";
    $scope.acceptButtonName = "Accept";
    $scope.RejectButtonName = "Reject";
    $scope.copyButtonName = "Copy";

    var trackStorage = localStorageService.get("trackColl");
    if (trackStorage == null || trackStorage) {
        $scope.isCollapsed = true;
    } else {
        $scope.isCollapsed = false;
    }

    var licenseId = $stateParams.licenseId;
    $scope.products = [];
    $scope.productConfigurations = [];
    $scope.licenseStatuses = [];
    $scope.writerFilters = [];
    $scope.licenseAttachments = [];
    $scope.writerNote = "";
    $scope.currentWriteNoteId = "";

    $scope.populatelicenseAttachments = function (licenseId) {
        licensesService.getlicenseAttachments(licenseId)
            .then(function (result) {
                $scope.licenseAttachments = result.data;
                angular.forEach($scope.licenseAttachments,
                    function (attach) {
                        attach.selected = false;
                    });
            });
    }

    $scope.populatelicenseAttachments(licenseId);

    $scope.licenseAttachmentsTabClick = function () {
        if ($scope.licenseAttachments == null)
            $scope.populatelicenseAttachments(licenseId);
    }


    $scope.openAssignModal = function (size, caller) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-AssignPriority.html',
            controller: 'assignPriorityController',
            size: size,
            resolve: {
                data: function () {
                    return [$scope.licenseDetail];
                },
                caller: function () {
                    return caller;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.loadDetail();
        },
    function () {

    });

    };

    $scope.setCaret = function (collapsed) {
        if (collapsed == true) {
            return "caret";
        } else {
            return "caret caret-up";
        }
    }
    $scope.isScheduleCollapsed = true;
    $scope.isSelectWritersCollapsed = true;

    $scope.writerBackground2 = function (controlled) {
        if (controlled == true) {
            return "'background-color:#B2FF7F'";
        } else {
            return "";
        }
    }

    $scope.writerBackground = function (controlled) {
        if (controlled == true) {
            return "{'background-color':'#B2FF7F'}";
        } else {
            return "";
        }
    }

    $scope.writerFilter = function (writer) {
        if ($scope.selectedWriterFilter.Name == "Controlled Writers") {
            if (writer.controlled == true) {
                return true;
            } else {
                return false;
            }
        }
        if ($scope.selectedWriterFilter.Name == "Uncontrolled Writers") {
            if (writer.controlled == false) {
                return true;
            } else {
                return false;
            }
        }
        if ($scope.selectedWriterFilter.Name == "Licensed Writers") {
            if (writer.licenseProductRecordingWriter.isLicensed) {
                return true;
            } else {
                return false;
            }
        }
        if ($scope.selectedWriterFilter.Name == "Unlicensed Writers") {
            if (!writer.licenseProductRecordingWriter.isLicensed) {
                return true;
            } else {
                return false;
            }
        }

        return true;


    }


    $scope.openEditConfigurations = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-EditConfigs.html',
            controller: 'editConfigurationsController',
            size: size,
            resolve: {
                data: function () {
                    return [$scope.products];
                }
            }
            //resolve: {
            //    data: function () {
            //        return [$scope.licenseDetail];
            //    }
            //}
        });

        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        },
function () {

});

    };


    $scope.checkRecordings2 = function (isCollapsed, productId) {
        var licensedRollup = 0;
        var umpgRollup = 0;
        if (!isCollapsed) {
            var safeId = "";
            if ($scope.safeauthentication) {
                safeId = $scope.safeauthentication.safeId;
            }
            //licenseProductsService.getLicenseProductRecordingsV2(productId, safeId).then(function (result) {
            angular.forEach($scope.products,
                function (product) {
                    licensedRollup = 0;
                    umpgRollup = 0;
                    if (product.licenseProductId == productId) {
                        angular.forEach(product.recordings,
                            function (value) {
                                try {
                                    if (value.track.copyrights.length != 0) {
                                        angular.forEach(value.track.copyrights,
                                            function (copyright) {
                                                if (copyright.sampledWorks && copyright.sampledWorks.length > 0) {
                                                    value.hasSample = true;
                                                } else {
                                                    value.hasSample = false;
                                                }
                                            });
                                    }
                                } catch (e) {
                                    console.log("A track has no copyrights. " + e.message);
                                }
                                //value.writersCollapsed = true;
                                value.writersCollapsed = false;
                                licensedRollup += parseFloat(value.licensedRollup);
                                umpgRollup += parseFloat(value.umpgPercentageRollup);
                                var statList = [];
                                if (value.licenseRecording != null) {
                                    for (var key in value.licenseRecording.statusRollup) {
                                        statList.push(key);
                                    }
                                }
                                value.recStatRollup = statList;
                            });
                        //product.recordings = result.data;

                        product.licensedRollup = licensedRollup;
                        product.umpgRollup = umpgRollup;

                    }
                });
            $scope.selectWriterFilter($scope.selectedWriterFilter);
            // });
        }
    };


    $scope.toggleProductCollapse = function (product) {
        //product does not have property, check if it is in local storage, if it is remove it.  then collapse the writer. (usually on page load)
        if (product.isCollapsed == null || product.isCollapsed == undefined) {
            var productCollapsedData = localStorageService.get("productCollapseData");
            if (productCollapsedData != null) {
                if (productCollapsedData.length != null && productCollapsedData.length >= 1) {
                    if (isInArray(productCollapsedData, product.licenseProductId)) {
                        removeWriterId(productCollapsedData, product.licenseProductId);
                        localStorageService.set("productCollapseData", productCollapsedData);
                    }
                }
            }
            product.isCollapsed = true;
            //Product was previosuly collapsed, now is requesting to be open.  Save the id to local storage, and set isCollapsed to false
        } else if (product.isCollapsed === true) {
            var productCollapsedData1 = localStorageService.get("productCollapseData");
            if (!isInArray(productCollapsedData1, product.licenseProductId)) {
                if (productCollapsedData1 == null) {
                    var array = [];
                    if (product.licenseProductId)
                        array.push(product.licenseProductId);
                    localStorageService.set("productCollapseData", array);
                } else {
                    productCollapsedData1.push(product.licenseProductId);
                    localStorageService.set("productCollapseData", productCollapsedData1);
                }
            }
            product.isCollapsed = false;
            //product was previosuly open, now requesting to be closed.  Check if id is in array, remove it from array.  Save the modified array.  Set collapsed to true;
        } else if (product.isCollapsed === false) {
            var productCollapsedData2 = localStorageService.get("productCollapseData");
            if (productCollapsedData2 == null) {
                return console.log("Error: localStorageService: productCollapseData is null");
            }
            for (var i = 0; i < productCollapsedData2.length; i++) {
                if (product.licenseProductId === productCollapsedData2[i]) {
                    removeWriterId(productCollapsedData2, product.licenseProductId);
                    localStorageService.set("productCollapseData", productCollapsedData2);
                }
            }
            product.isCollapsed = true;
        }
    };

    $scope.checkRecordings = function (isCollapsed, productId) {
        $scope.isCollapsed = !isCollapsed;

        localStorageService.remove("trackColl");
        localStorageService.set("trackColl", isCollapsed);

        var licensedRollup = 0;
        var umpgRollup = 0;
        if (!isCollapsed) {
            var safeId = "";
            if ($scope.safeauthentication) {
                safeId = $scope.safeauthentication.safeId;
            }
            //licenseProductsService.getLicenseProductRecordingsV2(productId, safeId).then(function (result) {
            angular.forEach($scope.products,
            function (product) {
                licensedRollup = 0;
                umpgRollup = 0;
                if (product.licenseProductId == productId) {
                    angular.forEach(product.recordings,
                        function (value) {
                            try {
                                if (value.track.copyrights.length != 0) {
                                    angular.forEach(value.track.copyrights,
                                        function (copyright) {
                                            if (copyright.sampledWorks && copyright.sampledWorks.length > 0) {
                                                value.hasSample = true;
                                            } else {
                                                value.hasSample = false;
                                            }
                                        });
                                }
                            } catch (e) {
                                console.log("A track has no copyrights. " + e.message);
                            }
                            if (value.writersCollapsed === true || value.writersCollapsed === null || value.writersCollapsed === undefined) {
                                value.writersCollapsed = true;
                            } else if (value.writersCollapsed === false) {
                                value.writersCollapsed = false;
                            }


                            licensedRollup += parseFloat(value.licensedRollup);
                            umpgRollup += parseFloat(value.umpgPercentageRollup);
                            var statList = [];
                            if (value.licenseRecording != null) {
                                for (var key in value.licenseRecording.statusRollup) {
                                    statList.push(key);
                                }
                            }
                            value.recStatRollup = statList;
                        });
                    //product.recordings = result.data;

                    product.licensedRollup = licensedRollup;
                    product.umpgRollup = umpgRollup;

                }
            });
            $scope.selectWriterFilter($scope.selectedWriterFilter);
            // });
        }
    };

    $scope.collapseWriters = function (recording) { //Depreciated.

        if (recording.writersCollapsed) {

            licenseProductsService.getLicenseWritersV2(recording.licenseRecording.licenseRecordingId,
                    recording.track.copyrights[0].workCode)
                .then(function (result) {
                    var response = result.data;
                    angular.forEach(result.data,
                        function (item) {

                            var escaladedCount = 0;
                            var statPerCount = 0;
                            if (item.licenseProductRecordingWriter != null) {

                                //add rateList.configuration_upc here
                                angular.forEach(item.licenseProductRecordingWriter.rateList,
                                    function (rateList) {
                                        rateList
                                            .configuration_upc =
                                            getProductConfigurationUpc(rateList.product_configuration_id);
                                    });

                                item.licenseProductRecordingWriter.ratesByConfiguration = $scope
                                    .groupByConfigurations(item.licenseProductRecordingWriter.rateList);
                                angular.forEach(item.licenseProductRecordingWriter.ratesByConfiguration,
                                    function (rate) {
                                        if (rate.paidQuarter == null) rate.paidQuarter = "N/A";
                                        if (rate.rates[0].rateTypeId == 2 || rate.rates[0].rateTypeId == 5) {
                                            escaladedCount++;
                                        }
                                        switch (rate.rates[0].rateTypeId) {
                                            case 3:
                                            case 4:
                                            case 6:
                                            case 7:
                                            case 10:
                                            case 11:
                                                statPerCount++;
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                            }
                            if (escaladedCount > 0) {
                                item.escalatedRateVisible = true;
                            } else {
                                item.escalatedRateVisible = false;
                            }
                            if (statPerCount > 0) {
                                item.statPrcentageVisible = true;
                            } else {
                                item.statPrcentageVisible = false;
                            }
                            angular.forEach(item.originalPublishers,
                                function (publisher) {
                                    publisher.SeExists = false;
                                    publisher.zeroValue = false;
                                    angular.forEach(publisher.administrators,
                                        function (subpub) {
                                            var lpub = angular.toJson(publisher);
                                            var llpub = angular.fromJson(lpub);
                                            subpub.pub = llpub;
                                            if (subpub.capacityCode == "SE") {
                                                publisher.SeExists = true;
                                            }
                                            if (subpub.mechanicalCollectablePercentage == 0) {
                                                publisher.zeroValue = true;
                                            } else {
                                                publisher.zeroValue = false;
                                            }
                                            if (subpub.name == publisher.name) {
                                                publisher.sameName = true;
                                            }
                                        });
                                });

                        });

                    recording.licensePRWriters = result.data;
                    var product = USL.Common.FirstInArray($scope.products, 'productId', recording.productId);
                    $scope.updateRecAndProdPaidQtr(product); //problem method

                });

        }

        recording.writersCollapsed = !recording.writersCollapsed;

    }

    var toPercent = function (x) {
        return ((x / 100) * 100).toFixed(2) + '%';
    }

    var ifNullBlank = function (x) {
        if (x == null || x === "null") {
            return "";
        } else {
            return x;
        }

    }
    var ifNullZero = function (x) {
        if (x == null || x === "null") {
            return "0";
        } else {
            return x;
        }

    }

    var ifNullNA = function (x) {
        if (x == null || x == "" || x == undefined) {
            return "N/A";
        } else {
            return x;
        }
    }

    function getFormattedDate(date) {
        date = new Date(date);
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return month + '/' + day + '/' + year;
    }

    var ifNullDateBlank = function (x) {
        if (x == null || x == "null") {
            return "";
        } else {
            return getFormattedDate(x);
        }
    }


    $scope.getRecordingWriters = function (recording, recordingIndex, productIndex) {
        recording.writerHtml = "";

        //this toggles recording open and closed
        if (recording.writersCollapsed == null || recording.writersCollapsed == undefined) {
            var collapsedData1 = localStorageService.get("collapseData");
            if (collapsedData1 != null) {
                //check if id is in local storage, if it is, remove it.
                for (var i = 0; i < collapsedData1.length; i++) {
                    if (recording.id === collapsedData1[i]) {
                        recording.writersCollapsed = false;
                    }
                }
            }
            recording.writersCollapsed = true;
        }





        //_____Writer Region___START__
        angular.forEach(recording.writers,
            function (item) {

                var escaladedCount = 0;
                var statPerCount = 0;
                if (item.licenseProductRecordingWriter != null) {

                    //add rateList.configuration_upc here
                    angular.forEach(item.licenseProductRecordingWriter.rateList,
                        function (rateList) {
                            rateList.configuration_upc = getProductConfigurationUpc(rateList.product_configuration_id);
                        });

                    item.licenseProductRecordingWriter.ratesByConfiguration = $scope
                        .groupByConfigurations(item.licenseProductRecordingWriter.rateList);
                    angular.forEach(item.licenseProductRecordingWriter.ratesByConfiguration,
                        function (rate) {

                            if (rate.paidQuarter == null) rate.paidQuarter = "N/A";
                            if (rate.rates[0].rateTypeId == 2 || rate.rates[0].rateTypeId == 5) {
                                escaladedCount++;
                            }
                            switch (rate.rates[0].rateTypeId) {
                                case 3:
                                case 4:
                                case 6:
                                case 7:
                                case 10:
                                case 11:
                                    statPerCount++;
                                    break;
                                default:
                                    break;
                            }

                        });
                }
                if (escaladedCount > 0) {
                    item.escalatedRateVisible = true;
                } else {
                    item.escalatedRateVisible = false;
                }
                if (statPerCount > 0) {
                    item.statPrcentageVisible = true;
                } else {
                    item.statPrcentageVisible = false;
                }
                angular.forEach(item.originalPublishers,
                    function (publisher) {

                        publisher.SeExists = false;
                        publisher.zeroValue = false;
                        angular.forEach(publisher.administrators,
                            function (subpub) {
                                var lpub = angular.toJson(publisher);
                                var llpub = angular.fromJson(lpub);
                                subpub.pub = llpub;
                                if (subpub.capacityCode == "SE") {
                                    publisher.SeExists = true;
                                }
                                if (subpub.mechanicalCollectablePercentage == 0) {
                                    publisher.zeroValue = true;
                                } else {
                                    publisher.zeroValue = false;
                                }
                                if (subpub.name == publisher.name) {
                                    publisher.sameName = true;
                                }
                            });
                    });

            });

        recording.licensePRWriters = recording.writers;
        var product = USL.Common.FirstInArray($scope.products, 'productId', recording.productId);
        $scope.updateRecAndProdPaidQtr(product);

        var ww = "";
        var writer_row_id = 0;
        var controlled = 0;
        var licensed = 0;
        var writerIndex = 0;


        var collapsedData = localStorageService.get("collapseData");
        if (collapsedData != null) {
            if (writerIdExists(collapsedData, recording.id)) {
                recording.writersCollapsed = false;
            }
        }


        recording.licensePRWriterCount = 0;
        angular.forEach(recording.licensePRWriters,
            function (writer, i_writer) {
                if ($scope.writerFilter(writer)) {
                    recording.licensePRWriterCount += 1;
                    if (writer.controlled) {
                        controlled = true;
                    } else {
                        controlled = false;
                    }

                    //need to set licensed
                    writer_row_id++;

                    var l = $scope.licenseDetail;

                    var w = "";

                    w += "<tr id='" +
                        writer_row_id +
                        "' style=" +
                        $scope.writerBackground2(writer.controlled) +
                        " class='details-writer-row' controlled='" +
                        controlled +
                        "' licensed='" +
                        licensed +
                        "'>";

                    w += "  <td class='ten-percent top'>" +
                        "   <span><strong>" +
                        writer.name +
                        "</strong></span> " +
                        "  </td>";

                    w += "  <td class='one-percent top'>";
                    if ($scope.isSampleWriter(writer.name, recording.track.copyrights)) {
                        w += "  <span class='badge sample pull-right'>SAMPLE</span>";
                    }
                    w += "  </td>";


                    w += "<td class='twentyfive-percent top'>";
                    angular.forEach(writer.originalPublishers,
                        function (originalPublisher) {
                            //check for zero value false
                            angular.forEach(originalPublisher.administrators,
                                function (administrator) {
                                    w += "<span class='float-left-subpub'>";

                                    if (!originalPublisher.SeExists &&
                                        administrator.capacityCode == 'AM' &&
                                        !originalPublisher.zeroValue) {
                                        w += "<span>";
                                        w += "<span>" +
                                            administrator.name +
                                            "</span><span style='margin-left: 4px; margin-right: 4px'>/</span>";
                                        w += "<span>" + administrator.pub.name + "</span>";
                                        angular.forEach(administrator.pub.affiliations,
                                            function (affiliation) {
                                                //filter:{incomeGroup:"Performance"}
                                                w += "<span>";
                                                angular.forEach(affiliation.affiliations,
                                                    function (a) {
                                                        w += "(<span>" + a.societyAcronym + "</span>)";
                                                    });
                                                w += "</span>";
                                            });
                                        w += "</span>";
                                    }
                                    if (originalPublisher.SeExists &&
                                        administrator.capacityCode == "SE" &&
                                                    !originalPublisher.zeroValue) {
                                        w += "<span>";
                                        w += "<span>" + administrator.name + "</span>";
                                        angular.forEach(administrator.affiliations,
                                function (affiliation) {
                                    //filter:{incomeGroup:"Performance"
                                    w += "<span>";
                                    angular.forEach(affiliation.affiliations,
                                        function (a) {
                                            w += "(<span>" + a.societyAcronym + "</span>)";
                                        });
                                    w += "<span style='margin-left: 4px; margin-right: 4px'>/</span>";
                                    w += "<span>" + administrator.pub.name + "</span>";
                                    w += "</span>";
                                });
                                        w += "</span>";
                                    }
                                    w += "<br />";
                                    w += "</span>";
                                });
                        });
                    w += "<div></div>";
                    w += "</td>";

                    if (recording.track.claimException == true) {
                        w += "<td class='ten-percent top'>";
                        //if (recording.track.claimException == true) {
                        //<!-- Override -->
                        w += "<span>";
                        if (writer.licenseProductRecordingWriter.claimExceptionOverride != null) {
                            w += "<span>" + writer.licenseProductRecordingWriter.claimExceptionOverride + "</span>";
                            // | percentage:2
                        }
                        w += "</span>";
                        // }
                        w += "</td>";
                    }

                    w += "<td class='ten-percent top'>";
                    //<!-- Override -->
                    if (writer.licenseProductRecordingWriter.splitOverride >= 0 &&
                    writer.licenseProductRecordingWriter.splitOverride != null) {
                        w += "<span class='strike-through'>";
                        w += "<span><strong>" + toPercent(writer.contribution) + "</strong></span>";
                        //| percentage:2
                        w += "</span>";
                    }
                    if (writer.licenseProductRecordingWriter.splitOverride >= 0 &&
                        writer.licenseProductRecordingWriter.splitOverride != null) {
                        w += "<span class='override'>";
                        w += "<span><strong>" +
                            toPercent(writer.licenseProductRecordingWriter.splitOverride) +
                            "</strong></span>";
                        //| percentage:2
                        w += "</span>";
                    }
                    //<!-- No Override -->
                    if (writer.licenseProductRecordingWriter.splitOverride == null) {
                        w += "<span>";
                        w += "<span><strong>" + toPercent(writer.contribution) + "</strong></span>";
                        // | percentage:2
                        w += "</span>";
                    }
                    w += "</td>";

                    if ($scope.licenseDetail.licenseStatusId == 5 || $scope.licenseDetail.licenseStatusId == 7) {
                        w += "<td class='ten-percent top'>";
                        if (writer.licenseProductRecordingWriter.executedSplit >= 0) {
                            w += "<div><span><strong>" +
                                toPercent(writer.licenseProductRecordingWriter.executedSplit) +
                                "</span></div>";
                            // | percentage:2
                        }
                        w += "</td>";
                    }


                    w += "<td class='twentyeight-percent top'>";
                    w += "<span>" + ifNullBlank(writer.licenseProductRecordingWriter.mostRecentNote) + "</span>";
                    w += "</td>";

                    w += "<td class='one-percent top'>";
                    if ($scope.buttons.writerNoteBtn && writer.controlled) {
                        if (writer.licenseProductRecordingWriter.writerNoteCount > 0) {

                            //Single Quote problem area.  All JSON stringify
                            w +=
                            //   "<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm' ng-click='collapseWriterNotes(" + JSON.stringify(writer).replace(/'/g, "")  + "," + JSON.stringify(recording) + ")' >";
                            //"<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm' ng-click='collapseWriterNotes(" + JSON.stringify(writer) + "," + JSON.stringify(recording.id) + ");' >";
 "<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm' ng-click='collapseWriterNotes(" + JSON.stringify(writer).replace(/'/g, "skkk") + "," + JSON.stringify(recording.id) + ");' >";
                            w += "<span>" +
                                writer.licenseProductRecordingWriter.writerNoteCount +
                                "</span><span class='caret'></span></button>";
                        }
                        if (writer.licenseProductRecordingWriter.writerNoteCount == 0) {

                            w +=
                                //"<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm notes-btn'  ng-click='GoAddWriterNote(" + JSON.stringify(writer).replace(/'/g, "")  +","+ JSON.stringify(recording)+ ")'>";
     //"<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm notes-btn'  ng-click='GoAddWriterNote(" + JSON.stringify(writer).replace(/'/g, "") .replace(/'/g, "") + "," + JSON.stringify(recording.id) + ")'>";
"<button security actions='LicenseDetailWriterNote' class='btn btn-default btn-sm notes-btn'  ng-click='GoAddWriterNote(" + JSON.stringify(writer) + "," + JSON.stringify(recording.id) + ")'>";
                            w += "New Note<span class='caret'></span></button>";
                        }
                    }
                    w += "</td>";

                    w += "<td class='one-percent top'>";
                    if ($scope.buttons.editIndividualRates && writer.controlled) {

                        w += "<button class='btn btn-default btn-sm' security actions='LicenseDetailEditIndivdualRate'";

                        w +=
                            " ng-click='editWriterRate3(licenseDetail, licenseDetail.licenseTypeId, licenseDetail.licenseId, " + JSON.stringify(writer).replace(/'/g, "") + ", product.productId, recording.id, recording.track.duration,recording.track.claimException,licenseDetail.statusesRollup,recording.licenseRecording.statusRollup)'>Edit Rates</button>";
                    }
                    w += "</td>";
                    w += "</tr>";

                    w += "<tr controlled='" + controlled + "'>";
                    w += "<td colspan='12' class='table writer-notes' collapse='" + !writer.writerNotesCollapsed + "'>";


                    if (writer.licenseProductRecordingWriter.writerNotes.length == 0) {
                        w += "<table class='table' security actions='LicenseDetailWriterNote'>";
                        w += "    <tr>";
                        w +=
                            "        <td><textarea class='writer-note' ng-model-options='{debounce:1000}' ng-model='writer.newWriterNote'></textarea></td>";
                        w += "        <td class='one-percent top no-wrap'>";
                        w += "            <button class='btn btn-default btn-sm narrow' ng-click='saveWriterNote(" +
                            JSON.stringify(writer).replace(/'/g, "") +
                            ", 43, {}, " +
                            JSON.stringify(writer.newWriterNote) +
                            ", -1)' ng-disabled='" +
                            JSON.stringify(writer.newWriterNote) +
                            "| isEmpty'><span class='icon save'></span></button>";
                        w += "        </td>";
                        w += "    </tr>";
                        w += "</table>";
                    }

                    if (writer.licenseProductRecordingWriter.writerNotes.length > 0) {
                        w +=
                            "<table class='table' security actions='LicenseDetailWriterNote'>";
                        w += "    <thead>";
                        w += "    <tr>";
                        w += "        <th class='ten-percent'>Created Date</th>";
                        w += "        <th class='fifteen-percent'>Created By</th>";
                        w += "        <th class='seventyfive-percent'>Note</th>";
                        w += "        <th class='ten-percent centered'>Actions</th>";
                        w += "    </tr>";
                        w += "    </thead>";
                        w += "    <tbody>";

                        angular.forEach(writer.licenseProductRecordingWriter.writerNotes,
                            function (writernote) {
                                w += "    <tr>";
                                w += "        <td class='ten-percent top'><span>" +
                                    writernote.createdDate +
                                    "</span></td>";
                                //| timezone | date:'MM/dd/yyyy'
                                w += "        <td class='fifteen-percent top'><span>" +
                                    writernote.createdBy +
                                    "</span></td>";
                                w += "        <td class='seventyfive-percent top'><span> " +
                                    writernote.note +
                                    "</span></td>";
                                w += "        <td class='ten-percent top no-wrap'>";
                                if ($scope.buttons.writerNoteBtn && writer.controlled) {
                                    w +=
                                        "            <button class='btn btn-default btn-sm narrow' title='New Note' ng-click='collapseWriterAddNotes(" + JSON.stringify(writer).replace(/'/g, "") + ", " + JSON.stringify(writernote) + ")'><span class='icon add-note'></span></button>";
                                    w +=
                                        "            <button class='btn btn-default btn-sm narrow' title='Edit Note' ng-click='collapseEditNote(" + JSON.stringify(writer).replace(/'/g, "") + ", " + JSON.stringify(writernote) + ")'><span class='icon edit'></span></button>";
                                    w +=
                                        "            <button class='btn btn-default btn-sm narrow' title='Delete Note' ng-click='removeWriterNote(" + JSON.stringify(writer).replace(/'/g, "") + ", " + JSON.stringify(writernote.licenseWriterNoteId) + ")'><span class='icon delete'></span></button>";
                                    w += "            <input type='hidden' ng-model='currentWriteNoteId'/>";
                                }
                                w += "        </td>";
                                w += "    </tr>";
                            });
                        w += "    <tr>";
                        if (writer.editNoteVisible) {
                            w += "        <td class='writer-add-note' colspan='12'>";
                            w += "            <table class='table writer-notes'>";
                            w += "                <tr>";
                            w +=
                                "                    <td class='onehundred-percent'><textarea class='writer-note' ng-model-options='{debounce:1000}' ng-model='writernote.editNoteValue'></textarea></td>";
                            w += "                    <td class='one-percent no-wrap'>";
                            w +=
                                "                        <button class='btn btn-default btn-sm narrow' ng-click='saveWriterNote(writer, 43, writernote, writernote.editNoteValue,writernote.licenseWriterNoteId)' ng-disabled='writernote.editNoteValue | isEmpty'><span class='icon save'></span></button>";
                            w += "                    </td>";
                            w += "                </tr>";
                            w += "            </table>";
                            w += "        </td>";
                        }
                        w += "    </tr>";
                        w += "    <tr>";

                        if (writer.addNewNoteVisible) {
                            w += "        <td class='writer-add-note' colspan='12'new>";
                            w += "            <table class='table writer-notes'>";
                            w += "                <tr>";
                            w +=
                                "                    <td class='onehundred-percent'><textarea class='writer-note' ng-model-options='{debounce:1000}' ng-model='writer.newWriterNote'></textarea></td>";
                            w += "                    <td class='one-percent no-wrap'>";
                            w +=
                                "                        <button class='btn btn-default btn-sm narrow' ng-click='saveWriterNote(" + JSON.stringify(writer).replace(/'/g, "") + ", 43,{}, " + JSON.stringify(writer.newWriterNote).replace(/'/g, "") + " -1)' ng-disabled='writer.newWriterNote | isEmpty'><span class='icon save'></span></button>";
                            w += "                    </td>";
                            w += "                </tr>";
                            w += "            </table>";
                            w += "        </td>";
                        }
                        w += "    </tr>";

                        w += "    </tbody>";
                        w += "  </table>";
                    }
                    w += "</td>";

                    w += "</tr>";


                    w += "<tr controlled='" + controlled + "'>";
                    w += "<td colspan='12' class='nested light shadow'>";
                    w += "<table class='table nested light'>";
                    w += "<thead>";
                    w += "<tr>";
                    w += "<th class='one-percent no-wrap centered'>License</th>";
                    w += "<th class='fifteen-percent'> <span>Configuration (UPC)</span></th>";
                    w += "<th class='one-percent'>Consent</th>";
                    w += "<th class='fifteen-percent no-wrap'>Writer Status</th>";
                    w += "<th class='fifteen-percent'>Rate Type</th>";
                    if (writer.statPrcentageVisible == true) {
                        w += "<th class='five-percentage nowrap top centered'>% of Stat</th>";
                    }
                    if (writer.escalatedRateVisible) {
                        w += "<th class='ten-percent'>Threshold</th>";
                        w += "<th class='five-percent'>Rate</th>";
                    }
                    w += "<th class='five-percent'>Pro-Rata Rate</th>";
                    w += "<th class='five-percent'>Per Song Rate</th>";

                    //<!--Not: NOI, Advice Letter or Gratis-->
                    if ($scope.licenseDetail.licenseTypeId !== 2 &&
                        $scope.licenseDetail.licenseTypeId !== 3 &&
                        $scope.licenseDetail.licenseTypeId !== 4) {
                        w += "<th  class='ten-percent no-wrap'>License Date</th>";
                    }

                    if ($scope.licenseDetail.licenseTypeId === 4 &&
            ($scope.licenseDetail.licenseStatusId === 5 || $scope.licenseDetail.licenseStatusId === 6)) {
                        w += "<th class='ten-percent no-wrap'>License Date</th>";
                    }

                    //<!--License NOI type-->
                    if ($scope.licenseDetail.licenseTypeId === 2) {
                        w += "<th class='ten-percent no-wrap'>Effective Date</th>";
                    }

                    //<!--License Advice Letter or Gratis type-->
                    if ($scope.licenseDetail.licenseTypeId === 3 ||
                    ($scope.licenseDetail.licenseTypeId === 4 &&
                $scope.licenseDetail.licenseStatusId !== 5 &&
                $scope.licenseDetail.licenseStatusId !== 6)) {
                        w += "<th class='ten-percent no-wrap'>Signed Date</th >";
                    }

                    w += "<th class='ten-percent no-wrap centered'>Paid Quarter</th>";
                    w += "</tr>";
                    w += "</thead>";

                    angular.forEach(writer.licenseProductRecordingWriter.ratesByConfiguration,
                        function (rateConfiguration) {
                            w += "<tbody>";
                            angular.forEach(rateConfiguration.rates,
                                function (rate, iRate) {
                                    w += "    <tr>";
                                    w += "    <td class='one-percent no-wrap centered'>";
                                    //if (writer.controlled && $index == 0) {  $index is not working
                                    if (writer.controlled && iRate == 0) {

                                        w += "        <span  title='' data-toggle='tooltip'>";
                                        w +=
                            "                                <button ng-disabled='licenseDetail.licenseStatusId != 2' securitydisable actions='LicenseDetailsIncludeExclude' class='btn btn-default btn-icon narrow' data-toggle='modal' ng-click='WritersIncludedModal(" + JSON.stringify(rate) + ",licenseAttachments,recording," + JSON.stringify(writer).replace(/'/g, "") + ",product," + JSON.stringify(rateConfiguration) + ")'>";
                                        if (rate.writerRateInclude) {
                                            w +=
                                                "                                    <span class='icon include'></span>";
                                        }
                                        if (!rate.writerRateInclude) {
                                            w +=
                                                "                                    <span class='icon exclude'></span>";
                                        }
                                        w += "                                </button>";
                                        w += "                            </span>";
                                    }
                                    w += "    </td>";
                                    if (iRate == 0) {
                                        w +=
                                            "    <td class='fifteen-percent'><span><span ng-class='rate.configuration_id | returnConfigurationIcon'>" + rate.configuration_name + "</span>";
                                        if (rate.configuration_upc) {
                                            w += "<span >(<span>" + rate.configuration_upc + "</span>)</span>";
                                        }
                                        w += "</span></td>";
                                    }
                                    w += "    <td>";
                                    if (writer.controlled && iRate == 0) {
                                        w +=
                                            "        <span title='{{rate.writersConsentType.description}}' data-toggle='tooltip' data-placement='right'>";
                                        //w += "                                <button ng-disabled='!buttons.writerConsentBtn' securitydisable actions='LicenseDetailWriterConsent' class='btn btn-default btn-sm' data-toggle='modal' ng-click='WriterConsentModal(" + JSON.stringify(rate) + ", licenseAttachments,recording, " + JSON.stringify(writer).replace(/'/g, "")  + ","+JSON.stringify(product)+")' >";
                                        w +=
                            "                                <button ng-disabled='!buttons.writerConsentBtn' securitydisable actions='LicenseDetailWriterConsent' class='btn btn-default btn-sm' data-toggle='modal' ng-click='WriterConsentModal(" + JSON.stringify(rate) + ", licenseAttachments,recording, " + JSON.stringify(writer).replace(/'/g, "") + ", product)' >";
                                        w += "                                    <span>" +
                                            rate.writersConsentType.writersConsentType +
                                            "</span>";
                                        w += "                                </button>";
                                        w += "                            </span>";
                                    }
                                    w += "    </td>";
                                    w += "    <td class='fifteen-percent top'>";

                                    if (iRate == 0) {
                                        w += "        <span>";
                                        angular.forEach(rateConfiguration.specialStatusList,
                                            function (status) {
                                                w += "                                <span class='badge'>";
                                                if (status.lU_SpecialStatuses) {
                                                    w += "             <span>" + status.lU_SpecialStatuses.specialStatus + "</span>";
                                                }
                                                if (!status.lU_SpecialStatuses) {
                                                    w += "                                    <span>" + status.specialStatus + "</span>";
                                                }
                                            });
                                        w += "                                </span>";
                                        w += "                            </span>";
                                    }
                                    w += "    </td>";
                                    if (writer.controlled == true || writer.escalatedRateVisible == true) {
                                        w += "    <td class='fifteen-percent'>";
                                        if (iRate == 0 || writer.escalatedRateVisible == true) {
                                            //w += "<span ng-show='" + iRate+ " == 0'> " +
                                            w += "<span ng-show='" + iRate + " == 0'> " +
                                                ifNullNA(rate.rateType.rateType) +
                                                "</span></span></td>";
                                        }

                                    }
                                    if (iRate !== 0) {
                                        w += "    <td class='fifteen-percent'></td>";
                                    }
                                    if (writer.controlled == false) {
                                        w += "    <td class='fifteen-percent'>";
                                        if (iRate == 0) {
                                            w += "<span>N/A</span></td>";
                                        }
                                    }
                                    if (writer.controlled == false) {
                                        w += "    <td class='five-percent'>N/A</td>";
                                    }
                                    if (writer.controlled == true && writer.statPrcentageVisible == true) {
                                        w += "    <td class='five-percent centered'><span>" +
                                            ifNullBlank(rate.percentOfStat) + "</span></td>";
                                    }
                                    if (writer.controlled == true && writer.escalatedRateVisible == true) {
                                        w += "  <td class='ten-percent'><span>" +
                                            ifNullBlank(rate.escalatedRate) +
                            "</span></td>"; //Threshold
                                    }
                                    if (writer.controlled == false) {
                                        w += "    <td class='five-percent'>N/A</td>";
                                    }
                                    if (writer.controlled == true && writer.escalatedRateVisible == true) {
                                        w += "    <td class='five-percent'><span>" + rate.rate + "</span></td>";
                                    }

                                    if (writer.controlled == true) {
                                        w += "    <td class='five-percent'><span>" + rate.proRataRate + "</span></td>";
                                    }
                                    if (writer.controlled == false) {
                                        w += "    <td class='five-percent'>N/A</td>";
                                    }
                                    if (writer.controlled == true) {
                                        w += "    <td class='five-percent'><span>" + rate.perSongRate + "</span></td>";
                                    }
                                    if (writer.controlled == false) {
                                        w += "    <td class='ten-percent centered'>N/A</td>";
                                    }


                                    //w += "    <!--Display License Date, Signed Date or Effective Date-->";
                                    //                   w += "    <td class='ten-percent' ng-show='writer.controlled == true && $index==0'>"+rate.licenseDate+"<span ng-bind='rate.licenseDate | timezone | date:'MM/dd/yyyy''></span></td>";
                                    //    if (writer.controlled == true && i_writer == 0) {
                                    if (writer.controlled == true) {
                                        w += "    <td class='ten-percent'>" +
                                            ifNullDateBlank(rate.licenseDate) +
                            "</td>";
                                    }
                                    //    if (writer.controlled == true && i_writer == 0) {
                                    if (writer.controlled == true) {
                                        w += "    <td class='ten-percent centered'>";
                                        if (iRate == 0) {
                                            //w += "        <span ng-show='$index==0'>";
                                            w +=
                                                "                                <button ng-disabled='paidQuarterDisabled' securitydisable actions='LicenseDetailsPaidQuarter' class='btn btn-default btn-sm' ng-click='ModalPaidQuarter(licenseDetail.licenseId, " + JSON.stringify(rate) + ", recording, " + JSON.stringify(writer).replace(/'/g, "") + ", product)'>";
                                            w += "                                    <span>" +
                                                rateConfiguration.paidQuarter +
                                                "</span>";
                                            w += "                                </button>";
                                        }
                                        //w += "                            </span>";
                                        w += "    </td>";

                                    }

                                    w += "</tr>";
                                });
                            w += "</tbody>";
                        });

                    w += "</table>";
                    w += "</tr>";

                    //w += "</tbody>";

                    //w = "<tr><td>trust me</td></tr>";
                    ww += w;
                    // writerIndex++;
                }
            });

        //escape quotes jsfiddle http://jsfiddle.net/3j25m/2/
        recording.writerHtml = $sce.trustAsHtml(ww);
        $scope.banned = false;


        //    var jsonData = {
        //        glossary: {
        //            title: "example Jeff's awesome song!",
        //            GlossDiv: {
        //                title: "S",
        //                GlossList: {
        //                    GlossEntr: {
        //                        ID: "SGML",
        //                       SortAs: "SGML",
        //                        GlossTerm: "Standard Generalized Markup Language",
        //                        Acronym: "SGML",
        //                        Abbrev: "ISO 8879:1986",
        //                        GlossDef: {
        //                            para: "A meta-markup language, used to create markup languages such as DocBook.",
        //                            GlossSeeAlso: ["GML", "XML"]
        //                        },
        //                        GlossSee: "markup"
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    $scope.myHTML = $sce.trustAsHtml(
        //"I am an <code>HTML</code>string with <a href='#' ng-mouseover='removeExp()'>links!</a> and other <em>stuff</em><button ng-click='alertMe( "+ JSON.stringify(jsonData) +" )'>CLICK ME</button>");


        /* Its good to have this html down here to understand the madness happening above
        <!--This is the area that expands down from the UI-->
        <tbody ng-repeat="writer in recording.licensePRWriters | filter:writerFilter track by $index">
        <!--<tr ng-class="{'background:pink': writer.controlled == '0'}">-->
        <tr ng-style="{{writerBackground(writer.controlled)}}" class="details-writer-row">
            <td class="ten-percent top">
                <span ng-bind="writer.name"></span>  
            </td>
            <td class="one-percent top">
                <span ng-if="isSampleWriter(writer.name, recording.track.copyrights)" class="badge sample pull-right">SAMPLE</span>
                <!--<span ng-if="isSampleWriter(writer.name, recording.track.copyrights[0].sampledWorks[0].writers)" class="badge sample pull-right">SAMPLE</span>-->
            </td>
            <!--<td class="five-percent top"> Jeff Commented this out. I added a Badge (line 251) instead.
                <span class="badge">{{writer.sample}}</span>
            </td>-->
            <td class="twentyfive-percent top">
                <span ng-repeat="originalPublisher in writer.originalPublishers | filter:{zeroValue:false} track by $index">
                                <span class="float-left-subpub" ng-repeat="administrator in originalPublisher.administrators  track by $index">
                                    <span ng-if='!originalPublisher.SeExists && administrator.capacityCode=="AM" && !originalPublisher.zeroValue'>
                                        <span ng-bind="administrator.name"></span><span style="margin-left: 4px; margin-right: 4px">/</span>
                                        <span ng-bind="administrator.pub.name"></span>
                                        <span ng-repeat='affiliation in administrator.pub.affiliations | filter:{incomeGroup:"Performance"} track by $index'>
                                            <span ng-repeat='a in affiliation.affiliations track by $index'>
                                                (<span ng-bind="a.societyAcronym"></span>)
                                            </span>
                                        </span>
                                    </span>
                                    <span ng-if='originalPublisher.SeExists && administrator.capacityCode=="SE" && !originalPublisher.zeroValue'>
                                        <span ng-bind="administrator.name"></span>
                                        <span ng-repeat='affiliation in administrator.affiliations  | filter:{incomeGroup:"Performance"}'>
                                            <span ng-repeat='a in affiliation.affiliations  track by $index'>
                                                (<span ng-bind="a.societyAcronym"></span>)
                                            </span> <span style="margin-left: 4px; margin-right: 4px">/</span>
                                            <span ng-bind="administrator.pub.name"></span>
                                        </span>
                                    </span>
                                </span>
                                <br />
                            </span>
                <div><!--num pubs:{{writer.originalPublishers.length}},controlled:{{writer.controlled}}}--></div>
            </td>
            <td class="ten-percent top" ng-if="recording.track.claimException==true">
                <!-- Override -->
                <span ng-if="writer.licenseProductRecordingWriter.claimExceptionOverride != null">
                                <span ng-bind="writer.licenseProductRecordingWriter.claimExceptionOverride | percentage:2"></span>  
                            </span>
            </td>
            <td class="ten-percent top">
                <!-- Override -->
                <span ng-if="writer.licenseProductRecordingWriter.splitOverride >= 0 && writer.licenseProductRecordingWriter.splitOverride !=null" class="strike-through">
                                <span ng-bind="writer.contribution | percentage:2"></span>
                            </span>
                <span ng-if="writer.licenseProductRecordingWriter.splitOverride >= 0 && writer.licenseProductRecordingWriter.splitOverride !=null" class="override"> <span ng-bind="writer.licenseProductRecordingWriter.splitOverride | percentage:2"></span></span>
                <!-- No Override -->
                <span ng-if="writer.licenseProductRecordingWriter.splitOverride==null"> <span ng-bind="writer.contribution | percentage:2"></span></span>
            </td>
            <td class="ten-percent top" ng-if="licenseDetail.licenseStatusId == 5 || licenseDetail.licenseStatusId == 7">
                <div ng-if="writer.licenseProductRecordingWriter.executedSplit>=0"><span ng-bind="writer.licenseProductRecordingWriter.executedSplit | percentage:2"></span></div>
            </td>
            <td class="twentyeight-percent top">
                <span ng-bind="writer.licenseProductRecordingWriter.mostRecentNote"></span>
            </td>
            <td class="one-percent top">
                <button ng-show="buttons.writerNoteBtn && writer.controlled" security actions="LicenseDetailWriterNote" class="btn btn-default btn-sm" ng-if="writer.licenseProductRecordingWriter.writerNoteCount > 0" ng-click="collapseWriterNotes(writer)"><span ng-bind="writer.licenseProductRecordingWriter.writerNoteCount"></span><span class=" caret"></span></button>
                <button ng-show="buttons.writerNoteBtn && writer.controlled" security actions="LicenseDetailWriterNote" class="btn btn-default btn-sm notes-btn" ng-if="writer.licenseProductRecordingWriter.writerNoteCount == 0" ng-click="collapseWriterNotes(writer)">New Note<span class=" caret"></span></button>
            </td>
            <td class="one-percent top">
                <button ng-show="buttons.editIndividualRates && writer.controlled" class="btn btn-default btn-sm" security actions="LicenseDetailEditIndivdualRate" ng-click="editWriterRate(licenseDetail, licenseDetail.licenseTypeId, licenseDetail.licenseId, writer, product.productId, recording.id, recording.track.duration,recording.track.claimException,licenseDetail.statusesRollup,recording.licenseRecording.statusRollup)">Edit Rates</button>
            </td>
        </tr>

        <tr>
            <td colspan="12" class="table writer-notes" collapse="!writer.writerNotesCollapsed">
                <table class="table" ng-show="writer.licenseProductRecordingWriter.writerNotes.length == 0" security actions="LicenseDetailWriterNote">
                    <tr>
                        <td><textarea class="writer-note" ng-model-options="{debounce:1000}" ng-model="writer.newWriterNote"></textarea></td>
                        <td class="one-percent top no-wrap">
                            <button class="btn btn-default btn-sm narrow" ng-click="saveWriterNote(writer, 43, {}, writer.newWriterNote, -1)" ng-disabled="writer.newWriterNote | isEmpty"><span class="icon save"></span></button>
                        </td>
                    </tr>
                </table>
                <table class="table" ng-show="writer.licenseProductRecordingWriter.writerNotes.length > 0" security actions="LicenseDetailWriterNote">
                    <thead>
                    <tr>
                        <th class="ten-percent">Created Date</th>
                        <th class="fifteen-percent">Created By</th>
                        <th class="seventyfive-percent">Note</th>
                        <th class="ten-percent centered">Actions</th>
                    </tr>
                    </thead>
                    <tbody>

                    <tr ng-repeat-start="writernote in writer.licenseProductRecordingWriter.writerNotes">
                        <td class="ten-percent top"><span ng-bind="writernote.createdDate | timezone | date:'MM/dd/yyyy'"></span><!--({{writernote.licenseWriterId}})--></td>
                        <td class="fifteen-percent top"><span ng-bind="writernote.createdBy"></span></td>
                        <td class="seventyfive-percent top"><span ng-bind="writernote.note"></span></td>
                        <td class="ten-percent top no-wrap">
                            <button ng-show="buttons.writerNoteBtn && writer.controlled" class="btn btn-default btn-sm narrow" title="New Note" ng-click="collapseWriterAddNotes(writer, writernote)"><span class="icon add-note"></span></button>
                            <button ng-show="buttons.writerNoteBtn && writer.controlled" class="btn btn-default btn-sm narrow" title="Edit Note" ng-click="collapseEditNote(writer, writernote)"><span class="icon edit"></span></button>
                            <button ng-show="buttons.writerNoteBtn && writer.controlled" class="btn btn-default btn-sm narrow" title="Delete Note" ng-click="removeWriterNote(writer, writernote.licenseWriterNoteId)"><span class="icon delete"></span></button>
                            <input type="hidden" ng-model="currentWriteNoteId"/>
                        </td>
                    </tr>
                    <tr ng-repeat-end="writernote in writer.licenseProductRecordingWriter.writerNotes">

                        <td class="writer-add-note" colspan="12" ng-show="writernote.editNoteVisible">
                            <table class="table writer-notes">
                                <tr>
                                    <td class="onehundred-percent"><textarea class="writer-note" ng-model-options="{debounce:1000}" ng-model="writernote.editNoteValue"></textarea></td>
                                    <td class="one-percent no-wrap">
                                        <button class="btn btn-default btn-sm narrow" ng-click="saveWriterNote(writer, 43, writernote, writernote.editNoteValue,writernote.licenseWriterNoteId)" ng-disabled="writernote.editNoteValue | isEmpty"><span class="icon save"></span></button>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>

                        <td class="writer-add-note" colspan="12" ng-show="writer.addNewNoteVisible">
                            <table class="table writer-notes">
                                <tr>
                                    <td class="onehundred-percent"><textarea class="writer-note" ng-model-options="{debounce:1000}" ng-model="writer.newWriterNote"></textarea></td>
                                    <td class="one-percent no-wrap">
                                        <button class="btn btn-default btn-sm narrow" ng-click="saveWriterNote(writer, 43,{}, writer.newWriterNote, -1)" ng-disabled="writer.newWriterNote | isEmpty"><span class="icon save"></span></button>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>

        <tr>
            <td colspan="12" class="nested light shadow">
            <table class="table nested light">
                <thead>
                <tr>
                    <th class="one-percent no-wrap centered">License</th>
                    <th class="fifteen-percent"> <span>Configuration (UPC)</span></th>
                    <th class="one-percent">Consent</th>
                    <th class="fifteen-percent no-wrap">Writer Status</th>
                    <th class="fifteen-percent">Rate Type</th>
                    <th class="five-percentage nowrap top centered" ng-show="writer.statPrcentageVisible == true">% of Stat</th>
                    <th class="ten-percent" ng-show="writer.escalatedRateVisible == true">Threshold</th>
                    <th class="five-percent" ng-show="writer.escalatedRateVisible == true">Rate</th>
                    <th class="five-percent">Pro-Rata Rate</th>
                    <th class="five-percent">Per Song Rate</th>
                    <!--Not: NOI, Advice Letter or Gratis-->
                    <th ng-if="licenseDetail.licenseTypeId!=2 && licenseDetail.licenseTypeId!=3 && licenseDetail.licenseTypeId!=4" class="ten-percent no-wrap">License Date</th>
                    <th ng-if="licenseDetail.licenseTypeId==4 && (licenseDetail.licenseStatusId == 5 || licenseDetail.licenseStatusId == 6)" class="ten-percent no-wrap">License Date</th>
                    <!--License NOI type-->
                    <th ng-if="licenseDetail.licenseTypeId==2" class="ten-percent no-wrap">Effective Date</th>
                    <!--License Advice Letter or Gratis type-->
                    <th ng-if="licenseDetail.licenseTypeId==3 || (licenseDetail.licenseTypeId==4 && licenseDetail.licenseStatusId != 5 && licenseDetail.licenseStatusId != 6)" class="ten-percent no-wrap">Signed Date</th>
                    <th class="ten-percent no-wrap centered">Paid Quarter</th>
                </tr>
                </thead>
                <tbody ng-repeat="rateConfiguration in writer.licenseProductRecordingWriter.ratesByConfiguration  track by $index">
                <tr ng-repeat="rate in rateConfiguration.rates">
                    <td class="one-percent no-wrap centered">
                        <span ng-show="writer.controlled && $index == 0" title="" data-toggle="tooltip">
                                                <button ng-disabled="licenseDetail.licenseStatusId != 2" securitydisable actions="LicenseDetailsIncludeExclude" class="btn btn-default btn-icon narrow" data-toggle="modal" ui-sref="SearchMyView.DetailLicense.StepsModal.WritersIsIncluded({config:rate,files:licenseAttachments,recording:recording,writer:writer,product:product,modalSize:'sm',rate:rateConfiguration })">
                                                    <span class="icon include" ng-show="rate.writerRateInclude"></span>
                                                    <span class="icon exclude" ng-show="!rate.writerRateInclude"></span>
                                                </button>
                                            </span>
                    </td>
                    <td class="fifteen-percent"><span ng-show="$index == 0"><span ng-class="rate.configuration_id | returnConfigurationIcon"></span><span ng-bind="rate.configuration_name"></span><span ng_if="rate.configuration_upc">(<span ng-bind="rate.configuration_upc"></span>)</span></span></td>
                    <td>
                        <span ng-show="writer.controlled && $index == 0" title="{{rate.writersConsentType.description}}" data-toggle="tooltip" data-placement="right">
                                                <button ng-disabled="!buttons.writerConsentBtn" securitydisable actions="LicenseDetailWriterConsent" class="btn btn-default btn-sm" data-toggle="modal" ui-sref="SearchMyView.DetailLicense.StepsModal.WritersConsent({config:rate,files:licenseAttachments,recording:recording,writer:writer,product:product,modalSize:'md' })">
                                                    <span ng-bind="rate.writersConsentType.writersConsentType"></span>
                                                </button>
                                            </span>
                    </td>
                    <td class="fifteen-percent top">
                        <span ng-show="$index == 0">
                                                <span ng-repeat="status in rateConfiguration.specialStatusList" class="badge">
                                                    <span ng-if="status.lU_SpecialStatuses"><span ng-bind="status.lU_SpecialStatuses.specialStatus"></span></span>
                                                    <span ng-if="!status.lU_SpecialStatuses"><span ng-bind="status.specialStatus"></span></span>
                                                </span>
                                            </span>
                    </td>
                    <td class="fifteen-percent" ng-if="writer.controlled == true"><span ng-show="$index == 0"><span ng-bind="rate.rateType.rateType"></span></span></td>
                    <td class="fifteen-percent" ng-if="writer.controlled == false"><span ng-show="$index == 0">N/A</span></td>
                    <td class="five-percent" ng-if="writer.controlled == false">N/A</td>
                    <td class="five-percent centered" ng-if="writer.controlled == true" ng-show="writer.statPrcentageVisible == true"><span ng-bind="rate.percentOfStat"></span></td>
                    <td class="ten-percent" ng-if="writer.controlled == true" ng-show="writer.escalatedRateVisible == true"><span ng-bind="rate.escalatedRate"></span></td>
                    <td class="five-percent" ng-if="writer.controlled == false">N/A</td>
                    <td class="five-percent" ng-if="writer.controlled == true" ng-show="writer.escalatedRateVisible == true"><span ng-bind="rate.rate"></span></td>
                    <td class="five-percent" ng-if="writer.controlled == true"><span ng-bind="rate.proRataRate"></span></td>
                    <td class="five-percent" ng-if="writer.controlled == false">N/A</td>
                    <td class="five-percent" ng-if="writer.controlled == true"><span ng-bind="rate.perSongRate"></span></td>
                    <td class="ten-percent centered" ng-if="writer.controlled == false">N/A</td>
                    <!--Display License Date, Signed Date or Effective Date-->
                    <td class="ten-percent" ng-show="writer.controlled == true && $index==0"><span ng-bind="rate.licenseDate | timezone | date:'MM/dd/yyyy'"></span></td>

                    <td class="ten-percent centered" ng-show="writer.controlled == true">
                        <span ng-show="$index==0">
                                                <button ng-disabled="paidQuarterDisabled" securitydisable actions="LicenseDetailsPaidQuarter" class="btn btn-default btn-sm" ui-sref="SearchMyView.DetailLicense.StepsModal.PaidQuarter({licenseId:licenseDetail.licenseId,config:rate,recording:recording,writer:writer,product:product, modalSize:'sm' })">
                                                    <span ng-bind="rateConfiguration.paidQuarter"></span> 
                                                </button>
                                            </span>
                    </td>
                </tr>

                </tbody>
            </table>
        </tr>

        </tbody>
        </table><!-- END Writer Table-->
*/

        $scope.goToLastModified();
    }
    //$scope.removeExp = function () {
    //    console.log('dfdfgdfgdfg');
    //}

    //$scope.alertMe = function (object) {
    //    alert(JSON.parse(JSON.stringify(object)));
    //}
    //$scope.cf = function() {
    //    alert("TEST");
    //}




    var setLastModifiedRecording = function (recording) {
        var recordingId = recording.id;
        var storage = localStorageService.set("lastMod");
        if (storage == null) {
            localStorageService.set("lastMod", recordingId);
        } else {
            storage = recordingId;
            localStorageService.set("lastMod", storage);
        }
    }

    var setLastModifiedRecordingID = function (recordingID) {
        var recordingId = recordingID;
        var storage = localStorageService.set("lastMod");
        if (storage == null) {
            localStorageService.set("lastMod", recordingId);
        } else {
            storage = recordingId;
            localStorageService.set("lastMod", storage);
        }
    }


    var writerIndex = -1;

    //Loads as true, when set to false, table expands
    $scope.collapseWriters3 = function (recording) {
        //check if cookie exists, if not create it
        var collapsedData = localStorageService.get("collapseData");
        if (collapsedData === null) {
            var newcollapsedData = [];
            newcollapsedData.push(recording.id);
            localStorageService.set("collapseData", newcollapsedData);
            setLastModifiedRecording(recording);
        } else if (writerIdExists(collapsedData, recording.id)) {
            //If cookie exists and ID of currently clicked writer is in cookie
            //This is for when a writer is being closed
            removeWriterId(collapsedData, recording.id);
            localStorageService.set("collapseData", collapsedData);


        } else if (!writerIdExists(collapsedData, recording.id)) {
            //If cookie exists and ID of currently clicked writer is NOT in cookie
            //Cookie exists, writer is being expanded.  Add writer details to cookie.
            collapsedData.push(recording.id);
            localStorageService.set("collapseData", collapsedData);
            setLastModifiedRecording(recording);
        }

        recording.writersCollapsed = !recording.writersCollapsed;
    }






    var timer = function (name) {
        var start = new Date();
        return {
            stop: function () {
                var end = new Date();
                var time = end.getTime() - start.getTime();
                console.log('Timer:', name, 'finished in', time, 'ms');
            }
        }
    };

    $scope.groupByConfigurations = function (rateList) {
        var configurationRateList = [];
        for (var i = 0; i < rateList.length; i++) {
            var currentRate = rateList[i];
            //var exists = USL.Common.FirstInArray(configurationRateList, 'configuration_id', currentRate.configuration_id);
            //changed from configuration_id to product_configuration_id
            //added configuration_upc to configurationRateList collection
            var exists = USL.Common.FirstInArray(configurationRateList, 'product_configuration_id', currentRate.product_configuration_id);
            if (!exists) {
                currentRate.isFirstRate = true;
                configurationRateList.push({
                    product_configuration_id: currentRate.product_configuration_id,
                    configuration_name: currentRate.configuration_name,
                    configuration_id: currentRate.configuration_id,
                    configuration_upc: currentRate.configuration_upc,
                    rates: [currentRate],
                    specialStatusList: currentRate.specialStatusList,
                    paidQuarter: !currentRate.paidQuarter ? null : currentRate.paidQuarter
                });

            } else {
                exists.rates.push(currentRate);
            }
        }
        return configurationRateList;
    }


    $scope.collapseWriterNotes = function (writer, recording) {
        setLastModifiedRecordingID(recording);
        writer = JSON.parse(JSON.stringify(writer));

        var buttons = $scope.buttons;
        $scope.GoEditWriterNote(writer, writer.licenseProductRecordingWriter.writerNotes, buttons);
    };

    $scope.collapseWriterAddNotes = function (writer, writerNote) {
        writer.addNewNoteVisible = !writer.addNewNoteVisible;
        writerNote.editNoteVisible = false;
        if (writer.addNewNoteVisible) writer.newWriterNote = "";
    };

    $scope.collapseEditNote = function (writer, writerNote) {
        writerNote.editNoteVisible = !writerNote.editNoteVisible;
        writerNote.editNoteValue = writerNote.note;
        writer.addNewNoteVisible = false;

    };
    $scope.saveWriterNote = function (writer, configuration_id, writerNote, noteValue, currentWriterNoteId) {
        if (currentWriterNoteId < 1) {
            licensesService.addPRWriterLicenseNote(writer.licenseProductRecordingWriter.licenseWriterId, noteValue, configuration_id).then(function (result) {
                writer.licenseProductRecordingWriter.writerNotes.unshift(result.data);
                writer.writerAddNotesCollapsed = false;
                writer.licenseProductRecordingWriter.writerNoteCount = writer.licenseProductRecordingWriter.writerNotes.length;
                writer.licenseProductRecordingWriter.mostRecentNote = result.data.note;
                writer.newWriterNote = "";
                notyService.success("Note added");
                writer.addNewNoteVisible = !writer.addNewNoteVisible;
            }, function (error) {
                notyService.error("Note add failed");
            });
        } else {
            licensesService.editPRWriterLicenseNote(writer.licenseProductRecordingWriter.licenseWriterId, noteValue, configuration_id, currentWriterNoteId).then(function (result) {
                var writerNotes = writer.licenseProductRecordingWriter.writerNotes;
                var index = -1;
                for (var i = 0, len = writerNotes.length; i < len; i++) {
                    if (writerNotes[i].licenseWriterNoteId === result.data.licenseWriterNoteId) {
                        index = i;
                        break;
                    }
                }

                if (index > -1) {
                    writer.licenseProductRecordingWriter.writerNotes.splice(index, 1);
                }
                writer.licenseProductRecordingWriter.writerNotes.unshift(result.data);
                writer.licenseProductRecordingWriter.mostRecentNote = result.data.note;
                writerNote.editNoteVisible = !writerNote.editNoteVisible;
                notyService.success("Note edited successfuly");
            }, function (error) {
                notyService.error("Note edit failed");
            });
        }


    }


    $scope.removeWriterNote = function (writer, licenseWriterNoteId) {
        notyService.modalConfirm("Are you sure you want to delete this note?").then(function () {
            licensesService.removePRWriterLicenseNote(licenseWriterNoteId).then(function (result) {
                var writerNotes = writer.licenseProductRecordingWriter.writerNotes;
                var index = -1;
                for (var i = 0, len = writerNotes.length; i < len; i++) {
                    if (writerNotes[i].licenseWriterNoteId === result.data.licenseWriterNoteId) {
                        index = i;
                        break;
                    }
                }

                if (index > -1) {
                    writer.licenseProductRecordingWriter.writerNotes.splice(index, 1);
                }
                var notesLength = writer.licenseProductRecordingWriter.writerNotes.length;
                writer.licenseProductRecordingWriter.writerNoteCount = notesLength;
                if (notesLength > 0) {
                    writer.licenseProductRecordingWriter.mostRecentNote = writer.licenseProductRecordingWriter.writerNotes[0].note;
                } else {
                    writer.licenseProductRecordingWriter.mostRecentNote = "";
                }
                if (writer.currentWriteNoteId == licenseWriterNoteId && writer.writerAddNotesCollapsed == true) {
                    writer.writerAddNotesCollapsed = false;
                    writer.editWriterNote = "";
                }
                notyService.success("Noted removed");

            }, function () {
                notyService.error("Noted remove failed");

            });

        });

    }

    $scope.removeSelectedAttachments = function () {
        var text = 'Are you sure you want to remove selected attachments?';
        notyService.modalConfirm(text).then(function () {

            var selectedAttachments = [];

            angular.forEach($scope.licenseAttachments, function (attachment) {
                if (attachment.selected) {
                    selectedAttachments.push(attachment);
                }
            });

            filesService.removeMultiple(selectedAttachments).then(function (result) {
                notyService.success("Attachment(s) removed");

                // Remove from UI
                for (var i = 0; i < $scope.licenseAttachments.length; i++) {
                    if ($scope.licenseAttachments[i].selected) {
                        $scope.licenseAttachments.splice(i, 1);
                        i--;
                    }
                }
            }, function (error) {
                notyService.error("Attachment(s) remove failed");
            });

        });
    }

    $scope.openCreateLicense = function (size) {
        var rootScope = $scope;
        var modalInstance = USL.GlobalModals.initCreateLicenseModals($modal, $scope.licenseDetail, 1, size);


        modalInstance.result.then(function (selectedItem) {
        }, function () {

        });

    };


    $scope.openEditLicense = function (size) {

        //var modalInstance = USL.GlobalModals.initLicenseModals($modal, $scope.licenseDetail, 1, size);
        //modalInstance.result.then(function (selectedItem) {

        //}, function () {

        //});
        $state.go('SearchMyView.DetailLicense.StepsModal.EditLicense', {
            licenseData: JSON.stringify($scope.licenseDetail)
        });

    };

    $scope.openAddProducts = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-AddProducts.html',
            controller: 'addProductsController',
            size: size,
            resolve: {
                data: function () {
                    //return [$scope.licenseDetail];
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };


    $scope.openEditRates = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-EditRates.html',
            controller: 'editRatesController',
            size: size,
            resolve: {
                data: function () {
                    return $scope.products;
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };


    $scope.selectAllNotes = function () {
        var allSelected = !$filter('isAllSelected')($scope.licenseDetail.licenseNoteList);
        $filter('selectAll')($scope.licenseDetail.licenseNoteList, allSelected);

    }

    $scope.selectAllAttachments = function () {
        var allSelected = !$filter('isAllSelected')($scope.licenseAttachments);
        $filter('selectAll')($scope.licenseAttachments, allSelected);

    }

    $scope.downloadAttachments = function (obj) {
        if (obj) {
            filesService.downloadAttachment(obj.licenseAttachmentId).then(function (result) {
                var link = document.createElement("a");
                link.href = result.data.url;
                link.click();
            });
        } else {
            angular.forEach($scope.licenseAttachments, function (attach) {
                if (attach.selected) {
                    filesService.downloadAttachment(attach.licenseAttachmentId).then(function (result) {
                        var link = document.createElement("a");
                        link.href = result.data.url;
                        link.click();
                    });

                }
            });
        }

    }

    $scope.openAddNote = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-AddNote.html',
            controller: 'addNoteController',
            size: size,
            resolve: {
                data: function () {
                    return $scope.licenseDetail;
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };

    $scope.openEditNote = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-EditNote.html',
            controller: 'editNoteController',
            size: size,
            resolve: {
                data: function () {
                    return $scope.licenseDetail.licenseNoteList.filter(function selected(category, index, array) {
                        return category.selected == true;
                    });
                },
                licenseData: function () {
                    return $scope.licenseDetail;
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };

    $scope.openUploadDoc = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-UploadDoc.html',
            controller: 'uploadDocController',
            size: size,
            resolve: {
                data: function () {
                    //return [$scope.licenseDetail];
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };

    $scope.openGenerateDoc = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-GenerateDoc.html',
            controller: 'generateDocController',
            size: size,
            resolve: {
                data: function () {
                    //return [$scope.licenseDetail];
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {
            //$scope.loadDetail();
        }, function () {

        });

    };

    $scope.openExecuteLicense = function (size) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-ExecuteLicense.html',
            controller: 'executeLicenseController',
            size: size,
            resolve: {
                data: function () {
                    return [$scope.licenseDetail];
                }
            }
        });


        modalInstance.result.then(function (selectedItem) {

        }, function () {
            initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
        });

    };


    $scope.openStepContainer = function (size) {
        //var rootScope = $scope;
        //var modalInstance = $modal.open({
        //    templateUrl: 'app/views/partials/modal-step-Container.html',
        //    controller: 'stepContainerController',
        //    size: size,
        //    resolve: {
        //        data: function () {
        //            //return [$scope.licenseDetail];
        //        }
        //    }
        //});
        //modalInstance.result.then(function (selectedItem) {
        //    //$scope.loadDetail();
        //}, function () {

        //});
        $state.go("SearchMyView.DetailLicense.StepsModal.AddProducts", {}, {
        });

    };

    $scope.noProductsOnLicense = false;

    $scope.calculateNote = function (note) {
        //If executed
        var display = true;
        if ($scope.licenseDetail.licenseStatusId == 5) {
            if (note.noteType.noteType.toLowerCase() != 'internal' && note.noteType.noteType.toLowerCase() != 'priority') {
                display = false;
            }
        }

        return display;
    };


    $scope.loadDetail = function () {
        licensesService.getLicenseDetail(licenseId).then(function (result) {
            $scope.licenseDetail = result.data;
            initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
            if ($scope.licenseDetail.effectiveDate) {
                $scope.licenseDetail.effectiveDate = moment.utc($scope.licenseDetail.effectiveDate).format();
            }
            if ($scope.licenseDetail.receivedDate) {
                $scope.licenseDetail.receivedDate = moment.utc($scope.licenseDetail.receivedDate).format();
            }
            if ($scope.licenseDetail.signedDate) {
                $scope.licenseDetail.signedDate = moment.utc($scope.licenseDetail.signedDate).format();
            }

            $scope.licenseDetail.createdDate = moment.utc($scope.licenseDetail.createdDate).format();
            $scope.licenseDetail.modifiedDate = moment.utc($scope.licenseDetail.modifiedDate).format();
            angular.forEach($scope.licenseDetail.licenseNoteList, function (note) {
                note.selected = false;
                note.displayNote = $scope.calculateNote(note);
            });

            // Checking status - display the following buttons

            // HOLD StatusId =3
            if ($scope.licenseDetail.licenseStatusId == 3) {
                $scope.holdButtonName = "Release Hold";
            }
            else {
                $scope.holdButtonName = "Hold";
            }

            // VOID StatusId =8
            if ($scope.licenseDetail.licenseStatusId == 8) {
                $scope.voidButtonName = "Unvoid";
            }
            else {
                $scope.voidButtonName = "Void";
            }
        }, function () {
            $state.go('SearchMyView.Tabs.MyViewTab');
        });


        licenseProductsService.getLicenseProducts($stateParams.licenseId).then(function (result) {
            $scope.products = result.data;
            if ($scope.products.length == 0) {
                $scope.noProductsOnLicense = true;
            }
            if (result.data.length > 0) {
                $scope.licenseDetail.claimException = result.data[0].licenseClaimException;
            }
            $scope.productConfigurations.length = 0;
            // set configuration grid data
            var totalLicensedAmount = 0;
            var totalLicensedConfigs = 0;
            var totalAmount = 0;

            //This toggles the products open/closed
            angular.forEach($scope.products, function (product, iProduct) {
                if (product.isCollapsed == null || product.isCollapsed == undefined) {
                    //check to make sure it is not in the array, if it is in the array, remove it.
                    var productCollapsedData = localStorageService.get("productCollapseData");
                    if (productCollapsedData != null) {
                        if (productCollapsedData.length != null) {
                            product.isCollapsed = true;
                            //check if id is in local storage, if it is, remove it.
                            for (var i = 0; i < productCollapsedData.length; i++) {
                                if (product.licenseProductId === productCollapsedData[i]) {
                                    product.isCollapsed = false;
                                }
                            }
                        } else {
                            product.isCollapsed = true;
                        }
                    } else {
                        product.isCollapsed = true;
                    }
                } else {
                    product.isCollapsed = true;
                }

                product.isScheduleCollapsed = true;
                product.totalLicensedConfigAmount = 0;
                totalLicensedAmount = 0;
                totalAmount = 0;
                totalLicensedConfigs = 0;

                angular.forEach(product.productHeader.configurations, function (config) {
                    if (config.licenseProductConfiguration != null) {
                        var lconfig = {
                            productId: product.productHeader.id,
                            title: product.productHeader.title,
                            configuration_id: config.licenseProductConfiguration.configuration_id,
                            configuration_name: config.licenseProductConfiguration.configuration_name,
                            priorityReport: config.licenseProductConfiguration.priorityReport,
                            statusReport: config.licenseProductConfiguration.statusReport,
                            licensedAmount: config.licenseProductConfiguration.licensedAmount,
                            notLicensedAmount: config.licenseProductConfiguration.notLicensedAmount,
                            totalAmount: config.licenseProductConfiguration.totalAmount,
                            licenseProductConfigurationId: config.licenseProductConfiguration.licenseProductConfigurationId,
                            upc: config.upc,
                            release_date: config.releaseDate,
                            catalogNumber: config.licenseProductConfiguration.catalogNumber
                        };
                        if (config.release_date) {
                            lconfig.release_date = moment.utc(config.releaseDate).format();
                        }
                        $scope.productConfigurations.push(lconfig);
                        totalLicensedConfigs += 1;
                        totalLicensedAmount += config.licenseProductConfiguration.licensedAmount;
                        totalAmount += config.licenseProductConfiguration.totalAmount;
                    }
                });


                angular.forEach(product.recordings, function (recording, iRecording) {
                    $scope.getRecordingWriters(recording, iRecording, iProduct);
                });

                //if (totalLicensedConfigs > 0) {
                //    totalAmount = totalAmount / totalLicensedConfigs;
                //    product.totalLicenseConfigAmount = (totalLicensedAmount / totalAmount) * 100; //  / totalLicensedConfigs;
                //}

                if (product.message.length > 0) {
                    var m = "License Information is not complete for Product '" + product.productHeader.title + "'<br/><br/>";
                    angular.forEach(product.message, function (message) {
                        m += message + "<br />";
                    });
                    notyService.error(m);
                }

            });
            if ($scope.products.length == 1) {
                $scope.checkRecordings(false, $scope.products[0].licenseProductId);
                $scope.isCollapsed = false;
            }

        }, function () {
            $state.go('SearchMyView.Tabs.MyViewTab');
        });

        //licensesService.getLicenseProductConfigurations($stateParams.licenseId).then(function (result) {
        //    $scope.productConfigurations = result.data;
        //});

        $scope.writerFilters.length = 0;
        $scope.writerFilters.push({
            Id: 1, Name: 'All Writers'
        });
        $scope.writerFilters.push({
            Id: 2, Name: 'Controlled Writers'
        });
        $scope.writerFilters.push({
            Id: 3, Name: 'Uncontrolled Writers'
        });
        $scope.writerFilters.push({
            Id: 4, Name: 'Licensed Writers'
        });
        $scope.writerFilters.push({
            Id: 5, Name: 'Unlicensed Writers'
        });

        if ($scope.firstFilter === true) {
            $scope.selectedWriterFilter = $scope.writerFilters[1];
        }

        //nav area
        var trackStorage = localStorageService.get("trackColl");
        if (trackStorage == null || trackStorage) {
            $scope.isCollapsed = true;
        } else {
            $scope.isCollapsed = false;
        }
        $scope.goToLastModified();

    };
    $scope.goToLastModified();

    $scope.firstFilter = true;

    $scope.selectWriterFilter = function (f) {
        $scope.selectedWriterFilter = f;
        switch (f.Id) {
            case 1:
                angular.forEach($scope.products, function (product) {
                    angular.forEach(product.recordings, function (rec) {
                        rec.computedWritersCount = rec.track.writerCount;

                    });
                });
                break;
            case 2:
                angular.forEach($scope.products, function (product) {
                    angular.forEach(product.recordings, function (rec) {
                        rec.computedWritersCount = rec.track.controlledWriterCount;

                    });
                });
                break;
            case 3:
                angular.forEach($scope.products, function (product) {
                    angular.forEach(product.recordings, function (rec) {
                        rec.computedWritersCount = rec.track.writerCount - rec.track.controlledWriterCount;

                    });
                });
                break;
            case 4:
                angular.forEach($scope.products, function (product) {
                    angular.forEach(product.recordings, function (rec) {
                        rec.computedWritersCount = rec.licenseRecording.licensePRLicensedWriterNo;

                    });
                });
                break;
            case 5:
                angular.forEach($scope.products, function (product) {
                    angular.forEach(product.recordings, function (rec) {
                        rec.computedWritersCount = rec.licenseRecording.licensePRUnLicensedWriterNo;

                    });
                });
                break;
            default: break;
        }
    };

    $scope.clickLicenseStatus = function () {
        if ($scope.licenseStatuses.length == 0) {
            licenseStatusService.getLicenseStatuses().then(function (result) {
                $scope.licenseStatuses = result.data;
            });
        }
    };
    ///this part is  for audit
    $scope.openAuditFrom = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
    };
    $scope.openAuditTo = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0,
    };
    $scope.selectTable = function (table) {
        $scope.selectedTable = table;
    };
    $scope.auditSearch = function () {

        var date1 = $("#dateA").val();
        var date2 = $("#dateB").val();

        if (isNotADate(date1) && date1.length >= 1 || isNotADate(date2) && date2.length >= 1) {
            dateErrorMessage();
            return;
        }



        var request = {
            FromDate: $scope.dt.from,
            ToDate: $scope.dt.to,
            Id: $scope.licenseDetail.licenseId,
            Table: $scope.selectedTable
        };
        if ($scope.selectedTable == "License") {
            auditService.getLicenseAuditInfo(request).then(function (result) {
                angular.forEach(result.data, function (item) {
                    if (item.columnsUpdated) {
                        item.highlightColumns = item.columnsUpdated.split(',');
                    }
                });
                $scope.auditDetail.licenseAudit = result.data;

            });
        } else if ($scope.selectedTable == "LicenseProduct") {
            auditService.getProductAuditInfo(request).then(function (result) {
                angular.forEach(result.data, function (item) {
                    if (item.columnsUpdated) {
                        item.highlightColumns = item.columnsUpdated.split(',');
                    }
                });
                $scope.auditDetail.licenseProductAudit = result.data;

            });
        }


    };
    $scope.isColumnModified = function (columns, value) {
        if (!columns || !value || columns.length == 0) {
            return false;
        }
        if (columns.indexOf(value) != -1) {
            return true;
        } else {
            return false;
        }

    };
    //end audit


    $scope.changeLicenseProductConfiguration = function () {
        licensesService.updateLicenseStatusReport($scope.licenseDetail.licenseId).then(function (result) {
        });
    };

    $scope.deleteNotes = function () {
        var selectedLicensesNoteIds = USL.Common.SingleFieldArray($scope.licenseDetail.licenseNoteList, 'licenseNoteId', true);
        if (selectedLicensesNoteIds.length > 0) {
            notyService.modalConfirm("Are you sure you want to delete this note(s)?").then(function () {
                licensesService.deleteLicenseNotes(selectedLicensesNoteIds).then(function (result) {
                    var message = "Note(s) removed";
                    $scope.licenseDetail.licenseNoteList = $scope.licenseDetail.licenseNoteList.filter(deleteFilter);
                    notyService.success(message);
                }, function (error) {
                    notyService.error("Note(s) remove failed");
                });

            }, function () {
            });
        }
    };

    $scope.deleteLicense = function () {
        var message = ""
        if ($scope.deleteButtonName == "Delete") {
            message = "Are you sure you want to DELETE this license?";

        }
        else {
            message = "Are you sure you want to restore this license?"
        }
        notyService.modalConfirm(message).then(function () {
            if ($scope.deleteButtonName == "Delete") {
                // $scope.deleteButtonName = "Restore";  // no requirement yet
                $scope.licenseDetail.licenseStatusId = 9;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Deleted";
                initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
                licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                    var message = "Status Changed to Deleted";
                    notyService.success(message);
                }, function (error) {
                });
            }
            else {


            }


        });
    };

    function removeOutForSignatureAttachments() {
        //remove previous OUT_FOR_SIGNATURE attachments
        var selectedAttachments = [];
        angular.forEach($scope.licenseAttachments, function (attachment) {
            if (attachment.fileName.indexOf("_OUT_FOR_SIGNATURE") > -1) {
                selectedAttachments.push(attachment);
            }
        });

        filesService.removeMultiple(selectedAttachments).then(function (result) {

            // Remove from UI
            for (var i = 0; i < $scope.licenseAttachments.length; i++) {
                var j = 0;
                var found = false;
                while (j < selectedAttachments.length && !found) {
                    if (selectedAttachments[j].fileName == $scope.licenseAttachments[i].fileName) {
                        $scope.licenseAttachments.splice(i, 1);
                        found = true;
                    }
                    j++;
                }

            }

        }, function (error) {

        });
    }

    $scope.verifyLicense = function () {
        var message = ""
        if ($scope.verifyButtonName == "Verify") {
            message = "Are you sure you want to set this license back to Verifying status?";
            notyService.modalConfirm(message).then(function () {
                if ($scope.licenseDetail.licenseStatusId == 6) {
                    var data = {
                        licenseId: licenseId,
                        userAction: 2
                    }
                    licensesService.updateGeneratedLicenseStatus(data);
                }

                removeOutForSignatureAttachments();

                $scope.licenseDetail.licenseStatusId = 2;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Verifying";
                $scope.licenseDetail.licenseStatus.licenseStatusId = 2;
                initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
                licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                    message = "Status Changed to Verifying";
                    notyService.success(message);
                }, function (error) {
                });

            });

        }
        else {

        }
    };

    $scope.holdLicense = function () {
        var message = ""
        if ($scope.holdButtonName == "Hold") {
            message = "Are you sure you want to hold this license?";
        }
        else {
            message = "Are you sure you want to release hold to this license?"
        }
        notyService.modalConfirm(message).then(function () {
            if ($scope.holdButtonName == "Hold") {
                $scope.holdButtonName = "Release Hold";
                $scope.licenseDetail.licenseStatusId = 3;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Hold";
            }
            else {
                $scope.holdButtonName = "Hold"
                $scope.licenseDetail.licenseStatusId = 2;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Verifying";

            }
            initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
            licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                message = "Status Changed to " + $scope.licenseDetail.licenseStatus.licenseStatus;
                notyService.success(message);
            }, function (error) {
            });

        });

    };

    $scope.acceptLicense = function () {
        var message = "";
        if ($scope.licenseDetail.effectiveDate) {
            $scope.dt = moment($scope.licenseDetail.effectiveDate).format();

        }
        if ($scope.licenseDetail.receivedDate) {
            $scope.dtReceived = moment($scope.licenseDetail.receivedDate).format();

        }
        if ($scope.licenseDetail.signedDate) {
            $scope.dtSigned = moment($scope.licenseDetail.signedDate).format();

        }
        if ($scope.acceptButtonName == "Accept") {
            message = "Are you sure you want to Accept this license?";
            notyService.modalConfirm(message).then(function () {
                $scope.licenseDetail.licenseStatusId = 7;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Accepted";
                initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
                licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                    message = "Status Changed to Accepted";
                    notyService.success(message);
                    $state.go('SearchMyView.DetailLicense', {
                        licenseId: $scope.licenseDetail.licenseId
                    }, {
                        reload: true
                    });
                }, function (error) {
                    message = "Status change failed";
                    notyService.error(message);
                });


            });

        }
    };

    $scope.proformaLicense = function () {
        var message = ""
        if ($scope.proformaButtonName == "ProForma") {
            message = "Are you sure you want change status to ProForma ?";
            notyService.modalConfirm(message).then(function () {
                $scope.licenseDetail.licenseStatusId = 1;
                $scope.licenseDetail.licenseStatus.licenseStatus = "ProForma";
                initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
                licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                    var message = "Status Changed to ProForma";
                    notyService.success(message);
                }, function (error) {
                    var message = "Status change failed";
                    notyService.error(message);
                });


            });

        }
    };

    $scope.addendumLicense = function () {
        var message = ""
        if ($scope.addendumButtonName == "Addendum") {
            message = "Are you sure you want to create an Addendum to this license?";
            notyService.modalConfirm(message).then(function () {
                $scope.licenseDetail.licenseStatusId = 2;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Verifying";

                var notymessage = 'Note: This may take up to two minutes to complete as the database and SOLR index are updating.';
                var notytype = 'success';
                var notytimeout = 5000;
                noty({
                    text: notymessage,
                    type: notytype,
                    timeout: notytimeout,
                    layout: "top"
                });


                //initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
                var contactid = $scope.safeauthentication.contactId;
                licensesService.copyLicense(licenseId, "Addendum", contactid).then(function (result) {
                    if (result.data.success) {
                        message = 'Addendum Created';
                        notyService.success(message);
                        $state.go('SearchMyView.DetailLicense', {
                            licenseId: result.data.licenseId
                        });
                    }
                    else {
                        message = 'Error creating addendum'
                        notyService.error(message);
                    }

                }, function (error) {
                    message = 'Error creating addendum ' + result.data.errorMessage;
                    notyService.error(message);
                });
            });
        }

    };

    $scope.copyLicense = function () {
        var message = ""
        if ($scope.copyButtonName == "Copy") {
            message = "Are you sure you want to create a Copy of this license?";
            notyService.modalConfirm(message).then(function () {
                $scope.licenseDetail.licenseStatusId = 2;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Verifying";

                var notymessage = 'Note: This may take up to two minutes to complete as the database and SOLR index are updating.';
                var notytype = 'success';
                var notytimeout = 5000;
                noty({
                    text: notymessage,
                    type: notytype,
                    timeout: notytimeout,
                    layout: "top"
                });


                var contactid = $scope.safeauthentication.contactId;
                licensesService.copyLicense(licenseId, "Copy", contactid).then(function (result) {
                    if (result.data.success) {
                        message = 'Copy Created'
                        notyService.success(message);
                        $state.go('SearchMyView.DetailLicense', {
                            licenseId: result.data.licenseId
                        });
                    }
                    else {
                        message = 'Error creating Copy';
                        notyService.error(message);
                    }

                }, function (error) {
                    message = 'Error creating Copy ' + result.data.errorMessage;
                    notyService.error(message);
                });

            });

        }
    };
    $scope.voidLicense = function () {
        var message = ""
        if ($scope.voidButtonName == "Void") {
            message = "Are you sure you want to void this license?";
        }
        else {
            message = "Are you sure you want to unvoid this license?"
        }
        notyService.modalConfirm(message).then(function () {
            if ($scope.voidButtonName == "Void") {
                // if license is Issued
                if ($scope.licenseDetail.licenseStatusId == 6) {
                    var data = {
                        licenseId: licenseId,
                        userAction: 1
                    }
                    licensesService.updateGeneratedLicenseStatus(data);
                }
                $scope.voidButtonName = "Unvoid";
                $scope.licenseDetail.licenseStatusId = 8;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Voided";

            }
            else {
                $scope.voidButtonName = "Void"
                $scope.licenseDetail.licenseStatusId = 2;
                $scope.licenseDetail.licenseStatus.licenseStatus = "Verifying";

            }
            initializeButtons($scope.buttons, $scope.licenseDetail.licenseStatusId, $scope.licenseDetail.licenseTypeId);
            licensesService.updateLicenseStatus($scope.licenseDetail).then(function (result) {
                var message = "Status Changed to Voided";
                notyService.success(message);
            }, function (error) {
            });

        });

    };
    $scope.loadSchedules = function () {
    if ($scope.scheduleList.length == 0) {
        licensesService.getSchedules().then(function (result) {
            $scope.scheduleList = result.data;
            });
            }
            };

    function loadSchedules() {
        licensesService.getSchedules().then(function (result) {
            $scope.scheduleList = result.data;
        });
    };

    $scope.selectSchedule = function (schedule, product) {
        var oldSchedule = product.schedule;
        var oldSchId = product.scheduleId;
        var productList = [];
        angular.forEach($scope.products, function (item) {
            if (item.scheduleId == schedule.scheduleId) {
                item.schedule = oldSchedule;
                item.scheduleId = oldSchId;
                productList.push(item);
            }
        });
        product.schedule = schedule,
        product.scheduleId = schedule.scheduleId;
        productList.push(product);
        licenseProductsService.updateProductsSchedule(productList);
        $scope.products = $filter('orderBy')($scope.products, 'scheduleId');
    };

    $scope.loadDetail();


    function getProductConfigurationUpc(product_configuration_id) {
        for (var i = 0; i < $scope.products.length; i++) {
            for (var j = 0; j < $scope.products[i].productHeader.configurations.length; j++) {
                if ($scope.products[i].productHeader.configurations[j].id == product_configuration_id) {
                    return $scope.products[i].productHeader.configurations[j].upc;
                }
            }
        }
        return ' not found ';
    }

    function deleteFilter(category, index, array) {
        return category.selected == false;
    };

    function initializeButtons(buttons, licenseStatusId, licenseTypeId) {
        // Verifying = 2
        if (licenseStatusId == 2) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = true;

            });
            $scope.paidQuarterDisabled = false;
            if (licenseTypeId == 1) // Standard
            {
                buttons.acceptLicense = false;
                buttons.executeLicense = true;
                buttons.verifyLicense = false;
                buttons.addendumLicense = false;
                buttons.holdLicense = true;
                buttons.issueLicense = true;
                buttons.deleteLicense = true;
                buttons.voidLicense = true;
                buttons.copyLicense = false;
                buttons.rejectLicense = false;
                buttons.proformaLicense = true;
                //new 
                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
                buttons.writerConsentBtn = true;
                buttons.writerNoteBtn = true;
                buttons.editIndividualRates = true;
            }

            if (licenseTypeId == 2) //NOI type
            {

                buttons.executeLicense = false;
                buttons.verifyLicense = false;
                buttons.addendumLicense = false;
                buttons.issueLicense = false;
                buttons.acceptLicense = true;
                buttons.holdLicense = true;
                buttons.deleteLicense = true;
                buttons.voidLicense = true;
                buttons.copyLicense = false;
                buttons.rejectLicense = false;
                buttons.proformaLicense = true;

                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
                buttons.writerConsentBtn = true;
                buttons.writerNoteBtn = true;
                buttons.editIndividualRates = true;

            }

            if (licenseTypeId == 2 || licenseTypeId == 3) //NOI type or Advice Letter
            {

                buttons.executeLicense = false;
                buttons.verifyLicense = false;
                buttons.addendumLicense = false;
                buttons.issueLicense = false;
                buttons.acceptLicense = true;
                buttons.holdLicense = true;
                buttons.deleteLicense = true;
                buttons.voidLicense = true;
                buttons.copyLicense = false;
                buttons.rejectLicense = false;
                buttons.proformaLicense = true;

                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
                buttons.writerConsentBtn = true;
                buttons.writerNoteBtn = true;
                buttons.editIndividualRates = true;

            }

            if (licenseTypeId == 4) //Gratis
            {


                buttons.acceptLicense = true;
                buttons.issueLicense = true;
                buttons.holdLicense = true;
                buttons.deleteLicense = true;
                buttons.voidLicense = true;
                buttons.proformaLicense = true;

                buttons.verifyLicense = false;
                buttons.addendumLicense = false;
                buttons.executeLicense = false;
                buttons.copyLicense = false;
                buttons.rejectLicense = false;


                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
                buttons.writerConsentBtn = true;
                buttons.writerNoteBtn = true;
                buttons.editIndividualRates = true;

            }

            if (licenseTypeId == 5) //Blanket
            {

                buttons.executeLicense = true;
                buttons.issueLicense = true;
                buttons.holdLicense = true;
                buttons.deleteLicense = true;
                buttons.voidLicense = true;
                buttons.proformaLicense = true;

                buttons.acceptLicense = false;
                buttons.verifyLicense = false;
                buttons.addendumLicense = false;
                buttons.copyLicense = false;
                buttons.rejectLicense = false;


                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
                buttons.writerConsentBtn = true;
                buttons.writerNoteBtn = true;
                buttons.editIndividualRates = true;

            }


        }   // Hold = 3
        else if (licenseStatusId == 3) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            buttons.holdLicense = true;
            buttons.voidLicense = true;
            buttons.deleteLicense = true;
            buttons.executeLicense = false;
            buttons.acceptLicense = false;
            buttons.issueLicense = false;
            buttons.addendumLicense = false;
            buttons.verifyLicense = false;
            buttons.copyLicense = false;
            buttons.rejectLicense = false;

        }   // proforma = 1
        else if (licenseStatusId == 1) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            buttons.holdLicense = false;
            buttons.voidLicense = true;
            buttons.deleteLicense = true;
            buttons.executeLicense = false;
            buttons.acceptLicense = false;
            buttons.issueLicense = false;
            buttons.addendumLicense = false;
            buttons.verifyLicense = true;
            buttons.copyLicense = false;
            buttons.rejectLicense = false;

        } // Void = 8
        else if (licenseStatusId == 8) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            buttons.voidLicense = false;
            buttons.deleteLicense = false;
            buttons.executeLicense = false;
            buttons.acceptLicense = false;
            buttons.issueLicense = false;
            buttons.addendumLicense = false;
            buttons.verifyLicense = false;
            buttons.copyLicense = true;
            buttons.rejectLicense = false;


        } // Issued = 6
        else if (licenseStatusId == 6) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            if (licenseTypeId == 1 || licenseTypeId == 4 || licenseTypeId == 5) //Standard,Gratis,Blanket
            {
                buttons.acceptLicense = false;
                buttons.addendumLicense = false;
                buttons.holdLicense = false;
                buttons.rejectLicense = false;
                buttons.executeLicense = true;
                buttons.verifyLicense = true;
                buttons.voidLicense = true;
                buttons.deleteLicense = true;
                buttons.copyLicense = false;


            }
            if (licenseTypeId == 2 || licenseTypeId == 3) //NOI or Advice Letter
            {
                buttons.holdLicense = false;
                buttons.rejectLicense = false;
                buttons.executeLicense = false;
                buttons.addendumLicense = false;
                buttons.acceptLicense = true;
                buttons.verifyLicense = true;
                buttons.voidLicense = true;
                buttons.deleteLicense = true;
                buttons.copyLicense = false;


            }
            if ($scope.safeauthentication.roleId >= 3) {
                buttons.addNotes = true;
                buttons.editNotes = true;
                buttons.deleteNotes = true;
                buttons.addAttachment = true;
                buttons.downloadAttachment = true;
                buttons.deleteAttachment = true;
            }
            if ($scope.safeauthentication.roleId <= 2) {
                buttons.addNotes = false;
                buttons.editNotes = false;
                buttons.deleteNotes = false;
                buttons.addAttachment = false;
                buttons.downloadAttachment = false;
                buttons.deleteAttachment = false;
            }
            buttons.writerConsentBtn = false;
            buttons.writerNoteBtn = false;
            buttons.editIndividualRates = false;

        } // Executed = 5
        else if (licenseStatusId == 5) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            if (licenseTypeId == 1 || licenseTypeId == 4 || licenseTypeId == 5) //Standard,Gratis,Blanket
            {
                buttons.acceptLicense = false;
                buttons.addendumLicense = true;
                buttons.holdLicense = false;
                buttons.rejectLicense = false;
                buttons.executeLicense = false;
                buttons.verifyLicense = false;
                buttons.voidLicense = true;
                buttons.deleteLicense = false;
                buttons.copyLicense = false;
            }
            $scope.paidQuarterDisabled = false;
            buttons.addNotes = true;
            buttons.editNotes = true;
            buttons.deleteNotes = true;
            if ($scope.safeauthentication.roleId >= 3) {
                buttons.addAttachment = true; //Jeff Changed from False to True || Ticket USL-1062
                buttons.downloadAttachment = true; //Jeff Changed from False to True || Ticket USL-1062
            }
            if ($scope.safeauthentication.roleId <= 2) {
                buttons.addAttachment = false;  // || Ticket USL-1062
                buttons.downloadAttachment = false; // || Ticket USL-1062
            }

            buttons.deleteAttachment = false;
            buttons.writerConsentBtn = false;
            buttons.writerNoteBtn = false;
            buttons.editIndividualRates = false;

        } // Accepted = 7
        else if (licenseStatusId == 7) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = false;
            if (licenseTypeId == 2 || licenseTypeId == 3 || licenseTypeId == 4) //NOI or Advice Letter
            {
                buttons.holdLicense = false;
                buttons.rejectLicense = false;
                buttons.executeLicense = false;
                buttons.addendumLicense = true;
                buttons.acceptLicense = false;
                buttons.verifyLicense = false;
                buttons.voidLicense = true;
                buttons.deleteLicense = false;
                buttons.copyLicense = false;

            }
            if (licenseTypeId == 4) //gratis
            {
                buttons.holdLicense = false;
                buttons.rejectLicense = false;
                buttons.executeLicense = false;
                buttons.addendumLicense = true;
                buttons.acceptLicense = false;
                buttons.verifyLicense = false;
                buttons.voidLicense = true;
                buttons.deleteLicense = false;
                buttons.copyLicense = false;

            }

            if ($scope.safeauthentication.roleId >= 3) {
                buttons.addNotes = true; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
                buttons.editNotes = true; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
                buttons.deleteNotes = true; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
            }
            if ($scope.safeauthentication.roleId <= 2) {
                buttons.addNotes = false; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
                buttons.editNotes = false; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
                buttons.deleteNotes = false; //Jeff Changed [False] to TRUE || Per Ticket USL-1082
            }
            if ($scope.safeauthentication.roleId >= 3) {
                buttons.addAttachment = true; //Jeff Changed from False to True || Ticket USL-1062
                buttons.downloadAttachment = true; //Jeff Changed from False to True || Ticket USL-1062
            }
            if ($scope.safeauthentication.roleId <= 2) {
                buttons.addAttachment = false;  // || Ticket USL-1062
                buttons.downloadAttachment = false; // || Ticket USL-1062
            }

            buttons.deleteAttachment = false;
            buttons.writerConsentBtn = false;
            buttons.writerNoteBtn = false;
            buttons.editIndividualRates = false;

        } // Deleted = 9
        else if (licenseStatusId == 9) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            buttons.voidLicense = false;
            buttons.addendumLicense = false;
            buttons.deleteLicense = false;
            buttons.executeLicense = false;
            buttons.acceptLicense = false;
            buttons.copyLicense = false;
            buttons.rejectLicense = false;


        }// Rejected = 4
        else if (licenseStatusId == 4) {
            angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });
            $scope.paidQuarterDisabled = true;
            if (licenseTypeId == 1 || licenseTypeId == 4 || licenseTypeId == 5) //Standard,Gratis,Blanket
            {
                buttons.addendumLicense = false;
                buttons.executeLicense = false;
                buttons.acceptLicense = false;
                buttons.copyLicense = false;
                buttons.verifyLicense = true;
                buttons.voidLicense = true;
                buttons.deleteLicense = true;
                buttons.rejectLicense = false;
            }

        }
            //If license == 'Failed'
        else if (licenseStatusId == 10) {
            /*angular.forEach(buttons, function (value, key) {
                buttons[key] = false;
            });*/
            $scope.paidQuarterDisabled = true;
            buttons.voidLicense = false;
            buttons.addendumLicense = false;
            buttons.deleteLicense = false;
            buttons.executeLicense = false;
            buttons.acceptLicense = false;
            buttons.copyLicense = false;
            buttons.rejectLicense = false;
            buttons.verifyLicense = true;

        }
        if ($scope.safeauthentication == null) {
            $scope.paidQuarterDisabled = true;
        }

    };

    $scope.expandAll = function () {
        $scope.isCollapsed = false;
        angular.forEach($scope.products, function (prod) {
            $scope.checkRecordings(false, prod.licenseProductId);
            angular.forEach(prod.recordings, function (rec) {
                rec.writersCollapsed = true;
                $scope.collapseWriters(rec);
            });
        });
    };
    $scope.collapseAll = function () {
        $scope.isCollapsed = true;
        angular.forEach($scope.products, function (prod) {
            $scope.checkRecordings(true, prod.licenseProductId);
            angular.forEach(prod.recordings, function (rec) {
                rec.writersCollapsed = false;
                $scope.collapseWriters(rec);
            });
        });
    };
    $scope.format = "MM/dd/yyyy";


    //USL-1102
    $scope.isSampleWriter = function (writerName, copyrights) {
        writerName = writerName.trim();
        var rv = false;
        if (copyrights != null) {
            for (var i = 0; i < copyrights.length; i++) {
                if (copyrights[i].sampledWorks != null) {
                    for (var j = 0; j < copyrights[i].sampledWorks.length; j++) {
                        var sampledWriterString = copyrights[i].sampledWorks[j].writers + " / ";
                        var sampledWriterArray = sampledWriterString.split(" / ");
                        rv = inArray(writerName, sampledWriterArray);
                        if (rv) {
                            break;
                        }
                    }
                }
                if (rv) {
                    break;
                }
            }
        }
        return rv;
    }

    function inArray(needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle)
                return true;
        }
        return false;
    }

    $scope.isOpenTo = false;
    $scope.isOpenFrom = false;

    $scope.generateDetailLicenseDoc = function (licenseDetail, licenseAttachments, products) {
        $state.go('SearchMyView.DetailLicense.StepsModal.GenerateDocument',
        ({
            licenseData: licenseDetail, files: licenseAttachments, products: products
        }));
    };

    $scope.executeDoc = function (licenseDetail, licenseAttachments) {
        $state.go("SearchMyView.DetailLicense.StepsModal.ExecuteDocument", ({
            licenseData: licenseDetail, files: licenseAttachments
        }));
    };

    $scope.createLicense = function () {
        $state.go("SearchMyView.DetailLicense.StepsModal.CreateLicense");
    };
    $scope.editLicenseModal = function (licenseDetail, id, products) { // the id has been hardcoded to 2
        $state.go("SearchMyView.DetailLicense.StepsModal.EditLicense", ({
            licenseData: licenseDetail, actionId: id, products: products
        }));
    }
    $scope.addLicProducts = function (licenseDetail, products) {
        $state.go("SearchMyView.DetailLicense.StepsModal.AddProducts", ({
            licenseData: licenseDetail, products: products
        }));
    };
    $scope.editConfigs = function (licenseDetail, products) {
        $state.go("SearchMyView.DetailLicense.StepsModal.EditConfigs", ({
            licenseData: licenseDetail, products: products
        }));
    };
    $scope.editRatesModal = function (licenseDetail, products) {
        $state.go("SearchMyView.DetailLicense.StepsModal.EditRates", ({
            licenseData: licenseDetail, products: products
        }));
    };
    $scope.generateDocumentPreview = function (licenseDetail, a, products, directPreviewPageObject) { // a = ''
        $state.go("SearchMyView.DetailLicense.StepsModal.GenerateDirectDocumentPreview",
        ({
            licenseData: licenseDetail, actionId: a, products: products, otherValues: directPreviewPageObject
        }));
    };
    $scope.editWriterRate = function (licenseDetail,
            licenseTypeId,
            id,
            i_writer,
            productIndex,
            recordingIndex,
            productId,
            recordingId,
            duration,
            claimException,
            licenseDetailRollUp,
            recordingRollup) {


        var writer = $scope.products[productIndex].recordings[recordingIndex].licensePRWriters[i_writer];

        //    console.log("go go gadget: " + JSON.stringify(licenseDetail));
        //      console.log("go go gadget: " + JSON.stringify(licenseTypeId));

        $state.go("SearchMyView.DetailLicense.StepsModal.EditWriterRate",
        ({
            license: licenseDetail,
            licenseTypeId: licenseTypeId,
            licenseId: id,
            writer: writer,
            productId: productId,
            recordingId: recordingId,
            songDuration: duration,
            claimException: claimException,
            statsRollup: licenseDetailRollUp,
            trackStatsRollup: recordingRollup
        }));
    };



    $scope.editWriterRate3 = function (licenseDetail,
    licenseTypeId,
        id,
    writer,
    productId,
    recordingId,
    duration,
    claimException,
    licenseDetailRollUp,
    recordingRollup) {
        setLastModifiedRecordingID(recordingId);
        var deserializedWriter = JSON.parse(JSON.stringify(writer));

        $state.go("SearchMyView.DetailLicense.StepsModal.EditWriterRate",
        ({
            license: licenseDetail,
            licenseTypeId: licenseTypeId,
            licenseId: id,
            writer: deserializedWriter,
            productId: productId,
            recordingId: recordingId,
            songDuration: duration,
            claimException: claimException,
            statsRollup: licenseDetailRollUp,
            trackStatsRollup: recordingRollup
        }));
    };


    $scope.GoAddWriterNote = function (writer, recording) {
        setLastModifiedRecordingID(recording);
        var deserializedWriter = JSON.parse(JSON.stringify(writer));

        $state.go("SearchMyView.DetailLicense.StepsModal.AddWriterNote",
        {
            writer: deserializedWriter
        });
    }

    $scope.GoEditWriterNote = function (writer, writerNotes, buttons) {
        var deserializedWriter = JSON.parse(JSON.stringify(writer));
        var deserializedWriterNotes = JSON.parse(JSON.stringify(writerNotes));
        var deserializedWriterButtons = JSON.parse(JSON.stringify(buttons));
        $state.go("SearchMyView.DetailLicense.StepsModal.EditWriterNote",
        {
            writer: deserializedWriter,
            writerNotes: deserializedWriterNotes,
            buttons: deserializedWriterButtons
        });
    }

    $scope.WritersIncludedModal = function (rate,
        licenseAttachments,
            recording,
            writer,
            product,

            rateConfiguration) {
        setLastModifiedRecording(recording);
        var deserializedRate = JSON.parse(JSON.stringify(rate));
        var deserializedRateConfiguration = JSON.parse(JSON.stringify(rateConfiguration));

        $state.go("SearchMyView.DetailLicense.StepsModal.WritersIsIncluded",
        ({
            config: deserializedRate,
            files: licenseAttachments,
            recording: recording,
            writer: writer,
            product: product,
            modalSize: 'sm',
            rate1: deserializedRateConfiguration
        }));

    }

    $scope.WriterConsentModal = function (rate, licenseAttachments, recording, writer, product) {
        setLastModifiedRecording(recording);
        var deserializedRate = JSON.parse(JSON.stringify(rate));
        var deserializedWriter = JSON.parse(JSON.stringify(writer));
        var deserializedProduct = JSON.parse(JSON.stringify(product));
        $state.go("SearchMyView.DetailLicense.StepsModal.WritersConsent",
        ({
            config: deserializedRate,
            files: licenseAttachments,
            recording: recording,
            writer: deserializedWriter,
            product: deserializedProduct,
            modalSize: 'md'
        }));
    }

    $scope.ModalPaidQuarter = function (licenseDetailId, rate, recording, writer, product) {
        setLastModifiedRecording(recording);
        $state.go('SearchMyView.DetailLicense.StepsModal.PaidQuarter',
        ({
            licenseId: licenseDetailId,
            config: rate,
            recording: recording,
            writer: writer,
            product: product,
            modalSize: 'sm'
        }));
    }





    $scope.updateWriters = function () {
        $scope.loadDetail();
        $scope.firstFilter = false;
    }









    $scope.createCookie = function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    $scope.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $scope.eraseCookie = function (name) {
        $scope.createCookie(name, "", -1);
    }



}]);


