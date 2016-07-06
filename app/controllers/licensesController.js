'use strict';
app.controller('licensesController', ['$scope', 'licensesService','licenseProductsService', 'contactsService', '$modal', '$stateParams', 'localStorageService', 'licenseesService', 'labelsService', 'prioritiesService', 'contactDefaultsService', 'licenseMethodsService', 'rateTypesService', '$filter', '$state', 'safeService', function ($scope, licensesService, licenseProductsService, contactsService, $modal, $stateParams, localStorageService, licenseesService, labelsService, prioritiesService, contactDefaultsService, licenseMethodsService, rateTypesService, $filter, $state, safeService) {
    var localStorageOptions = "LICENSE_SEARCH_OPTIONS";
    var currentPage = "licenseSearch";
    var maxSavedSearches = 8;
    var defaultsKeyName = "SEARCH_PAGE";
    $scope.safeauthentication = safeService.getAuthentication();
    $scope.licenses = [];
    $scope.test = "";
    $scope.filteredLicenses = [];
    $scope.canChangePage = false;//changePage gets called with page 1 bug
    //$scope.maxSize = 5;
    $scope.pagination = {
        currentPage: 1,
        totalItems: 0,
        numPerPage: 10,
        maxSize: 5,
        pageSizeList: [10, 20, 50, 100],
        isCollapsed: true
    }

    $scope.loadPagination($scope.currentPage(), $scope.pagination);
    $scope.sortArrow = "caret";
    $scope.labelSuggest = "";
    $scope.publisherSuggest = "";
    $scope.selectAllLicenses = function (currentLicenses) {
        var allSelected = !$filter('isAllSelected')(currentLicenses);
        $filter('selectAll')(currentLicenses, allSelected);

    }
    $scope.recentLimit = maxSavedSearches;
    $scope.isMyView = false;
    $scope.hiddenColumns = [];
    $scope.columns = [];
    $scope.searchParameters = function () {
        var sliderRangeDefault = function() {
            return $scope.sliderRangeMin == $scope.currentSearch.RateRange[0] && $scope.sliderRangeMax == $scope.currentSearch.RateRange[1]
        }
        var advancedOpt = $scope.currentSearch;
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
            LabelGroups: USL.Common.SingleFieldArray(advancedOpt.LabelGroups, 'id', true),
            Labels: USL.Common.SingleFieldArray(advancedOpt.Labels, 'id', true),
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
            SignedDateTo: advancedOpt.SignedDateTo,
            Configurations: USL.Common.SingleFieldArray(advancedOpt.Configuration, 'id', true),
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
                $scope.sortBy = angular.undefined;
                $scope.sortOrder = angular.undefined;
                $scope.sortArrow = angular.undefined;
            }
        }
        $scope.searchLicenses(true);
    }
    $scope.changePageSize = function (pageSize) {
        $scope.pagination.numPerPage = pageSize;
        $scope.searchLicenses();
    }
    $scope.pageChanged = function () {
        //  var begin = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage)
        //  , end = begin + $scope.pagination.numPerPage;
        //$scope.filteredLicenses = $scope.licenses.slice(begin, end);
        if ($scope.canChangePage) {
            $scope.searchLicenses();
        } else {
            $scope.loadPagination($scope.currentPage(), $scope.pagination);
        }
    };

    $scope.createParams = function() {
        if ($scope.pagination.numPerPage != 10 || $scope.pagination.currentPage != 1) {
            return $scope.pagination.currentPage + "-" + $scope.pagination.numPerPage;
        }
        return null;
    }
    $scope.searchLicenses = function () {
        licensesService.searchLicenses($scope.searchParameters()).then(function (result) {
            var response = result.data;
            angular.forEach(response.results, function(license) {
                license.selected = false;               
            });
            $scope.licenses = response.results;

            $scope.allLicenses = $scope.licenses.concat($scope.licensesInbox);            

            $scope.filteredLicenses = $scope.licenses.slice(0, $scope.pagination.numPerPage);
            $scope.pagination.totalItems = response.total;
            $scope.pagination.numPages = Math.ceil($scope.licenses.length / $scope.pagination.numPerPage);
            $scope.filtersSelected();
            $scope.savePagination($scope.currentPage(), $scope.pagination);
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
    $scope.search = function() {
        $scope.pagination.currentPage = 1;
        $scope.searchLicenses();
    }
    $scope.check = function (isCollapsed, liceseId, currentLicenses) {
        if (isCollapsed) {
            licenseProductsService.getLicenseProducts(liceseId).then(function (result) {
                var response = result.data;
                angular.forEach(currentLicenses, function (license) {
                    if (license.licenseId == liceseId) {
                        license.products = result.data;
                    }
                });

            });
        }
            };
    $scope.setCaret = function (collapsed) {
        if (collapsed == true) {
            return "caret";
        }
        else {
            return "caret caret-up";
        }
    }
    //modal
    $scope.openModal = function (size,caller) {
        var rootScope = $scope;
        var modalInstance = $modal.open({
            templateUrl: 'app/views/partials/modal-AssignPriority.html',
            controller: 'assignPriorityController',
            size: size,
            resolve: {
                data: function () {
                    return $scope.allLicenses;
                },
                caller: function () {
                    caller: caller;
                }

            }
        });

        modalInstance.result.then(function (selectedItem) {
            rootScope.searchLicenses();
            if ($scope.safeauthentication != null) {
                getInboxLicenses($scope.safeauthentication.contactId);
            }
        }, function () {

        });
    };

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

    $scope.selectedLicenseCount = function () {
        var count = 0;
        angular.forEach($scope.licenses, function (license) {
            if (license.selected == true) {
                count++;
            }
        });
        return count;
    }
    //emit for global scope
  
    //$scope.initialSearch();
     $scope.showHideColumn = function (col, event) {
         if (col.isDefault) return;
         if (event.target.nodeName != "INPUT") col.selected = !col.selected;
         if (!col.selected) {
             $scope.hiddenColumns.push(col);
         } else {
             USL.Common.FindAndRemove($scope.hiddenColumns, 'key', col.key);
         }

     }
     $scope.editColumnsDropdown = function (open) {
         if (!open) {
             saveEditColumnsSettings();
         }
     }
     $scope.isEditColumnsCollapsed = true;


    $scope.licensesInbox = [];
    function init() {
        $scope.$emit('licensesControllerLoaded', $scope);
        if ($scope.safeauthentication != null) {
            getInboxLicenses($scope.safeauthentication.contactId);
        }
        loadDefaultColumns();
        
    }

    function getInboxLicenses(contactId) {

        if (contactId != null) {
            licensesService.searchInboxLicenses(contactId).then(function(result) {

                var response = result.data;
                angular.forEach(response, function (license) {
                    license.selected = false;    
                });
                $scope.licensesInbox = response;

                },
                function(response) {
                    var errors = [];
                    for (var key in response.data.modelState) {
                        for (var i = 0; i < response.data.modelState[key].length; i++) {
                            errors.push(response.data.modelState[key][i]);
                        }
                    }
                });
        }
    }

    function loadDefaultColumns() {
        var name = $scope.currentPage() + "editColums";
         contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
             var response = result.data;
             var settings = null;
             if (response && response.userSetting) {
                 settings = JSON.parse(response.userSetting);
             } else {
                 return;
             }
             if (settings[defaultsKeyName] && settings[defaultsKeyName][name]) {
                 $scope.hiddenColumns = settings[defaultsKeyName][name];
             }
         });
     }

     function saveEditColumnsSettings() {
         var name = $scope.currentPage() + "editColums";
         contactDefaultsService.getContactDefaults($scope.getSafeContactId()).then(function (result) {
             var response = result.data;
             if (!response || !response.userSetting) {
                 response = USL.Common.CreateEmptyDefaults($scope.getSafeContactId());
             } else {
                 response.userSetting = JSON.parse(response.userSetting);
             }
             if (!response.userSetting[defaultsKeyName]) response.userSetting[defaultsKeyName] = { };
             response.userSetting[defaultsKeyName][name] = $scope.hiddenColumns;
             response.userSetting = JSON.stringify(response.userSetting);
             contactDefaultsService.saveContactDefaults(response);
         });
     }

    init();
}]);

