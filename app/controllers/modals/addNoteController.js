'use strict';
app.controller('addNoteController', ['$scope', '$modalInstance', 'licensesService', 'data', 'notyService', 'safeService', function ($scope, $modalInstance, licensesService, data, notyService, safeService) {
    $scope.note = "";
    //$scope.noteTypes = getNoteTypes(); || Turned off for now, load note types upfront
    $scope.noteTypes = [];
    
    $scope.selectedNoteType = {
        noteType: 'Select Type', noteTypeId: -1
    };

    $scope.getNoteTypes = function () {
        if ($scope.noteTypes.length == 0) {
            licensesService.getNoteTypes().then(function (results) {
                $scope.noteTypes = results.data;
                $scope.filterNoteTypes();
            }, function (error) {
            });
        }

    };

    function getNoteTypes (){
            licensesService.getNoteTypes().then(function(results) {
                $scope.noteTypes = results.data;
                $scope.filterNoteTypes();
            }, function(error) {
            });
    };

    $scope.filterNoteTypes = function () {
        //if Executed or Issued 
        if (data.licenseStatusId == 5 || data.licenseStatusId == 6) {
            var currentNoteTypes = $scope.noteTypes;
            $scope.noteTypes = [];
            if (currentNoteTypes.length > 0) {
                angular.forEach(currentNoteTypes, function (noteTypes) {
                    if (noteTypes.noteType.toLowerCase() == 'internal' || noteTypes.noteType.toLowerCase() == 'priority') {
                        $scope.noteTypes.push(noteTypes);
                    }
                });
            }
        }
    };

    $scope.selectNoteType = function(p) {
        $scope.selectedNoteType = p;
    };

    $scope.is_valid_field = USL.Common.isValidField;
    $scope.modal_submit = false;

    $scope.safeauthentication = safeService.getAuthentication();

    $scope.ok = function() {

        $scope.modal_submit = true;

        if ($scope.note && $scope.selectedNoteType.noteTypeId != -1) {
            licensesService.addLicenseNote(data.licenseId, $scope.note, $scope.safeauthentication.contactId, $scope.selectedNoteType.noteTypeId).then(function (result) {
                result.data.selected = false;
                result.data.displayNote = true;
                    data.licenseNoteList.push(result.data);
                    notyService.success("Note added");
                    $modalInstance.dismiss('cancel');
                }, function(error) {
                    notyService.error("Error adding note");
                    $modalInstance.dismiss('cancel');
                });

        }
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);