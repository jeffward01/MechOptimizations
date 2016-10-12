'use strict';
app.controller('productDetailsController',
[
    '$scope', 'productsService', 'licensesService', '$modal', '$stateParams', 'localStorageService',
    'licenseProductConfigurationService',
    'contactDefaultsService', '$http', 'licenseProductsService', '$interval',
    function ($scope,
        productsService,
        licensesService,
        $modal,
        $stateParams,
        localStorageService,
        licenseProductConfigurationService,
        contactDefaultsService,
        $http,
        licenseProductsService,
        $interval) {
        //___Start Model Objects

        $scope.rateTypeRank = {
            "Statutory": 1,
            "Controlled Fixed": 2,
            "Controlled Stat": 3,
            "Controlled Min Stat": 4,
            "Reduced Fixed": 5,
            "Reduced Stat": 6,
            "Reduced Min Stat": 7,
            "Gratis": 8,
            "Compulsory": 9,
            "Controlled Stat (LS)": 10,
            "Reduced Stat (LS)": 11,
            "N/A": 12
        };

        $scope.writerConsentRank = {
            "Track/Config": 1,
            "Track": 2,
            "Configuration": 3,
            "Writer": 4,
            "N/A": 5
        };

        $scope.paidQuarterRank = {
            "1Q05": 1,
            "2Q05": 2,
            "3Q05": 3,
            "4Q05": 4,
            "1Q06": 5,
            "2Q06": 6,
            "3Q06": 7,
            "4Q06": 8,
            "1Q07": 9,
            "2Q07": 10,
            "3Q07": 11,
            "4Q07": 12,
            "1Q08": 13,
            "2Q08": 14,
            "3Q08": 15,
            "4Q08": 16,
            "1Q09": 17,
            "2Q09": 18,
            "3Q09": 19,
            "4Q09": 20,
            "1Q10": 21,
            "2Q10": 22,
            "3Q10": 23,
            "4Q10": 24,
            "1Q11": 25,
            "2Q11": 26,
            "3Q11": 27,
            "4Q11": 28,
            "1Q12": 29,
            "2Q12": 30,
            "3Q12": 31,
            "4Q12": 32,
            "1Q13": 33,
            "2Q13": 34,
            "3Q13": 35,
            "4Q13": 36,
            "1Q14": 37,
            "2Q14": 38,
            "3Q14": 39,
            "4Q14": 40,
            "1Q15": 41,
            "2Q15": 42,
            "3Q15": 43,
            "4Q15": 44,
            "1Q16": 45,
            "2Q16": 46,
            "3Q16": 47,
            "4Q16": 48,
            "1Q17": 49,
            "2Q17": 50,
            "3Q17": 51,
            "4Q17": 52,
            "1Q18": 53,
            "2Q18": 54,
            "3Q18": 58,
            "4Q18": 59,
            "1Q19": 60,
            "2Q19": 61,
            "3Q19": 62,
            "4Q19": 63,
            "1Q20": 64,
            "2Q20": 65,
            "3Q20": 66,
            "4Q20": 67,
            "1Q21": 68,
            "2Q21": 69,
            "3Q21": 70,
            "4Q21": 71,
            "1Q22": 72,
            "2Q22": 73,
            "3Q22": 74,
            "4Q22": 75
        }

        //___End model objects___

        //Start Controller

        $scope.showToDOM = false;  //We toggle this to true once the interval is called successfully.  AKA, after dom is loaded
        $scope.hidden = true;
        $scope.totalComp = 0;
        $scope.licenseTitles = [];
        $scope.mostRecentOnly = false;
        $scope.allSelected = true;
        $scope.productSummary = {};
        $scope.productDetail = {};
        $scope.productDetail.recordings = [];
        $scope.isCollapsed = true;
        var productId = $stateParams.productId;
        $scope.licensedConfigs = [];
        $scope.disableRateZeroButton = true;
        $scope.disableExpandAllPublishersButton = true;
        $scope.myObj = "test";
        $scope.organizedRatesByConfiguration = [];
        $scope.organizedWriters = [];
        $scope.productRecordingsandWriters = [];
        $scope.productsForCreateLicense = [];
        $scope.licenses = loadRelatedLicenses();
        $scope.selectedConfigFilter = [];
        $scope.licensedConfigurationCount = 0;
        $scope.configurationFilters = [];
        $scope.writerFilters = [];
        $scope.viewFilters = [];
        //      $scope.firstConfigFilter = true;  <- Not needed?
        $scope.firstWriterFilter = true;
        $scope.firstViewFilter = true;
        $scope.licenseWriterIds = [];
        //Filter Btn Control
        $scope.isSelectConfigCollapsed = true;
        $scope.isSelectWritersCollapsed = true;
        $scope.isSelectViewsCollapsed = true;

        //Show only executed Status by default
        $scope.allStatuses = true;
        $scope.showZeros = true;
        //Toggle Collapse Tracks
        $scope.trackCollapsed = true;

        $scope.productOverviewRates = {};
        $scope.ExtractedWriterListSummary = [];
        //Extracted List is a holding list
        $scope.ExtractedWriterList = [];
        $scope.ExtractedWriterList_forWriter = [];

        $scope.relatedLicenses_tom = [];
        $scope.BuildRateList = [];
        $scope.RateListFast = [];
        $scope.RateListDuo = [];
        $scope.productOverview_Original = {};
        $scope.mostRecentRates = [];
        //   Get ProductOverview and begin juggling data.

        productsService.getProductOverview($stateParams.productId) //Turned on
            .then(function (result) {
                $scope.productOverview_Original = result.data;
                $scope.productOverviewRates = result.data;
                console.log("JSON is off, API is on.");
                console.log("ProductId: " + $stateParams.productId);

                ////JSON call
                //$http.get("tom_Original.json")
                //     .then(function (res) {
                //         $scope.productOverview_Original = res.data;
                //         $scope.productOverviewRates = res.data;
                //         console.log("API call is off, JSON is on. Product 64889");

                //Normalize CAE number
                $scope.productOverview_Original = normalizeCaeCode($scope.productOverview_Original);

                var licensed_recording_count = 0;
                var partial_licensed_recording_count = 0;
                var unlicensed_recording_count = 0;

                var writer_count = 0;
                var licensed_writer_count = 0;
                var unlicensed_writer_count = 0;
                //Build productDetail and main object
                /*
                 $http.get('po.json').then(function (result) {
                     console.log("ProductDetail JSON on: Product 64889");
                     */

                productsService.getProductDetailsHeader($stateParams.productId)
                    .then(function (result) {
                        console.log("ProductDetail API On");

                        $scope.productDetail = result.data;

                        //  getRecordings();
                        //Insert here empty array most Recent

                        //Set License configs
                        var prodConfigIds = [];
                        angular.forEach($scope.productOverview_Original,
                            function (license) {
                                angular.forEach(license.licenseProducts,
                                    function (licenseProduct) {
                                        if (license.licenseId === licenseProduct.licenseId) {
                                            var thisLicenseProductId = licenseProduct.licenseProductId;
                                            angular.forEach(license.licenseProductConfigurations,
                                                function (config) {
                                                    config.id = config.product_configuration_id;
                                                    if (thisLicenseProductId === config.licenseProductId) {
                                                        //Validation so configurations with same product_configuration_id dont get added
                                                        if (prodConfigIds.length === 0) {
                                                            prodConfigIds
                                                                .push(parseInt(config.product_configuration_id));
                                                            config.checked = false;
                                                            $scope.configurationFilters
                                                                .push(config);
                                                        }
                                                        //if is not in array
                                                        if (
                                                            isInArray(config.product_configuration_id,
                                                                    prodConfigIds) ==
                                                                -1) {
                                                            prodConfigIds
                                                                .push(parseInt(config.product_configuration_id));
                                                            config.checked = false;
                                                            //console.log("LOOKY LOOKY:          " + JSON.stringify(config));
                                                            $scope.configurationFilters.push(config);
                                                        }
                                                    }
                                                });
                                        }
                                    });
                            });

                        getRecordings();
                    });
            },
                function (error) {
                    alert(error.data.message);
                });

        //function getLicensedConfigs(x) {  Delete this
        //    var count = 0;
        //    angular.forEach(x,
        //        function (config) {
        //            if (config.licensedAmount === config.totalAmount) {
        //                count++;
        //            }
        //        });
        //    return count;
        //}

        function setLicenseWriterNotes(x) {
            var writerNotes = [];
            angular.forEach(x,
                function (license) {
                    angular.forEach(license.licenseProducts,
                        function (licenseProduct) {
                            angular.forEach(licenseProduct.recordings,
                                function (recording) {
                                    var trackId = recording.track.id;
                                    angular.forEach(recording.writers,
                                        function (writer) {
                                            if (writer.licenseProductRecordingWriter != null) {
                                                var mostRecentNote =
                                                    writer.licenseProductRecordingWriter.mostRecentNote;
                                                var caeCode = writer.licenseProductRecordingWriter.caeCode;
                                                if (mostRecentNote != null) {
                                                    console.log(mostRecentNote);
                                                    //Find matching writer on $scope.productDetail
                                                    matchNoteWithWriter(mostRecentNote, caeCode, trackId);
                                                }
                                            }
                                        });
                                });
                        });
                });
        }

        function matchNoteWithWriter(note, caeCode, trackId) {
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    angular.forEach(recording.writers,
                        function (writer) {
                            if (writer.caeNumber === caeCode && writer.trackId === trackId) {
                                writer.mostRecentNote = note;
                                return;
                            } else {
                                if (writer.mostRecentNote == undefined) {
                                    writer.mostRecentNote = "";
                                }
                            }
                        });
                });
        }
        //input writers
        function setlicenseProductRecordingWriter(writers, recording) {
            angular.forEach(writers, function (rootWriter) {

                var executedSplitPresent = false;
                var rootWriterExecutedSplit = 0;

                var rootWriterSplitOverRide = 0;
                var overRidePresent = false;
                angular.forEach($scope.productOverview_Original, function (license) {
                    angular.forEach(license.licenseProducts, function (licenseProduct) {
                        angular.forEach(licenseProduct.recordings, function (lp_recording) {
                            angular.forEach(lp_recording.writers, function (writer) {
                                if (writer.licenseProductRecordingWriter != null) {
                                    if (writer.caeNumber === rootWriter.caeNumber &&
                                        writer.name === rootWriter.name) {

                                        //   console.log(rootWriter.name + "----Saving licenseProductRecordingWriter");
                                        //   console.log("--------------writer.licenseProductRecordingWriter-------------" + JSON.stringify(writer.licenseProductRecordingWriter));
                                        rootWriter.licenseProductRecordingWriter = writer.licenseProductRecordingWriter;

                                        //logic to control the overWriting of splitOverrides.  We always are overwriting the current if the new is higher
                                        if (writer.licenseProductRecordingWriter.splitOverride != null &&
                                            writer.licenseProductRecordingWriter.splitOverride >= 0) {
                                            overRidePresent = true;

                                            //update the highest SplitOverride
                                            if (rootWriterSplitOverRide <=
                                                writer.licenseProductRecordingWriter.splitOverride) {
                                                rootWriterSplitOverRide =
                                                    writer.licenseProductRecordingWriter.splitOverride;
                                            }
                                        }

                                        //logic to control the overWriting of Executable split.  We always are overwriting the current if the new is higher
                                        if (writer.licenseProductRecordingWriter.executedSplit >= 0 &&
                                            writer.licenseProductRecordingWriter.executedSplit != null) {
                                            executedSplitPresent = true;

                                            //update the highest ExecutedSplit
                                            if (writer.licenseProductRecordingWriter.executedSplit >=
                                                rootWriterExecutedSplit) {
                                                rootWriterExecutedSplit =
                                                    writer.licenseProductRecordingWriter.executedSplit;
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    });
                });

                //if present, save the highest overRidePresent to our rootWriter
                if (overRidePresent) {
                    rootWriter.licenseProductRecordingWriter
                        .splitOverride = rootWriterSplitOverRide;
                }

                //if present, save the highest executedSplitPresent to our rootWriter
                if (executedSplitPresent) {
                    rootWriter.licenseProductRecordingWriter
                        .executedSplit = rootWriterExecutedSplit;
                    recording.executedSplitPresent = true;
                }
            });

        }

        $scope.isWriterLicensedIncluded = function (writer) {
            var licensed = false;
            angular.forEach(writer.licenseProductRecordingWriter.rateList,
                 function (writerRate) {
                     if (writerRate.writerRateInclude && writerRate.licenseDate != null) {
                         licensed = true;
                     }
                 });
            return licensed;
        }

        function normalizeCaeCode(x) {
            angular.forEach(x,
                function (license) {
                    angular.forEach(license.licenseProductRecordingWriters,
                        function (writer) {
                            var writerCaeCode = writer.caeCode;
                            angular.forEach(writer.rateList,
                                function (rate) {
                                    rate.caeCode = writerCaeCode;
                                });
                        });
                });
            angular.forEach(x,
                function (license) {
                    var licenseStatus = license.licenseStatus;
                    var licenseId = license.licenseId;
                    angular.forEach(license.licenseProductRecordings,
                        function (recording) {
                            var trackId = recording.trackId;
                            var licenseRecordingId = recording.licenseRecordingId;
                            //recording.paidQtr = $scope.getMostRecentPaidQuarter(recording);

                            angular.forEach(license.licenseProducts,
                                function (licenseProduct) {
                                    angular
                                        .forEach(licenseProduct.recordings,
                                            function (licenseProductRecording) {
                                                angular
                                                    .forEach(licenseProductRecording.writers,
                                                        function (writer) {
                                                            if (writer.licenseProductRecordingWriter != null) {
                                                                if (
                                                                    writer.licenseProductRecordingWriter
                                                                        .licenseRecordingId ===
                                                                        licenseRecordingId) {
                                                                    writer.licenseProductRecordingWriter
                                                                        .contribution = writer.contribution;

                                                                    //Get values from writer, and put them in writer.licenseProductRecordingWriter
                                                                    writer.licenseProductRecordingWriter.name =
                                                                        writer.name;
                                                                    writer.licenseProductRecordingWriter.ipCode =
                                                                        writer.ipCode;
                                                                    writer.licenseProductRecordingWriter
                                                                        .capacityCode = writer.capacityCode;
                                                                    writer.licenseProductRecordingWriter
                                                                        .mechanicalCollectablePercentage =
                                                                        writer.mechanicalCollectablePercentage;
                                                                    writer.licenseProductRecordingWriter
                                                                        .mechanicalOwnershipPercentage =
                                                                        writer.mechanicalOwnershipPercentage;
                                                                    writer.licenseProductRecordingWriter
                                                                        .affilations = [];
                                                                    writer.licenseProductRecordingWriter
                                                                        .affilations = writer.affilations;
                                                                    writer.licenseProductRecordingWriter
                                                                        .affiliationsString = writer.affiliationsString;

                                                                    writer.licenseProductRecordingWriter.licenseId =
                                                                        licenseId;
                                                                    writer.licenseProductRecordingWriter.trackId =
                                                                        trackId;
                                                                    //    var tempWriter = writer;
                                                                    // tempWriter.licenseStatus = licenseStatus;

                                                                    if (!
                                                                        containsObject(writer.licenseProductRecordingWriter, $scope.ExtractedWriterList)) {
                                                                        writer.licenseProductRecordingWriter
                                                                            .licenseStatus =
                                                                            {};
                                                                        writer.licenseProductRecordingWriter
                                                                            .licenseStatus =
                                                                            licenseStatus;
                                                                        $scope.ExtractedWriterList
                                                                            .push(writer.licenseProductRecordingWriter);
                                                                    }
                                                                    //
                                                                }
                                                            }
                                                            //writer.licenseStatus = {};
                                                            //writer.licenseStatus = licenseStatus;
                                                            //$scope.ExtractedWriterList.push(writer);
                                                        });
                                            });
                                });
                        });
                });

            angular.forEach($scope.ExtractedWriterList,
                function (writer) {
                    var licenseStatus = writer.licenseStatus;
                    var licenseRecordingId = writer.licenseRecordingId;
                    var caeCode = writer.caeCode;
                    var trackid = writer.trackId;
                    angular.forEach(writer.rateList,
                        function (rate) {
                            rate.trackId = trackid;
                            rate.licenseStatus = licenseStatus;
                            rate.caeCode = caeCode;
                            rate.licenseRecordingId = licenseRecordingId;

                            //Check if already in array
                            if (!containsObject(rate, $scope.ExtractedWriterList_forWriter)) {
                                $scope.ExtractedWriterList_forWriter.push(rate);
                            }
                        });
                    //writer.licenseStatus = {};
                    //writer.licenseStatus = licenseStatus;
                });
            return x;
        }

        // Need to set TrackId and licenseRecordingId and licenseStatus, grab from recording, append to writerRate
        //This sets values and keys for other methods
        function setTrackIdAndLicenseRecordingId() {
            angular.forEach($scope.productOverviewRates,
                function (license) {
                    var licenseStatus = license.licenseStatus;
                    var licensePriority = license.licensePriority;
                    var licenseType = license.licenseType;
                    var licenseMethod = license.licenseMethod;
                    var licenseId = license.licenseId;

                    angular.forEach(license.licenseProductRecordings,
                        function (recording) {
                            var licenseRecordingId = recording.licenseRecordingId;
                            var trackId = recording.trackId;

                            angular.forEach(license.licenseProducts,
                                function (licenseProduct) {
                                    angular.forEach(licenseProduct.recordings,
                                        function (recording) {
                                            var trackId = recording.track.id;
                                            angular.forEach(recording.writers,
                                                function (writer) {
                                                    if (writer.licenseProductRecordingWriter != null) {
                                                        if (
                                                            writer.licenseProductRecordingWriter
                                                                .licenseRecordingId ===
                                                                licenseRecordingId) {
                                                            writer.licenseProductRecordingWriter
                                                                .contribution = writer.contribution;

                                                            //Get values from writer, and put them in writer.licenseProductRecordingWriter
                                                            writer.licenseProductRecordingWriter.name =
                                                                writer.name;
                                                            writer.licenseProductRecordingWriter.ipCode =
                                                                writer.ipCode;
                                                            writer.licenseProductRecordingWriter
                                                                .capacityCode = writer.capacityCode;
                                                            writer.licenseProductRecordingWriter
                                                                .mechanicalCollectablePercentage =
                                                                writer.mechanicalCollectablePercentage;
                                                            writer.licenseProductRecordingWriter
                                                                .mechanicalOwnershipPercentage =
                                                                writer.mechanicalOwnershipPercentage;
                                                            writer.licenseProductRecordingWriter
                                                                .affilations = [];
                                                            writer.licenseProductRecordingWriter
                                                                .affilations = writer.affilations;
                                                            writer.licenseProductRecordingWriter
                                                                .affiliationsString =
                                                                writer.affiliationsString;

                                                            writer.licenseProductRecordingWriter
                                                                .licenseId = licenseId;

                                                            writer.licenseProductRecordingWriter.trackId =
                                                                trackId;
                                                        }
                                                    }
                                                });
                                        });
                                });

                            angular.forEach(license.licenseProductRecordingWriters,
                                function (writer) {
                                    if (writer.licenseRecordingId === licenseRecordingId) {
                                        angular.forEach(writer.rateList,
                                            function (rate) {
                                                writer.trackId = trackId;
                                                rate.licenseRecordingId = licenseRecordingId;
                                                rate.trackId = trackId;
                                                rate.licenseStatus = licenseStatus;
                                                rate.licensePriority = licensePriority;
                                                rate.licenseType = licenseType;
                                                rate.licenseMethod = licenseMethod;
                                            });
                                    }
                                });
                        });
                });
        }

        //This organizes the rates into ratesByConfiguration
        function setRatesByConfig() {
            angular.forEach($scope.productOverviewRates,
                function (license) {
                    var licenseConfigs = [];
                    licenseConfigs = license.licenseProductConfigurations;

                    //angular.forEach(license.licenseProductRecordingWriters, function (writer) {
                    angular.forEach(license.licenseProducts,
                        function (licenseProduct) {
                            angular.forEach(licenseProduct.recordings,
                                function (recording) {
                                    var trackId = recording.track.id;

                                    angular.forEach(recording.writers,
                                        function (writer) {
                                            if (writer.licenseProductRecordingWriter != null) {
                                                // console.log("\n \n \n \n writer1: " + JSON.stringify(writer) + " \n \n \n \n");
                                                writer.licenseProductRecordingWriter.trackId = trackId;
                                                angular.forEach(writer.licenseProductRecordingWriter.rateList,
                                                    function (rate) {
                                                        var
                                                            rateProduct_configuration_id =
                                                                rate.product_configuration_id;
                                                        var caeCode = rate.caeCode;
                                                        writer.licenseProductRecordingWriter.caeCode = caeCode;

                                                        angular.forEach(licenseConfigs,
                                                            function (config) {
                                                                if (config
                                                                    .product_configuration_id ===
                                                                    rateProduct_configuration_id) {
                                                                    rate.upc = config.upc_code;
                                                                }
                                                            });
                                                    });

                                                writer.licenseProductRecordingWriter.ratesByConfiguration = {};
                                                writer.licenseProductRecordingWriter.ratesByConfiguration = $scope
                                                    .groupByConfigurations(writer.licenseProductRecordingWriter
                                                        .rateList);
                                            }
                                        });
                                });
                        });
                });
        }

        //returns and fills $scope.organizedWriters
        function fillOrganizedWritersArray(x) {
            var organzied = [];
            angular.forEach(x,
                function (license) {
                    var licenseName = license.licenseName;
                    var licenseNumber = license.licenseNumber;
                    var licenseId = license.licenseId;
                    var licenseMethod = license.licenseMethod;
                    var licenseType = license.licenseType;

                    var thresholdPresent = false;
                    angular.forEach(license.licenseProducts,
                        function (licenseProduct) {
                            angular.forEach(licenseProduct.recordings,
                                function (recording) {
                                    angular.forEach(recording.writers,
                                        function (writer) {
                                            if (writer.licenseProductRecordingWriter != null) {
                                                writer.licenseProductRecordingWriter.licenseName = licenseName;
                                                writer.licenseProductRecordingWriter.licenseNumber = licenseNumber;
                                                writer.licenseProductRecordingWriter.licenseId = licenseId;
                                                writer.licenseProductRecordingWriter.licenseMethod = licenseMethod;
                                                writer.licenseProductRecordingWriter.licenseType = licenseType;
                                                angular
                                                    .forEach(writer.licenseProductRecordingWriter.ratesByConfiguration,
                                                        function (configRate) {
                                                            configRate.licenseId = licenseId;
                                                            configRate.licenseMethod = licenseMethod;
                                                            configRate.licenseType = licenseType;
                                                        });
                                                //8 is voided, 9 is deleted, 10 is failed
                                                if (writer.licenseProductRecordingWriter.licenseStatus
                                                    .licenseStatusId !==
                                                    8) {
                                                    organzied.push(writer.licenseProductRecordingWriter);
                                                }
                                            }
                                        });
                                });
                        });
                });

            return organzied;
        }

        function fillOrganizedRatesArray() {
            var organized = [];
            var trimmedArray = [];
            var uniqueTitles = [];
            angular.forEach($scope.organizedWriters,
                function (writer) {
                    //   console.log("writer error area: " + JSON.stringify(writer));
                    //Need to add licenseId
                    var thresholdPresent = writer.thresholdRatePresent;
                    var licenseName = writer.licenseName;
                    var licenseNumber = writer.licenseNumber;
                    var licenseId = writer.licenseId;
                    var trackId = writer.trackId;
                    var caeCode = writer.caeCode;
                    var licenseMethod = writer.licenseMethod;
                    var licenseType = writer.licenseType;

                    //Fill license title and license information
                    angular.forEach(writer.ratesByConfiguration,
                        function (rateConfig) {
                            angular.forEach(rateConfig.rates,
                                function (rate) {
                                    rate.licenseTitle = licenseName;
                                    rate.licenseNumber = licenseNumber;
                                    rate.licenseId = licenseId;
                                    rate.trackId = trackId;
                                    rate.caeCode = caeCode;
                                    rate.licenseMethod = licenseMethod;
                                    rate.licenseType = licenseType;
                                });
                            rateConfig.thresholdPresent = thresholdPresent;
                        });

                    var configArray = writer.ratesByConfiguration;
                    organized.push(configArray);
                });

            //Trim down organized, put keys in nested array.
            angular.forEach(organized,
                function (item) {
                    var trackId = item.trackId;
                    var caeCode = item.caeCode;
                    var licenseMethod = item.licenseMethod;
                    var licenseType = item.licenseType;
                    angular.forEach(item,
                        function (nestedItem) {
                            nestedItem.licenseMethod = licenseMethod;
                            nestedItem.licenseType = licenseType;
                            nestedItem.trackId = trackId;
                            nestedItem.caeCode = caeCode;
                            trimmedArray.push(nestedItem);
                        });
                });

            return trimmedArray;
        }

        $scope.groupByConfigurations = function (rateList) {
            var configurationRateList = [];
            for (var i = 0; i < rateList.length; i++) {
                var currentRate = rateList[i];
                //var exists = USL.Common.FirstInArray(configurationRateList, 'configuration_id', currentRate.configuration_id);
                //changed from configuration_id to product_configuration_id
                //added configuration_upc to configurationRateList collection
                var exists = USL.Common.FirstInArray(configurationRateList,
                    'product_configuration_id',
                    currentRate.product_configuration_id);
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

        $scope.returnRateType = function (x) {
            var rateTypeKey = x;
            return returnRateTypeFromKey(rateTypeKey);
        };

        $scope.returnWriterConsentType = function (x) {
            var writerConsentTypeKey = x;
            return returnWriterConsentFromKey(writerConsentTypeKey);
        }

        function returnWriterConsentFromKey(jKey) {
            var array = $scope.writerConsentRank;
            for (var key in array) {
                if (jKey == array[key]) {
                    return key;
                }
            }
            return null;
        };

        function returnRateTypeFromKey(jKey) {
            var array = $scope.rateTypeRank;
            for (var key in array) {
                if (jKey == array[key]) {
                    return key;
                }
            }
            return null;
        };

        function returnRateTypeKey(paidQtr) {
            for (var pq in $scope.rateTypeRank) {
                if (paidQtr == pq) {
                    return $scope.rateTypeRank[pq];
                }
            }
            return null;
        }

        $scope.calculateProductPaidQtr = function (recording, productPaidQtr) {
            //get current Paid Quarter
            //     console.log("recording: "+ JSON.stringify(recording) + "    productPaidQtr: " + productPaidQtr);
            var currentPaidQuarterKey = returnPaidQuarterKey(productPaidQtr);
            //    console.log("currentPaidQuarterKey: " + currentPaidQuarterKey);
            if (currentPaidQuarterKey == null) {
                currentPaidQuarterKey = returnPaidQuarterKey(recording.paidQtr);
                if (currentPaidQuarterKey == null) {
                    return productPaidQtr;
                }
                return returnPaidQtrFromKey(currentPaidQuarterKey);
            } else if (currentPaidQuarterKey > returnPaidQuarterKey(recording.paidQtr)) {
                currentPaidQuarterKey = returnPaidQuarterKey(recording.paidQtr);
                if (currentPaidQuarterKey == null) {
                    return productPaidQtr;
                }
                return returnPaidQtrFromKey(currentPaidQuarterKey);
            }
            //   console.log("currentPaidQuarterKey2: " + currentPaidQuarterKey);
            return returnPaidQtrFromKey(currentPaidQuarterKey);
        };

        $scope.getMostRecentPaidQuarter = function (recording) {
            var paidQuarterList = getPaidQtrList(recording);
            var listOfKeys = [];
            //Get Lowest KeyValue in paidQuarter List
            angular.forEach(paidQuarterList,
                function (listPQ) {
                    listOfKeys.push(returnPaidQuarterKey(listPQ));
                });
            var lowestKey = returnLowestInArray(listOfKeys);
            var lowestPaidQtr = returnPaidQtrFromKey(lowestKey);
            return lowestPaidQtr;
        }

        function returnPaidQtrFromKey(jKey) {
            var array = $scope.paidQuarterRank;
            for (var key in array) {
                if (jKey == array[key]) {
                    return key;
                }
            }
            return null;
        };

        function returnPaidQuarterKey(paidQtr) {
            for (var pq in $scope.paidQuarterRank) {
                if (paidQtr == pq) {
                    return $scope.paidQuarterRank[pq];
                }
            }
            return null;
        }

        function getPaidQtrList(recording) {
            var paidQuarterList = [];
            angular.forEach($scope.productOverview_Original,
                function (license) {
                    angular.forEach(license.licenseProductRecordings,
                        function (rec) {
                            if (recording.track.id === rec.trackId) {
                                var licenseRecordingId = rec.licenseRecordingId;
                                angular.forEach($scope.ExtractedWriterList_forWriter,
                                    function (writer) {
                                        if (writer.licenseRecordingId == licenseRecordingId) {
                                            if (writer.paidQuarter != null) {
                                                paidQuarterList.push(writer.paidQuarter);
                                            }
                                        }
                                    });
                            }
                        });
                });
            return paidQuarterList;
        }

        function isInArray(needle, haystack) {
            var found = 0;
            for (var i = 0, len = haystack.length; i < len; i++) {
                if (haystack[i] === needle) return i;
                found++;
            }
            return -1;
        }

        function returnLowestInArray(array) {
            var lowestValue = 100;
            angular.forEach(array,
                function (value) {
                    var arrayValue = value;
                    if (arrayValue < lowestValue) {
                        lowestValue = arrayValue;
                    }
                });
            return lowestValue;
        }

        //Load Related licenses up front
        function loadRelatedLicenses() {
            licensesService.getLicensesForProduct($stateParams.productId)
                .then(function (result) {
                    $scope.licenses = result.data;
                });
        }

        $scope.toggleCollapseTracks = function () {
            if ($scope.trackCollapsed) {
                $scope.trackCollapsed = false;
            } else {
                $scope.trackCollapsed = true;
            }
        }

        //Function called from Writer filter.  This applies current filter to writers
        $scope.updateWriters = function () {
            // alert("BOOM");
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    if (recording.track.copyrights != null) {
                        productsService.getWorksWriters(recording.track.copyrights[0].workCode)
                            .then(function (result) {
                                angular.forEach(result.data,
                                    function (value) {
                                        value.publishersCollapsed = true;
                                        angular.forEach(value.originalPublishers,
                                            function (publisher) {
                                                var adminContribution = 0;
                                                publisher.hasCollectable = false;
                                                angular.forEach(publisher.administrators,
                                                    function (admin) {
                                                        adminContribution =
                                                            adminContribution + admin.mechanicalCollectablePercentage;
                                                    });
                                                if (adminContribution != 0) {
                                                    publisher.hasCollectable = true;
                                                }
                                            });
                                    });
                                recording.writers = result.data;
                                recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                            });
                    }
                });
        }

        //This counts the number of filtered writers on a recording
        $scope.getFilteredWriterCount = function (recording) {
            var count = 0;
            angular.forEach(recording.writers,
                function (writer) {
                    //console.log(JSON.stringify(writer));
                    if ($scope.writerFilter(writer)) {
                        count++;
                    };
                });

            return count;
        }

        //Writer Filter Information
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
                if (writer.isLicensed) {
                    return true;
                } else {
                    return false;
                }
            }
            if ($scope.selectedWriterFilter.Name == "Unlicensed Writers") {
                if (!writer.isLicensed) {
                    return true;
                } else {
                    return false;
                }
            }
            if ($scope.selectedWriterFilter.Name == "All Writers") {
                {
                    return true;
                }
                return true;
            }
        }

        $scope.viewFilters.push({
            Id: 1,
            Name: 'All Statuses Shown'
        });
        $scope.viewFilters.push({
            Id: 2,
            Name: 'Executed Statuses Only'
        });
        //$scope.viewFilters.push({
        //    Id: 3,
        //    Name: 'Most Recent Statuses Only'
        //});

        $scope.selectViewFilter = function (filter) {
            $scope.selectedViewFilter = filter;
            switch (filter.Id) {
                case 1:
                    $scope.mostRecentOnly = false;
                    $scope.allStatuses = true;
                    break;
                case 2:
                    $scope.mostRecentOnly = false;
                    $scope.allStatuses = false;
                    break;
                case 3:
                    $scope.mostRecentOnly = true;
                    $scope.allStatuses = true;
                    break;
            }
        }


        //Set default filter to Executed Only
        if ($scope.firstViewFilter === true) {
            $scope.selectedViewFilter = $scope.viewFilters[0];
        }

        //Handler for select Writer Filter
        $scope.selectWriterFilter = function (f) {
            $scope.selectedWriterFilter = f;
            switch (f.Id) {
                case 1:
                    angular.forEach($scope.productDetail.recordings,
                        function (recording) {
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });

                    break;
                case 2:
                    angular.forEach($scope.productDetail.recordings,
                        function (recording) {
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });
                    break;
                case 3:
                    angular.forEach($scope.productDetail.recordings,
                        function (recording) {
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });
                    break;
                case 4:
                    angular.forEach($scope.productDetail.recordings,
                        function (recording) {
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });
                    break;
                case 5:
                    angular.forEach($scope.productDetail.recordings,
                        function (recording) {
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });
                    break;
                default:
                    break;
            }
        };

        //Writer Filter Build
        $scope.writerFilters.push({
            Id: 1,
            Name: 'All Writers'
        });
        $scope.writerFilters.push({
            Id: 2,
            Name: 'Controlled Writers'
        });
        $scope.writerFilters.push({
            Id: 3,
            Name: 'Uncontrolled Writers'
        });
        $scope.writerFilters.push({
            Id: 4,
            Name: 'Licensed Writers'
        });
        $scope.writerFilters.push({
            Id: 5,
            Name: 'Unlicensed Writers'
        });
        if ($scope.firstWriterFilter === true) {
            $scope.selectedWriterFilter = $scope.writerFilters[1];
        }

        //Writer and Config button configurations
        $(document)
            .ready(function () {
                $(document)
                    .click(function () {
                        $('#writerFilterDropdown').hide();
                        $scope.isSelectWritersCollapsed = true;
                        $('configDropdown').hide();
                        $scope.isSelectConfigCollapsed = true;
                    });
            });

        function containsObject(obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i] === obj) {
                    return true;
                }
            }

            return false;
        }

        function getRecordings() {
            var totalComp = 0;
            productsService.getProductRecsRecordings(productId)
                .then(function (result) {
                    angular.forEach(result.data,
                        function (value) {
                            value.writersCollapsed = true;
                            value.writers = [];
                            if (value.track != null && value.track.copyrights != null) {
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
                            } else {
                                value.message += " no associated copyright";
                            }
                            if (value.message != '') {
                                var notymessage = value.track.title + ' - ' + value.message + " (click to close)";
                                noty({
                                    text: notymessage,
                                    type: 'error',
                                    timeout: false,
                                    layout: "top"
                                });
                            }
                        });
                    $scope.productDetail.recordings = result.data;
                    angular.forEach($scope.productDetail.recordings,
                        function(recording) {
                            if (recording.track.copyrights != null){
                                productsService.getWorksWriters(recording.track.copyrights[0].workCode)
                                    .then(function(result) {
                                        angular.forEach(result.data,
                                            function(value) {
                                                value.publishersCollapsed = true;
                                                angular.forEach(value.originalPublishers,
                                                    function(publisher) {
                                                        var adminContribution = 0;
                                                        publisher.hasCollectable = false;
                                                        angular.forEach(publisher.administrators,
                                                            function(admin) {
                                                                adminContribution =
                                                                    adminContribution +
                                                                    admin.mechanicalCollectablePercentage;
                                                            });
                                                        if (adminContribution != 0) {
                                                            publisher.hasCollectable = true;
                                                        }
                                                    });
                                            });
                                          
                                        recording.paidQtr = $scope.getMostRecentPaidQuarter(recording);
                                        var response = result.data;
                                        recording.writers = result.data;

                                        setlicenseProductRecordingWriter(recording.writers, recording);

                                        setLicenseWriterNotes($scope.productOverview_Original);
                                        var recordingTrackId = recording.track.id;

                                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);

                                        //Get totalComp and other values
                                        angular.forEach(recording.writers,
                                            function(writer) {
                                                //    totalComp = totalComp + writer.mechanicalOwnershipPercentage / 100;
                                                writer.trackId = recordingTrackId;

                                                //______Fill dependencies_________
                                                //Set Rates by Config
                                                setRatesByConfig();

                                                //Organize rates into thresholds and related rates w/ writers.  Then store in array.
                                                $scope
                                                    .organizedWriters =
                                                    fillOrganizedWritersArray($scope.productOverviewRates);

                                                //Trim down organized writers and organize rates to be passed to ng-repeat
                                                $scope.organizedRatesByConfiguration = fillOrganizedRatesArray();

                                                setThresholdFlag($scope.organizedRatesByConfiguration);
                                            });
                                        //Map totalComp and releaseDate
                                        angular.forEach($scope.productDetail.configurations,
                                            function(pConfig) {
                                                angular.forEach($scope.configurationFilters,
                                                    function(config) {
                                                        if (config.product_configuration_id == pConfig.id) {
                                                            // config.totalAmount = $scope.totalComp;
                                                            config.releaseDate = pConfig.releaseDate;
                                                        }
                                                    });
                                            });

                                        //Map paid Qtr from rates to recording
                                        recording.paidQtr = mapPaidQtr(recording);
                                        $scope.productPaidQuarter = $scope
                                            .calculateProductPaidQtr(recording, $scope.productPaidQuarter);
                                    });
                            }
                        });

                    //Fill literals used to be here

                    //Set trackId and license recording Id on rates
                    setTrackIdAndLicenseRecordingId();

                    //Set Rates by Config
                    setRatesByConfig();

                    //Organize rates into thresholds and related rates w/ writers.  Then store in array.
                    $scope.organizedWriters = fillOrganizedWritersArray($scope.productOverviewRates);

                    //Trim down organized writers and organize rates to be passed to ng-repeat
                    $scope.organizedRatesByConfiguration = fillOrganizedRatesArray();

                    setThresholdFlag($scope.organizedRatesByConfiguration);

                    //Calculate Summary Config Licensed
                    // calculateSummaryConfigurations(); //only total comp calculated here
                    //   calculateSummaryConfiurations_v2();

                    mapThresholdsToWriters($scope.organizedRatesByConfiguration);

                    //  setThresholdWriters();

                    //end
                    $scope.productsForCreateLicense.push({
                        licenseId: null,
                        product_id: $scope.productDetail.id,
                        title: $scope.productDetail.title,
                        recsArtist: $scope.productDetail.artist,
                        recsLabel: $scope.productDetail.recordLabel,
                        licensesNo: $scope.productDetail.relatedLicensesNo,
                        recordingsNo: $scope.productDetail.recordings.length
                    });
                },
                    function (error) {
                        alert(error.data.message);
                    });

            return $scope.productDetail;
        }

        function setThresholdFlag(x) {
            angular.forEach(x,
                function (writerRates) {
                    var count = 0;
                    if (writerRates.rates.length >= 2) {
                        writerRates.thresholdPresent = true;
                    } else {
                        writerRates.thresholdPresent = false;
                    }
                });
        }

        function normalizeLicenseStatus(x) {
            angular.forEach(x,
                function (writerRates) {
                    angular.forEach(writerRates.rates, function (nestedRate) {
                        var licenseDate = nestedRate.licenseDate;
                        var writerRateInclude = nestedRate.writerRateInclude; //If true, then we show licensed.  if false, then we show unLicensed
                        //console.log("writerRateInclude: " + writerRateInclude + "    -- licenseDate: " + licenseDate);
                        if (licenseDate == null && writerRateInclude) {
                            //alert("PING");
                            nestedRate.writerRateInclude = false; // If licenseDate is null, mark as unLicnesed
                        }
                    });
                });
        }

        function getMostRecentRatesForWriter(writer, rates) {
            var writerRates = [];  //These are the rates that belong to the writer
            var uniqueConfigurationIds = [];
            var duplicateConfigIds = [];
            var uniqueLicenseMethodIds = [];
            var recentRateHolder = [];
            var sortedByConfigAndDateWriterRates = [];
            var ratesSameConfig = [];

            //SetRates for Organizing
            var trackId;
            var caeCode;
            var modifiedDate;
            var licenseMethodId;

            //Set all modifiedDates to 1500 days ago
            //Set property keys on object so that we can handle them
            setRateKeys(rates);

            //Fill all writer Rates
            writerRates = getWriterRates(rates, writer);
            //console.log("writerRateswriterRateswriterRateswriterRates writerRates" + JSON.stringify(writerRates));
            //_____logic on writerRates____
            //Get each unique configuration Id
            uniqueConfigurationIds = getUniqueConfigIdForWriterRates(writerRates);

            //Get UniqueLicenseMethodIds
            //Should usually be 1.  It will be 2 in cases of 'direct' and 'direct bulk'
            uniqueLicenseMethodIds = getUniqueLicenseMethodIds(writerRates);
            /*
            console.log("Look Look!!! licenseMethodsIdslicenseMethodsIdslicenseMethodsIds + licenseMethodsIds + " + JSON.stringify(uniqueLicenseMethodIds));
            console.log("Look Look!!! licenseMethodsIdslicenseMethodsIdslicenseMethodsIds + licenseMethodsIds + " + JSON.stringify(uniqueConfigurationIds));
            */
            //     duplicateConfigIds = getDuplicateConfigurationIds(writerRates);  Not used. Function not implemented either

            sortedByConfigAndDateWriterRates = sortWriterRatesByConfigId(writerRates);

            //Get E and A rate count.  This is used to toggle the 'no results found' div if there are no E or A rates
            writer.writerEARatesCount = getWriterExecutedAndAcceptedRateCount(writer, rates);

            //If there is only 1 licenseMethod, then gather the mostRecentRatesFor each single configuration
            if (uniqueLicenseMethodIds.length === 1) {
                /*
                console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                */
                var mostRecentRatesForSingleLicenseMethod = [];

                //Get most recent WriterRates if single license method

                mostRecentRatesForSingleLicenseMethod =
                    getMostRecentRatesForSingleLicenseMethod(sortedByConfigAndDateWriterRates);

                writer.writerMostRecentRateCount = mostRecentRatesForSingleLicenseMethod.length;

                return mostRecentRatesForSingleLicenseMethod;
                //Check if licenseMehtod is different by looking in duplicate config and see if its populated.
            } else {
                /*
                console.log("************************************************************");
                console.log("************************************************************");
                console.log("************************************************************");
                console.log("************************************************************");
                */
                //If more than one license Method
                var mostRecentRatesForMultipleLicenseMethod = [];
                mostRecentRatesForMultipleLicenseMethod =
                    getMostRecentRatesForMultipleLicenseMethod(sortedByConfigAndDateWriterRates);
                writer.writerMostRecentRateCount = mostRecentRatesForMultipleLicenseMethod.length;

                return mostRecentRatesForMultipleLicenseMethod;
            }
        };

        function getMostRecentRatesForSingleLicenseMethod(sortedWriterRates) {
            var mostRecentRates = [];
            //Grab first element in array for each array
            angular.forEach(sortedWriterRates,
                function (rate) {
                    mostRecentRates.push(rate[0]);
                });
            return mostRecentRates;
        }

        //Can only be two license Method types
        function getMostRecentRatesForMultipleLicenseMethod(sortedWriterRates) {
            var mostRecentRates = [];

            angular.forEach(sortedWriterRates,
            function (configRate) {
                var licenseMethodIdsFound = [];
                var mostRecentRatesForTwoLicenseMethods = [];
                angular.forEach(configRate, function (nestedRate) {
                    var licenseMethod = nestedRate.licenseMethod.licenseMethodId;

                    //Get first item in array, we know it will be the most recent.
                    //Save that id to the licenseMethodsFound array
                    if (licenseMethodIdsFound.length === 0) {
                        mostRecentRatesForTwoLicenseMethods.push(configRate[0]);
                        licenseMethodIdsFound.push(licenseMethod);
                    }

                    //If it does not contain the licenseMethod, add it rate to array and add licenseMethod
                    if (!containsObject(licenseMethod, licenseMethodIdsFound)) {
                        mostRecentRatesForTwoLicenseMethods.push(nestedRate);
                        licenseMethodIdsFound.push(licenseMethod);
                    }
                });

                //Add mostRecentRates to above array
                angular.forEach(mostRecentRatesForTwoLicenseMethods, function (rate) {
                    if (!containsObject(rate, mostRecentRates)) {
                        mostRecentRates.push(rate);
                    }
                });
            });

            return mostRecentRates;
        }

        angular.element(document).ready(function () {
            $scope.showToDOM = true;
        });

        function sortWriterRatesByConfigId(writerRates) {
            var sortedRatesByConfiguration = [];

            //Separate each rate into each configuration stack existing in a larger stack
            sortedRatesByConfiguration = sortRatesByConfiguration(writerRates);

            //return array of latest rates by largest date first
            angular.forEach(sortedRatesByConfiguration, function (sortedConfig) {
                sortedConfig.sort(function (a, b) {
                    var key1 = a.modifiedDate;
                    var key2 = b.modifiedDate;

                    if (key1 > key2) {
                        return -1;
                    } else if (key1 === key2) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
            });
            //   console.log("This should be right " + JSON.stringify(sortedRatesByConfiguration));
            return sortedRatesByConfiguration;
        }

        function sortRatesByConfiguration(writerRates) {
            return writerRates.reduce(function (result, current) {
                result[current.product_configuration_id] = result[current.product_configuration_id] || [];
                result[current.product_configuration_id].push(current);
                return result;
            }, {});
        }

        //A duplicate will only occur when the license method is different.  If a duplicate occurs, that means show that writer rate twice.  Once per duplicate.
        //
        function getDuplicateConfigurationIds(writerRates) {
        }

        function getUniqueLicenseMethodIds(writerRates) {
            var licenseMethodIds = [];
            angular.forEach(writerRates,
                function (writerRate) {
                    var licenseMethodId = writerRate.licenseMethod.licenseMethodId;
                    if (!containsObject(licenseMethodId, licenseMethodIds)) {
                        licenseMethodIds.push(licenseMethodId);
                    }
                });
            return licenseMethodIds;
        }

        function getUniqueConfigIdForWriterRates(writerRates) {
            var uniqueConfigIds = [];
            angular.forEach(writerRates,
                function (writerRate) {
                    var productConfigurationid = writerRate.product_configuration_id;
                    if (!containsObject(productConfigurationid, uniqueConfigIds)) {
                        uniqueConfigIds.push(productConfigurationid);
                    }
                });
            return uniqueConfigIds;
        }

        function matchingConfigId(array, configId) {
            return isInArray(configId, array);
        }

        function getWriterRates(rates, writer) {
            var writerRates = [];
            angular.forEach(rates,
                function (rate) {
                    //console.log("LOOK RATE! Look for licenseStatus: " + JSON.stringify(rate));
                    if ((rate.trackId === writer.trackId) && (rate.caeCode === writer.caeNumber)) {
                        writerRates.push(rate);
                    }
                });
            return writerRates;
        }

        //Set property keys on object so that we can handle them
        function setRateKeys(rates) {
            var trackId, caeCode, licenseMethod;
            var modifiedDate = null;

            angular.forEach(rates,
                function (rate) {
                    angular.forEach(rate.rates,
                        function (nestedRate) {
                            trackId = nestedRate.trackId;
                            caeCode = nestedRate.caeCode;
                            licenseMethod = nestedRate.licenseMethod;
                            if (nestedRate.modifiedDate != null) {
                                modifiedDate = nestedRate.modifiedDate;
                            }
                        });
                    rate.licenseMethod = licenseMethod;
                    rate.trackId = trackId;
                    rate.caeCode = caeCode;

                    //set modified date 'dummy holder data' to track rates with null as a modified date
                    rate.modifiedDate = setModifiedDate(modifiedDate);
                });
        }

        //Set all modifiedDates to 1500 days ago to serve as keys so we can identify them later
        function setModifiedDate(modifiedDate) {
            if (modifiedDate === null) {
                var tomorrow = new Date();
                modifiedDate = tomorrow.setDate(tomorrow.getDate() - 1500);
            }
            return modifiedDate;
        }

        function getWriterExecutedAndAcceptedRateCount(writer, rates) {
            var writerEARatesCount = 0;
            angular.forEach(rates,
                function (rate) {
                    angular.forEach(rate.rates,
                        function (nestedRate) {
                            if ((rate.trackId === writer.trackId) &&
                                (rate.caeCode === writer.caeNumber) &&
                                (nestedRate.licenseStatus.licenseStatusId === 5 ||
                                    nestedRate.licenseStatus.licenseStatusId === 7) &&
                                nestedRate.licenseDate != null) {
                                //                                writerEARates.push(rate);
                                writerEARatesCount++;
                            }
                        });
                });
            return writerEARatesCount;
        }

        function getRatesForWriter(writer, rates) {
            var writerRates = [];

            //SetRates for Organizing
            var trackId;
            var caeCode;
            var modifiedDate;
            angular.forEach(rates,
                function (rate) {
                    angular.forEach(rate.rates,
                        function (nestedRate) {
                            trackId = nestedRate.trackId;
                            caeCode = nestedRate.caeCode;
                            if (nestedRate.modifiedDate != null) {
                                modifiedDate = nestedRate.modifiedDate;
                            }
                        });
                    rate.trackId = trackId;
                    rate.caeCode = caeCode;
                    rate.modifiedDate = modifiedDate;
                });

            //Fill all writer Rates
            angular.forEach(rates,
                function (rate) {
                    if ((rate.trackId === writer.trackId) && (rate.caeCode === writer.caeNumber)) {
                        writerRates.push(rate);
                    }
                });



            return writerRates;
        };

        function setThresholdWriters() {
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    angular.forEach(recording.writers,
                        function (writer) {
                            setWriterThresholdValues(writer);
                        });
                });
        }

        function setWriterThresholdValues(writer) {
            var thresholdRateVis = false;
            if (writer.thresholdRate == undefined) {
                writer.thresholdRate = false;
            }
            if (writer.escalatedThresholdRateVis == undefined) {
                writer.escalatedThresholdRateVis = false;
            }
            angular.forEach(writer.writerPORates,
                function (writerRate) {
                    angular.forEach(writerRate.rates,
                        function (nestedRate) {
                            if (writerRate.rates.length >= 2) {
                                writer.thresholdRate = true;
                            } else {
                                if (writer.thresholdRate == undefined) {
                                    writer.thresholdRate = false;
                                }
                                if (writer.thresholdRate) {
                                    writer.thresholdRate = true;
                                }
                            }

                            if (nestedRate.escalatedRate == undefined) {
                                thresholdRateVis = false;
                                writer.escalatedThresholdRateVis = thresholdRateVis;
                            }
                            if (writerRate.thresholdPresent) {
                                if (!isNaN(nestedRate
                                        .escalatedRate) &&
                                    nestedRate.escalatedRate > 0) {
                                    thresholdRateVis = true;
                                    writer.escalatedThresholdRateVis = thresholdRateVis;
                                }
                            }
                        });
                });
        }

        function mapThresholdsToWriters(x) {
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    angular.forEach(recording.writers,
                        function (writer) {
                            if (writer.thresholdPresent == undefined) {
                                writer.thresholdPresent = false;
                            } else if (writer.thresholdPresent === true) {
                                writer.thresholdPresent = true;
                                angular.forEach(x,
                                    function (rate) {
                                        var thresholdPresent = rate.thresholdPresent;
                                        //If its the proper writer
                                        if ((rate.trackId === writer.trackId) && (rate.caeCode === writer.caeNumber)) {
                                            if (!writer.thresholdPresent) {
                                                alert("MAPPED!");
                                                writer.thresholdPresent = thresholdPresent;
                                            } else if (writer.thresoldPresent) {
                                                writer.thresoldPresent = true;
                                            }
                                        }
                                    });
                            }
                        });
                });
        }

        //function groupByConfigurations(x) {  //TODO: Delete
        //    angular.forEach(x,
        //        function (license) {
        //            angular.forEach(license.licenseProducts,
        //                function (licenseProduct) {
        //                    angular.forEach(licenseProduct.recordings,
        //                        function (recording) {
        //                            angular.forEach(recording.writers,
        //                                function (writer) {
        //                                    writer.licenseProductRecordingWriter.ratesByConfiguration = {};
        //                                    writer.licenseProductRecordingWriter.ratesByConfiguration = $scope
        //                                        .groupByConfigurations(writer.licenseProductRecordingWriter.rateList);
        //                                });
        //                        });
        //                });
        //        });
        //    return x;
        //}

        function mapPaidQtr(recording) {
            var recordingLowestPaidQtrKey = 500; //Just a high number to start the count
            var recordingLowestPaidQtr;
            var recordingTrackId = recording.track.id;
            var rateList = [];
            var paidQtrList = [];
            var paidQtrKeys = [];
            angular.forEach($scope.productOverview_Original,
                function (license) {
                    angular.forEach(license.licenseProducts,
                        function (licenseProduct) {
                            angular.forEach(licenseProduct.recordings,
                                function (recording) {
                                    var productOverviewTrackId = recording.track.id;
                                    if (productOverviewTrackId === recordingTrackId) {
                                        angular.forEach(recording.writers,
                                            function (writer) {
                                                if (writer.licenseProductRecordingWriter != null) {
                                                    //Fill rates with paid Qtr
                                                    angular.forEach(writer.licenseProductRecordingWriter.rateList,
                                                        function (rate) {
                                                            rateList.push(rate);
                                                        });
                                                    //Loop through rateList and find lowest paid Qtr
                                                    angular.forEach(rateList,
                                                        function (rate) {
                                                            if (rate.paidQuarter != null) {
                                                                paidQtrList.push(rate.paidQuarter);
                                                            }
                                                        });

                                                    angular.forEach(paidQtrList,
                                                        function (paidQtr) {
                                                            var paidQtrKey = returnPaidQuarterKey(paidQtr);
                                                            if (paidQtrKey != null) {
                                                                paidQtrKeys.push(paidQtrKey);
                                                            }
                                                        });

                                                    var lowestPaidQtrKey = Math.min.apply(null, paidQtrKeys);

                                                    //return lowestpaidQtr
                                                    if (recordingLowestPaidQtrKey > lowestPaidQtrKey) {
                                                        recordingLowestPaidQtrKey = lowestPaidQtrKey;
                                                    }
                                                }
                                            });
                                    }
                                });
                        });
                });
            //Map all rates from Product_OVerview_Original to this recording
            //Match by 'recording id'?  Check? || OR CAE and trackId
            recordingLowestPaidQtr = returnPaidQtrFromKey(recordingLowestPaidQtrKey);
            //   console.log("RECORDING PAID QTR" + recordingLowestPaidQtr);
            return recordingLowestPaidQtr;
            //Map lowest paidQtr on rates to recording
        }

        function calulateLicensedAmount() {
            var licensed = 0;
            //Set configuration filter 'licensed to zero'
            angular.forEach($scope.configurationFilters,
                function (config) {
                    config.licensedAmount = 0;
                    config.totalAmount = 0;
                });

            //find rates and calculate!
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    angular.forEach(recording.writers,
                        function (writer) {
                            var contribution = writer.contribution;
                            var writerCaeNumber = writer.caeNumber;
                            var writerTrackId = writer.trackId;
                            //addTotalCompRate(contribution, configId); //Currently just adding
                            addTotalCompRateAll(contribution); //This adds total Comp / Total amount to all configurations.  they all will be the same
                            //to turn this off and go back to the old calc (had an error of .5) comment this out, and then uncomment calculateLiteralAndSummary on line 2177
                            angular.forEach(writer.writerPORates,
                                function (writerRate) {
                                    var configId = writerRate.product_configuration_id;

                                    //if there is not threshold
                                    if (!writerRate.thresholdPresent) {
                                        angular.forEach(writerRate.rates,
                                            function (nestedRate) {
                                                //check to see if writer Rate is a parent of an addendum.  if it is a parent, skip it
                                                var licenseNumber = nestedRate.licenseNumber;
                                                if (!isParentToAddendum(licenseNumber, configId)) {
                                                    if (nestedRate.writerRateInclude &&
                                                        writerTrackId === nestedRate.trackId &&
                                                        writerCaeNumber === nestedRate.caeCode) {
                                                        addLicensedRate(contribution, configId);
                                                    }
                                                }
                                            });
                                    } else {
                                        //if there is a threshold
                                        var nestedRate = writerRate.rates[0];
                                        var licenseNumber = nestedRate.licenseNumber;
                                        if (!isParentToAddendum(licenseNumber, configId)) {
                                            if (nestedRate.writerRateInclude &&
                                                writerTrackId === nestedRate.trackId &&
                                                writerCaeNumber === nestedRate.caeCode) {
                                                addLicensedRate(contribution, configId);
                                            }
                                        }
                                    }
                                });
                        });
                });
        }

        function isParentToAddendum(licenseNumber, parentConfig) {
            var licenseNumbers = [];
            //GetAllLicenseNumbers
            licenseNumbers = getAllLicenseNumbers(parentConfig);

            //Check if licenseNumbers match
            var matchingNumbers = doLicenseNumbersMatch(licenseNumber, licenseNumbers);
            var result = isAddendumNewer(matchingNumbers, licenseNumber);

            return result;
        }

        function isAddendumNewer(matchingNumbers, licenseNumber) {
            //Check if current licenseNumber is an addendum
            var isAddendum = isLicenseNumberAddendum(licenseNumber);

            //if there is a match, determine which is newer
            if (matchingNumbers.length >= 1) {
                var possibleHigherAddendums = getAddendumNumber(matchingNumbers);
                //if parentConfig newer, then parent is actually an addendum, return false
                if (isAddendum) {
                    //get last digit and find oldest
                    var addendumNumber = licenseNumber.slice(-1);
                    if (isNumberHigher(addendumNumber, possibleHigherAddendums)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                //if parent is older, then it is a parent, return true

                //if no match, return false
            } else {
                return false;
            }
            return false;
        }

        function getAllLicenseNumbers(parentConfig) {
            var licenseNumbers = [];
            angular.forEach($scope.productDetail.recordings,
         function (recording) {
             angular.forEach(recording.writers,
                 function (writer) {
                     var contribution = writer.contribution;
                     angular.forEach(writer.writerPORates,
                         function (writerRate) {
                             var configId = writerRate.product_configuration_id;
                             if (parentConfig === configId) {
                                 angular.forEach(writerRate.rates,
                                     function (nestedRate) {
                                         if (!containsObject(nestedRate.licenseNumber, licenseNumbers)) {
                                             licenseNumbers.push(nestedRate.licenseNumber);
                                         }
                                     });
                             }
                         });
                 });
         });
            return licenseNumbers;
        }

        function isNumberHigher(number, array) {
            var bool = false;
            angular.forEach(array,
                function (item) {
                    if (item < number) {
                        bool = true;
                    }
                });
            return bool;
        }

        function getAddendumNumber(matchingNumbers) {
            var array = [];
            angular.forEach(matchingNumbers,
                function (num) {
                    var newNum = num.slice(-1);
                    array.push(newNum);
                });
            return array;
        }

        function doLicenseNumbersMatch(licenseNumber, licenseNumbers) {
            var matchingNumbers = [];
            angular.forEach(licenseNumbers,
                function (num) {
                    //If it is in array
                    if (licenseNumber.indexOf(num) > -1) {
                        matchingNumbers.push(num);
                    }
                });
            return matchingNumbers;
        }

        function isLicenseNumberAddendum(number) {
            if (number.indexOf('-') > -1) {
                //It is an addendum!
                return true;
            } else {
                return false;
            }
        }

        function addLicensedRate(rate, configId) {
            angular.forEach($scope.configurationFilters,
                function (config) {
                    if (config.product_configuration_id === configId) {
                        config.licensedAmount = config.licensedAmount + rate;
                    }
                });
        }

        function addTotalCompRate(rate, configId) {
            angular.forEach($scope.configurationFilters,
              function (config) {
                  if (config.product_configuration_id === configId) {
                      config.totalAmount = config.totalAmount + rate;
                  }
              });
        }

        function addTotalCompRateAll(rate) {
            angular.forEach($scope.configurationFilters,
              function (config) {
                  config.totalAmount = config.totalAmount + rate;
              });
        }

        //Collapses Writers
        $scope.collapseWriters = function (recording) {
            recording.writersCollapsed = !recording.writersCollapsed;

            //toggle writer row collapse
            toggleWriterRowCollapse(recording);
        }

        function toggleWriterRowCollapse(recording) {
            var elementId = recording.id;
            var myElement = document.getElementById(elementId);
            $(myElement).collapse("toggle");
        }

        //This is here because we cant access the full scope of $scope.productDetail until after the page loads.  Its tricky to access the writers, and recording collections.  I get errors such as
        //writers is undefined.  This is because the order of execution is wrong.  using $interval, allows me to execute a method after $scope.productDetail has been properly and completely populated (all slow function finished)
        $interval(function () {
            angular.forEach($scope.productDetail.recordings,
        function (recording) {
            var trackId = recording.track.id;
            angular.forEach(recording.writers,
                function (writer) {
                    writer.trackId = trackId;
                    writer.mostRecentRates =
                        getMostRecentRatesForWriter(writer, $scope.organizedRatesByConfiguration);
                    writer.writerPORates = getRatesForWriter(writer, $scope.organizedRatesByConfiguration);
                    setThresholdWriters();
                });
        });

            normalizeLicenseStatus($scope.organizedRatesByConfiguration);
            //Start literal and productSummary calculations here
            //   calculateLiteralAndSummary();  Not working
            calulateLiterals();
            calulateLicensedAmount();

            //Fill recording Literal
            //  fillRecordingLiteral();  //turned off
        }, 10000);

        function calulateLiterals() {
            var licensedRecordings = 0;
            var partialRecordings = 0;
            var unlicensedRecordings = 0;
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    recording.licenseLiteral = "None";
                    recording.licenseLiteral = isRecordingLicensed(recording);

                    var writerCount = recording.writers.length;
                    var writerLicensedCount = 0;
                    var writerUnLicensedCount = 0;

                    //Get ProductLiteral
                    if (recording.licenseLiteral === "Licensed") {
                        licensedRecordings++;
                    } else if (recording.licenseLiteral === "Partial") {
                        partialRecordings++;
                    }
                    else {
                        unlicensedRecordings++;
                    }
                });

            //console.log("licensedRecordings: " + licensedRecordings + "\n" + "unlicensedRecordings: " + unlicensedRecordings);

            //None

            //preventPreload of verifying tag
            if (licensedRecordings === 0 && unlicensedRecordings == 0 && partialRecordings === 0) {
                $scope.productDetail.productTotalLicenseLiteral = "";
            }

            if (licensedRecordings === 0 && unlicensedRecordings >= 1 && partialRecordings === 0) {
                $scope.productDetail.productTotalLicenseLiteral = "None";
            }
                //licensed
            else if (licensedRecordings >= 1 && unlicensedRecordings === 0 && partialRecordings === 0) {
                $scope.productDetail.productTotalLicenseLiteral = "Licensed";
            }
                //Partial
            else {
                $scope.productDetail.productTotalLicenseLiteral = "Partial";
            }
        }

        function isWriterLicensed(writer) {
            var configurationIds = getConfigurationIds();

            var licensedConfigurations = [];
            //   console.log("I AM HUIT");
            var unlicensedRateCount = 0;
            var licensedRateCount = 0;
            angular.forEach(writer.writerPORates, function (writerRate) {
                angular.forEach(writerRate.rates, function (nestedRate) {
                    //LicenseStatus == Rejected or voided, set to unLicensed
                    if (nestedRate.licenseStatus.licenseStatusId === 4 ||
                        nestedRate.licenseStatus.licenseStatusId === 8) {
                        unlicensedRateCount++;
                    }
                    if (nestedRate.writerRateInclude) {
                        var licensedConfig = nestedRate.product_configuration_id;
                        if (!containsObject(licensedConfig, licensedConfigurations)) {
                            licensedConfigurations.push(licensedConfig);
                        }
                        licensedRateCount++;
                    }
                    if (!nestedRate.writerRateInclude) {
                        unlicensedRateCount++;
                    }
                });
            });
            //if (licensedRateCount >= 1) { //This works, byt now
            //    writer.isLicensed = true;
            //    return true;
            //} else {
            //    writer.isLicensed = false;

            //    return false;
            //}

            if (licensedConfigurations.length === 0) {
                writer.isLicensed = "None";
                return "None";
            }

            if (configurationIds.length === licensedConfigurations.length) {
                writer.isLicensed = "Licensed";
                return "Licensed";
            }
            else if (configurationIds.length > licensedConfigurations.length && licensedConfigurations.length !== 0) {
                writer.isLicensed = "Partial";
                return "Partial";
            } else {
                writer.isLicensed = "None";
                return "None";
            }
        }

        function getConfigurationIds() {
            var array = [];
            angular.forEach($scope.configurationFilters, function (config) {
                array.push(config.product_configuration_id);
            });
            return array;
        }

        function isRecordingLicensed(recording) {
            var writerStatusArray = [];
            var writerCount = recording.writers.length;
            //console.log("Writer Count on Track: " + writerCount);
            angular.forEach(recording.writers, function (writer) {
                if (writer.controlled) {
                    var writerLicensed = false;
                    var licensedRates = 0;
                    var unLicensedRates = 0;

                    var licenseStatusString = isWriterLicensed(writer);
                    if (writerCount === 1 && licenseStatusString === "Licensed") {
                        //
                        recording.licenseLiteral = "Licensed";
                        writerStatusArray.push(licenseStatusString);
                    } //If 1 writer on recording
                    else if (writerCount === 1 && licenseStatusString === "Partial") {
                        recording.licenseLiteral = "Partial";
                        writerStatusArray.push(licenseStatusString);
                    } else if (writerCount === 1 && licenseStatusString === "None") {
                        recording.licenseLiteral = "None";
                        writerStatusArray.push(licenseStatusString);
                    }
                    if (writerCount > 1) {
                        //console.log("Track Title: " + recording.track.title + "\n " + "Writer Count: " + writerCount + " \n " + " WriterName: " + writer.name + " \n " + "Writer is: " + licenseStatus);
                        //console.log(writer.name);
                        //console.log(licenseStatus);
                        writerStatusArray.push(licenseStatusString);
                    }
                }
            });


            var recordingStatus = returnLicenseStatus(writerStatusArray);


            return recordingStatus;

        }

        function returnLicenseStatus(array) {
            var total = array.length;
            var licensedCount = 0;
            var unlicensedCount = 0;
            var partialCount = 0;
            angular.forEach(array, function (item) {
                if (item === "Licensed") {
                    licensedCount++;
                } else if (item === "Partial") {
                    partialCount++;
                } else {
                    unlicensedCount++;
                }
            });
            //console.log("___Called from returnLicenseStatus___: " + "\n" + "LicensedCount: " + licensedCount + "\n " + "PartialCount: " + partialCount + " \n" + "UnLicensedCount: " + unlicensedCount);
            if (licensedCount === 0 && unlicensedCount >= 1 && partialCount === 0) {
                return "None";
            } else if (licensedCount >= 1 && unlicensedCount === 0 && partialCount === 0) {
                return "Licensed";
            } else if (licensedCount >= 0 && (unlicensedCount > 0 || partialCount >= 1)) {
                return "Partial";
            }

            //if (licensedCount >= 1 && unlicensedCount > 0) {  //Not used
            //    return "Licensed";
            //} else if (licensedCount === 0 && unlicensedCount >= 1) {
            //    return "None";
            //} else {
            //    return "Partial";
            //}
        }

        //Expand all writers button
        $scope.ToggleWritersBootstrap = function () {
            angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    //If publishers are open, close them
                    if (!$scope.publishersClosed) {
                        closeAllPublisers();
                        $scope.publishersClosed = true;
                    }

                    //Either open or close all writers
                    var elementId = recording.id;
                    var myElement = document.getElementById(elementId);
                    if ($scope.writersClosed) {
                        $(myElement).collapse("show");
                    } else {
                        $(myElement).collapse("hide");
                    }
                });
            //toggle writer control
            $scope.writersClosed = !$scope.writersClosed;
        }

        //Writer Open close toggle
        $scope.writersClosed = true;

        $scope.publishersClosed = true;
        $scope.toggleCollapseAllPublishers = function () {
            //If writers are not expanded
            if ($scope.writersClosed) {
                //  expandAllWriters();
                expandAllWritersBootstrap();
                $scope.writersClosed = false;
            }
            closeAllPublisers();
            $scope.publishersClosed = !$scope.publishersClosed;
        }
        function closeAllPublisers() {
            angular.forEach($scope.productOverview.recordings,
        function (recording) {
            angular.forEach(recording.writers,
                function (writer) {
                    if ($scope.publishersClosed) {
                        expandAllPublishers(writer);
                    } else {
                        collapseAllPublishers(writer);
                    }
                });
        });
        }

        function expandAllPublishers(writer) {
            writer.publishersCollapsed = false;
        }

        function collapseAllPublishers(writer) {
            writer.publishersCollapsed = true;
        }

        function expandAllWriters() {
            angular.forEach($scope.productOverview.recordings,
                function (recording) {
                    recording.writersCollapsed = false;
                });
        }

        function expandAllWritersBootstrap() {
            $('.collapse').collapse("show");
        }

        function collapseAllWriters() {
            angular.forEach($scope.productOverview.recordings,
                function (recording) {
                    recording.writersCollapsed = true;
                });
        }
        function collapseAllWritersBootstrap() {
            $('.collapse').collapse("hide");
        }

        $scope.setCaret = function (collapsed) {
            if (collapsed == true) {
                return "caret";
            }
            else {
                return "caret caret-up";
            }
        }

        $scope.writerBackground = function (controlled) {
            if (controlled == true) {
                return "{'background-color':'#B2FF7F'}";
            }
            else {
                return "";
            }
        }

        //$scope.collapseWriters = function (recording) {
        //    var elementId = recording.id;
        //    var myElement = document.getElementById(elementId);
        //    $(myElement).collapse("toggle");
        //}

        $scope.collapsePublishers = function (writer) {
            writer.publishersCollapsed = !writer.publishersCollapsed;
        }

        $scope.updateProductPriority = function (productId, mechsProductPriority) {
            mechsProductPriority = !mechsProductPriority;
            var request = { id: productId, mechsPriority: mechsProductPriority };

            productsService.updateProductPriority(request).then(function (result) {
            });
        }
        $scope.format = "MM/dd/yyyy";

        $scope.cbChecked = function () {
            $scope.allSelected = true;
            angular.forEach($scope.configurationFilters, function (v, k) {
                if (!v.checked) {
                    $scope.allSelected = false;
                }
            });
            //reset $scope.allSelected to true to change the button to say 'All configurations'
            ifNoneChecked();
        }

        function ifNoneChecked() {
            var configCount = $scope.configurationFilters.length;
            var count = 0;
            angular.forEach($scope.configurationFilters, function (v, k) {
                if (!v.checked) {
                    count++;
                }
            });
            if (configCount === count) {
                $scope.allSelected = true;
            }
        }

        //Configuration Filter, 'All Selected' Checkbox
        //__ BELOW ||Used for 'Select All' (Not implemented)|| BELOW __
        $scope.toggleAll = function () {
            var toggleAllSelected = !$scope.allSelected;
            var bool = true;
            if ($scope.allSelected) {
                bool = false;
            }
            angular.forEach($scope.configurationFilters, function (v, k) {
                v.checked = bool;
                $scope.allSelected = toggleAllSelected;
            });
        }

        $scope.monitorAllSelected = function () {
            $scope.allSelected = true;
            angular.forEach($scope.configurationFilters, function (v, k) {
                if (!v.checked) {
                    $scope.allSelected = false;
                }
            });
        }


        $scope.returnNAorDecimal = function (input, control) {
            var rateType = $scope.returnRateType(control);
            if (rateType === "N/A") {
                return input.toFixed(0);
            } else {
                return input.toFixed(4);
            }
        }
        var ifNullNA = function (x) {
            if (x == null || x == "" || x == undefined) {
                return "N/A";
            } else {
                return x;
            }
        }


        $scope.controlDeciamlRateColumn = function (input, control) {
            var rateType = ifNullNA(control);
            if (rateType === "N/A") {
                var result1 = input.toFixed(0);
                return result1;
            } else {
                var result = input.toFixed(4);
                return result;
            }
        }

        $scope.controlDeciamlProRataColumn = function (input, control) {
            var rateType = ifNullNA(control);
            if (rateType === "N/A") {
                var result1 = input.toFixed(0);
                return result1;
            } else {
                var result = input.toFixed(4);
                return result;
            }
        }

        $scope.controlDeciamlPerSongRateColumn = function (input, control) {
            var rateType = ifNullNA(control);
            if (rateType === "N/A") {
                var result1 = input.toFixed(0);
                return result1;
            } else {
                var result = input.toFixed(3);
                return result;
            }
        }


        //__^^ Used for 'Select All' ^^
    }]);

