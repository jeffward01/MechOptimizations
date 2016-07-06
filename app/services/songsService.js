app.factory('songsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var songsServiceFactory = {};

    var _getSongs = function () {
        return $http.get(serviceBase + "api/testdata");
    };

    songsServiceFactory.getSongs = _getSongs;

    return songsServiceFactory;

}]);