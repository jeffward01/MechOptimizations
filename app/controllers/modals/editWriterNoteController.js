'use strict';
app.controller('editWriterNoteController', ['$scope', 'licensesService', 'notyService', 'safeService', '$state', '$stateParams', function ($scope, licensesService, notyService, safeService, $state, $stateParams) {

    $scope.newNoteClosed = true;
    $scope.is_valid_field = USL.Common.isValidField;
    $scope.modal_submit = false;
    $scope.safeauthentication = safeService.getAuthentication();
    $scope.writer = $stateParams.writer;
    angular.forEach($scope.writer.licenseProductRecordingWriter.writerNotes,
        function(writerNote) {
            writerNote.note = writerNote.note.replace("skkk", '\'');
        });
    
    $scope.writerNotes = $stateParams.writerNotes;
    $scope.buttons = $stateParams.buttons;
    $scope.note = "";
    $scope.noteTypes = [];
    $scope.selectedNoteType = {
        noteType: 'Select Type', noteTypeId: -1
    };
    
    $scope.modifiedUI = false;
    
    $scope.getNoteTypes = function () {
        if ($scope.noteTypes.length == 0) {
            licensesService.getNoteTypes().then(function (results) {
                $scope.noteTypes = results.data;
                $scope.filterNoteTypes();
            }, function (error) {
            });
        }
    };

    $scope.clickMe = function() {
        alert("LOADED!");
    }

    $scope.ok = function () {
        $scope.modal_submit = true;
    }

    $scope.saveWriterNote = function (writer, configuration_id, writerNote, noteValue, currentWriterNoteId) {
        
        //noteValue = noteValue.toString().replace(/'/g, "");
        //noteValue = noteValue.toString().replace(/"/g, "");
    
        $scope.editOpen = false;


        $scope.modifiedUI = true;
        if (currentWriterNoteId < 1) {
            licensesService.addPRWriterLicenseNote(writer.licenseProductRecordingWriter.licenseWriterId, noteValue, configuration_id).then(function (result) {
                //                writer.licenseProductRecordingWriter.writerNotes.unshift(result.data);
                writer.licenseProductRecordingWriter.writerNotes.push(result.data);
                writer.writerAddNotesCollapsed = false;
                writer.licenseProductRecordingWriter.writerNoteCount = writer.licenseProductRecordingWriter.writerNotes.length;
                writer.licenseProductRecordingWriter.mostRecentNote = result.data.note;
                alert("Most Recent: " + writer.licenseProductRecordingWriter.mostRecentNote);
                writer.newWriterNote = "";
                notyService.success("Note added");
                writer.addNewNoteVisible = !writer.addNewNoteVisible;
            }, function (error) {
                notyService.error("Note add failed");
            });
        } else {
            alert("nested!");
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

        $scope.newNoteClosed = true;

    }

    $scope.cancelNewNote = function(writer) {
        writer.addNewNoteVisible = false;
        writer.newWriterNote = null;
        $scope.newNoteClosed = true;
    }

    $scope.editOpen = false;


    $scope.collapseWriterAddNotes = function (writer, writerNote) {
        $scope.newNoteClosed = false;
        if ($scope.editOpen === true) {
            $scope.editOpen = false;
        }
  
        writer.addNewNoteVisible = !writer.addNewNoteVisible;
        if (writerNote != null && writerNote.editNoteVisible != undefined) {
            writerNote.editNoteVisible = false;
        }
        if (writer.addNewNoteVisible) writer.newWriterNote = "";


    };

    $scope.collapseEditNote = function (writer, writerNote) {
        $scope.editOpen = !$scope.editOpen;

        writerNote.editNoteVisible = !writerNote.editNoteVisible;
        writerNote.editNoteValue = writerNote.note;
        writer.addNewNoteVisible = false;

    };


    $scope.removeWriterNote = function (writer, licenseWriterNoteId) {
        $scope.modifiedUI = true;
        notyService.modalConfirm("Are you sure you want to delete this note?").then(function () {
            licensesService.removePRWriterLicenseNote(licenseWriterNoteId).then(function (result) {
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
                var notesLength = writer.licenseProductRecordingWriter.writerNotes.length;
                writer.licenseProductRecordingWriter.writerNoteCount = notesLength;
                if (notesLength > 0) {
                    writer.licenseProductRecordingWriter.mostRecentNote = writer.licenseProductRecordingWriter.writerNotes[0].note;
                } else {
                    writer.licenseProductRecordingWriter.mostRecentNote = "";
                }
                if (writer.currentWriteNoteId == licenseWriterNoteId && writer.writerAddNotesCollapsed == true) {
                    writer.writerAddNotesCollapsed = false;
                    writer.editWriterNote = "";
                }
                notyService.success("Noted removed");

            }, function () {
                notyService.error("Noted remove failed");

            });

        });

    }















    $scope.cancel = function () {
        
        if ($scope.modifiedUI ) {
            $scope.goToParent({ writer: $scope.writer }, true);
        } else {
            $scope.goToParent({ writer: $scope.writer }, false);
        }
        
    }

    $scope.cancel = function (reload) {
        
        if (reload === true || $scope.modifiedUI ) {
            $scope.goToParent({ writer: $scope.writer }, true);
        } else {
            $scope.goToParent({ writer: $scope.writer }, false);
        }
    }
}]);