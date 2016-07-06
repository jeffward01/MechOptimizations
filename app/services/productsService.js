'use strict';
app.factory('productsService', ['$http', 'ngAuthSettings', '$state', function ($http, ngAuthSettings,$state) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var productsServiceFactory = {};

    var _getProducts = function (searchParams) {

        return $http.get(serviceBase + 'api/RECsCTRL/products').then(function (results) {
                  return results;
        });
    };

    var _getProductDetail = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/Products/GetProductDetails/' + productId;
        return $http.get(url).error(function (data, status, headers, config) {
            $state.go('SearchProducts');
            alert(error.data.message);
        })
        .then(function (response) {
            return response;
        });
    };
    
    var _searchProducts = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/PagedSearch';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getLicenses = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/products/GetLicenses/'+productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    
    var _getRecordings = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/products/GetRecordings/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    var _getProductRecordings = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/products/GetProductRecordings/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    

    //New methods for recs and works data
    var _getProductDetailsHeader = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/Products/GetProductHeader/' + productId;
        return $http.get(url).error(function (data, status, headers, config) {
        })
        .then(function (response) {
            return response;
        });
    };

    var _getProductRecsRecordings = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/products/GetProductRecsRecordings/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };
    
    var _getWorksWriters = function (worksCode) {
        var url = serviceBase + 'api/RECsCTRL/products/GetWorksWriters';
        return $http.post(url, '"' + worksCode + '"')
        .then(function (response) {
            return response;
        });
    };

    var _addNewProduct = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/AddProduct';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _artistAutosuggest = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/Artist';
        return $http.post(url, '"' + request + '"')
        //return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    
    var _productAutosuggest = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/Product';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _trackAutosuggest = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/Track';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _versionTypes = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/GetVersionTypes';
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _worksSearch = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Autosuggests/Work';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getProductTracks = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/RetrieveTracks';
        return $http.post(url, '"' + request + '"')
        //return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getLabels = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/RetrieveLabels';
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _saveProduct = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/SaveProduct';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _saveProductLink = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/SaveProductLink';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };

    var _getProductLinks = function (productId) {
        var url = serviceBase + 'api/RECsCTRL/products/GetProductLinks/' + productId;
        return $http.get(url)
        .then(function (response) {
            return response;
        });
    };

    var _getTrackDetails = function (request) {
        var url = serviceBase + 'api/RECsCTRL/products/RetrieveTrack';
        return $http.post(url, request)
        //return $http.post(url, '"' + trackId + '"')
        .then(function (response) {
            return response;
        });
    };

    var _deleteProductLink = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/DeleteProductLink';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    };
    var _getTrackTypes = function (request) {
        var url = serviceBase + '/api/LookUpCTRL/TrackType';
        return $http.get(url)
       .then(function (response) {
           return response;
       });
    }

    var _updateProductPriority = function (request) {
        var url = serviceBase + 'api/RECsCTRL/Products/UpdateProductPriority';
        return $http.post(url, request)
        .then(function (response) {
            return response;
        });
    }

    productsServiceFactory.getProducts = _getProducts;
    productsServiceFactory.getProductDetail = _getProductDetail;
    productsServiceFactory.searchProducts = _searchProducts;
    productsServiceFactory.getLicenses = _getLicenses;
    productsServiceFactory.getRecordings = _getRecordings;
    productsServiceFactory.getProductRecordings = _getProductRecordings;
    
    productsServiceFactory.getProductDetailsHeader = _getProductDetailsHeader;
    productsServiceFactory.getProductRecsRecordings = _getProductRecsRecordings;
    productsServiceFactory.getWorksWriters = _getWorksWriters;
    productsServiceFactory.addNewProduct= _addNewProduct;
    productsServiceFactory.artistAutosuggest = _artistAutosuggest;
    productsServiceFactory.productAutosuggest = _productAutosuggest;
    productsServiceFactory.trackAutosuggest = _trackAutosuggest;
    productsServiceFactory.worksSearch = _worksSearch;
    productsServiceFactory.getProductTracks= _getProductTracks;
    productsServiceFactory.getLabels = _getLabels;
    productsServiceFactory.saveProduct = _saveProduct;
    productsServiceFactory.saveProductLink = _saveProductLink;
    productsServiceFactory.getProductLinks = _getProductLinks;
    productsServiceFactory.getTrackDetails = _getTrackDetails;
    productsServiceFactory.deleteProductLink = _deleteProductLink;
    productsServiceFactory.getTrackTypes = _getTrackTypes;
    productsServiceFactory.updateProductPriority = _updateProductPriority;
    productsServiceFactory.getVersionTypes = _versionTypes;
    return productsServiceFactory;

}]);