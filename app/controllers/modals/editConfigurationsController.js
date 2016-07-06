'use strict';
app.controller('editConfigurationsController', ['$scope', '$filter', 'licensesService', 'editConfigurationsService', '$stateParams', '$state', 'licenseProductsService', function ($scope, $filter, licensesService, editConfigurationsService, $stateParams, $state, licenseProductsService) {

    // values from routes in app.js

    //added this for creating new license
    //make sure it does not cause a problem elsewhere...
    $scope.licenseId = 0;
    if ($scope.selectedLicense != null) {
        if ($scope.selectedLicense.licenseId != null) {
            $scope.licenseId = $scope.selectedLicense.licenseId;

        }
    }

    //commented out 9/3/2015
    //$scope.selectedProducts = $scope.selectedProducts.filter(function singledFilter(category) {
    //    return category.selected == true;
    //});


    //$scope.productsParams = $scope.selectedProducts;
    $scope.forms = {};

    $scope.myproducts = [];

    $scope.isCollapsed = true;
    $scope.change = null;

    $scope.all_configurations = [];
    $scope.recs_products = [];

    $scope.currentstate = $state.current.name;

    $scope.configSuggest = "";

    $scope.modal_submit = false;

    $scope.testproduct = {
        title: "Test title",
        configs: [{ id: 1, name: "1" }, { id: 2, name: "2" }, { id: 3, name: "3" }]
    };

    // date picker 
    //$scope.format = 'MMM dd, yyyy';  | Apr 21, 2016
    $scope.format = "MM/dd/yyyy";
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0
    };

    $scope.open = function ($event, productConfiguration) {
        angular.forEach($scope.myproduct.productHeader.configurations, function (config) {
            config.isOpen = false;
        });
        $event.preventDefault();
        $event.stopPropagation();
        productConfiguration.isOpen = true;
    };
    //

    $scope.deleteExistingConfig = function (product, config) {

        var configCount = 0;

        for (var i = 0; i < product.productHeader.configurations.length; i++) {
            if (product.productHeader.configurations[i].licenseProductConfiguration != null) {
                configCount++;
            }
        }

        //if last config alert message 
        if (configCount == 1) {

            noty({
                text: "You are about to remove the last config for this product.  If you proceed, both the configuration and product will be removed from the license.  Proceed?",
                type: 'confirm',
                modal: true,
                timeout: 5000,
                layout: "center",
                buttons: [
            {
                addClass: 'btn-default', text: 'Ok', onClick: function ($noty) {

                    $noty.close();

                    licenseProductsService.deleteLicenseProduct(product.licenseId, product.productId).then(function (result) {
                        //          $state.reload();
                        noty({
                            text: 'Product has been removed from the License',
                            type: 'success',
                            timeout: 2500,
                            layout: "top"
                        });

                        for (var i = 0; i < $scope.myproducts.length; i++) {
                            for (var j = 0; j < $scope.myproducts[i].productHeader.configurations.length; j++) {
                                if ($scope.myproducts[i] == product) {
                                    $scope.myproducts.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        //$state.reload();
                        //$state.reload().then(function () {
                        //    $state.go('SearchMyView.DetailLicense', { licenseId: product.licenseId });
                        //});
                    }, function (error) {
                        var notymessage = "Error removing product from license ";
                        for (var i = 0; i < result.errorList.length; i++) {
                            notymessage += result.errorList[i].message + "\n"
                        }
                        noty({
                            text: notymessage,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    });
                }
            },
            {
                addClass: 'btn-default', text: 'Cancel', onClick: function ($noty) {
                    $noty.close();

                }
            }
                ]
            });


        }
        else {

            var request = {
                action: 'DELETE',
                licenseId: product.licenseId,
                licenseProductId: product.licenseProductId,
                licenseProductConfigurationId: config.licenseProductConfiguration.licenseProductConfigurationId,
                productId: product.productId,
                configuration_id: config.configuration.id,
                configuration_name: config.configuration.name,
                product_configuration_id: 0
            };

            var notymessage = 'configuration "' + config.configuration.name + '" ';
            var notytype = 'success';
            var notytimeout = 2500;
            editConfigurationsService.deleteExistingConfig(request)
              .then(function (result) {
                  //if (result.data == 'true') {  20160623 fix invalid delete config error message
                  if (result.data) {
                      notymessage += ' has been removed';
                      notytype = 'success';
                      config.licenseProductConfiguration = null;
                  }
                  else {
                      notymessage = 'Error removing ' + notymessage + ' (click to close)';
                      notytype = 'error';
                      notytimeout = false;
                  }
                  noty({
                      text: notymessage,
                      type: notytype,
                      timeout: notytimeout,
                      layout: "top"
                  });
                  // $state.reload().then(function () {
                  //     $state.go('SearchMyView.DetailLicense');
                  // });
              }, function (error) {
                  notymessage = 'Error removing ' + notymessage + ' ' + error.data.message + ' (click to close)';
                  noty({
                      text: notymessage,
                      type: 'error',
                      timeout: false,
                      layout: "top"
                  });
              });
        }
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


    $scope.addConfig = function (product, config) {


        //var form1 = $scope.someForm10;
        var form1 = $scope.forms;

        var date1Content = $("#date10").val();



        if (form1.$invalid && date1Content.length >= 1) {
            dateErrorMessage();
            return;
        }



        var catalogNumber = null;
        var releaseDate = null;
        var upc = null;

        if (config.releaseDate) {
            releaseDate = config.releaseDate;
        }
        if (config.upc) {
            upc = config.upc;
        }

        if (config.licenseProductConfiguration) {
            if (config.licenseProductConfiguration.catalogNumber) {
                catalogNumber = config.licenseProductConfiguration.catalogNumber;
            }
        }

        var request = {
            action: 'ADDEXISTING',
            addToLicenseId: $scope.licenseId,
            licenseId: product.licenseId,
            licenseProductId: product.licenseProductId,
            licenseProductConfigurationId: 0,
            productId: product.productId,
            configuration_id: config.configuration.id,
            configuration_name: config.configuration.name,
            product_configuration_id: config.id,
            upc: upc,
            releaseDate: releaseDate,
            catalogNumber: catalogNumber
        };

        var notymessage = 'configuration "' + config.configuration.name + '" ';
        var notytype = 'success';
        var notytimeout = 2500;
        editConfigurationsService.addExistingConfig(request)
            .then(function (result) {

                if (result.data.success) { // == 'true') {
                    notymessage += " added";
                    notytype = "success";

                    config.licenseProductConfiguration = result.data.licenseProductConfiguration;
                    config.isDirty = false;
                    //config.licenseProductConfiguration.licenseProductConfiguration = result.data.licenseProductConfiguration;
                    //config.licenseProductConfiguration.licenseProductConfigurationId = result.data.licenseProductConfiguration.licenseProductConfigurationId;

                    //need to update the LicenseProductId for any configs that do not have a value, this only occurs when adding configs to a new product
                    if (product.licenseId == 0) {
                        product.licenseId = $scope.licenseId;
                    }
                    product.licenseProductId = config.licenseProductConfiguration.licenseProductId;
                    product.configSuggest = "";

                }
                else {
                    notymessage = "error adding " + notymessage + " " + result.data.errorMessage + " (click to close)";
                    notytype = "error";
                    notytimeout = false;
                }
                noty({
                    text: notymessage,
                    type: notytype,
                    timeout: notytimeout,
                    layout: "top"
                });

                //$state.reload().then(function () {
                //    $state.go('SearchMyView.DetailLicense');
                //});

            }, function (error) {
                //alert(error.data.message);
                var notymessage = "Error occurred adding " + notymessage + ' ' + error.data.message + " (click to close)";
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            });
    }

    $scope.addNewConfig = function (product, config) {
        var catalogNumber = null;
        var releaseDate = null;
        var upc = null;
        var request = {
            action: 'ADDNEW',
            addToLicenseId: $scope.licenseId,
            licenseId: product.licenseId,
            licenseProductId: product.licenseProductId,
            licenseProductConfigurationId: 0,
            productId: product.productId,
            configuration_id: config.id,
            configuration_name: config.name,
            product_configuration_id: 0,
            upc: upc,
            releaseDate: releaseDate,
            catalogNumber: catalogNumber
        };

        var notymessage = 'configuration "' + config.name + '" ';
        var notytype = 'success';
        var notytimeout = 2500;

        editConfigurationsService.addExistingConfig(request)
            .then(function (result) {

                if (result.data.success) { // == 'true') {
                    notymessage += " added";
                    notytype = "success";

                    var newconfig = { id: result.data.licenseProductConfiguration.configuration_id, name: result.data.licenseProductConfiguration.configuration_name };

                    var newconfiguration = {
                        id: result.data.licenseProductConfiguration.product_configuration_id,
                        configuration: newconfig,
                        licenseProductConfiguration: result.data.licenseProductConfiguration
                    }

                    //product.licenseProductId = config.licenseProductConfiguration.licenseProductId;
                    product.licenseProductId = newconfiguration.licenseProductConfiguration.licenseProductId;

                    if (product.licenseId == 0) {
                        product.licenseId = $scope.licenseId;
                    }
                    product.productHeader.configurations.push(newconfiguration);

                    //$state.reload().then(function () {
                    //    $state.go('SearchMyView.DetailLicense');
                    //});
                    product.configSuggest = "";

                    noty({
                        text: notymessage,
                        type: notytype,
                        timeout: 2500,
                        layout: "top"
                    });
                }
                else {
                    notymessage = "error adding " + notymessage + " " + result.data.errorMessage + "  (click to close)";
                    notytype = "error";
                    noty({
                        text: notymessage,
                        type: notytype,
                        timeout: false,
                        layout: "top"
                    });
                }

                //$state.reload().then(function () {
                //    $state.go('SearchMyView.DetailLicense');
                //});
            }, function (error) {
                var notymessage = "Error occurred adding " + notymessage + ' ' + error.data.message + "  (click to close)";
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });

            });
    }


    $scope.canAddConfig = function (config) {

        var c = 0;

        if (!config.licenseProductConfiguration) {
            return true;
        }
        if (!config.licenseProductConfiguration.licenseProductConfigurationId) {
            return true;
        }
        return false;

    };

    $scope.canDeleteConfig = function (configs, config) {
        var rv = false;

        var licenseProductId = 0;
        if (config) {
            if (config.licenseProductConfiguration) {
                licenseProductId = config.licenseProductConfiguration.licenseProductId;
            }
        }
        if (licenseProductId > 0) {
            for (var i = 0; i < configs.length; i++) {
                if (configs[i].licenseProductConfiguration) {
                    if (configs[i].licenseProductConfiguration.licenseProductId == licenseProductId) {
                        rv = true;
                        break;
                    }
                };
            }
        }

        return rv;
    };

    $scope.rowClass = function (configs, config) {
        if ($scope.canEditConfig(configs, config)) {
            return "configselected";
        }
        else {
            return "";
        }
    };

    $scope.canEditConfig = function (configs, config) {
        var rv = false;
        var licenseProductId = 0;

        if (config) {
            if (config.licenseProductConfiguration) {
                licenseProductId = config.licenseProductConfiguration.licenseProductId;
            }
        }
        if (licenseProductId > 0) {
            angular.forEach(configs, function (config) {
                if (config.licenseProductConfiguration) {
                    if (config.licenseProductConfiguration.licenseProductId == licenseProductId) {
                        rv = true;
                    }
                };
            });
        }
        return rv;
    }

    $scope.myproduct = null;
    $scope.setProductDetails = function (product) {
        if (product.configSuggest != null) {
            product.configSuggest = "";
        }
        if ($scope.myproduct == product) {
            $scope.myproduct = null;
        }
        else {
            $scope.myproduct = product;
        }
    };


    $scope.getAllRecsConfigurations = function () {
        editConfigurationsService.getAllRecsConfigurations().then(function (result) {
            $scope.all_configurations.length = 0;

            angular.forEach(result.data, function (item) {
                $scope.all_configurations.push({ id: item.id, name: item.name, type: item.type });
            });

        }, function (error) {
            alert(error.data.message);
        });
    };


    $scope.availableConfigurationFilter = function (product_configs) {  //product
        return function (config) {
            if ((config) && (product_configs)) {
                for (var i = 0; i < product_configs.length; i++) {
                    if (config.id == product_configs[i].configuration.id) {
                        return false;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        }
    };


    $scope.updateConfigSuggest = function (product) {
        var configSuggest = "";
        var addConfiguration = null;
        if (product.configSuggest) {
            configSuggest = product.configSuggest;
        }
        if (product.addConfiguration) {
            addConfiguration = product.addConfiguration;
        }

        if (addConfiguration) {
            if (configSuggest != addConfiguration.name) {
                product.addConfiguration = null;
                product.configSuggest = "";
            }
        }

        else {
            //product.configSuggest = "";
        }

    };

    $scope.updateSelectedConfig = function (product, config) {
        product.addConfiguration = config;
        product.configSuggest = config.name;
    }



    function pendingConfigurationConfirm(action) {

        var rv = false;
        var pending = false;
        for (var i = 0; i < $scope.myproducts.length; i++) {
            if (($scope.myproducts[i].configSuggest != null) && ($scope.myproducts[i].configSuggest != "")) {
                pending = true;
                break;
            }


        }

        $scope.modal_submit = true;

        if (pending) {

            noty({
                text: 'You have a configuration pending.  Continue without adding the configuration?',
                type: 'confirm',
                modal: true,
                timeout: 5000,
                layout: "center",
                buttons: [
                    {
                        addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                            $noty.close();

                            for (var i = 0; i < $scope.myproducts.length; i++) {
                                if (($scope.myproducts[i].configSuggest != null) && ($scope.myproducts[i].configSuggest != "")) {
                                    $scope.myproducts[i].configSuggest = "";
                                }
                            }

                            if (action == "cancel") {
                                $scope.cancelToLicenseDetails();
                            }
                            if (action == "back") {
                                $scope.modalPreviousStep();
                            }
                            if (action == "save") {
                                $scope.save();
                            }
                            return false;
                            //noty({ text: 'You clicked "Ok" button', type: 'success' });

                        }
                    },
                    {
                        addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                            $noty.close();
                            //noty({ text: 'You clicked "Cancel" button', type: 'error' });
                            return true;
                        }
                    }
                ]
            });

        }
        else {
            if (action == "cancel") {
                $scope.cancelToLicenseDetails();
            }
            if (action == "back") {
                $scope.modalPreviousStep();
            }
            if (action == "save") {
                $scope.save();

            }
        }
    }

    function pendingConfiguration() {
        var rv = false;
        for (var i = 0; i < $scope.myproducts.length; i++) {
            if (($scope.myproducts[i].configSuggest != null) && ($scope.myproducts[i].configSuggest != "")) {

                noty({
                    text: "There is a Configuration pending.  Clear the Configuration, or add it.     (click to close)",
                    type: "error",
                    timeout: false,
                    layout: "top"
                });
                rv = true;
                $scope.modal_submit = true;
                break;
            }
        }
        return rv;
    }

    $scope.back = function () {
        pendingConfigurationConfirm("back");
        //if (!pendingConfigurationConfirm()) {
        //    $scope.modalPreviousStep()
        //}
    }

    $scope.cancel = function () {
        pendingConfigurationConfirm("cancel");
        //if (!pendingConfigurationConfirm()) {
        //    //$parent.cancel()
        //    $scope.cancelToLicenseDetails();
        //}
    }



    var isNotADate = function (date) {
        if (date.length != 10 || date.length == 0) {
            return true;
        }
    }

    $scope.ok = function () {
        var date1 = $("#date10").val();
        if (date1 != null && date1.length != undefined) {
            if (isNotADate(date1) && date1.length >= 1) {
                dateErrorMessage();
                return;
            }
        }
        pendingConfigurationConfirm("save");
    }

    $scope.save = function () {

        var requests = [];

        for (var i = 0; i < $scope.myproducts.length; i++) {
            for (var j = 0; j < $scope.myproducts[i].productHeader.configurations.length; j++) {
                if ($scope.myproducts[i].productHeader.configurations[j].isDirty)
                    // add to check
                    //&& has a licenseProductConfigurationId && has a product_configuration_id
                {
                    //update recsproduct, licenseproductConfig
                    var config = $scope.myproducts[i].productHeader.configurations[j];

                    var catalogNumber = null;
                    var releaseDate = null;
                    var upc = null;
                    var licenseProductConfigurationId = 0;
                    var product_configuration_id = 0;

                    if (config.releaseDate) {
                        releaseDate = moment(config.releaseDate).format("YYYY-MM-DD");
                    }
                    if (config.upc) {
                        upc = config.upc;
                    }

                    if (config.licenseProductConfiguration) {
                        if (config.licenseProductConfiguration.catalogNumber) {
                            catalogNumber = config.licenseProductConfiguration.catalogNumber;
                        }
                        licenseProductConfigurationId = config.licenseProductConfiguration.licenseProductConfigurationId;
                        product_configuration_id = config.licenseProductConfiguration.product_configuration_id;
                    }

                    if (licenseProductConfigurationId > 0 && product_configuration_id > 0) {

                        var request = {
                            action: 'UPDATE',
                            addToLicenseId: $scope.licenseId,
                            licenseId: $scope.myproducts[i].licenseId, //product.licenseId,
                            licenseProductId: $scope.myproducts[i].licenseProductId,
                            licenseProductConfigurationId: licenseProductConfigurationId,
                            productId: $scope.myproducts[i].productId,
                            configuration_id: config.configuration.id,
                            configuration_name: config.configuration.name,
                            product_configuration_id: product_configuration_id,
                            upc: upc,
                            releaseDate: releaseDate,
                            catalogNumber: catalogNumber
                        };

                        requests.push(request);

                        config.isDirty = false;
                    }
                }
            }
        }

        if (requests.length > 0) {

            var notymessage = '';
            var notytype = 'success';
            var notytimeout = 2500;

            editConfigurationsService.updateConfig(requests)
                .then(function (results) {
                    angular.forEach(results.data, function (result) {
                        notymessage = 'configuration "' + result.licenseProductConfiguration.configuration_name + '" ';

                        if (result.success) {
                            notymessage += ' updated';
                            notytype = "success";

                            $scope.modal_submit = false;

                        }
                        else {
                            notymessage = "error updating " + notymessage + " " + result.errorMessage + " (click to close)";
                            notytype = "error";
                            notytimeout = false;
                        }
                        noty({
                            text: notymessage,
                            type: notytype,
                            timeout: notytimeout,
                            layout: "top"
                        });

                    });
                }, function (error) {
                    var notymessage = "Error occurred updating " + notymessage + ' ' + error.message + " (click to close)";
                    noty({
                        text: notymessage,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                }).then(function () {
                    $state.reload().then(function () {
                        //$state.go('SearchMyView.DetailLicense');
                        $state.go('SearchMyView.DetailLicense', { licenseId: $scope.licenseId });
                        location.reload(false);
                    });
                });

        }
        else {
            $state.reload().then(function () {
                //$state.go('SearchMyView.DetailLicense');
                $state.go('SearchMyView.DetailLicense', { licenseId: $scope.licenseId });
                location.reload(false);
            });
        }
    };

    $scope.getProducts = function () {
        //commented out 9/3/2015
        //if (($stateParams) && ($stateParams.products=="test")) {
        ////bla bla

        //commented out if statement 6/29/2016 || Jeff
        //If 'if == true' then code breaks, cant find configuration.  we need to build it in the else.  We do not need this 'If' block.
        //if (($stateParams) && ($stateParams.products != null) && ($stateParams.products.length > 0)) {
        //    $scope.myproducts = $stateParams.products;
        //    if ($scope.myproducts.length > 0) {
        //        $scope.setProductDetails($scope.myproducts[0]);
        //    }
        //    angular.forEach($scope.myproducts, function (prod) {
        //        angular.forEach(prod.productHeader.configurations, function (config) {
        //            if (config.releaseDate) {
        //                config.releaseDate = moment.utc(config.releaseDate).format("YYYY-MM-DD");
        //            }

        //        });
        //    });
        //} else {
            $scope.myproducts = [];
            var i = 0;
            angular.forEach($scope.selectedProducts, function (p) {
                //pending licenseId value being passed in selectedProducts 
                //current products in the license have null for licenseNo
                //selected products to be added have a value of zero.

                //var licenseId = 0
                //if (p.licensesNo == null) {
                //    licenseId = $scope.licenseId;
                //}

                //always send the current licenseId
                var licenseId = $scope.licenseId;

                //var licenseId = $scope.licenseId;
                licenseProductsService.getSelectedProduct(licenseId, p.product_id).then(function (result) {
                    var d = result.data;
                    $scope.myproducts.push(d);
                    if (i == 0) {
                        i++;
                        $scope.setProductDetails($scope.myproducts[0]);
                    }
                    angular.forEach($scope.myproducts, function (prod) {
                        angular.forEach(prod.productHeader.configurations, function (config) {
                            if (config.releaseDate) {
                                config.releaseDate = moment.utc(config.releaseDate).format("YYYY-MM-DD");
                            }

                        });
                    });
                });
            });
       // }
    };

    $scope.getProducts();
    $scope.getAllRecsConfigurations();

}]);