//http://spa.local/#/search-MyView/detail-Product/17775

//TO DELETE

//function calculateLiteralAndSummary() {
//    var totalComp = 0;
//    var totalCompNumberArray = []; //Calculate these numbers to get total comp
//    var licensed = 0;
//    var unlicensed = 0;

//    var writerArray = []; //all writers from $scope.productDetail
//    var productOverviewRecordings = []; //This is all recordings from the product on each license

//    //Set configSummary licensed to zero to prevent unnecessary addition
//    angular.forEach($scope.configurationFilters,
//        function (config) {
//            config.licensedAmount = 0;
//            config.notLicensedAmount = 0;
//        });

//    //Fill writer array and totalComp calculation Array
//    angular.forEach($scope.productDetail.recordings,
//        function (recording) {
//            var totalCompNumber = recording.umpgPercentageRollup / 100;

//            totalCompNumberArray.push(totalCompNumber);

//            angular.forEach(recording.writers, function (writer) {
//                //Get writer split(collectable/split)
//                var split = writer.contribution / 100;
//                console.log("split: " + split);
//                //var isLicensed = isWriterLicensed(writer);

//                var writerCaeCode = writer.caeNumber;
//                var writerTrackId = writer.trackId;
//                var writerName = writer.name;
//                var isLicensed;
//                angular.forEach($scope.productOverview_Original,
//                    function (license) {
//                        angular.forEach(license.licenseProducts, function (licenseProduct) {
//                            angular.forEach(licenseProduct.recordings, function (lpRecording) {
//                                var recordingTrackId = lpRecording.track.id;
//                                angular.forEach(lpRecording.writers, function (licenseProductWriter) {
//                                    //The 'isLicensed' is for literal calculation
//                                    //   var licenseStatus = licenseProductWriter.licenseProductRecordingWriter.isLicensed;

