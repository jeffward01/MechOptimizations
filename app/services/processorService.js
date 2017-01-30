'use strict';
app.factory('processorService', ['$http', 'ngAuthSettings', '$state', 'localStorageService', function ($http, ngAuthSettings, $state, localStorageService) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var serviceProcessorBase = serviceBase + "api/serviceController/";
    var processorFactory = {};

    var _restartDataHarmonizingProcessor = function () {
        var url = serviceProcessorBase + "RestartDataHarmonizingProcessor";
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    };

    var _restartSolrProcessor = function () {
        var url = serviceProcessorBase + "RestartSolrProcessor";
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    };


    var _isAdmin = function (contactId) {
        var url = serviceProcessorBase + "IsAdmin/" + contactId;
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    };


    var _getProcessorsRestarting = function() {
        var url = serviceProcessorBase + "GetRestartInProgress";
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    }

    var _checkIfInProcess = function (processorName) {
        var processorsInProgrss = _getProcessorsRestarting().then(function (result) {
           return result.data;
        });
        if (processorsInProgrss.length > 0) {
            angular.forEach(processorsInProgrss,
                function (entry) {
                    if (entry.ProcessorName === processorName) {
                        return true;
                    }
                });
            return false;
        }
    }

    var _restartLicenseProcessor = function () {
        var url = serviceProcessorBase + "RestartLicenseProcessor";
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    };

    var _restartProcessor = function(processorName) {
        var url = serviceProcessorBase + "RestartProcessor/" + processorName;
        return $http.get(url, {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    }

    var _getAllLicenseProcessorStatus = function () {
        var url = serviceProcessorBase + "GetAllProcessorStatus";
        return $http.get(url,  {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });
    };


    var _getProcessorStatus = function (processorName) {
        var url = serviceProcessorBase + "GetProcessorStatus/" + processorName;
        return $http.get(url,  {
            ignoreLoadingBar: true
        })
        .then(function (response) {
            return response;
        });

    };

    var _getSolrFailedItems = function() {
        var url = serviceProcessorBase + "SolrFailedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function(response) {
                return response.data;
            });
    };


    var _getSolrUnProcessedItems = function () {
        var url = serviceProcessorBase + "SolrUnProcessedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    };
    
    var _getLicenseFailedItems = function () {
        var url = serviceProcessorBase + "LicenseFailedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    };


    var _getLicenseUnProcessedItems = function () {
        var url = serviceProcessorBase + "LicenseUnProcessedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    };



    var _getDataHarmonizationFailedItems = function () {
        var url = serviceProcessorBase + "DataHarmonizingFailedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    };

    var _getDataHarmonizationUnProcessedItems = function () {
        var url = serviceProcessorBase + "DataHarmonizingUnProcessedItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    };

    //-------------

    var _setAllUnProcessedSolrItemsToPending = function() {
        var url = serviceProcessorBase + "SetAllUnProcessedSolrItemsToPending";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _deleteAllUnProcessedSolrItems = function () {
        var url = serviceProcessorBase + "DeleteAllUnProcessedSolrItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _setSingleUnProcessedSolrItemToPending = function (id) {
        var url = serviceProcessorBase + "SetSingleUnProcessedSolrItemToPending/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _deleteSingleUnProcessedSolrItem = function (id) {
        var url = serviceProcessorBase + "DeleteSingleUnProcessedSolrItem/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _setAllUnProcessedDHItemsToPending = function (id) {
        var url = serviceProcessorBase + "SetAllUnProcessedDHItemsToPending";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _deleteAllUnProcessedDHItems = function (id) {
        var url = serviceProcessorBase + "DeleteAllUnProcessedDHItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _setSingleUnProcessedDHItemToPending = function (id) {
        var url = serviceProcessorBase + "SetSingleUnProcessedDHItemToPending/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _deleteAllFailedLicenseItems = function (id) {
        var url = serviceProcessorBase + "DeleteAllFailedLicenseItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _deleteAllUnProcessedLicenseItems = function (id) {
        var url = serviceProcessorBase + "DeleteAllUnProcessedLicenseItems";
        return $http.get(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _setSingleUnProcessedLicenseItemToPending = function (id) {
        var url = serviceProcessorBase + "SetSingleUnProcessedLicenseItemToPending/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _deleteSingleUnProcessedLicenseItem = function (id) {
        var url = serviceProcessorBase + "DeleteSingleUnProcessedLicenseItem/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _setAllFailedDhItemsToPending = function() {
        var url = serviceProcessorBase + "SetAllFailedDhItemsToPending";
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _setAllFailedSolrItemsToPending = function () {
        var url = serviceProcessorBase + "SetAllFailedSolrItemsToPending";
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }

    var _deleteAllFailedSolrItems = function () {
        var url = serviceProcessorBase + "DeleteAllFailedSolrItems";
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }


    var _deleteSingleDhItem = function (id) {
        var url = serviceProcessorBase + "DeleteSingleDhItem/" + id;
        return $http.post(url,
            {
                ignoreLoadingBar: true
            })
            .then(function (response) {
                return response.data;
            });
    }
    processorFactory.restartsInProgress = _getProcessorsRestarting;
    processorFactory.restartDataHarmonizingProcessor = _restartDataHarmonizingProcessor;
    processorFactory.restartSolrProcessor = _restartSolrProcessor;
    processorFactory.restartLicenseProcessor = _restartLicenseProcessor;
    processorFactory.restartProcessor = _restartProcessor;
    processorFactory.getAllProcessorStatus = _getAllLicenseProcessorStatus;
    processorFactory.getProcessorStatus = _getProcessorStatus;
    processorFactory.checkIfRestartInProgress = _checkIfInProcess;
    processorFactory.isAdmin = _isAdmin;
    processorFactory.getSolrUnProcessed = _getSolrUnProcessedItems;
    processorFactory.getSolrFailed = _getSolrFailedItems;
    processorFactory.getDhFailed = _getDataHarmonizationFailedItems;
    processorFactory.getDhUnProcessed = _getDataHarmonizationUnProcessedItems;
    processorFactory.getLicenseUnProcessed = _getLicenseUnProcessedItems;
    processorFactory.getLicenseFailed = _getLicenseFailedItems;
    processorFactory.setAllUnProcessedSolrItemsToPending = _setAllUnProcessedSolrItemsToPending;
    processorFactory.deleteAllUnprocesedSolrItems = _deleteAllUnProcessedSolrItems;
    processorFactory.setSingleSolrItemToPending = _setSingleUnProcessedSolrItemToPending;
    processorFactory.deleteSingleUnProcessedSolrItem = _deleteSingleUnProcessedSolrItem;
    processorFactory.setAllUnProcessedDHItemsToPending = _setAllUnProcessedDHItemsToPending;
    processorFactory.deleteAllUnProcessedDHItems = _deleteAllUnProcessedDHItems;
    processorFactory.setSingleUnProcessedDHItemToPending = _setSingleUnProcessedDHItemToPending;
    processorFactory.deleteAllFailedLicenseItems = _deleteAllFailedLicenseItems;
    processorFactory.deleteAllUnProcessedLicenseItems = _deleteAllUnProcessedLicenseItems;
    processorFactory.setSingleUnProcessedLicenseItemToPending = _setSingleUnProcessedLicenseItemToPending;
    processorFactory.deleteSingleUnProcessedLicenseItem = _deleteSingleUnProcessedLicenseItem;
    processorFactory.setAllFailedDhItemsToPending = _setAllFailedDhItemsToPending;
    processorFactory.setAllFailedSolrItemsToPending = _setAllFailedSolrItemsToPending;
    processorFactory.deleteAllFailedSolrItems = _deleteAllFailedSolrItems;
    processorFactory.deleteSingleDhItem = _deleteSingleDhItem;




    return processorFactory;

}]);