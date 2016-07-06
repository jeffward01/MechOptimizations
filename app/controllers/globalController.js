'use strict';
app.controller('globalController', ['$scope', '$state', 'licensesService', 'contactsService', '$modal', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licenseMethodsService', 'rateTypesService', 'safeService', 'licenseStatusService', 'licenseTypesService', 'editRatesService', '$timeout', 'licenseWritersConsentTypesService', function ($scope, $state, licensesService, contactsService, $modal, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService, licenseMethodsService, rateTypesService, safeService, licenseStatusService, licenseTypesService, editRatesService, $timeout, licenseWritersConsentTypesService) {

    //For the Rate Slider.  If the last index is selected '0.1', it returns 100.  I chose 100 becuase no rates will be higher than 100.
    var makeSureItsInt = function (string) {
        if (string.isString) {
            return 100;
        }
    }

    var searchTermKey = "SEARCH_TERM";
    var firstControllerLoadkey = "SEARCH_GLOBAL_FIRST_LOAD";
    var defaultsKeyName = "SEARCH_PAGE";
    $scope.GlobalAssignees = [];
    $scope.GlobalLicensees = [];
    $scope.GlobalPublishers = [];
    $scope.GlobalRateTypes = [];
    $scope.GlobalDistributors = [];
    $scope.GlobalLicenseMethods = [];
    $scope.GlobalConfigurations = [];
    $scope.GlobalSpecialStatuses = [];
    $scope.GlobalReports = [];
    $scope.GlobalLabels = [];
    $scope.GlobalLabelGroups = [];
    $scope.GlobalLicenseTypes = [];
    $scope.GlobalLicenseStatuses = [];
    $scope.GlobalWritersConsentTypes = [];
    $scope.sliderScale = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.091, '0.1+'];
    $scope.sliderTicksPositions = [0, 25, 50, 75, 100];
    $scope.sliderRangeMin = $scope.sliderScale[0];
    $scope.sliderRangeMax = $scope.sliderScale[$scope.sliderScale.length - 1];
    $scope.sliderTicks = [];
    $scope.advancedDropdownVisible = false;
    $scope.labelGroupSuggest = "";
    for (var i = 1; i <= $scope.sliderScale.length; i++) {
        $scope.sliderTicks.push(i);
    }
    $scope.tabs = [
        { heading: "My View", route: "SearchMyView.Tabs.MyViewTab", active: false },
        { heading: "Products", route: "SearchMyView.Tabs.ProductsTab", active: false },
        { heading: "Licenses", route: "SearchMyView.Tabs.LicenseTab", active: false }
    ];

 

    $scope.initData = function() {
        $scope.GlobalAssignees = [];
        $scope.GlobalLicensees = [];
        $scope.GlobalPublishers = [];
        $scope.GlobalRateTypes = [];
        $scope.GlobalDistributors = [];
        $scope.GlobalLicenseMethods = [];
        $scope.GlobalConfigurations = [];
        $scope.GlobalSpecialStatuses = [];
        $scope.GlobalReports = [];
        $scope.GlobalLabels = [];
        $scope.GlobalLicenseTypes = [];
        $scope.GlobalLicenseStatuses = [];
        $scope.GlobalLabelGroups = [];
        $scope.GlobalWritersConsentTypes = [];
    }
   $scope.showSlider = function() {
       $scope.advancedDropdownVisible = true;
   }
    $scope.insideModal = (function () {
            if ($state.current.name.indexOf("StepsModal.AddProducts") != -1) {
                return "AddProducts";
            }
            return "";
    }
    )();

    $scope.addRemoveSelected = function(destination, item, itemKeyName) {
        if (item.selected) {
            var exists = USL.Common.FirstInArray(destination, itemKeyName, item[itemKeyName]);
            if (!exists) destination.push(item);
        } else {
            USL.Common.FindAndRemove(destination, itemKeyName, item[itemKeyName]);
        }
    }
    $scope.firstSearch = false;
    $scope.addToRecent = false;
    $scope.go = function (route) {
        $state.go(route);
        if (route == "SearchMyView.Tabs.MyViewTab") {
            $scope.currentTabName = { id: "My-View", name: "My View Settings", route: "SearchMyView.Tabs.MyViewTab" };
            $scope.selectedTabName = { id: "My-View", name: "My View Settings", route: "SearchMyView.Tabs.MyViewTab" };
        }
        else if (route == "SearchMyView.Tabs.ProductsTab") {
            $scope.currentTabName = { id: "Product-View", name: "Product Settings", route: "SearchMyView.Tabs.ProductsTab" };
            $scope.selectedTabName = { id: "Product-View", name: "Product Settings", route: "SearchMyView.Tabs.ProductsTab" };
        } else {
            $scope.currentTabName = { id: "License-View", name: "License Settings", route: "SearchMyView.Tabs.LicenseTab" };
            $scope.selectedTabName = { id: "License-View", name: "License Settings", route: "SearchMyView.Tabs.LicenseTab" };
        }
        

    };


    $scope.active = function (route) {
        return $state.is(route);
    };
    $scope.$on("licensesControllerLoaded", function ($event) {
        $scope.advancedSearch = $scope.advancedSearchData[currentPage()];
        $scope.initData();
        $scope.prepareSearch($event.targetScope.searchLicenses);
    });
    $scope.$on("productsControllerLoaded", function ($event) {
        $scope.advancedSearch = $scope.advancedSearchData[currentPage()];
        $scope.initData();
        $scope.prepareSearch($event.targetScope.searchProducts);
    });
    $scope.$on("addproductsModalLoaded", function ($event) {
        $scope.initData();
        $scope.getDefaults().then(function() {
            $scope.searchProductsModal();
        });
    });
    $scope.$on("$stateChangeSuccess", function () {
        $scope.tabs.forEach(function (tab) {
            tab.active = $scope.active(tab.route);
        });
    });
    
    //Advanced search settings
    $scope.checkSelected = function() {
        
    }
    $scope.tabNames = [{ id: "My-View", name: "My View Settings", route: "SearchMyView.Tabs.MyViewTab" }, { id: "License-View", name: "License Settings", route: "SearchMyView.Tabs.LicenseTab" }, { id: "Product-View", name: "Product Settings", route: "SearchMyView.Tabs.ProductsTab" }];
    $scope.currentTabName = { id: "My-View", name: "My View Settings", route: "SearchMyView.Tabs.MyViewTab" };
    $scope.selectedTabName = { id: "My-View", name: "My View Settings", route: "SearchMyView.Tabs.MyViewTab" };
    $scope.selectTabName = function(tab) {
        $scope.selectedTabName = tab;
        $scope.advancedSearch = $scope.advancedSearchData[currentPage(tab.route)];
        $scope.initData();
    };
    $scope.dateRangesOpened = {
        releaseFrom: false,
        releaseTo: false,
        signedFrom: false,
        signedTo: false,
    }
    $scope.flipDateRange = function (what) {

        var value = !$scope.dateRangesOpened[what];
        $scope.closeDateRanges();
        $scope.dateRangesOpened[what] = value;



    }

    $scope.closeDateRanges = function() {
        $scope.dateRangesOpened.releaseFrom = false;
        $scope.dateRangesOpened.releaseTo = false;
        $scope.dateRangesOpened.signedFrom = false;
        $scope.dateRangesOpened.signedTo = false;
    };
    $scope.rangeFormat = "MM/dd/yyyy";
    var maxSavedSearches = 8;
    var advancedSearchObject = function (searchType) {
        if (searchType == "EditProductSearch" || searchType == "clear") {
            return {
                includeRecordingTitle: true,
                includeProductTitle: true,
                includeLicenseTitle: true,
                includeArtist: true,
                includeWriter: true,
                includePIPS: true,
                includeUPC: true,
                includeClient: true,
                includeHFALicense: false,
                includeLicenseNumber: true,
                filterStatusReport: false,
                filterPriorityReport: false,
                Asignees: [],
                Labels: [],
                LabelGroups: [],
                Licensees: [],
                Publishers: [],
                RateTypes: [],
                Dristributors: [],
                LicesingMethods: [],
                Configuration: [],
                SpecialStatus: [],
                LicenseTypes: [],
                LicenseStatuses: [],
                RateRange: [],
                WritersConsentTypes: [],
                ReleaseDateFrom: null,
                ReleaseDateTo: null,
                SignedDateFrom: null,
                SignedDateTo: null
            }
        } else {
            return {
                includeRecordingTitle: true,
                includeProductTitle: true,
                includeLicenseTitle: true,
                includeArtist: true,
                includeWriter: true,
                includePIPS: true,
                includeUPC: true,
                includeClient: true,
                includeHFALicense: false,
                includeLicenseNumber: true,
                filterStatusReport: false,
                filterPriorityReport: false,
                Asignees: [],
                Labels: [],
                LabelGroups: [],
                Licensees: [],
                Publishers: [],
                RateTypes: [],
                Dristributors: [],
                LicesingMethods: [],
                Configuration: [],
                SpecialStatus: [],
                LicenseTypes: [],
                LicenseStatuses: [],
                WritersConsentTypes: [],
                RateRange: [],
                ReleaseDateFrom: null,
                ReleaseDateTo: null,
                SignedDateFrom: null,
                SignedDateTo: null
            }
        }
    }
    var defaultLicense;
  //// Something isn't right here
    $scope.slider = function () {
      //  var slider = new Slider('#rateRange')
     //   {range: 'true'};
     //   return slide;
    }



    function currentPage(route) {
        var state = $state.current.name;
        if (route) state = route;
        var page = "";
        if ($scope.insideModal == "AddProducts") {
            page = "EditProductSearch";
        } else {
            switch (state) {
            case "SearchMyView.Tabs.ProductsTab":
                page = "ProductSearch";
                break;
            case "SearchMyView.Tabs.LicenseTab":
                page = "LicenseSearch";
                break;
            case "SearchMyView.DetailLicense.StepsModal.AddProducts":
                page = "EditProductSearch";
                break;
            default:
                page = "MyLicenseSearch";
                break;
            }
        }
        return page;
    }

    $scope.currentPage = currentPage;
   $scope.addRecentSearch = function() {
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            if (!response || !response.userSetting) {
                response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
            } else {
                response.userSetting = JSON.parse(response.userSetting);
            }
            if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = {};
            if (!response.userSetting[defaultsKeyName].savedSearches) response.userSetting[defaultsKeyName].savedSearches = [];
            var savedSearches = response.userSetting[defaultsKeyName].savedSearches;
            var currentSearch = {
                searchTerm: $scope.searchTerm,
                advancedSearchData: $scope.advancedSearchData
            };
            savedSearches.unshift(currentSearch);
            if (savedSearches.length > maxSavedSearches) savedSearches = savedSearches.slice(0, maxSavedSearches - 1);
            response.userSetting[defaultsKeyName].savedSearches = savedSearches;
            response.userSetting = JSON.stringify(response.userSetting);
            $scope.recentSearches = savedSearches;
            contactDefaultsService.saveContactDefaults(response);
            $scope.addToRecent = true;
        });
   }

    $scope.licenses = [];
    $scope.test = "";
    $scope.filteredLicenses = [];
    $scope.maxSize = 6;

    $scope.searchTerm = "";
    $scope.labelSuggest = "";
    $scope.publisherSuggest = "";
    $scope.advancedSearchData = {
        "MyLicenseSearch": new advancedSearchObject(),
        "LicenseSearch": new advancedSearchObject(),
        "ProductSearch": new advancedSearchObject(),
        "EditProductSearch": new advancedSearchObject("EditProductSearch")
    };
    $scope.advancedSearch = $scope.advancedSearchData[currentPage()];
    $scope.currentSearch = new advancedSearchObject();
    $scope.recentLimit = maxSavedSearches;
    $scope.isMyView = false;

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
    $scope.search = function (noRecent) {
        //Form Validation
     
        //Date input content
        var date1Content = $("#date").val();
        var date2Content = $("#date1").val();
        var date3Content = $("#date2").val();
        var date4Content = $("#date3").val();

        if (isNotADate(date1Content) && date1Content.length >= 1 || isNotADate(date2Content) && date2Content.length >= 1 || isNotADate(date3Content) && date3Content.length >= 1 || isNotADate(date4Content) && date4Content.length >= 1) {
            dateErrorMessage();
            return;
        }

       
        if (!noRecent) {
            $scope.addToRecent = false;
            $scope.clearAllPagination();
        }
        localStorageService.set(searchTermKey, $scope.searchTerm);
        if (angular.element($('#My-View')).length==0) {
            $state.go($scope.selectedTabName.route);
            $scope.currentTabName = $scope.selectedTabName;
        }else
        if ($scope.selectedTabName.name != $scope.currentTabName.name) {
            $state.go($scope.selectedTabName.route);
            $scope.currentTabName = $scope.selectedTabName;
        } else if ($scope.currentTabName.name == "Product Settings") {
            $scope.prepareSearch(angular.element($('#My-View')).scope().searchProducts);
        } else {
            $scope.prepareSearch(angular.element($('#My-View')).scope()
                .search);
        }
        
    };

    $scope.searchProductsModal = function () {
        $scope.currentSearch = JSON.parse(JSON.stringify($scope.advancedSearch));
        $scope.$broadcast("modalSearchProductsEvent");
    }
    /*
    var safeContactId = safeService.safeauthentication.contactId;
    $scope.currentUser = {
        id: safeContactId
    }
    */

    $scope.currentUser = null;

    //$scope.currentUser = {
    //    id: -1
    //}
    
    $scope.getSafeContactId = function () {
        var data = safeService.getAuthentication();
        if (data) return data.contactId;
        else return -1;
    }


    var newSearchData = function () {
        return {
                "MyLicenseSearch": new advancedSearchObject(),
                "LicenseSearch": new advancedSearchObject(),
                "ProductSearch": new advancedSearchObject(),
                "EditProductSearch": new advancedSearchObject("EditProductSearch")
        }
    };


    //$scope.saveDefaults = contactDefaultsService.saveDefaults();
    $scope.saveDefaults = function () {
        var currentTab = $scope.selectedTabName.route;
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            if (!response || !response.userSetting) {
                response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
            } else {
                response.userSetting = JSON.parse(response.userSetting);
            }
            if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = {};
            if (!response.userSetting[defaultsKeyName].defaultOptions) response.userSetting[defaultsKeyName].defaultOptions = newSearchData();
            response.userSetting[defaultsKeyName].defaultOptions[currentPage(currentTab)] = $scope.advancedSearchData[currentPage(currentTab)];
            response.userSetting = JSON.stringify(response.userSetting);
            contactDefaultsService.saveContactDefaults(response);
        }).then(function (result) {
            // var response = result.data;
            //$scope.licenses = response.results;
            //$scope.filteredLicenses = $scope.licenses.slice(0, $scope.pagination.numPerPage);
            //$scope.pagination.totalItems = response.total;
            //$scope.pagination.numPages = Math.ceil($scope.licenses.length / $scope.pagination.numPerPage);
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
    $scope.savePagination = function(location, paginationVal) {
        localStorageService.set(location, paginationVal);
    }
    $scope.loadPagination = function(location, paginationVal) {
        var value = localStorageService.get(location);
        if (value) {
            paginationVal['currentPage'] = value.currentPage;
            paginationVal['numPerPage'] = value.numPerPage;
        }
    }
    $scope.clearAllPagination = function() {
        $scope.savePagination("ProductSearch", null);
        $scope.savePagination("LicenseSearch", null);
        $scope.savePagination("MyLicenseSearch", null);
    }
    $scope.getDefaults = function (route) {
        $scope.initData();
        return contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            var savedDefaults = USL.Common.ReadPageDefaults(response, defaultsKeyName);
            if (savedDefaults && savedDefaults.defaultOptions) {
                var obj = savedDefaults.defaultOptions[currentPage(route)];
                if(obj)
                $scope.setOptions(obj);
            }
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


    $scope.setOptions = function(obj) {
        $scope.advancedSearch.includeRecordingTitle = obj.includeRecordingTitle;
        $scope.advancedSearch.includeProductTitle = obj.includeProductTitle;
        $scope.advancedSearch.includeLicenseTitle = obj.includeLicenseTitle;
        $scope.advancedSearch.includeArtist = obj.includeArtist;
        $scope.advancedSearch.includeWriter = obj.includeWriter;
        $scope.advancedSearch.includePIPS = obj.includePIPS;
        $scope.advancedSearch.includeUPC = obj.includeUPC;
        $scope.advancedSearch.includeClient = obj.includeClient;
        $scope.advancedSearch.includeHFALicense = obj.includeHFALicense;
        $scope.advancedSearch.Asignees = obj.Asignees;
        $scope.advancedSearch.Configuration = obj.Configuration;
        $scope.advancedSearch.Dristributors = obj.Distributors;
        $scope.advancedSearch.Labels = obj.Labels;
        $scope.advancedSearch.Licensees = obj.Licensees;
        $scope.advancedSearch.LicesingMethods = obj.LicesingMethods;
        $scope.advancedSearch.Publishers = obj.Publishers;
        $scope.advancedSearch.RateTypes = obj.RateTypes;
        $scope.advancedSearch.SpecialStatus = obj.SpecialStatus;
        $scope.advancedSearch.LicenseTypes = obj.LicenseTypes;
        $scope.advancedSearch.LicenseStatuses = obj.LicenseStatuses;
        $scope.advancedSearch.RateRange = obj.RateRange;
        $scope.advancedSearch.LabelGroups = obj.LabelGroups ? obj.LabelGroups : [];
        $scope.advancedSearch.ReleaseDateFrom = obj.ReleaseDateFrom;
        $scope.advancedSearch.ReleaseDateTo = obj.ReleaseDateTo;
        $scope.advancedSearch.SignedDateFrom = obj.SignedDateFrom;
        $scope.advancedSearch.SignedDateTo = obj.SignedDateTo;
        $scope.advancedSearch.filterStatusReport = obj.filterStatusReport;
        $scope.advancedSearch.filterPriorityReport = obj.filterPriorityReport;
        $scope.advancedSearch.includeLicenseNumber = obj.includeLicenseNumber;
        $scope.advancedSearch.WritersConsentTypes = obj.WritersConsentTypes;
    }
    $scope.clearDefaults = function () {
        $scope.advancedSearch.includeRecordingTitle = false;
        $scope.advancedSearch.includeProductTitle = false;
        $scope.advancedSearch.includeLicenseTitle = false;
        $scope.advancedSearch.includeArtist = false;
        $scope.advancedSearch.includeWriter = false;
        $scope.advancedSearch.includePIPS = false;
        $scope.advancedSearch.includeUPC = false;
        $scope.advancedSearch.includeClient = false;
        $scope.advancedSearch.includeHFALicense = false;
        $scope.advancedSearch.Asignees = [];
        $scope.advancedSearch.Configuration = [];
        $scope.advancedSearch.Dristributors = [];
        $scope.advancedSearch.Labels = [];
        $scope.advancedSearch.Licensees = [];
        $scope.advancedSearch.LicesingMethods = [];
        $scope.advancedSearch.Publishers = [];
        $scope.advancedSearch.RateTypes = [];
        $scope.advancedSearch.SpecialStatus = [];
        $scope.advancedSearch.LicenseTypes = [];
        $scope.advancedSearch.LicenseStatuses = [];
        $scope.advancedSearch.RateRange = [];
        $scope.advancedSearch.LabelGroups = [];
        $scope.advancedSearch.ReleaseDateFrom = null;
        $scope.advancedSearch.ReleaseDateTo = null;
        $scope.advancedSearch.SignedDateFrom = null;
        $scope.advancedSearch.SignedDateTo = null;
        $scope.advancedSearch.filterStatusReport = false;
        $scope.advancedSearch.filterPriorityReport = false;
        $scope.advancedSearch.includeLicenseNumber = false;
        $scope.advancedSearch.WritersConsentTypes = [];
        $scope.labelGroupSuggest = "";
        $scope.publisherSuggest = "";
        $scope.labelSuggest = "";
        $scope.initData();
    };

    $scope.setAll = function (v) {
        $scope.advancedSearch.includeRecordingTitle = v;
        $scope.advancedSearch.includeProductTitle = v;
        $scope.advancedSearch.includeLicenseTitle = v;
        $scope.advancedSearch.includeArtist = v;
        $scope.advancedSearch.includeWriter = v;
        $scope.advancedSearch.includePIPS = v;
        $scope.advancedSearch.includeUPC = v;
        $scope.advancedSearch.includeClient = v;
        $scope.advancedSearch.includeHFALicense = v;
        $scope.advancedSearch.includeLicenseNumber = v;
    };


    $scope.openWritersConsentTypes = function () {
        if ($scope.GlobalWritersConsentTypes.length == 0) {
            licenseWritersConsentTypesService.getLicenseWritersConsentTypes().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.WritersConsentTypes, 'writersConsentTypeId', value.writersConsentTypeId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalWritersConsentTypes = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }

    $scope.openAsignees = function () {
        if ($scope.GlobalAssignees.length == 0) {
            contactsService.getAssignees().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Asignees, 'contactId', value.contactId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalAssignees = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }

    $scope.openLicensees = function () {
        if ($scope.GlobalLicensees.length == 0) {
            licenseesService.getLicensees().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Licensees, 'contactId', value.contactId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLicensees = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }
    $scope.openLabels = function () {
        if ($scope.GlobalLabels.length == 0) {
            labelsService.getLabels().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Labels, 'id', value.id);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLabels = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }
    $scope.openLabelGroups = function () {
        if ($scope.GlobalLabels.length == 0) {
            labelsService.getLabels().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Labels, 'labelId', value.labelId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLabels = results.data;

            }, function (error) {
                //alert(error.data.message);
            });
        }
    }
    $scope.openPublishers = function (publisherSuggest) {
        if (publisherSuggest.length> 2) {
            labelsService.getPublishers(publisherSuggest).then(function (results) {
                if (results.data!="null") {

                    angular.forEach(results.data, function(value, key) {
                        var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Publishers, 'ipCode', value.ipCode);
                        if (selectedItem) {
                            value.selected = true;
                        } else {
                            value.selected = false;
                        }
                    });
                    $scope.GlobalPublishers = results.data;
                }
            }, function (error) {
                //alert(error.data.message);
            });
        }
    }
    
    $scope.openLicenseMethods = function () {
        if ($scope.GlobalLicenseMethods.length == 0) {
            licenseMethodsService.getLicenseMethods().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.LicesingMethods, 'licenseMethodId', value.licenseMethodId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLicenseMethods = results.data;

            }, function (error) {
                //          alert(error.data.message);
            });
        }
    }

    $scope.openRateTypes = function () {
        if ($scope.GlobalRateTypes.length == 0) {
            rateTypesService.getRateTypes().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.RateTypes, 'rateTypeId', value.rateTypeId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalRateTypes = results.data;

            }, function (error) {
                //            alert(error.data.message);
            });
        }
    }
    $scope.openConfigurations = function() {
        if ($scope.GlobalConfigurations.length == 0) {
            labelsService.getConfigurations().then(function(results) {
                angular.forEach(results.data, function(value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.Configuration, 'id', value.id);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalConfigurations = results.data;

            }, function(error) {
                //            alert(error.data.message);
            });
        }
    };
    $scope.labelGroupAutosuggest = function (labelGroupSuggest) {
        if ($scope.labelGroupSuggest.length > 2) {

            labelsService.labelGroupAutosuggest(labelGroupSuggest).then(function(result) {
                angular.forEach(result.data, function(value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.LabelGroups, 'id', value.id);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLabelGroups = result.data;
            }, function(error) {

            });
        }
    }
    $scope.openLicenseStatuses = function() {
        if ($scope.GlobalLicenseStatuses.length == 0) {
            licenseStatusService.getLicenseStatuses().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.LicenseStatuses, 'licenseStatusId', value.licenseStatusId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLicenseStatuses = results.data;

            }, function (error) {
                //            alert(error.data.message);
            });
        }
    }
    $scope.openSpecialStatuses = function () {
        if ($scope.GlobalSpecialStatuses.length == 0) {
            editRatesService.getSpecialStatus().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.SpecialStatus, 'specialStatusId', value.specialStatusId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalSpecialStatuses = results.data;

            }, function (error) {
                //            alert(error.data.message);
            });
        }
    }

    $scope.openLicenseTypes = function() {
        if ($scope.GlobalLicenseTypes.length == 0) {
            licenseTypesService.getLicenseTypes().then(function (results) {
                angular.forEach(results.data, function (value, key) {
                    var selectedItem = USL.Common.FirstInArray($scope.advancedSearch.LicenseTypes, 'licenseTypeId', value.licenseTypeId);
                    if (selectedItem) {
                        value.selected = true;
                    } else {
                        value.selected = false;
                    }
                });
                $scope.GlobalLicenseTypes = results.data;

            }, function (error) {
                //            alert(error.data.message);
            });
        }
    }
    $scope.prepareSearch = function (searchMethod) {
        if ($scope.firstSearch) {
            $scope.currentSearch = JSON.parse(JSON.stringify($scope.advancedSearch));
            searchMethod();
            if(!$scope.addToRecent)
                $scope.addRecentSearch();
          
        } else {
            contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
                var alreadyLoadedDefaults = localStorageService.get(firstControllerLoadkey);
                var searchTerm = localStorageService.get(searchTermKey);
                if (searchTerm != null) $scope.searchTerm = searchTerm;
                var response = result.data;
                var savedDefaults = USL.Common.ReadPageDefaults(response, defaultsKeyName);
                if (savedDefaults) {
                    var searchData = savedDefaults.savedSearches ? savedDefaults.savedSearches[0] : null;
                    if (alreadyLoadedDefaults && searchData) {
                        $scope.advancedSearchData = checkSearchObject(searchData.advancedSearchData);
                    }else if (!alreadyLoadedDefaults && savedDefaults.defaultOptions) {
                        $scope.advancedSearchData = checkSearchObject(savedDefaults.defaultOptions); 
                        $scope.addRecentSearch();
                    }
                    $scope.currentSearch = JSON.parse(JSON.stringify($scope.advancedSearchData[currentPage()]));
                    $scope.advancedSearch = $scope.advancedSearchData[currentPage()];
                    $scope.recentSearches = savedDefaults.savedSearches;
                    searchMethod();
                    localStorageService.set(firstControllerLoadkey, "true");
                } else {
                    searchMethod();
                    $scope.addRecentSearch();
                }
               
                $scope.firstSearch = true;

                },
           function (response) {
           });
        }

    }
    $scope.recentSearches = [];
    $scope.changeSavedSearch = function (index) {
        index++;
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            if (!response || !response.userSetting) {
                response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
            } else {
                response.userSetting = JSON.parse(response.userSetting);
            }
            if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = {};
            if (!response.userSetting[defaultsKeyName].savedSearches) response.userSetting[defaultsKeyName].savedSearches = [];
            var savedSearches = response.userSetting[defaultsKeyName].savedSearches;
            var seletedSearch = savedSearches.slice(index, index + 1);
            savedSearches.splice(index, 1);
            savedSearches.unshift(seletedSearch[0]);
            response.userSetting[defaultsKeyName].savedSearches = savedSearches;
            response.userSetting = JSON.stringify(response.userSetting);
            $scope.recentSearches = savedSearches;
            contactDefaultsService.saveContactDefaults(response);
            $scope.advancedSearchData = seletedSearch[0].advancedSearchData;
            $scope.advancedSearch = $scope.advancedSearchData[currentPage()];
            $scope.searchTerm = seletedSearch[0].searchTerm;
            $scope.search(true);
        });
    }
    $scope.removeSavedSearch = function (index) {
        index++;
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
            var response = result.data;
            if (!response || !response.userSetting) {
                response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
            } else {
                response.userSetting = JSON.parse(response.userSetting);
            }
            if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = {};
            if (!response.userSetting[defaultsKeyName].savedSearches) response.userSetting[defaultsKeyName].savedSearches = [];
            var savedSearches = response.userSetting[defaultsKeyName].savedSearches;
            savedSearches.splice(index, 1);
            response.userSetting[defaultsKeyName].savedSearches = savedSearches;
            response.userSetting = JSON.stringify(response.userSetting);
            $scope.recentSearches = savedSearches;
            contactDefaultsService.saveContactDefaults(response);
        });
    }
    $scope.unselectFilter = function(filterArray, filter, filterKey) {
        USL.Common.UnselectAndRemove($scope.advancedSearch[filterArray], filterKey, filter[filterKey]);
        USL.Common.UnselectAndRemove($scope.currentSearch[filterArray], filterKey, filter[filterKey]);
        $scope.filtersSelected();
        $scope.refreshSearch();
    }
    $scope.refreshSearch = function() {
        contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function(result) {
            var response = result.data;
            var settings = JSON.parse(response.userSetting);
            var savedDefaults = settings[defaultsKeyName];
            var searchData = savedDefaults.savedSearches[0];
            searchData.advancedSearchData = $scope.advancedSearchData;
            response.userSetting = JSON.stringify(settings);
            contactDefaultsService.saveDefaultsSession(response);
            if (!$scope.insideModal) {
                $scope.search(true);
            } else if($scope.insideModal == "AddProducts") {
                $scope.searchProductsModal();
            }
        });
    }
    $scope.unselectWriterRateRange = function() {
        $scope.advancedSearch.RateRange = [$scope.sliderRangeMin, $scope.sliderRangeMax];
        $scope.currentSearch.RateRange = [$scope.sliderRangeMin, $scope.sliderRangeMax];
        $scope.refreshSearch();
    }
    $scope.emptyFilter = function(name) {
        $scope.advancedSearch[name] = '';
        $scope.currentSearch[name] = '';
        $scope.refreshSearch();
    }
    $scope.filtersSelected = function () {
        var areSelected = false;
        areSelected = USL.Common.FirstSelected($scope.currentSearch.Asignees);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.Labels);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.Licensees);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.Publishers);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.RateTypes);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.LicesingMethods);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.LicenseTypes);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.LicenseStatuses);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.SpecialStatus);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.Configuration);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }
        areSelected = USL.Common.FirstSelected($scope.currentSearch.LabelGroups);
        if (areSelected) {
            $scope.showFilters = true;
            return;
        }

        if ($scope.currentSearch.filterStatusReport || $scope.currentSearch.filterPriorityReport) {
            $scope.showFilters = true;
            return;
        }


        if ($scope.currentSearch.ReleaseDateFrom || $scope.currentSearch.ReleaseDateTo || $scope.currentSearch.SignedDateFrom || $scope.SignedDateTo) {
            $scope.showFilters = true;
            return;
        }

        if ($scope.currentSearch.RateRange && $scope.currentSearch.RateRange.length == 2 && !($scope.currentSearch.RateRange[0] == $scope.sliderRangeMin && $scope.currentSearch.RateRange[1] == $scope.sliderRangeMax)) {
            $scope.showFilters = true;
            return;
        }
        $scope.showFilters = false;
    }
    $scope.showFilters = false;
    $scope.unselectPriorityReport = function () {
        $scope.advancedSearch.filterPriorityReport = false;
        $scope.filtersSelected();
        $scope.refreshSearch();
    }
    $scope.unselectStatusReport = function () {
        $scope.advancedSearch.filterStatusReport = false;
        $scope.filtersSelected();
        $scope.refreshSearch();
    }
    function checkSearchObject(o) {
        for (var property in o) {
            if (o.hasOwnProperty(property)) {
                if (typeof o[property].includeLicenseNumber === 'undefined') {
                    o[property].includeLicenseNumber = true;
                }
                if (typeof o[property].filterStatusReport === 'undefined') {
                    o[property].filterStatusReport = false;
                }
                if (typeof o[property].filterPriorityReport === 'undefined') {
                    o[property].filterPriorityReport = false;
                }
                if (typeof o[property].WritersConsentTypes === 'undefined') {
                    o[property].WritersConsentTypes = [];
                }
            }
        }
       
        return o;
    }

    $(".hasDatepicker").each(function(index, element) {
        var context = $(this);
        context.on("blur", function(e) {
            
            // The setTimeout is the key here.
            setTimeout(function() {
                if (!context.is(':focus')) {
                    $(context).datepicker("hide");
                }
            }, 250);
        });
    });

    $scope.dateOptions = {
        autoclose: true,
        clearBtn: true,
        showOnFocus: true,
        todayBtn: true,
        todayHighlight: false,
        startingDay: 0
        
        
    }

    $scope.closeOnBlur = function () {
        
        $scope.closeDateRanges();
    }
}]);