//                                    console.log("Analyze: \n" + "LP: caeCode " + licenseProductWriter.licenseProductRecordingWriter.caeCode + "   ||  writer: " + writerCaeCode + "\n LP: Name: " + licenseProductWriter.licenseProductRecordingWriter.name + "   ||| writer: " + writerName +
//                                        "\n" + "LP: trackId: " + recordingTrackId +
//                                        "    || " + writerTrackId);

//                                    if (licenseProductWriter.licenseProductRecordingWriter.caeCode === writerCaeCode &&
//                                        licenseProductWriter.licenseProductRecordingWriter.name === writerName &&
//                                        recordingTrackId === writerTrackId) {
//                                        angular
//                                                .forEach(licenseProductWriter.licenseProductRecordingWriter.ratesByConfiguration,
//                                                    function (rate) {
//                                                        angular.forEach(rate.rates, function (configRate) {
//                                                            console.log("MAGIC! : " + configRate.writerRateInclude);
//                                                            if (configRate.writerRateInclude) {
//                                                                if (writer.isLicensed) {
//                                                                    writer.isLicensed = true;
//                                                                }
//                                                                writer.isLicensed = true;
//                                                            } else {
//                                                                if (writer.isLicensed) {
//                                                                    writer.isLicensed = true;
//                                                                }
//                                                                writer.isLicensed = false;
//                                                            }
//                                                        });
//                                                    });

