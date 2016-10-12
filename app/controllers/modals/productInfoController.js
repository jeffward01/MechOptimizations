'use strict';
app.controller('productInfoController', ['$scope', '$state', '$stateParams', 'licensesService', 'productsService', 'editConfigurationsService','safeService', '$timeout', function ($scope, $state, $stateParams, licensesService, productsService, editConfigurationsService, $safeService, $timeout) {

    var productId = $stateParams.productId;
    $scope.isCreate = $stateParams.isCreate;
    $scope.myLicenseDetail = $stateParams.licenseDetail;
    $scope.products = $stateParams.products;
    if ((productId == null) && ($scope.selectedProductId != null)) {
        productId = $scope.selectedProductId;
    }
    $scope.productId = productId;

    if ($scope.isCreate) {
        $scope.productId = null;
    }

    $scope.isDirty = false;
    $scope.productDetail = {};
    $scope.productDetail.configurations = [];
    $scope.artistList = [];
    $scope.productList = [];
    $scope.selectedProduct = null;
    $scope.selectedArtist = null;

    $scope.is_valid_field = USL.Common.isValidField;
    $scope.modal_submit = false;

    $scope.valid_fields = function () {

        if (!$scope.is_valid_field($scope.productDetail.title)) return false;
        if (!$scope.is_valid_field($scope.productDetail.artist.name)) return false;
        if (!$scope.hasSelectedConfigurations()) return false;
        if ($scope.is_valid_field($scope.configSuggest)) return false;
        //if (!$scope.is_valid_field($scope.selectedAssignee.fullName)) return false;
        //if (!$scope.is_valid_field($scope.selectedLicensee.name)) return false;
        //if (!$scope.is_valid_field($scope.selectedLicenseeContact.fullName)) return false;

        return true;
    };

    $scope.selectProduct = function (product) {
        $scope.selectedProduct = product;
        $scope.productDetail.title = product.title;
        $scope.productList.length = 0;
    }

    var dateErrorMessage = function (evt) {
        var message = "Invalid Date, use mm/dd/yyyy format";
        noty({
            text: message,
            type: 'error',
            timeout: 2500,
            layout: "top"
        });
    }

    $scope.selectArtist = function (artist) {
        $scope.selectedArtist = artist;
        $scope.productDetail.artist.name = artist.name;
        $scope.productDetail.artist.id = artist.id;
        $scope.artistList.length = 0;
    }

    $scope.productAutosuggest = function () {
        if ($scope.productDetail.title.length > 2) {

            var query = $scope.productDetail.title;
            var artistId = null;
            if ($scope.selectedArtist != null) {
                artistId = $scope.selectedArtist.id;
            }
            var request = {
                query: query,
                artistId: artistId,
                siteLocationCode: null,
                filterMusicOwner: false
            }

            $scope.productList.length = 0;

            productsService.productAutosuggest(request).then(function (result) {
                if (result.data.success) {
                    if (result.data.values.length > 0) {
                        $scope.productList = result.data.values;
                    }
                    else {
                        noty({
                            text: 'No products found',
                            type: 'error',
                            timeout: 5000,
                            layout: "top"
                        });
                    }
                }
                else {
                    noty({
                        text: 'error getting products ' + result.error.message,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                }
            }, function (error) {
                var notymessage = "Error getting products ";
                for (var i = 0; i < result.data.errorList.length; i++) {
                    notymessage += result.data.errorList[i].message + "\n"
                }
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: 5000,
                    layout: "top"
                });
            });
        }
        else {
            $scope.productList.length = 0;
        }
    }

    $scope.showArtistAutoSuggestions = false;
    $scope.artistAutosuggest = function () {
        var currentSearchText = $scope.productDetail.artist.name;
        $scope.showNoArtistText = false;
        $scope.showArtistAutoSuggestions = false;
        if ($scope.productDetail.artist.name.length > 2) {
                      
            $timeout(function() {

                if (currentSearchText == $scope.productDetail.artist.name) {
                    var query = $scope.productDetail.artist.name;
                    $scope.artistList = [];

                    productsService.artistAutosuggest(query).then(function (result) {
                        if (result.data.success) {
                            $scope.showArtistAutoSuggestions = true;
                            $scope.artistList = result.data.values;

                            if ($scope.artistList.length == 0) {
                                $scope.showNoArtistText = true;
                            }
                            /*
                        if (result.data.values.length > 0) {
                            $scope.artistList = result.data.values;
                        }
                        else {
                            noty({
                                text: 'No artists found',
                                type: 'error',
                                timeout: 5000,
                                layout: "top"
                            });
                        }
                        */
                        } else {
                            for (var i = 0; i < result.data.errors.length; i++) {
                                noty({
                                    text: 'error getting artists ' + result.data.errors[i].message,
                                    type: 'error',
                                    timeout: false,
                                    layout: "top"
                                });
                            }
                        }
                    }, function (error) {
                        var notymessage = "Error getting artists ";
                        for (var i = 0; i < result.data.errorList.length; i++) {
                            notymessage += result.data.errorList[i].message + "\n"
                        }
                        noty({
                            text: notymessage,
                            type: 'error',
                            timeout: 5000,
                            layout: "top"
                        });
                    });
                } 
     
            }, 1000);
  
        }
        else {
            $scope.artistList = [];
        }
    }


    $scope.showLabelAutoSuggestions = false;
    $scope.labelAutosuggest = function () {

        var currentSearchText = $scope.productDetail.recordLabel.name;
        $scope.showLabelAutoSuggestions = false;
        if ($scope.productDetail.recordLabel.name.length > 2) {

            $timeout(function () {

                if (currentSearchText == $scope.productDetail.recordLabel.name) {                  
                    $scope.showLabelAutoSuggestions = true;
                }

            }, 1000);

        }

    }

    var isNotADate = function (date) {
        if (date.length != 10 || date.length == 0) {
            return true;
        }
    }

    $scope.checkSelectedLabel = function (productLink) {
        if ($scope.productDetail.recordLabel.name == "") {
            $scope.productDetail.recordLabel.id = null;
        }
    }

    $scope.selectLabel = function (label) {
        $scope.productDetail.recordLabel.id = label.id;
        $scope.productDetail.recordLabel.name = label.name;
    }

    $scope.saveProduct = function (nextstep) {
        var date1 = $("#date8").val();
        if (isNotADate(date1) && date1.length >= 1) {
            dateErrorMessage();
            return;
        }



        var notymessage = '';
        var notytype = 'success';
        /*
        if (($scope.productDetail.artist.name.length == 0) || ($scope.productDetail.title.length == 0)) {
            notytype = 'error';
            notymessage = 'Product Title and Artist are required';
            noty({
                text: notymessage,
                type: notytype,
                timeout: false,
                layout: "top"
            });
          //  return;
        }
        */

        $scope.modal_submit = true;
        var validated = $scope.valid_fields();

        if (validated) {

            var configs = [];
            for (var i = 0; i < $scope.configurations.length; i++) {
                var config = $scope.configurations[i];
                
                if (config.selected) {
                    var lconfig = {
                        id: config.id,
                        configuration: { id: config.configid, name: config.configname, databaseVersion: config.configdatabaseVersion },
                        upc: config.upc,
                        releaseDate: config.releaseDate,
                        databaseVersion: config.databaseVersion
                    };
                    if (lconfig.releaseDate) {
                        lconfig.releaseDate = moment(config.releaseDate).format("YYYY-MM-DD");
                    }
                    configs.push(lconfig);
                }
            }
            $scope.productDetail.configurations = configs;

            //for testing add tracks without having to create/edit a product
            //$scope.setParameter('selectedProductId', 61525)
            //$scope.modalNextStep();
            //if (nextstep == 'addtracks') {
            //    $scope.modalNextStep();
            //}
            //else {
            //    $scope.cancel();
            //}
            productsService.saveProduct($scope.productDetail).then(function (result) {

                if (result.data.success) {
                    notymessage = 'product saved';
                    notytype = "success";
                    noty({
                        text: notymessage,
                        type: notytype,
                        timeout: 2500,
                        layout: "top"
                    });
                    $scope.setParameter('selectedProductId', result.data.productHeader.id);
                    if (nextstep == 'addtracks') {
                        
                        var newProductId = result.data.productHeader.id;
                        //      $scope.modalNextStep();  | Not working when navigating to addProductsTracts. Added manual method instead
                        //$scope.goToAddTracks($scope.myLicenseDetail, productId, $scope.products);
                        $scope.goToAddTracks($scope.myLicenseDetail, newProductId, $scope.products);
                    }
                    else {
                        $state.reload().then(function () {
                            $scope.cancel();
                        });

                    }
                }
                else {
                    notymessage = "error adding product ";
                    notytype = "error";
                    for (var i = 0; i < result.data.errorList.length; i++) {
                        notymessage += result.data.errorList[i].message + "\n";
                    }
                    noty({
                        text: notymessage,
                        type: notytype,
                        timeout: false,
                        layout: "top"
                    });
                }
            }, function (error) {
                var notymessage = "Error occurred adding product <br />";
                notymessage += error.data.message;
                //for (var i = 0; i < result.data.errorList.length; i++) {
                //    notymessage += result.data.errorList[i].message + "\n"
                //}
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            });
        }

        //this removes the dark background that stays when you close a modal
        //this bug was introduced in angular 1.2 => 1.3.5 upgrade
        // I have to refresh the states, becasue if i removed the modal background, the screen appears fine, but it is infact frozen... this fixes it.
        var currentStates = $state.$current.name.split('.');
        currentStates.pop();
        currentStates.pop();
        $state.go(currentStates.join('.'), {}, { reload: $scope.reloadNeeded });
    };
   
    $scope.configurations = [];
    $scope.labelList = [];
    $scope.configindex = 0;

    $scope.hasSelectedConfigurations = function () {
        var rv = false;
        for (var i = 0; i < $scope.configurations.length; i++) {
            if ($scope.configurations[i].selected == true) {
                rv = true;
                break;
            }
        }
        return rv;
    };

    $scope.validInput = function () {

        if (($scope.productDetail.title.length > 0) && ($scope.productDetail.artist.name.length > 0))
        {
            return true;
        }
        else {
            return false;
        }
    }

    $scope.configSuggest = "";
    $scope.labelSuggest = "";
    $scope.publisherSuggest = "";
    // date picker 
    //$scope.format = 'MMM dd, yyyy';
    $scope.format = 'MM/dd/yyyy';
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0
    };

    $scope.open = function ($event, configuration) {
        $event.preventDefault();
        $event.stopPropagation();
        configuration.isOpen = true;
    };
    //


    $scope.addConfig = function (config) {
        $scope.configindex++;

        var lconfig = {
            id: config.id,
            configid: config.configid,
            configname: config.configname,
            configtype: config.configtype,
            configdatabaseVersion: config.configdatabaseVersion,
            upc: '',
            releaseDate: '',
            databaseVersion: config.databaseVersion,
            selected: true,
            isOpen: false,
            index: $scope.configindex
        };
       
        $scope.configurations.push(lconfig);
        $scope.configSuggest = "";

        /*
        config.selected = true;
        config.upc = '';
        config.releaseDate = '';
        config.index = $scope.configindex;
        $scope.configSuggest = "";
        */

    }

    $scope.removeConfig = function (config) {
        config.selected = false;
        config.upc = '';
        config.releaseDate = '';
        $scope.configSuggest = "";
    }

    $scope.getLabels = function () {
        productsService.getLabels().then(function (result) {
            $scope.labelList.length = 0;
            for (var i = 0; i < result.data.length; i++) {
                var label = result.data[i];
                $scope.labelList.push({
                    id: label.id,
                    name: label.name
                })
            }
        }, function (error) {
            alert(error.data.message);
        });
    };

    $scope.getAllRecsConfigurations = function () {
        editConfigurationsService.getAllRecsConfigurations().then(function (result) {
            $scope.configurations.length = 0;

            angular.forEach(result.data, function (item) {
                $scope.configurations.push({
                    id: 0,
                    configid: item.id,
                    configname: item.name,
                    configtype: item.type,
                    configdatabaseVersion: -1,
                    upc: '',
                    releaseDate: '',
                    databaseVersion:-1,
                    selected: false,
                    isOpen: false,
                    index: 0
                });
            });

            if ($scope.productId) {
                productsService.getProductDetailsHeader($scope.productId).then(function (result) {
                    $scope.productDetail = result.data;
                    for (var i = 0; i < $scope.productDetail.configurations.length; i++) {
                        var config = $scope.productDetail.configurations[i];
                        $scope.configindex++;
                        var lconfig = {
                            id: config.id,
                            configid: config.configuration.id,
                            configname: config.configuration.name,
                            configtype: config.configuration.type,
                            configdatabaseVersion: config.configuration.databaseVersion,
                            upc: config.upc,
                            releaseDate: config.releaseDate,
                            databaseVersion: config.databaseVersion,
                            selected: true,
                            isOpen: false,
                            index: $scope.configindex
                        };
                        if (lconfig.releaseDate) {
                            lconfig.releaseDate = moment.utc(lconfig.releaseDate).format("YYYY-MM-DD");
                        }
                        var recsConfigFound = false;
                        var j = 0;
                        while (!recsConfigFound && j < $scope.configurations.length) {
                            if ($scope.configurations[j].configid == lconfig.configid) {
                            //if ($scope.configurations[j].id == lconfig.id) {
                                recsConfigFound = true;
                                //removed to allow multiple configs of the same type
                                //$scope.configurations.splice(j, 1);
                            }
                            j++;
                        }
                        $scope.configurations.push(lconfig);
                    }

                }, function (error) {
                    alert(error.data.message);
                });
            }
            else {

                $scope.productDetail = {
                    id: 0,
                    title: '',
                    artist: { id: 0, name: '' },
                    recordLabel: {id: 0, name: ''},
                    catalogueId: '',
                    albumArtUrl: '',
                    configurations: [],
                    databaseVersion: -1
                }
            }


        }, function (error) {
            alert(error.data.message);
        });
    };

    $scope.worksSearch = function (productLink) {
        var request = {
            safeId: $scope.safeauthentication.safeId,
            title: productLink.title,
            siteLocationCode: 'US2',
            totalResults: 20
        }
        productsService.worksSearch(request).then(function (result) {
            var r = result;


        }, function (error) {
            alert(error.data.message);
        });

    }
    //"SearchMyView.DetailProduct.StepsModal.CreateProductAddTracks({licenseData:licenseDetail, productId: productDetail.id, products:products})
    $scope.goToAddTracks = function(licneseDetail, productId, products) {
        $state.go("SearchMyView.DetailProduct.StepsModal.CreateProductAddTracks",
        ({
            licenseData: licneseDetail,
            productId: productId,
            pdocucts: products
        }));
    }

    /*
    $scope.ok = function () {
        alert('productinfo');
    };
    */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
   }
    




    $scope.getLabels();
    $scope.getAllRecsConfigurations();
}]);
