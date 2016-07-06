'use strict';
app.controller('productsController', ['$scope', 'productsService', 'contactsService', '$modal', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licensesService','$state','licenseProductsService','$filter', function ($scope, productsService, contactsService, $modal, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService,licensesService, $state, licenseProductsService, $filter) {
    var localStorageOptions = "PRODUCTS_SEARCH_OPTIONS";
    var defaultsKeyName = "SEARCH_PAGE";
    $scope.$on("modalAddProductsEvent", function ($event, args) {
        $scope.addProductsEvent(args);
    });
    $scope.$on("modalSearchProductsEvent", function ($event) {
        $scope.searchProducts(true);
    });
    $scope.$on("modalAddNewProductEvent", function ($event, args) {
        $scope.addNewProductEvent(args);
    });
    $scope.selectAllProducts = function () {
        var allSelected = !$filter('isAllSelected')($scope.products);
        $filter('selectAll')($scope.products, allSelected);
    }
    $scope.selectedProductssFromGrid = [];
    $scope.products = [];
    $scope.columns = [];
    $scope.hiddenColumns = [];
    $scope.canChangePage = false;
    $scope.test = "";
    $scope.filteredLicenses = [];
    //$scope.maxSize = 5;
    $scope.pagination = {
        currentPage: 1,
        totalItems: 0,
        numPerPage: 10,
        maxSize: 5,
        pageSizeList: [10, 20, 50, 100],
        isCollapsed:true
    }
    if(!$scope.insideModal)
    $scope.loadPagination($scope.currentPage(), $scope.pagination);
    $scope.sortBy = "";
    $scope.sortOrder = "";
    $scope.sortArrow = "caret caret-up";
    //$scope.searchTerm = "";
    //$scope.labelSuggest = "";
    //$scope.advancedSearch = new advancedSearchObject();
    //$scope.myAdvancedSearch = new advancedSearchObject();
    //$scope.currentSearch = new advancedSearchObject();
    $scope.isMyView = false;

  
    $scope.searchParameters = function () {
        var advancedOpt = $scope.currentSearch;
        var sliderRangeDefault = function () {
            return $scope.sliderRangeMin == $scope.currentSearch.RateRange[0] && $scope.sliderRangeMax == $scope.currentSearch.RateRange[1]
        }
        return {
            SearchTerm: $scope.searchTerm,
            PageNo: $scope.pagination.currentPage - 1,
            PageSize: $scope.pagination.numPerPage,
            OrderBy: $scope.sortBy,
            SortOrder: $scope.sortOrder,
            IncludeRecordingTitle: advancedOpt.includeRecordingTitle,
            IncludeProductTitle: advancedOpt.includeProductTitle,
            IncludeLicenseTitle: advancedOpt.includeLicenseTitle,
            IncludeArtist: advancedOpt.includeArtist,
            IncludeWriter: advancedOpt.includeWriter,
            IncludeClientCode: advancedOpt.includeClient,
            IncludeHFALicense: advancedOpt.includeHFALicense,
            IncludeUpcCode: advancedOpt.includeUPC,
            IncludePipsCode: advancedOpt.includePIPS,
            IncludeLicenseNumber: advancedOpt.includeLicenseNumber,
            FilterStatusReport: advancedOpt.filterStatusReport,
            FilterPriorityReport: advancedOpt.filterPriorityReport,
            WritersConsentTypes: [],
            Assignees: USL.Common.SingleFieldArray(advancedOpt.Asignees, 'contactId', true),
            Labels: USL.Common.SingleFieldArray(advancedOpt.Labels, 'id', true),
            LabelGroups: USL.Common.SingleFieldArray(advancedOpt.LabelGroups, 'id', true),
            Licensees: USL.Common.SingleFieldArray(advancedOpt.Licensees, 'licenseeId', true),
            Publishers: USL.Common.SingleFieldArray(advancedOpt.Publishers, 'ipCode', true),
            RateTypes: USL.Common.SingleFieldArray(advancedOpt.RateTypes, 'rateTypeId', true),
            Distributor: advancedOpt.Dristributors,
            LicMethods: USL.Common.SingleFieldArray(advancedOpt.LicesingMethods, 'licenseMethodId', true),
            LicenseTypes: USL.Common.SingleFieldArray(advancedOpt.LicenseTypes, 'licenseTypeId', true),
            LicenseStatuses: USL.Common.SingleFieldArray(advancedOpt.LicenseStatuses, 'licenseStatusId', true),
            ReleaseDateFrom: advancedOpt.ReleaseDateFrom,
            ReleaseDateTo: advancedOpt.ReleaseDateTo,
            SignedDateFrom: advancedOpt.SignedDateFrom,
            Configurations: USL.Common.SingleFieldArray(advancedOpt.Configuration, 'id', true),
            SignedDateTo: advancedOpt.SignedDateTo,
            WriterRateFrom: advancedOpt.RateRange && advancedOpt.RateRange.length > 1 && !sliderRangeDefault() ? advancedOpt.RateRange[0] : null,
            WriterRateTo: advancedOpt.RateRange && advancedOpt.RateRange.length > 1 && !sliderRangeDefault() ? advancedOpt.RateRange[1] : null,
            SpecialStatuses: USL.Common.SingleFieldArray(advancedOpt.SpecialStatus, 'specialStatusId', true)
        }
    }
    $scope.sortSearch = function (orderBy) {
        if (orderBy != $scope.sortBy) {
            $scope.sortOrder = "asc";
            $scope.sortBy = orderBy;
            $scope.sortArrow = "caret caret-up";
        } else {
            if ($scope.sortOrder == "asc") {
                $scope.sortOrder = "desc";
                $scope.sortArrow = "caret";
            } else {
                $scope.sortBy = "";
                $scope.sortOrder = "";
                $scope.sortArrow = angular.undefined;
            }
        }
        $scope.searchProducts();
    }
    $scope.changePageSize = function (pageSize) {
        $scope.pagination.numPerPage = pageSize;
        $scope.searchProducts();
    }
    $scope.pageChanged = function () {
        //  var begin = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage)
        //  , end = begin + $scope.pagination.numPerPage;
        //$scope.filteredLicenses = $scope.licenses.slice(begin, end);
        if ($scope.canChangePage) {
            $scope.searchProducts();
        } else {
            if(!$scope.insideModal)
            $scope.loadPagination($scope.currentPage(), $scope.pagination);
        }
    };
    $scope.search = function () {
        $scope.pagination.currentPage = 1;
        $scope.currentSearch = (JSON.parse(JSON.stringify($scope.advancedSearch)));
        localStorageService.set(localStorageOptions, $scope.currentSearch);
        $scope.searchProducts();
    }
    $scope.searchProducts = function (checkSelected) {
        productsService.searchProducts($scope.searchParameters()).then(function (result) {
            var response = result.data;
            angular.forEach(response.results, function(product) {
                product.selected = false;
                if(!product.recordings)
                product.recordings = [];
                product.tracksLoaded = false;
                product.tracksCollapsed = false;

            });
            $scope.products = response.results;

            //This loads all of the recordings upfront || as of now not needed.  Possibly in the future, load licenses w/ 7 or less recordings, 
            // and then on the row click, load licenses with more than 7 recordings
            //$scope.products.forEach(function (product) {
            //    productsService.getProductRecsRecordings(product.product_id)
            //        .then(function (result) {
            //            product.recordings = result.data;
            //        });
            //});

            $scope.filtersSelected();
            if (checkSelected) $scope.checkSelected();
            $scope.filteredProducts = $scope.products.slice(0, $scope.pagination.numPerPage);
            $scope.pagination.totalItems = response.total;
            $scope.pagination.numPages = Math.ceil($scope.products.length / $scope.pagination.numPerPage);
            if (!$scope.insideModal) $scope.savePagination($scope.currentPage(), $scope.pagination);
                $scope.canChangePage = true;
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
    $scope.checkSelected = function() {
        angular.forEach($scope.products, function(item) {
            var exists = USL.Common.FirstInArray($scope.selectedProducts, 'product_id', item.product_id);
            if (exists) item.selected = true;
        });
    }
    $scope.check = function (isCollapsed, productId) {
        if (isCollapsed) {
            licensesService.getLicensesForProduct(productId).then(function (result) {
                var response = result.data;
                angular.forEach($scope.products, function (product) {
                    if (product.product_id == productId) {
                        product.licenses = result.data;
                    }
                });

            });
        }
    };
    $scope.expandRelatedLicenses = function (isCollapsed, productId) {
        if (isCollapsed) {
            licensesService.getLicensesForProduct(productId).then(function (result) {
                var response = result.data;
                angular.forEach($scope.selectedProducts, function (product) {
                    if (product.product_id == productId) {
                        product.licenses = result.data;
                    }
                });

            });
        }
    };
    $scope.openAsignees = function() {
        if ($scope.advancedSearch.Asignees.length == 0) {
            contactsService.getAssignees().then(function (results) {
                angular.forEach(results.data, function(value, key) {
                    value.selected = false;
                });
                $scope.advancedSearch.Asignees = results.data;
                
            }, function (error) {
                //alert(error.data.message);
            });
        }
    }

    $scope.openLabels = function() {
        if ($scope.advancedSearch.Labels.length == 0) {
            labelsService.getLabels().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    value.selected = false;
                });
                $scope.advancedSearch.Labels = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }

    $scope.setCaret = function (collapsed) {
        if (collapsed == true) {
            return "caret";
        }
        else {
            return "caret caret-up";
        }
    }
    //modal
    $scope.openModal = function (size, caller) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-AssignPriority.html',
            controller: function ($scope, $modalInstance) {
                $scope.caller = caller;
                $scope.selectedAssignee = { fullName: "Select Assignee" };
                $scope.selectedPriority = {
                    priority: 'Select priority', priorityId:-1
            };
                $scope.contacts = [];
                $scope.priorities = [];
                $scope.testGetContacts = function () {
                    if ($scope.contacts.length == 0) {
                        contactsService.getContacts().then(function (results) {
                            $scope.contacts = results.data;
                        }, function (error) {
                            //alert(error.data.message);
                        });
                    }
                };
                $scope.getPriorities = function() {
                    if ($scope.priorities.length == 0) {
                        prioritiesService.getPriorities().then(function(results) {
                            $scope.priorities = results.data;
                        }, function(error) {});
                    }
                }
                $scope.selectPriority = function(p) {
                    $scope.selectedPriority = p;
                }
                $scope.selectAsignee = function (contact) {
                    $scope.selectedAssignee = contact;
                };
                $scope.ok = function () {
                    if ($scope.selectedAssignee.contactId && $scope.selectedPriority.priorityId) {
                        var selectedLicensesIds = USL.Common.SingleFieldArray(rootScope.licenses, 'licenseId', true);
                        licensesService.updateLicensesAsignee($scope.selectedAssignee.contactId, $scope.selectedPriority.priorityId, selectedLicensesIds).then(function(result) {
                            rootScope.searchLicenses();
                        }, function(error) {});
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            size: size,

        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {

        });
    };

    $scope.clickExpandTracks = function (product) {
        /* Old method call | already commented out
        if (!product.tracksLoaded) {
            productsService.getProductRecordings(product.product_id).then(function(result) {
                product.recordings = result.data;
                product.tracksLoaded = true;
            });
        }
        */
        if (!product.tracksLoaded) {
            productsService.getProductRecsRecordings(product.product_id).then(function (result) {
                product.recordings = result.data;
                product.tracksLoaded = true;
            });
        }
    } 

    // contact defaults stuff
    $scope.userSetting = {
        includeRecordingTitle: false,
        includeProductTitle: false,
        includeLicenseTitle: false,
        includeArtist: false,
        includeWriter: false,
        includePIPS: false,
        includeUPC: false,
        includeClient: false,
        includeHFALicense: false
    };


    $scope.addNewProductEvent = function (args) {
        $scope.modalNextStep();
    };

    $scope.addProductsEvent = function(args) {
        var selectedProductsList = [];
        angular.forEach($scope.selectedProducts, function(item) {
            var newItem = {};
            newItem.key = item.product_id;
            if (item.recordings) {
                newItem.Value = USL.Common.SingleFieldArray(item.recordings, 'track_id', false);
            } else {
                newItem.Value = [];
            }
            selectedProductsList.push(newItem);
        });
        //
        //bla bla
        $scope.setParameter('products', selectedProductsList);
        $scope.modalNextStep();
        //
        //licenseProductsService.updateLicenseProducts(args.licenseId, selectedProductsList).then(function() {
        //    $scope.modalNextStep();
        //});

    };
    $scope.selectProduct = function (product) {
            product.selected = true;
            var exists = USL.Common.FirstInArray($scope.selectedProducts, 'product_id', product.product_id);
            if (!exists) $scope.selectedProducts.push(JSON.parse(JSON.stringify(product)));
        
    }
    $scope.selectProductFromGrid = function (product) {
        var exists = USL.Common.FirstInArray($scope.selectedProductssFromGrid, 'product_id', product.product_id);
        if (!exists) $scope.selectedProductssFromGrid.push(JSON.parse(JSON.stringify(product)))
        else {
            USL.Common.FindAndRemove($scope.selectedProductssFromGrid, 'product_id', product.product_id);
        }
        ;

    }
    $scope.removeSelected = function(product) {
        var exists = USL.Common.FirstInArray($scope.products, 'product_id', product.product_id);
        if (exists) exists.selected = false;
        USL.Common.FindAndRemove($scope.selectedProducts, 'product_id', product.product_id);
        if (product.licenseId) {

            licenseProductsService.deleteLicenseProduct(product.licenseId, product.product_id).then(function (result) {

      //          $state.reload();

                noty({
                    text: 'product deleted',
                    type: 'success',
                    timeout: 2500,
                    layout: "top"
                });

                //$state.reload();
                //$state.reload().then(function () {
                //    $state.go('SearchMyView.DetailLicense', { licenseId: product.licenseId });
                //});
            });
        }
    }
    var getContactUserSetting = function () {
        return {
            ContactId: 1,
            UserSetting: JSON.stringify($scope.userSetting)
        }
    };
    function loadDefaultColumns() {
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function(result) {
            var response = result.data;
            var settings = null;
            if (response && response.userSetting) {
                settings = JSON.parse(response.userSetting);
            } else {
                return;
            }
            if (settings[defaultsKeyName] && settings[defaultsKeyName].productsSearchColumns) {
                $scope.hiddenColumns = settings[defaultsKeyName].productsSearchColumns;
            }
        });
    }

    function saveEditColumnsSettings() {
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            if (!response || !response.userSetting) {
                response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
            } else {
                response.userSetting = JSON.parse(response.userSetting);
            }
            if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = { productsSearchColumns: {} };
            response.userSetting[defaultsKeyName].productsSearchColumns = $scope.hiddenColumns;
            response.userSetting = JSON.stringify(response.userSetting);
            contactDefaultsService.saveContactDefaults(response);
        });
    }
    function init() {
        if ($state.current.name.indexOf("StepsModal.AddProducts") != -1) {
            $scope.$emit('addproductsModalLoaded', $scope);
        }else
        {
            $scope.$emit('productsControllerLoaded', $scope);
            loadDefaultColumns();

        }
    }
    $scope.showHideColumn = function (col, event) {
        if (col.isDefault) return;
        if (event.target.nodeName != "INPUT") col.selected = !col.selected;
        if (!col.selected) {
            $scope.hiddenColumns.push(col);
        } else {
            USL.Common.FindAndRemove($scope.hiddenColumns, 'key', col.key);
        }
        
    }
    $scope.editColumnsDropdown = function(open) {
      if (!open) {
          saveEditColumnsSettings();
      }
    }
    $scope.isEditColumnsCollapsed = true;

    init();

}]);