//                                        //   isLicensed = licenseStatus;
//                                        //     writer.isLicensed = isLicensed;
//                                    }

//                                    //Calculate licensed configs amount
//                                    angular
//                                        .forEach(licenseProductWriter.licenseProductRecordingWriter
//                                            .ratesByConfiguration,
//                                            function (rate) {
//                                                calulateRate(rate);
//                                            });
//                                });
//                            });
//                        });
//                    });
//            });
//        });

//    //Calculate TotalComp || Working
//    angular.forEach(totalCompNumberArray, function (item) {
//        totalComp = totalComp + item;
//    });

//    //Calculate Literals || Working
//    angular.forEach($scope.productDetail.recordings, function (recording) {
//        var licensed = 0;
//        var unlicensed = 0;
//        angular.forEach(recording.writers, function (writer) {
//            if (writer.isLicensed) {
//                licensed++;
//            } else {
//                unlicensed++;
//            }
//        });

//        console.log("Literal Numbers: " + "\n" + "Licensed: " + licensed + " \n UnLicensed: " + unlicensed);

//        //None
//        if (licensed === 0 && unlicensed >= 1) {
//            recording.licenseLiteral = "None";
//        }
//            //licensed
//        else if (licensed >= 1 && unlicensed === 0) {
//            recording.licenseLiteral = "Licensed";
//        }
//            //Partial
//        else {
//            recording.licenseLiteral = "Partial";
//        }
//    });

