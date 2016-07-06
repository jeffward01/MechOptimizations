'use strict';
app.controller('productDetailsController',
[
    '$scope', 'productsService', 'licensesService', '$modal', '$stateParams', 'localStorageService',
    'contactDefaultsService',
    function($scope,
        productsService,
        licensesService,
        $modal,
        $stateParams,
        localStorageService,
        contactDefaultsService) {

        //Start Contoller



        $scope.productDetail = {};
        $scope.productDetail.recordings = [];
        $scope.isCollapsed = true;
        var productId = $stateParams.productId;
        productsService.getProductDetailsHeader(productId)
            .then(function(result) {
                $scope.productDetail = result.data;

                getRecordings();
                angular.forEach($scope.productDetail.recordings,
                function (recording) {
                    alert(JSON.stringify($scope.selectedWriterFilter));
                    recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                });
                },
                function(error) {
                    alert(error.data.message);
                });




        $scope.productsForCreateLicense = [];
        $scope.licenses = [];

        $scope.configurationFilters = [];
        $scope.writerFilters = [];
        $scope.firstConfigFilter = true;
        $scope.firstWriterFilter = true;
        //Filter Btn Control
        $scope.isSelectConfigCollapsed = true;
        $scope.isSelectWritersCollapsed = true;


        //Toggle Collapse Tracks
        $scope.trackCollapsed = true;

        $scope.toggleCollapseTracks = function() {
            if ($scope.trackCollapsed) {
                $scope.trackCollapsed = false;
            } else {
                $scope.trackCollapsed = true;
            }
        }

        //This counts the number of filterd writers on a recording
        $scope.getFilteredWriterCount = function(recording) {
            var count = 0;
            angular.forEach(recording.writers,
                function(writer) {
                    if ($scope.writerFilter(writer)) {
                        count++;
                    };
                });
            return count;
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

        $scope.selectWriterFilter = function (f) {
            $scope.selectedWriterFilter = f;
            switch (f.Id) {
                case 1:
                    angular.forEach($scope.productDetail.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
               
                    break;
                case 2:
                    angular.forEach($scope.productDetail.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 3:
                    angular.forEach($scope.productDetail.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 4:
                    angular.forEach($scope.productDetail.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                case 5:
                    angular.forEach($scope.productDetail.recordings, function (recording) {
                        recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                    });
                    break;
                default: break;
            }
        };

     $scope.dropdownHandler = function() {

     }

        $scope.configurationFilters.push({
            Id: 1,
            Name: "All Configurations"
        });
        $scope.configurationFilters.push({
            Id: 2,
            Name: "No Configurations"
        });

        if ($scope.firstConfigFilter === true) {
            $scope.selectedConfigFilter = $scope.configurationFilters[0];
        }


        $scope.isSelectConfigCollapsed = true;


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


        //Writer and Config button
        //$scope.dropdownHandler = function() {
        //    if (!isSelectConfigCollapsed || !isSelectWritersCollapsed) {
        //        $()
        //    }
        //}
        $(document)
            .ready(function(){
                $(document).click(function() {
                    $('#writerFilterDropdown').hide();
                $scope.isSelectWritersCollapsed = true;
                $('configDropdown').hide();
                $scope.isSelectConfigCollapsed = true;
            });
    });


    function getRecordings() {
        productsService.getProductRecsRecordings(productId).then(function(result) {
            angular.forEach(result.data, function(value) {
                value.writersCollapsed = true;
                value.writers = [];
                if (value.track != null && value.track.copyrights != null) {
                    if (value.track.copyrights.length != 0) {
                        angular.forEach(value.track.copyrights, function(copyright) {
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

                            var response = result.data;
                            recording.writers = result.data;
                            //get writer count on load
                            recording.filteredWriterCount = $scope.getFilteredWriterCount(recording);
                        });
                });
            $scope.productsForCreateLicense.push({ licenseId: null, product_id: $scope.productDetail.id, title: $scope.productDetail.title, recsArtist: $scope.productDetail.artist, recsLabel: $scope.productDetail.recordLabel, licensesNo: $scope.productDetail.relatedLicensesNo, recordingsNo: $scope.productDetail.recordings.length })
        }, function(error) {
            alert(error.data.message);
        });
    }
    
    $scope.writersClosed = true;
    $scope.toggleCollapseAllWriters = function () {
        //If publishers open
        if (!$scope.publishersClosed) {
            closeAllPublisers();
              $scope.publishersClosed = true;
        }
        angular.forEach($scope.productDetail.recordings,
            function (recording) {
                if ($scope.writersClosed) {
                    expandAllWriters();
                } else {
                    collapseAllWriters();
                }
            });
        $scope.writersClosed = !$scope.writersClosed;
    }

    $scope.publishersClosed = true;
    $scope.toggleCollapseAllPublishers = function () {
        //If writers are not expanded
        if ($scope.writersClosed) {
            expandAllWriters();
            $scope.writersClosed = false;
        }
        closeAllPublisers();
        $scope.publishersClosed = !$scope.publishersClosed;
    }
    function closeAllPublisers() {
        angular.forEach($scope.productDetail.recordings,
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
        angular.forEach($scope.productDetail.recordings,
            function (recording) {
                recording.writersCollapsed = false;
            });
    }

    function collapseAllWriters() {
        angular.forEach($scope.productDetail.recordings,
            function (recording) {
                recording.writersCollapsed = true;
            });
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
        recording.writersCollapsed = !recording.writersCollapsed;

        /*
        if (recording.writersCollapsed) {
            productsService.getWorksWriters(recording.track.copyrights[0].workCode).then(function (result) {
                var response = result.data;
                recording.writers = result.data;
            });
        }
        recording.writersCollapsed = !recording.writersCollapsed;
        */
    }

    $scope.collapsePublishers = function (writer) {
        writer.publishersCollapsed = !writer.publishersCollapsed;
    }

    $scope.loadLicenseInfo = function () {
        licensesService.getLicensesForProduct(productId).then(function (result) {
            $scope.licenses = result.data;
        });
    };



    $scope.updateProductPriority = function (productId, mechsProductPriority) {
        mechsProductPriority = !mechsProductPriority;
        var request = {id : productId, mechsPriority : mechsProductPriority};

        productsService.updateProductPriority(request).then(function (result) {



        });
    }
    $scope.format = "MM/dd/yyyy";
    /*
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
    */
}]);