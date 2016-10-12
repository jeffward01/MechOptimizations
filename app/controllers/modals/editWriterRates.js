'use strict';
app.controller('editWriterRates', ['$scope', 'licensesService', 'licenseProductsService', 'licenseProductConfigurationService', 'rateTypesService', '$stateParams', 'editRatesService', 'safeService', '$filter', function ($scope, licensesService, licenseProductsService, licenseProductConfigurationService, rateTypeService, $stateParams, editRatesService, safeService, $filter) {
    $scope.stateCallbackArguments = {
        method: 'editWriterRates',
        writer: {},
        productId: $stateParams.productId,
        recordingId: $stateParams.recordingId,
        rollupDictionary: {},
        trackRollupDict: {}
    };
    $scope.safeauthentication = safeService.getAuthentication();
    $scope.modifiedBy = $scope.safeauthentication.contactId;
    $scope.statsRollup = $stateParams.statsRollup;
    $scope.recordingStatusRollup = $stateParams.trackStatsRollup;
    $scope.isClaimException = $stateParams.claimException;
    $scope.quarters = null;
    $scope.writer = JSON.parse(angular.toJson($stateParams.writer));
    $scope.selectedPaidQuarter = null;
    $scope.specialstatusesForSave = [];
    $scope.ratetypesForSave = [];
    $scope.specialStatuses = [];
    $scope.EditData = {
        selectedRateType: { rateType: "Select Rate Type" },
        selectedRateTypeId: null,
        selectedStatus: { specialStatus: "Select Status" },
        selectedStatusId: null,
        splitOverride: null,
        claimExceptionOverride: null,
        isSample: false,
        licenseWriterDate: new Date(),
        paidQtr: "",
        statYear: "Year",
        percentOfStat: null,
        escalatedRate: null,
        rate: null,
        dt: "",
        proRata: null,
        songRate: null,
        modifiedBy: $scope.safeauthentication.contactId,
        //selectedIds: {}
        selectedWritersIds: []
    };
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
    $scope.selectedSpecialStatuses = [];
    $scope.selectedRateType = [];
    $scope.selectedRateTypeforSave = [];
    $scope.configurations = [];

    $scope.ok = function () {
        var licenseDateExist = false;

        angular.forEach($scope.writer.licenseProductRecordingWriter.ratesByConfiguration, function (item) {
            angular.forEach(item.rates, function (rate) {
                if (rate.licenseDate != null) {
                    licenseDateExist = true;
                }
            });
        });


        var textMessageLicenseType = "License Date";
        if ($stateParams.licenseTypeId == 2) {
            textMessageLicenseType = "Effective Date";
        }
        if ($stateParams.licenseTypeId == 3 || $stateParams.licenseTypeId == 4) {
            textMessageLicenseType = "Signed Date";
        }
        //USL-1307 Original
        //var textMessage = "You're about to change the configuration for this product from the license. <br /><br />If you proceed the " + textMessageLicenseType + " will be set to null <br /><br />Do you still want to apply the changes?";
        //USL-1307 new
        var textMessage = "You are about to change the information on this license, are you sure you want to proceed?";
        if (licenseDateExist) {
            noty({
                text: textMessage,
                type: 'confirm',
                modal: true,
                timeout: 5000,
                layout: "center",
                buttons: [
                    {
                        addClass: 'btn-default',
                        text: 'Ok',
                        onClick: function ($noty) {

                            $noty.close();

                            $scope.continueOk();

                        }
                    },
                    {
                        addClass: 'btn-default',
                        text: 'Cancel',
                        onClick: function ($noty) {
                            $noty.close();

                        }
                    }
                ]
            });
        } else {
            $scope.continueOk();
        }

    };


    $scope.continueOk = function () {
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
                if (!(rates[i].value >= 0) || rates[i].value >= 10) {
                    rates[i].classList.add('field-error');
                    rateError = true;
                }
            }
        }

        if (statError || rateError) return;

        $scope.writer.parentSongDuration = $stateParams.songDuration;
        var writer = $scope.writer;
        var editSaveRequest = function () {
            return {
                selectedWritersIds: [writer.licenseProductRecordingWriter.licenseWriterId],
                selectedStatusesIds: [],
                splitOverride: writer.licenseProductRecordingWriter.splitOverride,
                claimExceptionOverride: writer.licenseProductRecordingWriter.claimExceptionOverride,
                isSample: writer.licenseProductRecordingWriter.sample,
                statPercentage: 0,
                paidQtr: null,
                statYear: 0,
                rates: [],
                //configurationIds: [],
                productConfigurationIds: [],
                writers: [$scope.writer],
                licenseId: $stateParams.licenseId,
                modifiedBy: $scope.modifiedBy,
                licenseDate: null,
            }
        }
        var i = 0;
        for (var i = 0; i < $scope.writer.licenseProductRecordingWriter.ratesByConfiguration.length; i++) {
            $scope.writer.licenseProductRecordingWriter.ratesByConfiguration[i].specialStatusList = $filter('onlySelected')($scope.writer.licenseProductRecordingWriter.ratesByConfiguration[i].specialStatusList);
        }
        var requests = [];
        angular.forEach(writer.licenseProductRecordingWriter.ratesByConfiguration, function (item) {
            var elm = editSaveRequest();
            //elm.configurationIds = [item.configuration_id];
            elm.productConfigurationIds = [item.product_configuration_id];
            angular.forEach(item.rates, function (rate) {
                rate.selectedRateTypeId = rate.rateType.rateTypeId;
                elm.rates.push(rate);
            });
            elm.selectedStatusesIds = USL.Common.SingleFieldArray(item.specialStatusList, 'specialStatusId', true);
            if (item.paidQuarter == "N/A") {
                elm.paidQtr = null;
            } else {
                elm.paidQtr = item.paidQuarter;
            }
            requests.push(elm);
        });
        licenseProductsService.editIndividualRates(requests).then(function (result) {
            var l = result;
            var message = "Writer Rates applied";
            noty({
                text: message,
                type: 'success',
                timeout: 2500,
                layout: "top"

            });

            $scope.stateCallbackArguments.writer = $scope.writer;
            $scope.stateCallbackArguments.rollupDictionary = $scope.statsRollup;
            $scope.stateCallbackArguments.trackRollupDict = $scope.recordingStatusRollup;
            $stateParams.stateCallbackArguments = $scope.stateCallbackArguments;
            $scope.goToParent({ writer: $scope.writer }, true);

        }, function (error) {
        });

    }

    $scope.toPercent = function (x) {
          return ((x / 100) * 100).toFixed(2) + '%';
    }

    $scope.getQuarters = function () {
        if ($scope.quarters == null) {
            licensesService.getQuarters().then(function (result) {
                result.data.unshift({ paidQuarter: "N/A" });
                $scope.quarters = result.data;
            });
        }
    }
    $scope.selectQuarter = function (configurationRate, qtr) {
        if (qtr.paidQuarter == "N/A") {
            configurationRate.paidQuarter = null;
        } else {
            configurationRate.paidQuarter = qtr.paidQuarter;
        }
    }
    $scope.getRateTypes = function () {
        if ($scope.ratetypesForSave.length == 0) {
            editRatesService.getRateTypes().then(function (result) {

                $scope.ratetypesForSave = result.data;
                angular.forEach($scope.ratetypes, function (item) {
                    item.selected = false;
                });
            });
        }
    };

    $scope.getSpecialStatus = function (rate) {
        if ($scope.specialStatuses.length == 0) {
            editRatesService.getSpecialStatus().then(function (result) {
                $scope.specialStatuses = result.data;
                angular.forEach($scope.specialStatuses, function (item) {
                    item.selected = false;
                });
                $scope.rateSpecialStatusesLoad(rate);
            });
        } else {
            $scope.rateSpecialStatusesLoad(rate);
        }
    };
    $scope.rateSpecialStatusesLoad = function (rate) {
        if (rate.specialStatusList && rate.specialStatusList.length == $scope.specialStatuses.length) return;
        var statuses = JSON.parse(angular.toJson($scope.specialStatuses));
        angular.forEach(statuses, function (item) {
            var exists = USL.Common.FirstInArray(rate.specialStatusList, 'specialStatusId', item.specialStatusId);
            if (exists) item.selected = true;
        });
        rate.specialStatusList = statuses;
        if (!rate.specialStatusList) {
            var statuses = JSON.parse(angular.toJson($scope.specialStatuses));
            rate.specialStatusList = statuses;
        }
    }
    //select rete type for save
    $scope.selectRateTypeForSave = function (rateList, rate, ratetype) {
        if (rate.rateType.rateTypeId != ratetype.rateTypeId) {
            rate.statePrcentage = null;
            rate.escalatedRate = null;
            rate.rate = null;
        }
        rate.rateType = ratetype;
        $scope.changeRate(rateList, rate, ratetype);
    };
    $scope.selectSpecialStatusForSave = function (status) {
        $scope.EditData.selectedStatus = status;

    };
    $scope.selectStatusForRollup = function (status) {
        if (typeof $scope.statsRollup[status.specialStatus.toLowerCase()] == "undefined") {
            $scope.statsRollup[status.specialStatus.toLowerCase()] = 1;
        } else if (!status.selected) {
            $scope.statsRollup[status.specialStatus.toLowerCase()]++;
        } else {
            $scope.statsRollup[status.specialStatus.toLowerCase()]--;
        }
        if (typeof $scope.recordingStatusRollup[status.specialStatus.toLowerCase()] == "undefined") {
            $scope.recordingStatusRollup[status.specialStatus.toLowerCase()] = 1;
        } else if (!status.selected) {
            $scope.recordingStatusRollup[status.specialStatus.toLowerCase()]++;
        } else {
            $scope.recordingStatusRollup[status.specialStatus.toLowerCase()]--;
        }
    };
    $scope.selectYear = function (rate, year) {
        rate.statYear = year;
    };
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    $scope.addRate = function (rate, rateList) {
        var newRate = JSON.parse(angular.toJson(rate));
        newRate.escalatedRate = "";
        newRate.rate = "";
        newRate.perSongRate = 0;
        newRate.proRataRate = 0;
        newRate.isFirstRate = false;
        newRate.id = newRate.id + 1;
        $scope.changeRate(rateList, newRate, newRate.rateType);
        rateList.push(newRate);
    }
    $scope.removeRate = function (rate, rateList) {
        USL.Common.FindAndRemove(rateList, 'id', rate.id);
    }
    $scope.changeRate = function (rateList, rate, rateType, noRemove) {
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
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
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
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
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
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
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
                //if (!noRemove)
                //    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
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
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
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
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
                break;
            case 12:
                rate.escalatedRate = null;
                rate.rate = null;
                rate.percentOfStat = null;
                rate.visibleAdd = false;
                rate.visibleRate = false;
                rate.visibleRemove = false;
                rate.visibleStat = false;
                rate.visibleYear = false;
                rate.visibleThreshold = false;
                if (!noRemove)
                    USL.Common.FindAndRemoveExcept(rateList, 'id', 0);
                break;
            default: break;
        }
    }

    $scope.selectSpecialStatusForSave = function (rate, status) {
        if (status.selected) {
            var exists = USL.Common.FirstInArray(rate.specialStatusList, 'specialStatusId', status.specialStatusId);
            if (!exists) rate.specialStatusList.push(status);
        } else {
            USL.Common.FindAndRemove(rate.specialStatusList, 'specialStatusId', status.specialStatusId);
        }
    }

    function init() {
        if (!$scope.writer.specialStatusList || $scope.writer.specialStatusList == null)
            $scope.writer.specialStatusList = [];
        var j = 0;
        for (var i = 0; i < $scope.writer.licenseProductRecordingWriter.ratesByConfiguration.length; i++) {
            var rates = $scope.writer.licenseProductRecordingWriter.ratesByConfiguration[i].rates;

            j = 0;
            angular.forEach($scope.writer.licenseProductRecordingWriter.ratesByConfiguration[i].specialStatusList, function (item) {
                item.selected = true;
            });
            angular.forEach(rates, function (rate) {
                rate.visibleAdd = true;
                rate.visibleRemove = false;
                rate.visibleRate = true;
                rate.visibleStat = true;
                rate.visibleYear = true;
                rate.visibleThreshold = false;
                if (!rate.statYear && !$stateParams.license.effectiveDate) {
                    rate.statYear = new Date().getFullYear() + "";
                } else if (!rate.statYear && $stateParams.license.effectiveDate) {
                    rate.statYear = new Date($stateParams.license.effectiveDate).getFullYear() + "";
                }

                rate.id = j;
                $scope.changeRate(rates, rate, rate.rateType, true);
                if (j == 0) {
                    rate.isFirstRate = true;
                } else {
                    rate.isFirstRate = false;
                }
                j++;
            });

        }
    }

    init();
}]);