//    //Calculate ProductLiterals || Working
//    var unlicensedCount = 0;
//    var licensedCount = 0;
//    var partialCount = 0;
//    angular.forEach($scope.productDetail.recordings,
//        function (recording) {
//            if (recording.licenseLiteral === "None") {
//                unlicensedCount++;
//            } else if (recording.licenseLiteral === "Licensed") {
//                licensedCount++;
//            } else {
//                partialCount++;
//            }
//        });

//    if (unlicensedCount === 0 && partialCount === 0 && licensedCount > 0) {
//        $scope.productDetail.productTotalLicenseLiteral = "Licensed";
//    }
//    if (unlicensedCount >= 0 && licensedCount >= 0 && partialCount > 0) {
//        $scope.productDetail.productTotalLicenseLiteral = "Partial";
//    }
//    if (partialCount === 0 && licensedCount === 0 && unlicensedCount > 0) {
//        $scope.productDetail.productTotalLicenseLiteral = "None";
//    }

//    console.log("Total Comp: " + totalComp);
//    console.log("Licensed : " + licensed);
//    console.log("Unlicensed : " + (licensed - totalComp));
//    $scope.totalComp = totalComp;

//    //Map totalcomp to configuration filters
//    angular.forEach($scope.configurationFilters, function (config) {
//        config.totalAmount = $scope.totalComp;
//    });
//}

