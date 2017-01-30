'use strict';
app.controller('editRatesController', ['$scope', 'licensesService', 'licenseProductsService', 'licenseProductConfigurationService', 'rateTypesService', '$stateParams', 'editRatesService', '$filter', '$parse', '$state', 'safeService', function ($scope, licensesService, licenseProductsService, licenseProductConfigurationService, rateTypeService, $stateParams, editRatesService, $filter, $parse, $state, safeService) {
    // 2016-03 changed unique identifier for configurations from configuration_id to product_configuration_id

    $scope.safeauthentication = safeService.getAuthentication();
    $scope.modifiedBy = $scope.safeauthentication.contactId;
    $scope.products = [];
    $scope.licenseWriterHasLicenseDate = [];
    $scope.rates = [];
    $scope.recordings = [];
    $scope.writers = [];
    $scope.computedWriterIds = [];
    $scope.specialstatuses = [];
    $scope.specialstatusesForSave = [];
    $scope.ratetypes = [];
    $scope.ratetypesForSave = [];
    $scope.listOfCombinedRateIdsAll = [];
    $scope.listOfCombinedRateIdsSelected = [];
    $scope.listOfCombinedRateIdsResult = [];
    $scope.quarters = null;
    $scope.saved = false;
    $scope.EditData = {
        selectedRateType: { rateType: "Statutory", rateTypeId:1 },
        selectedRateTypeId: null,
        selectedStatuses: [],
        selectedStatusesIds: [],
        splitOverride: null,
        isSample: false,
        licenseWriterDate: new Date(),
        paidQtr: null,
        statYear: "Year",
        percentOfStat: null,
        escalatedRate: null,
        rate: null,
        dt: "",
        proRata: null,
        songRate: null,
        modifiedBy: $scope.safeauthentication.contactId,
        //selectedIds: {}
        selectedWritersIds: [],
        rates: [],
        writers: [],
        //configurationIds: []
        productConfigurationIds:[]
    };
    
    $scope.changeRate = function (rate, rateType) {
        switch (rateType.rateTypeId) {
            case 8:
                rate.percentOfStat = null;
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = false;
                rate.visibleYear = false;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 9:
                rate.percentOfStat = null;
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = false;
                rate.visibleYear = true;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 1:
                rate.percentOfStat = null;
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = false;
                rate.visibleYear = true;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 2:
            case 5:
                rate.percentOfStat = null;
                rate.visibleAdd = true;
                rate.visibleRate = true;
                rate.visibleRemove = true;
                rate.visibleStat = false;
                rate.visibleYear = false;
                rate.visibleThreshold = true;
                //USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 6:
            case 3:
            case 10:
            case 11:
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = true;
                rate.visibleYear = true;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 4:
            case 7:
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = true;
                rate.visibleYear = true;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            case 12:
                rate.percentOfStat = null;
                rate.escalatedRate = null;
                rate.rate = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = false;
                rate.visibleYear = false;
                rate.visibleThreshold = false;
                USL.Common.FindAndRemoveExcept($scope.EditData.rates, 'id', 0);
                break;
            default: break;
        }
    }
    $scope.firstRate = {
        selectedRateType: { rateType: "Statutory", rateTypeId: 1 },
        selectedRateTypeId: null,
        selectedStatuses: [],
        selectedStatusesIds: [],
        splitOverride: null,
        isSample: false,
        licenseWriterDate: new Date(),
        paidQtr: "",
        statYear: new Date().getFullYear() + "",
        percentOfStat: null,
        escalatedRate: null,
        rate: null,
        dt: "",
        proRata: null,
        songRate: null,
        modifiedBy: $scope.modifiedBy,
        //selectedIds: {}
        selectedWritersIds: [],
        visibleAdd: false,
        visibleRemove: false,
        visibleRate: false,
        visibleStat: false,
        visibleYear: false,
        visibleThreshold: false,
        isFirstRate: true,
        id: 0
    };
    if ($stateParams.licenseData.effectiveDate) {
        $scope.firstRate.statYear = new Date($stateParams.licenseData.effectiveDate).getFullYear() + "";
    }
    $scope.EditData.rates.push($scope.firstRate);
    $scope.changeRate($scope.EditData.rates[0], $scope.EditData.rates[0].selectedRateType);
    $scope.currentSource = "";
    $scope.sourceCount = 0;
    $scope.years = [];
    $scope.getYears = function () {
         if ($scope.years.length == 0) {
             licenseProductsService.getYears().then(function (results) {
                 $scope.years = results.data;
            }, function (error) {
            });
        }
    };
    $scope.getYears();
    $scope.licenseDetails = $stateParams.licenseData;
    $scope.licenseproducts = $stateParams.products;
    $scope.configurations = [];
    $scope.selectedProduct = [];
    $scope.selectedConfigurations = [];
    $scope.selectedRecordings = [];
    $scope.selectedWriters = [];
    $scope.selectedSpecialStatuses = [];
    $scope.selectedRateType = [];
    $scope.selectedRateTypeforSave = [];

    $scope.testArray = [
        {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }, {
            name: "test"
        }
    ];

    $scope.getQuarters = function () {
        if ($scope.quarters == null) {
            licensesService.getQuarters().then(function (result) {
                result.data.unshift({ paidQuarter: "N/A" });
                $scope.quarters = result.data;
            });
        }
    }
    $scope.selectQuarter = function (qtr) {
        if (qtr.paidQuarter == "N/A") {
            $scope.EditData.paidQtr = null;
        } else {
            $scope.EditData.paidQtr = qtr.paidQuarter;
        }
       
    }
   
    $scope.ok = function (reload) {
        
                var statError = false;
                var rateError = false;

                var stats = document.getElementsByClassName('rateStatPrcentage');
                for (var i = 0; i < stats.length; i++) {
                    if (stats[i].offsetParent !== null) { // stat textbox is visible
                        if (!(stats[i].value > 0) || stats[i].value > 100) {
                            stats[i].classList.add('field-error');
                            statError = true;
                        }
                    }
                }
                var rates = document.getElementsByClassName('rateValue');
                for (var i = 0; i < rates.length; i++) {
                    if (rates[i].offsetParent !== null) { // rate textbox is visible
                        if (!(rates[i].value >= 0) || rates[i].value > 10) {
                            rates[i].classList.add('field-error');
                            rateError = true;
                        }
                    }
                }

                if (statError || rateError) return;

                var licenseId = $scope.licenseDetails.licenseId;
                var statusesIdsList = [];
                //$scope.EditData.configurationIds = [];
                $scope.EditData.productConfigurationIds = [];
                angular.forEach($scope.EditData.selectedStatuses, function (item) {
                    statusesIdsList.push(item.specialStatusId);
                });
                angular.forEach($scope.EditData.rates, function (rate) {
                    rate.selectedRateTypeId = rate.selectedRateType.rateTypeId;
                });
                var combinedIds = [];
                if ($scope.listOfCombinedRateIdsSelected.length==0) {
                    combinedIds = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsAll);
                } else {
                    combinedIds = $scope.listOfCombinedRateIdsSelected;
                }

                //  USL-1182 
                //  if writers are selected first, then a track is selected, unselected writers are included in the update, need to filter them out.

                var uniqueWriterCaes = $filter('unique')($scope.selectedWriters, 'caeNumber');

                var trackIds = [];
                var writerCaes = [];
                angular.forEach(combinedIds, function (item) {
                    var ids = item.split('.');
                    //  USL-1182 
                    if ($scope.selectedWriters.length > 0) {
                        angular.forEach(uniqueWriterCaes, function (uniqueWriterCae) {
                            if (uniqueWriterCae.caeNumber == ids[2]) {
                                trackIds.push(ids[1]);
                                writerCaes.push(ids[2]);
                            }
                        });
                    } else {
                        trackIds.push(ids[1]);
                        writerCaes.push(ids[2]);
                    }
                });
                trackIds = $filter('uniqueSimpleArray')(trackIds);
                writerCaes = $filter('uniqueSimpleArray')(writerCaes);
                $scope.EditData.selectedWritersIds = [];
                angular.forEach($scope.recordings, function (recording) {
                    angular.forEach(trackIds, function (trackId) {
                       if (recording.licenseRecording.licenseRecordingId == trackId) {
                           angular.forEach(recording.writers, function (recWriter) {
                               angular.forEach(writerCaes, function (writerCae) {
                                   if (recWriter.caeNumber == writerCae && recWriter.controlled == true) {
                                       $scope.EditData.selectedWritersIds.push(recWriter.licenseProductRecordingWriter.licenseWriterId);
                                       recWriter.parentSongDuration = recording.track.duration;
                                       $scope.EditData.writers.push(recWriter);
                                   }
                               });
                           });
                       }
                    });

                });
                if ($scope.selectedConfigurations.length==0) {
                    angular.forEach($scope.configurations, function (config) {
                        if (config.licenseProductConfiguration != null) {
                           // $scope.EditData.configurationIds.push(config.configuration.id);
                            $scope.EditData.productConfigurationIds.push(config.id);
                        }

                    });
                }else{
                angular.forEach($scope.selectedConfigurations, function (config) {
                   // $scope.EditData.configurationIds.push(config.configuration.id);
                    $scope.EditData.productConfigurationIds.push(config.id);
                });
                }

                //var filtered = $filter('uniqueSimpleArray')($scope.EditData.configurationIds);
                //$scope.EditData.configurationIds = filtered;
                var filtered = $filter('uniqueSimpleArray')($scope.EditData.productConfigurationIds);
                $scope.EditData.productConfigurationIds = filtered;
                $scope.EditData.selectedStatusesIds = statusesIdsList;
                $scope.EditData.licenseId = licenseId;
                $scope.EditData.modifiedBy = $scope.modifiedBy;

                var licenseDateExist = false;
                angular.forEach($scope.EditData.selectedWritersIds, function(selectedIds) {
                    angular.forEach($scope.licenseWriterHasLicenseDate, function(ids) {

                        if (selectedIds == ids) {
                            licenseDateExist = true;
                        }
                    });
                        
                });

            var textMessageLicenseType = "License Date";
            if ($stateParams.licenseData.licenseTypeId == 2) {
                textMessageLicenseType = "Effective Date";
            }
            if ($stateParams.licenseData.licenseTypeId == 3 || $stateParams.licenseData.licenseTypeId == 4) {
                textMessageLicenseType = "Signed Date";
            }

            var textMessage = "You're about to change the configuration for this product from the license. <br /><br />If you proceed the " +textMessageLicenseType + " will be set to null <br /><br />Do you still want to apply the changes?";
            if (licenseDateExist) {
                noty({
                    text: textMessage,
                    type: 'confirm',
                    modal: true,
                    timeout: 5000,
                    layout: "center",
                    buttons: [
                {
                    addClass: 'btn-default', text: 'Ok', onClick: function ($noty) {

                        $noty.close();

                        $scope.okContinue(reload);

                    }
                },
                {
                    addClass: 'btn-default', text: 'Cancel', onClick: function ($noty) {
                        $noty.close();

                    }
                }
                    ]
                });

            } else {
                $scope.okContinue(reload);
            }


    };
    //fix refresh of edit rates
    $scope.okContinue = function(reload) {
        
        licenseProductsService.editRates($scope.EditData).then(function (result) {
            var l = result;
            var message = "Writer Rates applied";
            noty({
                text: message,
                type: 'success',
                timeout: 2500,
                layout: "top"

            });
            if (reload) {
                $scope.goToParent({ licenseId: $scope.selectedLicense.licenseId }, true);
            }
            else {
                $scope.saved = true;
            }
        }, function (error) {
        });
    }

    $scope.cancel = function () {
        if ($scope.saved) {
            $scope.goToParent({ licenseId: $scope.selectedLicense.licenseId }, true); // reload
        }
        else {
            $scope.goToParent({ licenseId: $scope.selectedLicense.licenseId }, false); // do not reload  
        }
    }
    $scope.addRate = function (rate) {
        var newRate = JSON.parse(angular.toJson(rate));
        newRate.isFirstRate = false;
        newRate.perSongRate = 0;
        newRate.proRataRate = 0;
        newRate.escalatedRate = "";
        newRate.rate = "";
        newRate.id = newRate.id + 1;
        newRate.modifiedBy = $scope.modifiedBy;
        $scope.changeRate(newRate, newRate.selectedRateType);
        $scope.EditData.rates.push(newRate);
    }
    $scope.removeRate = function (rate) {
        USL.Common.FindAndRemove($scope.EditData.rates, 'id', rate.id);
    }
    $scope.selectProduct = function (product) {
        if (product.selected) {
            var exists = USL.Common.FirstInArray($scope.selectedProduct, 'licenseProductId', product.licenseProductId);
            if (!exists) $scope.selectedProduct.push(product);
            //updateDropDownsv2P();
            //updateListOfIds("Product");
        } else {
            USL.Common.FindAndRemove($scope.selectedProduct, 'licenseProductId', product.licenseProductId);
            //updateDropDownsv2P();
            //updateListOfIdsUnselect("Product");
        }
        $scope.UpdateConfigDDL();
        $scope.UpdateTrackDDL();
        $scope.UpdateStatusDDL();
        $scope.UpdateRateTypeDDL();
        $scope.updateWriterDDL();
    };


    $scope.getRateTypes = function () {
        editRatesService.getRateTypes().then(function (result) {
            $scope.ratetypesForSave = result.data;
        });

    };

    $scope.getSpecialStatus = function () {
        if ($scope.specialstatusesForSave.length == 0) {
            editRatesService.getSpecialStatus().then(function (result) {
                $scope.specialstatusesForSave = result.data;
            });
        }
     };

    $scope.selectRecording = function (p) {
        if (p.selected) {
            var exists = USL.Common.FirstInArrayNested($scope.selectedRecordings, 'licenseRecording.licenseRecordingId', p.licenseRecording.licenseRecordingId);
            if (!exists) $scope.selectedRecordings.push(p);

        } else {
            USL.Common.FindAndRemoveNested($scope.selectedRecordings, 'licenseRecording.licenseRecordingId', p.licenseRecording.licenseRecordingId);

        }
        $scope.UpdateConfigDDL();
        $scope.UpdateProductDLL();
        $scope.UpdateStatusDDL();
        $scope.UpdateRateTypeDDL();
        $scope.updateWriterDDL();
    };

    $scope.selectConfiguration = function (config) {
        if (config.selected) {
            //var exists = USL.Common.FirstInArrayNested($scope.selectedConfigurations, 'configuration.id', config.configuration.id);
            var exists = USL.Common.FirstInArrayNested($scope.selectedConfigurations, 'id', config.id);
            if (!exists) {
                angular.forEach($scope.configurations, function (lconfiguration) {
                    if (lconfiguration.licenseProductConfiguration != null) {
                        //if (config.configuration.id == lconfiguration.configuration.id) {
                        if (config.id == lconfiguration.id) {
                            lconfiguration.selected = true;
                            $scope.selectedConfigurations.push(lconfiguration);
                        }
                    }
                });
            }
        } else {
            var localList = angular.toJson($scope.selectedConfigurations);
            localList = angular.fromJson(localList);
            angular.forEach(localList, function (lconfig) {

                //if (config.configuration.id == lconfig.configuration.id) {
                //    USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'configuration.id', lconfig.configuration.id);
                //}
                if (config.id == lconfig.id) {
                    USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'id', lconfig.id);
                }

            });
            angular.forEach($scope.configurations, function (lconfig) {
                //if (config.configuration.id == lconfig.configuration.id) {
                if (config.id == lconfig.id) {
                    lconfig.selected = false;
                }
            });

        }
        $scope.UpdateProductDLL();
        $scope.UpdateTrackDDL();
        $scope.UpdateStatusDDL();
        $scope.updateWriterDDL();
        $scope.UpdateRateTypeDDL();
        $scope.UpdateStatusDDL();
        
    }

    $scope.selectWriter = function (writer) {

        if (writer.selected) {
            var exists = USL.Common.FirstInArrayNested($scope.selectedWriters, 'licenseProductRecordingWriter.licenseWriterId', writer.licenseProductRecordingWriter.licenseWriterId);
            if (!exists) {
                angular.forEach($scope.writers, function (lwriter) {
                    if (writer.caeNumber == lwriter.caeNumber) {
                        lwriter.selected = true;
                        $scope.selectedWriters.push(lwriter);
                    }
                });
            }
        } else {
            var localList = angular.toJson($scope.selectedWriters);
            localList = angular.fromJson(localList);
            angular.forEach(localList, function (lwriter) {

                if (writer.caeNumber == lwriter.caeNumber) {
                    USL.Common.FindAndRemoveNested($scope.selectedWriters, 'licenseProductRecordingWriter.licenseWriterId', lwriter.licenseProductRecordingWriter.licenseWriterId);
                }

            });
            angular.forEach($scope.writers, function (lwriter) {
                if (writer.caeNumber == lwriter.caeNumber) {

                    lwriter.selected = false;
                }
            });
        }
        $scope.UpdateConfigDDL();
        $scope.UpdateProductDLL();
        $scope.UpdateTrackDDL();
        $scope.UpdateStatusDDL();
        $scope.UpdateRateTypeDDL();
    }

    $scope.selectStatus = function (status) {
        if (status.selected) {
            var exists = USL.Common.FirstInArray($scope.selectedSpecialStatuses, 'specialStatusId', status.specialStatusId);
            if (!exists) {
                angular.forEach($scope.specialstatuses, function (lstatus) {
                    if (status.specialStatusId == lstatus.specialStatusId) {
                        lstatus.selected = true;
                        $scope.selectedSpecialStatuses.push(lstatus);
                    }
                });
            }
        } else {
            var localList = angular.toJson($scope.selectedSpecialStatuses);
            localList = angular.fromJson(localList);
            angular.forEach(localList, function (lstatus) {

                if (status.specialStatusId == lstatus.specialStatusId) {
                    USL.Common.FindAndRemove($scope.selectedSpecialStatuses, 'specialStatusId', lstatus.specialStatusId);
                }

            });
            angular.forEach($scope.specialstatuses, function (lstatus) {
                if (status.specialStatusId == lstatus.specialStatusId) {
                    lstatus.selected = false;
                }
            });
        }
        $scope.UpdateConfigDDL();
        $scope.UpdateProductDLL();
        $scope.UpdateTrackDDL();
        $scope.UpdateRateTypeDDL();
        $scope.updateWriterDDL();
    }

    $scope.selectRateType = function (ratetype) {
        if (ratetype.selected) {
            var exists = USL.Common.FirstInArray($scope.selectedRateType, 'rateTypeId', ratetype.rateTypeId);
            if (!exists) {
                angular.forEach($scope.ratetypes, function (lrateType) {
                    if (ratetype.rateTypeId == lrateType.rateTypeId) {
                        $scope.selectedRateType.push(lrateType);
                        lrateType.selected = true;
                    }
                });
            }
        } else {
            var localList = angular.toJson($scope.selectedRateType);
            localList = angular.fromJson(localList);
            angular.forEach(localList, function (lrateType) {

                if (ratetype.rateTypeId == lrateType.rateTypeId) {
                    USL.Common.FindAndRemove($scope.selectedRateType, 'rateTypeId', ratetype.rateTypeId);
                }

            });
            angular.forEach($scope.ratetypes, function (lrateType) {
                if (ratetype.rateTypeId == lrateType.rateTypeId) {

                    lrateType.selected = false;
                }
            });

        }
        $scope.UpdateConfigDDL();
        $scope.UpdateProductDLL();
        $scope.UpdateTrackDDL();
        $scope.updateWriterDDL();
        $scope.UpdateStatusDDL();
        
    };

    //select rete type for save
    $scope.selectRateTypeForSave = function (rate, ratetype) {
        rate.selectedRateType = ratetype;
        $scope.changeRate(rate, ratetype);

    };

    $scope.selectSpecialStatusForSave = function (status) {
        if (status.selected) {
            var exists = USL.Common.FirstInArray($scope.EditData.selectedStatuses, 'specialStatusId', status.specialStatusId);
            if (!exists) $scope.EditData.selectedStatuses.push(status);
        } else {
            USL.Common.FindAndRemove($scope.EditData.selectedStatuses, 'specialStatusId', status.specialStatusId);
        }

    };
    $scope.selectYear = function (rate, year) {
        rate.statYear = year;
    };

    $scope.unselectProduct = function (t) {
        USL.Common.FindAndRemove($scope.selectedProduct, 'licenseProductId', t.licenseProductId);
        t.selected = false;
        computeWriterNumber();
    };

    $scope.unselectConfiguration = function (config) {
        var localList = angular.toJson($scope.selectedConfigurations);
        localList = angular.fromJson(localList);
        angular.forEach(localList, function (lconfig) {
            //if (config.configuration.id == lconfig.configuration.id) {
            //    USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'configuration.id', lconfig.configuration.id);
            //}

            if (config.id == lconfig.id) {
                USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'id', lconfig.id);
            }

        });
        angular.forEach($scope.configurations, function (lconfig) {
            //if (config.configuration.id == lconfig.configuration.id) {
            if (config.id == lconfig.id) {
                lconfig.selected = false;
            }
        });
        computeWriterNumber();
    };

    $scope.unselectTrack = function (t) {
        USL.Common.FindAndRemoveNested($scope.selectedRecordings, 'licenseRecording.licenseRecordingId', t.licenseRecording.licenseRecordingId);
        t.selected = false;
        computeWriterNumber();
    };

    $scope.unselectWriter = function (writer) {
        var localList = angular.toJson($scope.selectedWriters);
        localList = angular.fromJson(localList);
        angular.forEach(localList, function (lwriter) {

            if (writer.caeNumber == lwriter.caeNumber) {
                USL.Common.FindAndRemoveNested($scope.selectedWriters, 'licenseProductRecordingWriter.licenseWriterId', lwriter.licenseProductRecordingWriter.licenseWriterId);
            }

        });
        angular.forEach($scope.writers, function (lwriter) {
            if (writer.caeNumber == lwriter.caeNumber) {

                lwriter.selected = false;
            }
        });
        computeWriterNumber();
    }

    $scope.unselectStatus = function (status) {
        var localList = angular.toJson($scope.selectedSpecialStatuses);
        localList = angular.fromJson(localList);
        angular.forEach(localList, function (lstatus) {

            if (status.specialStatusId == lstatus.specialStatusId) {
                USL.Common.FindAndRemove($scope.selectedSpecialStatuses, 'specialStatusId', lstatus.specialStatusId);
            }

        });
        angular.forEach($scope.specialstatuses, function (lstatus) {
            if (status.specialStatusId == lstatus.specialStatusId) {
                lstatus.selected = false;
            }
        });
        computeWriterNumber();
    }

    $scope.unselectRateType = function (ratetype) {
        var localList = angular.toJson($scope.selectedRateType);
        localList = angular.fromJson(localList);
        angular.forEach(localList, function (lrateType) {

            if (ratetype.rateTypeId == lrateType.rateTypeId) {
                USL.Common.FindAndRemove($scope.selectedRateType, 'rateTypeId', ratetype.rateTypeId);
            }

        });
        angular.forEach($scope.ratetypes, function (lrateType) {
            if (ratetype.rateTypeId == lrateType.rateTypeId) {

                lrateType.selected = false;
            }
        });
        computeWriterNumber();
    };

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    
    $scope.getLicensePreview = function () {
        if (typeof $scope.selectedLicense.licensePreview == "undefined") {
            licenseProductsService.getLicensePreview($scope.selectedLicense.licenseId).then(function (result) {
                angular.forEach(result.data.licenseProducts, function (product) {
                    product.combinedRatesIds = [];
                    product.selected = false;
                    product.display = true;
                    $scope.products.push(product);
                    angular.forEach(product.productHeader.configurations, function (config) {
                        config.combinedIds = product.licenseProductId;
                        config.selected = false;
                        config.display = true;
                        //config.uniqeId = config.configuration.id;
                        config.uniqeId = config.id;
                        $scope.configurations.push(config);
                    });
                    angular.forEach(product.recordings, function (recording) {
                        recording.combinedIds = product.licenseProductId + '.' + recording.licenseRecording.licenseRecordingId;
                        recording.selected = false;
                        recording.display = true;
                        recording.combinedRatesIds = [];
                        $scope.recordings.push(recording);
                        angular.forEach(recording.writers, function (writer) {
                            if (writer.controlled == true) {
                                writer.combinedIds = product.licenseProductId + '.' + recording.licenseRecording.licenseRecordingId + '.' + writer.caeNumber;
                                writer.selected = false;
                                writer.combinedRatesIds = [];
                                writer.display = true;
                                $scope.writers.push(writer);
                                if (writer.licenseProductRecordingWriter != null) {
                                    angular.forEach(writer.licenseProductRecordingWriter.rateList,
                                        function(rate) {
                                            if (rate.licenseDate != null) {
                                                $scope.licenseWriterHasLicenseDate
                                                    .push(writer.licenseProductRecordingWriter.licenseWriterId);
                                            }
                                            rate.rateType
                                                .combinedIds =
                                                product.licenseProductId +
                                                '.' +
                                                recording.licenseRecording.licenseRecordingId +
                                                '.' +
                                                writer.caeNumber +
                                                '.' +
                                                rate.rateType.rateTypeId;
                                            rate.rateType.combinedRatesIds = [];
                                            rate.rateType.combinedRatesIds.push(rate.rateType.combinedIds);
                                            product.combinedRatesIds.push(rate.rateType.combinedIds);
                                            $scope.listOfCombinedRateIdsAll.push(rate.rateType.combinedIds);
                                            writer.combinedRatesIds.push(rate.rateType.combinedIds);
                                            recording.combinedRatesIds.push(rate.rateType.combinedIds);
                                            rate.selected = false;
                                            rate.display = false;
                                            rate.rateType.selected = false;
                                            rate.rateType.display = true;
                                            $scope.rates.push(rate);
                                            rate.rateType.GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                                                function(c) {
                                                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                                                    return v.toString(16);
                                                });
                                            $scope.ratetypes.push(rate.rateType);
                                            angular.forEach(rate.specialStatusList,
                                                function(specialStatus) {
                                                    specialStatus
                                                        .combinedIds =
                                                        product.licenseProductId +
                                                        '.' +
                                                        recording.licenseRecording.licenseRecordingId +
                                                        '.' +
                                                        writer.caeNumber;
                                                    specialStatus.selected = false;
                                                    specialStatus.display = true;
                                                    specialStatus.writerCae = writer.caeNumber;
                                                    specialStatus
                                                        .displayName = specialStatus.lU_SpecialStatuses.specialStatus;
                                                    product.combinedStatusIds = specialStatus.combinedIds;
                                                    writer.combinedStatusIds = specialStatus.combinedIds;
                                                    recording.combinedStatusIds = specialStatus.combinedIds;
                                                    $scope.specialstatuses.push(specialStatus);
                                                });
                                        });
                                }
                            }
                        });
                    });

                });
                computeWriterNumber();
            });

        } else {
            computeWriterNumber();
        }
    };
    $scope.getLicensePreview();
    


    function unselectBasedOnNewRules() {
        angular.forEach($scope.products, function (product) {
            if (product.display == false && product.selected == true) {
                product.selected = false;
                USL.Common.FindAndRemove($scope.selectedProduct, 'licenseProductId', product.licenseProductId);
            }

        });
        angular.forEach($scope.recordings, function (rec) {
            if (rec.display == false && rec.selected == true) {
                rec.selected = false;
                USL.Common.FindAndRemoveNested($scope.selectedRecordings, 'licenseRecording.licenseRecordingId', rec.licenseRecording.licenseRecordingId);
            }

        });

        angular.forEach($scope.writers, function (writer) {
            if (writer.display == false && writer.selected == true) {
                writer.selected = false;
                var localList = angular.toJson($scope.selectedWriters);
                localList = angular.fromJson(localList);
                angular.forEach(localList, function (lwriter) {
                    if (writer.caeNumber == lwriter.caeNumber) {
                        USL.Common.FindAndRemoveNested($scope.selectedWriters, 'licenseProductRecordingWriter.licenseWriterId', lwriter.licenseProductRecordingWriter.licenseWriterId);
                    }

                });
            }

        });
        angular.forEach($scope.configurations, function (configuration) {
            if (configuration.display == false && configuration.selected == true) {
                configuration.selected = false;
                var localList = angular.toJson($scope.selectedConfigurations);
                localList = angular.fromJson(localList);
                angular.forEach(localList, function (lconfig) {

                    //if (configuration.configuration.id == lconfig.configuration.id) {
                    //    USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'configuration.id', lconfig.configuration.id);
                    //}
                    if (configuration.id == lconfig.id) {
                        USL.Common.FindAndRemoveNested($scope.selectedConfigurations, 'id', lconfig.id);
                    }

                });
            }

        });

        angular.forEach($scope.specialstatuses, function (stat) {
            if (stat.display == false && stat.selected == true) {
                stat.selected = false;
                var localList = angular.toJson($scope.selectedSpecialStatuses);
                localList = angular.fromJson(localList);
                angular.forEach(localList, function (lstatus) {

                    if (stat.specialStatusId == lstatus.specialStatusId) {
                        USL.Common.FindAndRemove($scope.selectedSpecialStatuses, 'specialStatusId', lstatus.specialStatusId);
                    }

                });
            }

        });
        angular.forEach($scope.ratetypes, function (rateType) {
            if (rateType.display == false && rateType.selected == true) {
                rateType.selected = false;
                var localList = angular.toJson($scope.selectedRateType);
                localList = angular.fromJson(localList);
                angular.forEach(localList, function (lrateType) {

                    if (rateType.rateTypeId == lrateType.rateTypeId) {
                        USL.Common.FindAndRemove($scope.selectedRateType, 'rateTypeId', rateType.rateTypeId);
                    }

                });
            }

        });
    };

    function updateRecordingDdl(recids) {
        angular.forEach($scope.recordings, function (recording) {
            recording.display = false;
            angular.forEach(recids, function (id) {
                if (recording.licenseRecording.licenseRecordingId == id) {
                    recording.display = true;
                }
            });
        });
    }
    function updateWriterDdl(wrIds) {
        angular.forEach($scope.writers, function (writer) {
            writer.display = false;
            angular.forEach(wrIds, function (id) {
                if (writer.caeNumber == id) {
                    writer.display = true;
                }
            });
        });
    }

    function updateProductsDdl(prodIds) {
        angular.forEach($scope.products, function (product) {
            product.display = false;
            angular.forEach(prodIds, function (id) {
                if (product.licenseProductId == id) {
                    product.display = true;
                }
            });
        });
    }

    function updateConfigDdl(ids) {
        angular.forEach($scope.configurations, function (config) {
            config.display = false;
            angular.forEach(ids, function (id) {
                if (config.licenseProductConfiguration != null) {
                    //if (config.configuration.id == id) {
                    if (config.id == id) {
                        config.display = true;
                    }

                }
            });
        });
    }

    function updateStatsDdl(ids) {

        var statListIDs = [];
        angular.forEach($scope.specialstatuses, function (stat) {
            angular.forEach(ids, function (id) {
                if (stat.combinedIds == id) {
                    statListIDs.push(stat.specialStatusId);
                }
            });
        });
        angular.forEach($scope.specialstatuses, function (stat) {
            stat.display = false;
            angular.forEach(statListIDs, function (id) {
                if (stat.specialStatusId == id) {
                    stat.display = true;
                }
            });
        });
    }

    function updateRateTypesDdl(rateTpIds) {
        angular.forEach($scope.ratetypes, function (ratetp) {
            ratetp.display = false;
            angular.forEach(rateTpIds, function (id) {
                if (ratetp.rateTypeId == id) {
                    ratetp.display = true;
                }
            });
        });
    }

    $scope.updateWriterDDL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedConfigurations.length > 0) {
            var currentProdIds = [];
            angular.forEach($scope.selectedConfigurations, function (config) {
                currentProdIds.push(config.combinedIds);
            });
            angular.forEach(currentProdIds, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedProduct.length > 0) {
            angular.forEach($scope.selectedProduct, function (product) {
                var i = $scope.listOfCombinedRateIdsAll.filter(function (n) {
                    return product.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRecordings.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRecordings, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedSpecialStatuses.length > 0) {
            lList = [];
            var currentProdIds2 = [];
            angular.forEach($scope.selectedSpecialStatuses, function (status) {
                var ids = status.combinedIds.split('.');
                currentProdIds2.push(ids[2]);
            });
            angular.forEach(currentProdIds2, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRateType.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRateType, function (ratetype) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return ratetype.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');
            recIds.push(ids[2]);
        });
        updateWriterDdl(recIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    }

    $scope.UpdateTrackDDL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedConfigurations.length > 0) {
            var currentProdIds = [];
            angular.forEach($scope.selectedConfigurations, function (config) {

                currentProdIds.push(config.combinedIds);
            });
            angular.forEach(currentProdIds, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedProduct.length > 0) {
            lList = [];
            angular.forEach($scope.selectedProduct, function (product) {
                var i = $scope.listOfCombinedRateIdsAll.filter(function (n) {
                    return product.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedWriters.length > 0) {
            lList = [];
            angular.forEach($scope.selectedWriters, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedSpecialStatuses.length > 0) {
            lList = [];
            var currentProdIds2 = [];
            angular.forEach($scope.selectedSpecialStatuses, function (status) {
                var ids = status.combinedIds.split('.');
                currentProdIds2.push(ids[1]);
            });
            angular.forEach(currentProdIds2, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRateType.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRateType, function (ratetype) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return ratetype.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');

            recIds.push(ids[1]);

        });
        updateRecordingDdl(recIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    }
    $scope.UpdateProductDLL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedConfigurations.length > 0) {
            var currentProdIds = [];
            angular.forEach($scope.selectedConfigurations, function (config) {
                currentProdIds.push(config.combinedIds);
            });
            angular.forEach(currentProdIds, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }

        if ($scope.selectedRecordings.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRecordings, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedWriters.length > 0) {
            lList = [];
            angular.forEach($scope.selectedWriters, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedSpecialStatuses.length > 0) {
            lList = [];
            var currentProdIds2 = [];
            angular.forEach($scope.selectedSpecialStatuses, function (status) {
                var ids = status.combinedIds.split('.');
                currentProdIds2.push(ids[0]);
            });
            angular.forEach(currentProdIds2, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRateType.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRateType, function (ratetype) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return ratetype.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');

            recIds.push(ids[0]);

        });
        updateProductsDdl(recIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    }

    $scope.UpdateRateTypeDDL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedConfigurations.length > 0) {
            var currentProdIds = [];
            angular.forEach($scope.selectedConfigurations, function (config) {
                currentProdIds.push(config.combinedIds);
            });
            angular.forEach(currentProdIds, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }

        if ($scope.selectedProduct.length > 0) {
            lList = [];
            angular.forEach($scope.selectedProduct, function (product) {
                var i = $scope.listOfCombinedRateIdsAll.filter(function (n) {
                    return product.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }

        if ($scope.selectedRecordings.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRecordings, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedWriters.length > 0) {
            lList = [];
            angular.forEach($scope.selectedWriters, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedSpecialStatuses.length > 0) {
            lList = [];
            var currentProdIds2 = [];
            angular.forEach($scope.selectedSpecialStatuses, function (status) {
                var ids = status.combinedIds.split('.');
                currentProdIds2.push(ids[0]);
            });
            angular.forEach(currentProdIds2, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');

            recIds.push(ids[3]);

        });
        updateRateTypesDdl(recIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    };

    $scope.UpdateConfigDDL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedProduct.length > 0) {
            lList = [];
            angular.forEach($scope.selectedProduct, function (product) {
                var i = $scope.listOfCombinedRateIdsAll.filter(function (n) {
                    return product.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRecordings.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRecordings, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedWriters.length > 0) {
            lList = [];
            angular.forEach($scope.selectedWriters, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedRateType.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRateType, function (ratetype) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return ratetype.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedSpecialStatuses.length > 0) {
            var currentProdIds2 = [];
            angular.forEach($scope.selectedSpecialStatuses, function (status) {
                var ids = status.combinedIds.split('.');
                currentProdIds2.push(ids[0]);
            });
            angular.forEach(currentProdIds2, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');
            recIds.push(ids[0]);
        });
        var uniquerecIds = $filter('uniqueSimpleArray')(recIds);
        var configIds = [];
        angular.forEach($scope.configurations, function (con) {
            angular.forEach(uniquerecIds, function (id) {
                if (con.licenseProductConfiguration != null) {
                    if (con.combinedIds == id) {
                        configIds.push(con.uniqeId);
                    }
                }
            });
        });
        updateConfigDdl(configIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    }

    $scope.UpdateStatusDDL = function () {
        unselectBasedOnNewRules();
        $scope.listOfCombinedRateIdsSelected = $scope.listOfCombinedRateIdsAll;
        var lList = [];
        if ($scope.selectedConfigurations.length > 0) {
            var currentProdIds = [];
            angular.forEach($scope.selectedConfigurations, function (config) {
                currentProdIds.push(config.combinedIds);
            });
            angular.forEach(currentProdIds, function (id) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return n.indexOf(id) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedProduct.length > 0) {
            angular.forEach($scope.selectedProduct, function (product) {
                var i = $scope.listOfCombinedRateIdsAll.filter(function (n) {
                    return product.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }

        if ($scope.selectedRecordings.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRecordings, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        if ($scope.selectedWriters.length > 0) {
            lList = [];
            angular.forEach($scope.selectedWriters, function (recording) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return recording.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
       
        }
        if ($scope.selectedRateType.length > 0) {
            lList = [];
            angular.forEach($scope.selectedRateType, function (ratetype) {
                var i = $scope.listOfCombinedRateIdsSelected.filter(function (n) {
                    return ratetype.combinedRatesIds.indexOf(n) != -1;
                });
                lList = lList.concat(i);
            });
            $scope.listOfCombinedRateIdsSelected = lList;
        }
        var test = $filter('uniqueSimpleArray')($scope.listOfCombinedRateIdsSelected);
        $scope.listOfCombinedRateIdsSelected = test;
        var recIds = [];
        angular.forEach($scope.listOfCombinedRateIdsSelected, function (id) {
            var ids = id.split('.');

            recIds.push(ids[0] + "." + ids[1] + "." + ids[2]);

        });
        updateStatsDdl(recIds);
        unselectBasedOnNewRules();
        computeWriterNumber();
    }


    function computeWriterNumber() {
        $scope.computedWriterIds = [];
        if ($scope.selectedWriters.length == 0) {
            var lWriters = [];
            angular.forEach($scope.writers, function (writer) {
                if (writer.display == true) {
                    lWriters.push(writer);
                }
            });
            var result = $filter('unique')(lWriters, 'caeNumber');
            $scope.computedWriterIds = result;
        } else {
            var lresult = $filter('unique')($scope.selectedWriters, 'caeNumber');
            $scope.computedWriterIds = lresult;
        }
    }


    function testAlltheDatas() {
        var array = $scope.selectedWriters;
        var array2 = array;
        var array4 = array;

        $scope.selectedWriters.push.apply(array, array2);
    }

}]);