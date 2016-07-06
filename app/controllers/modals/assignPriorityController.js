'use strict';
app.controller('assignPriorityController', ['$scope', '$modalInstance', 'prioritiesService', 'contactsService', 'licensesService', 'data', 'caller', 'safeService', function ($scope, $modalInstance, prioritiesService, contactsService, licensesService, data, caller, safeService) {
    
    $scope.safeauthentication = safeService.getAuthentication();
    $scope.caller = caller;
    $scope.selectedAssignee = { fullName: "Select Assignee" };
    $scope.note = "";
    $scope.selectedPriority = {
            priority: 'Select priority', priorityId:-1
        };
        $scope.contacts = [];
        $scope.priorities = [];
        $scope.data = data;

        $scope.getAssignees = function () {
            if ($scope.contacts.length == 0) {
                contactsService.getAssignees().then(function (results) {
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
                    //removing the "Inbox" priority
                    $scope.priorities.pop();
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
         var selectedLicensesIds = new Array();
            if (typeof $scope.selectedAssignee.contactId == 'undefined' && $scope.selectedPriority.priorityId == -1) {
                return;
            }else{
            if (($scope.caller) && ($scope.caller == 'LicenseDetails')) {
                    selectedLicensesIds.push($scope.data[0].licenseId);
                }
                else {
                    //var selectedLicensesIds = USL.Common.SingleFieldArray($scope.data, 'licenseId', true);
                    selectedLicensesIds = USL.Common.SingleFieldArray($scope.data, 'licenseId', true);
                }
            licensesService.updateLicensesAsignee($scope.selectedAssignee.contactId, $scope.selectedPriority.priorityId, selectedLicensesIds, $scope.note, $scope.safeauthentication.contactId).then(function (result) {
                    $modalInstance.close();
                }, function(error) {});
                
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    
}]);