'use strict';
app.controller('appManagementController',
[
    '$scope', 'licenseesService', 'contactsService', 'safeService', 'notyService', '$filter', 'processorService', '$timeout', '$interval','$state',
    function ($scope, licenseesService, contactsService, safeService, notyService, $filter, processorService, $timeout, $interval, $state) {
        $scope.safeauthentication = safeService.getAuthentication();
        checkUser();

        $scope.processorInfo = {};

        fillProcessorData();

        $interval(function() {
                fillProcessorData();
            },
            5000);

        $scope.viewProcessorEntries = function (processorName) {
            
            $state.go('ProcessorEntries', { processorName: processorName });
            console.log("FIRED");
        }

        $scope.restartAllProcessors = function() {
            angular.forEach($scope.processorInfo,
                function(entry) {
                    $scope.restartProcessor(entry.serviceName);
                });
        }



        $scope.restartProcessor = function (processorName) {
            markProcessorAsRestarting(processorName);
            processorService.restartProcessor(processorName);
          //  checkOnRestartStatus(processorName);
        }

        function isInArray(needle, haystack) {
            angular.forEach(haystack,
                function (entry) {
                    if (entry.serviceName === needle) {
                        return true;
                    }
                });
            return false;
        }



        function checkOnRestartStatus(processorName) {
            var result = true;
            var processorsInProgress = {};
            var processorCheck = $interval(function() {
                processorService.restartsInProgress(processorName).then(function (inProgress) {
                    processorsInProgress = inProgress;
                    angular.forEach(processorsInProgress,
                        function(entry) {

                            if (entry.ProcessorName === processorName) {
                                result = true;
                            }

                        });
                    


                    console.log(processorName + " is still restarting.");
                });
                if (!isInArray(processorName, processorsInProgress)) {
                    console.log(processorName + " has finished restarting.");
                    finalizeRestart(processorName);
                    $interval.cancel(processorCheck);
                }
            },5000);
        }



        function finalizeRestart(processorName) {
            markProcessorAsFinalized(processorName);
            fillProcessorData();
        }




        function markProcessorAsRestarting(processorName) {
            angular.forEach($scope.processorInfo,
                function (entry) {
                    if (entry.serviceName === processorName) {
                        entry.restartInProgress = true;
                    }
                });
        }

        function markProcessorAsFinalized(processorName) {
            angular.forEach($scope.processorInfo,
                function(entry) {
                    if (entry.serviceName === processorName) {
                        entry.restartInProgress = false;
                    }
                });

        }

        function getProcessor(processorName) {
            angular.forEach($scope.processorInfo, function(entry) {
                if (entry.serviceName === processorName) {
                    return entry;
                }
            })
        }


        function fillProcessorData() {
             processorService.getAllProcessorStatus().then(function(result) {
                 $scope.processorInfo = result.data;
                 angular.forEach($scope.processorInfo,
                     function(processor) {
                         processor.restartInProgress = false;
                     });
             });
          
        }
       function checkUser() {
            try {
                if ($scope.safeauthentication.roleId < 3) {
                    var currentUrl = window.location.href.toLowerCase();
                    var newUrl = currentUrl.replace("#/superAdmin", "");
                    window.location.href = newUrl;
                }
            } catch (e) {
                goToLogIn();
            }
        };

        function goToLogIn() {
            var currentUrl = window.location.href.toLowerCase();
            var newUrl = currentUrl.replace("#/superAdmin", "#/login");
            window.location.href = newUrl;
        }

    }
]);