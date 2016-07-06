app.controller('viewSongsController', ['$scope', 'songsService', function ($scope, songsService) {
    $scope.songs = {};

    function initLoad() {
        songsService.getSongs().then(function (result) {
            if(result)
            $scope.songs = result.data;
        }, function () {
            $scope.errors = "Song can't be loaded at the moment.";
        });
    }
    initLoad();
    $scope.editMode = function (data) {
        data.IsEdit = true;
        $scope.$broadcast('refreshSongs');
    }

}]);