//function calulateRate(rate) {
//    var productConfigId = rate.product_configuration_id;
//    angular.forEach(rate.rates, function (writerRate) {
//        var trackId = writerRate.trackId;
//        var caeCode = writerRate.caeCode;
//        if (writerRate.writerRateInclude) {
//            //Get writer collectable
//            var collectable = getWriterContributionPercent(trackId, caeCode);
//            console.log("Collectable: " + collectable);
//            addContribuitonToConfig(productConfigId, collectable);
//        }
//    });
//}

//function getWriterContributionPercent(trackId, caeCode) {
//    var contribiution = 0;
//    angular.forEach($scope.productDetail.recordings, function (recording) {
//        angular.forEach(recording.writers, function (writer) {
//            if (trackId === recording.track.id && caeCode === writer.caeNumber) {
//                console.log("hit");
//                console.log("Contribution: " + writer.contribution / 100);
//                contribiution = writer.contribution / 100;
//            }
//        });
//    });
//    return contribiution;
//}

//function addContribuitonToConfig(configId, contribution) {
//    angular.forEach($scope.configurationFilters, function (config) {
//        if (config.product_configuration_id === configId) {
//            console.log("Licensed Amount b4: " + config.licensedAmount);
//            config.licensedAmount = config.licensedAmount + contribution;
//            console.log("Licensed Amount After: " + config.licensedAmount);
//        }
//    });
//}

