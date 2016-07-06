'use strict';
app.controller('editNoteController', ['$scope', '$modalInstance', 'licensesService', 'data', 'licenseData', function ($scope, $modalInstance, licensesService, data, licenseData) {
    $scope.licenseNote = data[0];
    $scope.note = $scope.licenseNote.note;
    //$scope.noteTypes = getNoteTypes(); || Turned off for now, load Note types upfront
    $scope.noteTypes = [];
    $scope.selectedNoteType = {
        noteType: $scope.licenseNote.noteType.noteType, noteTypeId: $scope.licenseNote.noteType.noteTypeId
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

    function getNoteTypes() {
        licensesService.getNoteTypes().then(function (results) {
            $scope.noteTypes = results.data;
            $scope.filterNoteTypes();
        }, function (error) {
        });
    };

    $scope.filterNoteTypes = function () {
        //if Executed or Issued
        if (licenseData.licenseStatusId == 5 || licenseData.licenseStatusId == 6) {
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

    $scope.selectNoteType = function (p) {
        $scope.selectedNoteType = p;
    };


    $scope.ok = function () {
        if ($scope.note && $scope.selectedNoteType.noteTypeId != -1) {
            noty({
                text: "Are you sure you want to edit this note?",
                type: 'confirm',
                modal: true,
                timeout: 5000,
                layout: "center",
                buttons: [
            {
                addClass: 'btn-default', text: 'Ok', onClick: function ($noty) {
                    $scope.licenseNote.note = $scope.note;
                    $scope.licenseNote.noteType = $scope.selectedNoteType;
                    $scope.licenseNote.noteTypeId = $scope.selectedNoteType.noteTypeId;
                    licensesService.editLicenseNote($scope.licenseNote).then(function (result) {
                        $modalInstance.close();
                    }, function (error) { });
                    $noty.close();

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
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);