'use strict';
app.controller('addWriterNoteController', ['$scope', 'licensesService', 'notyService', 'safeService', '$state', '$stateParams', function ($scope, licensesService, notyService, safeService, $state, $stateParams) {

    $scope.is_valid_field = USL.Common.isValidField;
    $scope.modal_submit = false;

    $scope.safeauthentication = safeService.getAuthentication();
    $scope.writer = $stateParams.writer;

    $scope.note = "";
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

    $scope.selectNoteType = function (p) {
        $scope.selectedNoteType = p;
    };


    $scope.ok = function () {
        $scope.modal_submit = true;

        //if ($scope.note && $scope.selectedNoteType.noteTypeId != -1) {
        //    licensesService.addLicenseNote(data.licenseId, $scope.note, $scope.safeauthentication.contactId, $scope.selectedNoteType.noteTypeId).then(function (result) {
        //        result.data.selected = false;
        //        result.data.displayNote = true;
        //        data.licenseNoteList.push(result.data);
        //        notyService.success("Note added");
        //        $modalInstance.dismiss('cancel');
        //    }, function (error) {
        //        notyService.error("Error adding note");
        //        $modalInstance.dismiss('cancel');
        //    });

        //}
    }

    $scope.saveWriterNote = function (writer, configuration_id, writerNote, noteValue, currentWriterNoteId) {

        //noteValue = noteValue.toString().replace(/'/g, "");
        //noteValue = noteValue.toString().replace(/"/g, "");

        if (currentWriterNoteId < 1) {
            licensesService.addPRWriterLicenseNote(writer.licenseProductRecordingWriter.licenseWriterId, noteValue, configuration_id).then(function (result) {
                writer.licenseProductRecordingWriter.writerNotes.unshift(result.data);
                writer.writerAddNotesCollapsed = false;
                writer.licenseProductRecordingWriter.writerNoteCount = writer.licenseProductRecordingWriter.writerNotes.length;
                writer.licenseProductRecordingWriter.mostRecentNote = result.data.note;
                writer.newWriterNote = "";
                notyService.success("Note added");
                writer.addNewNoteVisible = !writer.addNewNoteVisible;
                var reload = true;
                $scope.cancel(reload);
            }, function (error) {
                console.log("ERROR: "+error);
                notyService.error("Note add failed");
            });
        } else {
            licensesService.editPRWriterLicenseNote(writer.licenseProductRecordingWriter.licenseWriterId, noteValue, configuration_id, currentWriterNoteId).then(function (result) {
                var writerNotes = writer.licenseProductRecordingWriter.writerNotes;
                var index = -1;
                for (var i = 0, len = writerNotes.length; i < len; i++) {
                    if (writerNotes[i].licenseWriterNoteId === result.data.licenseWriterNoteId) {
                        index = i;
                        break;
                    }
                }

                if (index > -1) {
                    writer.licenseProductRecordingWriter.writerNotes.splice(index, 1);
                }
                writer.licenseProductRecordingWriter.writerNotes.unshift(result.data);
                writer.licenseProductRecordingWriter.mostRecentNote = result.data.note;
                writerNote.editNoteVisible = !writerNote.editNoteVisible;
                notyService.success("Note edited successfuly");
            }, function (error) {
                notyService.error("Note edit failed");
            });
        }


    }


    $scope.cancel = function () {
        $scope.goToParent({ writer: $scope.writer }, false);
    }

    $scope.cancel = function (reload) {
        if (reload === true) {
            $scope.goToParent({ writer: $scope.writer }, true);
        } else {
            $scope.goToParent({ writer: $scope.writer }, false);
        }
    }
}]);