//function addContribuitonToConfig2(configId, contribution) {
//    angular.forEach($scope.configurationFilters, function (config) {
//        if (config.product_configuration_id === configId) {
//            /// console.log("contribution " + contribution);
//            //  console.log("config.licensedAmount " + config.licensedAmount);
//            config.notLicensedAmount = config.notLicensedAmount + contribution;
//        }
//    });
//}

//check if writer is licensed on any related license, return true/false ||| Delete
//function isWriterLicensed(writer) {
//    var writerCaeCode = writer.caeNumber;
//    var writerTrackId = writer.trackId;
//    var writerName = writer.name;
//    angular.forEach($scope.productOverview_Original,
//        function(license) {
//            angular.forEach(license.licenseProducts, function(licenseProduct) {
//                angular.forEach(licenseProduct.recordings, function (lpRecording) {
//                    var recordingTrackId = lpRecording.track.id;
//                    angular.forEach(lpRecording.writers, function (licenseProductWriter) {
//                     //   console.log("Look here: " + JSON.stringify(licenseProductWriter));
//                        var licenseStatus = licenseProductWriter.licenseProductRecordingWriter.isLicensed;
//                        console.log("RESULT: " + licenseStatus);
//                        if (licenseProductWriter.licenseProductRecordingWriter.caeCode === writerCaeCode &&
//                            licenseProductWriter.licenseProductRecordingWriter.name === writerName &&
//                            recordingTrackId === writerTrackId) {
//                            console.log("HIT HIT: " + JSON.stringify(licenseStatus));
//                            return licenseStatus;
//                        }
//                        return false;
//                    });
//                });
//            });
//        });
//}

