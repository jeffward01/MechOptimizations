'use strict';
app.controller('productDetailsController',
[
    '$scope', 'productsService', 'licensesService', '$modal', '$stateParams', 'localStorageService',
    'licenseProductConfigurationService',
    'contactDefaultsService', '$http', 
    function ($scope,
        productsService,
        licensesService,
        $modal,
        $stateParams,
        localStorageService,
        licenseProductConfigurationService,
        contactDefaultsService, $http) {

        //Start Contoller



        $scope.productsForCreateLicense = [];
        $scope.licenses = loadRelatedLicenses();
        $scope.selectedConfigFilter = [];
        $scope.configurationFilters = [];
        $scope.writerFilters = [];
        //      $scope.firstConfigFilter = true;  <- Not needed?
        $scope.firstWriterFilter = true;

        //Filter Btn Control
        $scope.isSelectConfigCollapsed = true;
        $scope.isSelectWritersCollapsed = true;


        //Toggle Collapse Tracks
        $scope.trackCollapsed = true;

        $scope.WriterList = [];
        $scope.productOverview = {};
        $http.get("po.json")
           .then(function (res) {
               $scope.productOverview = res.data;
              // $scope.configurationFilters = $scope.productOverview.productHeader.configurations;
             //  angular.forEach($scope.configurationFilters,
              //     function (config) {
                //       config.checked = true;
               //    });
                angular.forEach($scope.productOverview,
                    function(license) {
                        angular.forEach(license.licenseProductRecordingWriters,
                            function(writer) {
                               
                                $scope.WriterList.push(writer);
                                    });
                            });
                    
                
            });

        $scope.RateListFast = [];
        $scope.productOverview_Original = {};
        //$http
        //    .get('http://spa.service/api/licenseProductCTRL/licenseproducts/BuildLicenseProductOverview_tom_Original/17775/1/1')
        //    .then(function(response) {
        //        $scope.productOverview_Original = response.data;
        //            });
        productsService.getProductOverview($stateParams.productId)
            .then(function(result) {
                $scope.productOverview_Original = result.data;;
                //$http.get("tom_Original.json")
                //    .then(function(res) {
                //        $scope.productOverview_Original = res.data;

                angular.forEach($scope.productOverview_Original,
                    function(license) {

                        angular.forEach(license.licenseProductRecordingWriters,
                            function(writer) {
                                angular.forEach(license.licenseProductRecordingWriterRates,
                                    function(rate) {
                                        angular.forEach(license.licenseProductConfigurations,
                                            function(config) {

                                                if (config.product_configuration_id === rate.product_configuration_id) {
                                                    rate.licenseStatus = license.licenseStatus;
                                                    rate.upc = config.upc_code;
                                                    rate.licenseTitle = license.licenseName;
                                                    rate.licenseId = license.licenseId;
                                                    rate.licenseNumber = license.licenseNumber;
                                                }
                                            });


                                        //Add Writer to array
                                        if (writer.licenseWriterId === rate.licenseWriterId) {
                                            writer.rateList = rate;
                                            $scope.RateListFast.push(writer);
                                        }

                                    });
                            });
                    });
                //angular.forEach($scope.productOverview_Original,
                //    function (license) {
                //        angular.forEach(license.licenseProducts,
                //            function (licenseProduct) {
                //                angular.forEach(licenseProduct.productHeader.configurations,
                //                    function(config) {
                //                        $scope.configurationFilters.push(config);
                //                    });
                //            });
                //    });
                angular.forEach($scope.productOverview_Original,
                    function(license) {
                        angular.forEach(license.licenseProductConfigurations,
                            function(config) {
                                config.id = config.product_configuration_id;

                                $scope.configurationFilters.push(config);
                            });
                    });
                //    });
            });


        //TODO: Map the JSON from WRiterList
        //TODO: Use TOms method (faster) and organize the data like WriterList

        $scope.allSelected = true;
        //Configure COnfiguration Filters
        //   $scope.productOverview = setConfigurations($scope.productOverview);
        //   console.log(JSON.stringify("LOOK!!!!!!"     +$scope.configurationFilters));

        $scope.productSummary = {};
     //   $scope.productSummary = getProductSummary($scope.productOverview);

        $scope.productDetail = {};
        $scope.productDetail.recordings = [];
        $scope.isCollapsed = true;
        var productId = $stateParams.productId;

        //Build productDetail
        productsService.getProductDetailsHeader(productId)
            .then(function (result) {
                $scope.productDetail = result.data;
                //  console.log("productDetail " + JSON.stringify($scope.productDetail));

                getRecordings();
                angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    //alert(JSON.stringify($scope.selectedWriterFilter));
                    recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                });
//                console.log("productDetail " + JSON.stringify($scope.productDetail));
            },
                function (error) {
                    alert(error.data.message);
                });



        //Load Related licenses up front
        function loadRelatedLicenses() {
            licensesService.getLicensesForProduct(productId)
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

        //This counts the number of filterd writers on a recording
        $scope.getFilteredWriterCount = function (recording) {
            var count = 0;
            angular.forEach(recording.writers,
                function (writer) {
                    if ($scope.writerFilter(writer)) {
                        count++;
                    };
                });
            return count;
        }




        //Filter control for WriterFilters
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


        //The code from the licenseDetail page includes on the writer property 'writer.licenseProductRecordingWriter.isLicensed.'.  ProductDetails does not have that property.
        //This catches the error and prints out to console.
        function errorCatchWriter(writer) {
            if (writer.licenseProductRecordingWriter == null) {
                console.log("Writer ipCode: " +
                    writer.ipCode +
                    " Name: " +
                    writer.name +
                    " has NULL for licenseProductRecordingWriter.  and therefore licenseProductRecordingWriter is not accessable from NULL");
                return false;
            }
        }

        //Handler for select Writer Filter
        $scope.selectWriterFilter = function (f) {
            $scope.selectedWriterFilter = f;
            switch (f.Id) {
                case 1:
                    angular.forEach($scope.productOverview.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });

                    break;
                case 2:
                    angular.forEach($scope.productOverview.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 3:
                    angular.forEach($scope.productOverview.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 4:
                    angular.forEach($scope.productOverview.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 5:
                    angular.forEach($scope.productOverview.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                default: break;
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
                $(document).click(function () {
                    $('#writerFilterDropdown').hide();
                    $scope.isSelectWritersCollapsed = true;
                    $('configDropdown').hide();
                    $scope.isSelectConfigCollapsed = true;
                });
            });

        /*
        //Initialze Recordings and other values
        function getRecordings() {
            //Get Recordings
            productsService.getProductRecsRecordings(productId).then(function (result) {
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
                    function (recording) {
                        productsService.getWorksWriters(recording.track.copyrights[0].workCode).then(function (result) {
                            angular.forEach(result.data, function (value) {
                                value.publishersCollapsed = true;
                                angular.forEach(value.originalPublishers, function (publisher) {
                                    var adminContribution = 0;
                                    publisher.hasCollectable = false;
                                    angular.forEach(publisher.administrators, function (admin) {
                                        adminContribution = adminContribution + admin.mechanicalCollectablePercentage;
                                    });
                                    if (adminContribution != 0) {
                                        publisher.hasCollectable = true;
                                    }
                                });
                            });

                            var response = result.data;
                            recording.writers = result.data;
                        });

                                //get writer count on load
                                recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                            });
                   // });

                console.log("productDetail " + JSON.stringify($scope.productDetail));

                //collapse Publishers and writers for overview | Temp off
                //angular.forEach($scope.productOverview.recordings,
                //    function (recording) {
                //        recording.writersCollapsed = true;
                //        angular.forEach(recording.writers,
                //            function (writer) {
                //                writer.publishersCollapsed = true;
                //            });
                //    });


                //get writerCount for overview | Temp off
                //angular.forEach($scope.productOverview.recordings,
                //    function (recording) {
                //        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                //    });

                //Build licensePrductCofigurations || Not working | Temp off
                //angular.forEach($scope.productDetail.configurations,
                //    function (config) {
                //        config.licenseProductConfiguration = licenseProductConfigurationService
                //            .getProductConfigurations(config.id);
                //    });


                //Configuration Filter Build
                //$scope.configurationFilters.push({
                //    id: 1,
                //    Name: "All Configurations"
                //});
                //$scope.configurationFilters.push({
                //    id: 2,
                //    Name: "No Configurations"
                //});

                //TODO: Erase | This is handled above
                //  console.log("PROD DETAIL!: " + JSON.stringify($scope.productDetail));
                //angular.forEach($scope.productDetail.configurations,
                //    function (config) {
                //        //Select All Config Filters on load
                //        $scope.allSelected = true;
                //        config.checked = true;
                //        $scope.configurationFilters.push(config);
                //        console.log("configurationFilters!: " + JSON.stringify(config));
                //    });

                //Correct aboce^^ test below__

                //angular.forEach($scope.productDetail.configurations,
                //    function(config) {
                //        //Select All Config Filters on load

                //               $scope.allSelected = true;
                //               config.checked = true;
                //               $scope.configurationFilters.push(config);
                //               console.log("configurationFilters!: " + JSON.stringify(config));
                //    });


                $scope.isSelectConfigCollapsed = true;

                $scope.productsForCreateLicense.push({ licenseId: null, product_id: $scope.productDetail.id, title: $scope.productDetail.title, recsArtist: $scope.productDetail.artist, recsLabel: $scope.productDetail.recordLabel, licensesNo: $scope.productDetail.relatedLicensesNo, recordingsNo: $scope.productDetail.recordings.length })
            }, function (error) {
                alert(error.data.message);
            });
        }
        Recording turned off
        */

        function getRecordings() {
            productsService.getProductRecsRecordings(productId).then(function (result) {
                angular.forEach(result.data, function (value) {
                    value.writersCollapsed = true;
                    value.writers = [];
                    if (value.track != null && value.track.copyrights != null) {
                        if (value.track.copyrights.length != 0) {
                            angular.forEach(value.track.copyrights, function (copyright) {
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
                $scope.productsForCreateLicense.push({ licenseId: null, product_id: $scope.productDetail.id, title: $scope.productDetail.title, recsArtist: $scope.productDetail.artist, recsLabel: $scope.productDetail.recordLabel, licensesNo: $scope.productDetail.relatedLicensesNo, recordingsNo: $scope.productDetail.recordings.length })
            }, function (error) {
                alert(error.data.message);
            });
        }




        $scope.collapseWriters = function (recording) {
            if (recording.writersCollapsed) {
                productsService.getWorksWriters(recording.track.copyrights[0].workCode).then(function (result) {
                    angular.forEach(result.data, function (value) {
                        value.publishersCollapsed = true;
                        angular.forEach(value.originalPublishers, function (publisher) {
                            var adminContribution = 0;
                            publisher.hasCollectable = false;
                            angular.forEach(publisher.administrators, function (admin) {
                                adminContribution = adminContribution + admin.mechanicalCollectablePercentage;
                            });
                            if (adminContribution != 0) {
                                publisher.hasCollectable = true;
                            }
                        });
                    });

                    var response = result.data;
                    recording.writers = result.data;
                    //console.log(JSON.stringify(recording.writers));
                });
            }
            recording.writersCollapsed = !recording.writersCollapsed;
            //toggle writer row collapse
            toggleWriterRowCollapse(recording);
        }

        function toggleWriterRowCollapse(recording) {
            var elementId = recording.id;
            var myElement = document.getElementById(elementId);
            $(myElement).collapse("toggle");
        }

        function in_array(needle, haystack) {
            for (var key in haystack) {
                if (needle === haystack[key]) {
                    return true;
                }
            }

            return false;
        }

        $scope.ToggleWritersBootstrap = function () {
            angular.forEach($scope.productOverview.recordings,
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


        //$scope.collapseWriters = function (recording) {  Temp off
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
                if(!v.checked) {
                    $scope.allSelected = false;
                }
            });
        }
        //__^^ Used for 'Select All' ^^







        //___Not used Code below___



        //not needed.  Need to make new API call. 
        /*
        function getProductSummary(productOverview) {
            var productSummary = {};
            angular.forEach(productOverview.relatedLicensesNo,
                function(license) {
                    var licenseId = license.liceneId;
                    angular.forEach(productOverview.relatedLicenseProducts, function(product) {
                        if (product.licenseId == licenseId) {
                            var prodConfigId = product.licenseProductConfigurations.product_configuration_id;

                        }
                    })
                })
        }
        */

        //Currently not used.  I just grab all configurations from productOverview.ProductHeader instead of cycling through the writers.
        function configExists(id) {
            //if (productOverview.configurations == null) {
            //    return false;
            //}
            angular.forEach($scope.productOverview.configurations,
                function (config) {
                    if(config.id === id) {
                        return true;
                    }
                    return false;
                });
            return false;
        }

        //Currently not used.  I just grab all configurations from productOverview.ProductHeader instead of cycling through the writers.
        function setConfigurations(productOverview) {
            //var configurations = [];
            //alert("FIRE FIRE FIRE");
            angular.forEach(productOverview.recordings,
                function (recording) {
                    angular.forEach(recording.writers,
                        function (writer) {
                            angular.forEach(writer.licenseProductRecordingWriter.rateList,
                                function (rate) {
                                    //Check if configuration exists
                                    //If config does NOT exist
                                    if(productOverview.configurations == undefined) {
                                        productOverview.configurations = [];
                                    }
                                    if (!configExists(rate.product_configuration_id)) {
                                        // alert("DOES NOT EXIST!");
                                        //save config to array
                                        var config = { };
                                        var configuration = {
                                            id: null,
                                            name: null
                                        };
                                        config.configuraiton = configuration;

                                        config.id = rate.product_configuration_id;
                                        config.name = rate.licenseTitle;
                                        config.upc = rate.upc;
                                        var myId = rate.configuration_id;
                                        var myName = rate.configuration_name;
                                        config.configuraiton.id = myId;
                                        config.configuraiton.name = myName;
                                        //Save to array
                                        productOverview.configurations.push(config);
                                    }
                                    //     alert("CONFIG EXISTS");


                                });
                        });
                });
            //console.log(JSON.stringify("LOOK!!!!!!" + JSON.stringify($scope.productOverview.configurations)));

            return productOverview;
        }




        //set recordings to collapse (productOverview)
        //angular.forEach($scope.productOverview.recordings,
        //    function(recording) {
        //        recording.writersCollapsed = true;
        //    });


        //$scope.cbChecked = function () {
        //    $scope.allSelected = true;
        //    angular.forEach($scope.configurationFilters, function (v, k) {
        //        if (!v.checked) {
        //            $scope.allSelected = false;
        //        }
        //    });
        //}
        //Check all configurations
        //$scope.toggleAll = function () {
        //    var bool = true;
        //    if ($scope.allSelected) {
        //        bool = false;
        //    }
        //    angular.forEach($scope.configurationFilters, function (v, k) {
        //        v.checked = !bool;
        //        $scope.allSelected = !bool;
        //    });
        //}


        /*  Legacy code, already commented out
        $scope.openProductInfo = function (size) {
            var rootScope = $scope;
            var modalInstance = $modal.open({
                templateUrl: 'app/views/partials/modal-step-ProductInfo.html',
                controller: 'productInfoController',
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
    
    
        $scope.openAddTracks = function (size) {
            var rootScope = $scope;
            var modalInstance = $modal.open({
                templateUrl: 'app/views/partials/modal-step-AddTracks.html',
                controller: 'addTracksController',
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



        //TODO:Delete, no longer used. We load upfront now.  Delete after SP3.
        //$scope.loadLicenseInfo = function () {
        //    licensesService.getLicensesForProduct(productId).then(function (result) {
        //        $scope.licenses = result.data;
        //    });
        //};


        /* Erase
                $scope.toggleCollapseAllWriters = function () {
                    alert("CICKED!");
                    //If publishers open
                    if (!$scope.publishersClosed) {
                        closeAllPublisers();
                        $scope.publishersClosed = true;
                    }
                    angular.forEach($scope.productOverview.recordings,
                        function (recording) {
                            if ($scope.writersClosed) {
                                expandAllWriters();
        
                                //    expandAllWritersBootstrap();
                            } else {
                                collapseAllWriters();
                                // collapseAllWritersBootstrap();
                            }
                        });
        
                    //if writers are open, collase em all.
        
                    if (!$scope.writersClosed) {
                        angular.forEach($scope.productOverview.recordings,
                            function (recording) {
                                var myElement = $(recording.id);
                                $(myElement).collapse("hide");
                            });
                    }
        
                    $scope.writersClosed = !$scope.writersClosed;
                }
        


        $scope.collapseWriters = function (recording) {
            if (recording.writersCollapsed) {
                //productsService.getWorksWriters(recording.track.copyrights[0].workCode).then(function (result) {
                //    angular.forEach(result.data, function (value) {
                //        value.publishersCollapsed = true;
                //        angular.forEach(value.originalPublishers, function (publisher) {
                //            var adminContribution = 0;
                //            publisher.hasCollectable = false;
                //            angular.forEach(publisher.administrators, function (admin) {
                //                adminContribution = adminContribution + admin.mechanicalCollectablePercentage;
                //            });
                //            if (adminContribution != 0) {
                //                publisher.hasCollectable = true;
                //            }
                //        });
                //    });

                //    var response = result.data;
                //    recording.writers = result.data;
                //});
            }
            //if (!recording.writersCollapsed) {
            var elementId = recording.id;
            var myElement = document.getElementById(elementId);
            //    if ($(myElement).hasClass('collapsing')) {
            //        $(myElement).removeClass('collapsing');
            //        $(myElement).addClass('collapse');

            //    }                
            $(myElement).collapse("toggle");
            //$(myElement).has('collapsing').addClass('collapse');
            //  }
            //    recording.writersCollapsed = !recording.writersCollapsed;

            /*
            if (recording.writersCollapsed) {
                productsService.getWorksWriters(recording.track.copyrights[0].workCode).then(function (result) {
                    var response = result.data;
                    recording.writers = result.data;
                });
            }
            recording.writersCollapsed = !recording.writersCollapsed;
            */
        //}






    }]);



//http://spa.local/#/search-MyView/detail-Product/17775