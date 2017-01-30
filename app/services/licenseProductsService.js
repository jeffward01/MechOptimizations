'use strict';
app.factory('licenseProductsService', ['$http', 'ngAuthSettings', '$state',  function ($http, ngAuthSettings, $state) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var licenseProductsServiceFactory = {};

    var _getProducts = function (licenseId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetProductsNew/' + licenseId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _getRecsDataChangesFast = function (products, licenseId) {
        var url = serviceBase + 'api/dataHarmonCTRL/methods/FindOutOfSyncRecItems/' + licenseId;
        console.log("Sent Request to Data Harmonization Sync");
        return $http.post(url,products, 
            {
                ignoreLoadingBar: true
            })
        .then(function (response) {
            return response.data;
        });
    };



    var _getCatalogNumber = function(productConfigId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetCatalogNumber/' + productConfigId;
        return $http.get(url)
            .then(function(response) {
                return response;
            });
    }

    var _findTrackDifferences = function(requestObj, licenseId) {
        var url = serviceBase + 'api/dataHarmonCTRL/methods/GetTrackDifferences/' + licenseId;
        console.log("Sent Request to Data Harmonization - Track Differences - Sync");

  

        return $http.post(url, requestObj,
            {
                ignoreLoadingBar: true
            })
        .then(function (response) {
            return response.data;
        });
    };
    

    //products in the license and products not in the license
    var _deleteLicenseProduct = function (licenseId, productId) {
        if (licenseId === null) {
            licenseId = 0;
        }
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/DeleteLicenseProduct/' + licenseId + '/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };


    //products in the license and products not in the license
    var _getSelectedProduct = function (licenseId,productId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetSelectedProduct/' + licenseId + '/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    //todo: to be deleted.. not used
    //var _getRecordings = function (productId) {
    //    var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetRecordings/' + productId;
    //    return $http.get(url)
    //    .then(function (response) {
    //        return response;
    //    });
    //};
    //todo: to be deleted.. not used
    //var _getRecordingsList = function (licenseProductIds) {

    //    var request = {
    //        licenseProductIds: licenseProductIds
    //    };
    //    var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseRecordingsList/';
    //    return $http.post(url, licenseProductIds)
    //    .then(function (response) {
    //        return response;
    //    });


    //};
    //todo: to be deleted.. not used
    //var _getLicenseProducts = function (licenseId) {
    //    var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseProductDropDown/' + licenseId;
    //    return $http.get(url)
    //    .then(function (response) {
    //        return response;
    //    });
    //};

    var _updateLicenseProducts = function (licenseId, productsIds) {
        var request = {
            licenseId: licenseId,
            licenseProducts: productsIds
        };
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/UpdateLicenseProducts';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    //toDo: to be deleted!!!
    //var _getLicenseWriters = function (recordingId, worksCode) {
    //    var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseWriters/' + recordingId;
    //    return $http.post(url,'"' + worksCode + '"')
    //    .then(function (response) {
    //        return response;
    //    });
    //};

    var _getLicenseWritersList = function (licenseRecordingIds) {

        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseWriterList';
        return $http.post(url, licenseRecordingIds)
        .then(function (response) {
            return response;
        });
    };

    var _getLicenseWritersStatusList = function (licenseWriterIds) {

        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseWriterStatusList';
        return $http.post(url, licenseWriterIds)
        .then(function (response) {
            return response;
        });
    };

    //
    var _getRecordingsV2 = function (productId, safeId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseProductRecordingsV2/' + productId;
        return $http.post(url, '"' + safeId + '"')
        .then(function (response) {
            return response;
        });
    };
    
    var _getLicenseWritersV2 = function (recordingId, worksCode) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseWritersV2/' + recordingId;
        return $http.post(url, '"' + worksCode + '"')
        .then(function (response) {
            return response;
        });
    };
    
    //methods used for the edit rates modal
    var _getLicenseIds = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetAllLicenseRecordingRelatedIds';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _getTracksDropDown = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseProductRecordingsDropdown';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _getWritersDropDown = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicenseProductWritersDropdown';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _getWritersNo = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetWritersNoForEditRates';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _editRates = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/EditRates';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _editIndividualRates = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/EditIndividualRates';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _getLicensePreview = function (licenseId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetLicensePreview/' + licenseId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    var _getYears = function () {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetYearsForEditRates';
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    
    var _updateProductsSchedule = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/UpdateLicenseProductSchedule';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _editPaidQuarter = function (request) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/EditPaidQuarter';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getWriterNotes = function(licenseWriterId) {
        var url = serviceBase + 'api/licenseProductCTRL/licenseproducts/GetWriterNotes/' + licenseWriterId;
        return $http.get(url)
            .then(function(response) {
                return response;
            });
    }
    
    licenseProductsServiceFactory.getRecsDataChangesFast = _getRecsDataChangesFast;
    licenseProductsServiceFactory.getTrackDifferences = _findTrackDifferences;
    licenseProductsServiceFactory.getCatalogNumber = _getCatalogNumber;
    licenseProductsServiceFactory.getLicenseProducts = _getProducts;
    licenseProductsServiceFactory.getWriterNotes = _getWriterNotes;
    //licenseProductsServiceFactory.getLicenseProductsDropdown = _getLicenseProducts;

    //licenseProductsServiceFactory.getLicenseProductRecordings = _getRecordings;
    licenseProductsServiceFactory.updateLicenseProducts = _updateLicenseProducts;
    //licenseProductsServiceFactory.getLicenseWriters = _getLicenseWriters;
    licenseProductsServiceFactory.getLicenseWritersList = _getLicenseWritersList;
    licenseProductsServiceFactory.getLicenseWritersStatusList = _getLicenseWritersStatusList;
    licenseProductsServiceFactory.updateProductsSchedule = _updateProductsSchedule;
    //used for edit rates modal
    licenseProductsServiceFactory.getLicenseIds = _getLicenseIds;
    licenseProductsServiceFactory.getTracksDropDown = _getTracksDropDown;
    licenseProductsServiceFactory.getWritersDropDown = _getWritersDropDown;
    licenseProductsServiceFactory.getWritersNo = _getWritersNo;
    licenseProductsServiceFactory.editRates = _editRates;
    licenseProductsServiceFactory.editIndividualRates = _editIndividualRates;

   //new methods with recs data (upside down)
    licenseProductsServiceFactory.getLicenseProductRecordingsV2 = _getRecordingsV2;
    licenseProductsServiceFactory.getLicenseWritersV2 = _getLicenseWritersV2;

    //edit configs modal from add products config modal
    licenseProductsServiceFactory.getSelectedProduct = _getSelectedProduct;

    // delete product from License
    licenseProductsServiceFactory.deleteLicenseProduct = _deleteLicenseProduct;
    
    //get license preview
    licenseProductsServiceFactory.getLicensePreview = _getLicensePreview;
    licenseProductsServiceFactory.getYears = _getYears;
    
    licenseProductsServiceFactory.editPaidQuarter = _editPaidQuarter;

    return licenseProductsServiceFactory;

}]);