//function calculateSummaryConfigurations() {  //Not used, delete this
//    var scrapedConfigsFromProductHeader = [];
//    var configs = [];
//    var licenseIds = [];
//    //load unique configurations into array
//    //This loads only LICENSED configurations into the config Array. //Map to these configs
//    angular.forEach($scope.productOverview_Original,
//        function (license) {
//            var licenseId = license.licenseId;
//            licenseIds.push(licenseId);
//            angular.forEach(license.licenseProductConfigurations,
//                function (config) {
//                    if (!containsObject(config.product_configuration_id, configs)) {
//                        //  console.log("PUSHING!");
//                        configs.push(config);
//                    }
//                });
//        });

//    //Get configuration data for each product
//    //We call the API and get totalAmount, licensedAmount, and notLicensedAmount
//    angular.forEach(licenseIds,
//        function (licenseId) {
//            //Api call
//            licenseProductsService.getLicenseProducts(licenseId)
//                .then(function (result) {
//                    var products = result.data;
//                    console.log(JSON.stringify(products));
//                    angular.forEach(products,
//                        function (product) {
//                            angular.forEach(product.productHeader.configurations,
//                                function (config) {
//                                    if (config.licenseProductConfiguration != null) {
//                                        scrapedConfigsFromProductHeader
//                                            .push(config.licenseProductConfiguration);
//                                    }
//                                });
//                        });

//                    //We map the totalAmount, licensedAmount, and notLicenedAmount into our unique only LICENSED configurations array
//                    angular.forEach(scrapedConfigsFromProductHeader,
//                        function (configData) {
//                            angular.forEach(configs,
//                                function (uniqueLicenseConfiguration) {
//                                    if (configData
//                                        .product_configuration_id ===
//                                        uniqueLicenseConfiguration.product_configuration_id) {
//                                        if (configData.totalAmount != null && configData.totalAmount !== 0) {
//                                            uniqueLicenseConfiguration.totalAmount += configData.totalAmount;
//                                        }
//                                        if (configData
//                                            .licensedAmount !=
//                                            null &&
//                                            configData.licensedAmount !== 0) {
//                                            uniqueLicenseConfiguration
//                                                .licensedAmount += configData.licensedAmount;
//                                        }
//                                        if (configData.notLicensedAmount != null &&
//                                            configData.notLicensedAmount !== 0) {
//                                            uniqueLicenseConfiguration
//                                                .notLicensedAmount += configData.notLicensedAmount;
//                                        }
//                                    }
//                                });
//                        });

//                    //We map our unique away, to the ProductDetails.Configurations array.
//                    //On the UI, we have a filter that filters out non-licensed productDetails.configurations.
//                    //unique configs has 'totalAmount', 'licensedAmount', and 'notLicensedAmount'
//                    //here we match the 'totalAmount', 'licensedAmount', and 'notLicensedAmount' with the config on the configuration filter
//                    mapRates($scope.configurationFilters, scrapedConfigsFromProductHeader);
//                });
//        });
//}

//function mapRates(configurationFilters, rates) { //Wrong, re-writing math
//    //console.log("CHECK THIS:  " + JSON.stringify($scope.configurationFilters));
//    var rateArray = [];
//    //remove duplicates from scrapedConfigsFromProductHeader

//    rateArray = removeDuplicates(rates, 'product_configuration_id');

//    //   console.log("RATE ARRAYL:::: " + JSON.stringify(rateArray));

//    angular.forEach(configurationFilters,
//        function (config) {
//            //if (config.totalAmount == undefined) {
//            config.totalAmount = 0;
//            //  }
//            //  if (config.notLicensedAmount == undefined) {
//            config.notLicensedAmount = 0;
//            //  }
//            // if (config.licensedAmount == undefined) {
//            config.licensedAmount = 0;
//            // }
//            angular.forEach(rateArray,
//                function (uniqueConfig) {
//                    if (uniqueConfig.product_configuration_id === config.id) {
//                        config.totalAmount += parseInt(uniqueConfig.totalAmount);
//                        //Setting of licensed/unlicensed not working and not calculated correctly here
//                        //  config.licensedAmount += parseInt(uniqueConfig.licensedAmount);
//                        //  config.notLicensedAmount += parseInt(uniqueConfig.notLicensedAmount);
//                    }
//                });
//        });
//}

//function removeDuplicates(originalArray, objKey) {
//    var trimmedArray = [];
//    var values = [];
//    var value;

//    for (var i = 0; i < originalArray.length; i++) {
//        value = originalArray[i][objKey];

//        if (values.indexOf(value) === -1) {
//            trimmedArray.push(originalArray[i]);
//            values.push(value);
//        }
//    }

//    return trimmedArray;
//}

//$scope.calculateProductPaidQtr = function (recording, productPaidQtr) {
//    //get current Paid Quarter
//         console.log("recording: "+ JSON.stringify(recording) + "    productPaidQtr: " + productPaidQtr);
//         var currentPaidQuarterKey = returnPaidQuarterKey(productPaidQtr);
//         var currentProductPaidQuarterKey = returnPaidQuarterKey(productPaidQtr);
//      console.log("currentPaidQuarterKey: " + currentPaidQuarterKey);
//    if (currentPaidQuarterKey == null) {
//        currentPaidQuarterKey = returnPaidQuarterKey(recording.paidQtr);
//        if (currentPaidQuarterKey == null) {
//            return returnPaidQtrFromKey(currentProductPaidQuarterKey);
//        }
//        //check to see which is higher
//        if (currentPaidQuarterKey > currentProductPaidQuarterKey) {
//            return returnPaidQtrFromKey(currentProductPaidQuarterKey);
//        }

//        return returnPaidQtrFromKey(currentPaidQuarterKey);
//    } else if (currentPaidQuarterKey > returnPaidQuarterKey(recording.paidQtr)) {
//        currentPaidQuarterKey = returnPaidQuarterKey(recording.paidQtr);
//        return returnPaidQtrFromKey(currentPaidQuarterKey);
//    }
//    console.log("currentPaidQuarterKey2: " + currentPaidQuarterKey);
//   var currentPaidQtr = returnPaidQtrFromKey(currentPaidQuarterKey);
//   console.log("currentPaidQuarterKey translated: " + currentPaidQtr);
//    if ((!isNaN(currentPaidQtr)) || (currentPaidQtr === null)) {
//        return productPaidQtr;
//    }
//    return currentPaidQtr;
//    //return currentPaidQuarterKey;
//};