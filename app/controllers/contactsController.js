'use strict';
app.controller('contactsController', ['$scope', 'contactsService', function ($scope, contactsService) {

    $scope.contacts = [];
    $scope.searchTerm="";

    contactsService.getContacts().then(function (results) {

        $scope.contacts = results.data;

    }, function (error) {
        //alert(error.data.message);
    });

    $scope.search = function () {
        contactsService.searchContacts($scope.searchTerm).then(function(response) {
            $scope.contacts = response;
        },
         function (response) {
             var errors = [];
             for (var key in response.data.modelState) {
                 for (var i = 0; i < response.data.modelState[key].length; i++) {
                     errors.push(response.data.modelState[key][i]);
                 }
             }
         });
             
    };

}]);