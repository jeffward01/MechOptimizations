'use strict';
app.controller('registerController', ['$scope', '$modalInstance', 'safeService', 'data', function ($scope, $modalInstance, safeService, data) {

    $scope.message = "";
    $scope.registration = {
        EmailAddress: "",
        Password: "",
        ConfirmPassword: "",
        FirstName: "",
        LastName: "",
        JobTitle: "",
        Phone: "",
        Cell: "",
        CompanyName: "",
        Address1: "",
        Address2: "",
        City: "",
        State: "",
        ZipCode: "",
        Country: ""
    };

    var errors = [];
    $scope.errors = errors;
   
    $scope.ok = function () {

        errors = [];
        $scope.errors = errors;

        if ($scope.registration.EmailAddress.trim().length < 5) {
            errors.push({ message: "Email Address required" });
        }
        if ($scope.registration.EmailAddress.trim().indexOf("@") < 0 || $scope.registration.EmailAddress.trim().indexOf(".") < 0) {
            errors.push({ message: "Invalid Email Address" });
        }
        if ($scope.registration.Password.trim().length == 0) {
            errors.push({ message: "Password required" });
        }
        if ($scope.registration.ConfirmPassword.trim().length == 0) {
            errors.push({ message: "Confirm Password required" });
        }
        if ($scope.registration.Password.trim() != $scope.registration.ConfirmPassword.trim()) {
            errors.push({ message: "Passwords do not match" });
        }
        if ($scope.registration.FirstName.trim().length == 0) {
            errors.push({ message: "First Name required" });
        }
        if ($scope.registration.LastName.trim().length == 0) {
            errors.push({ message: "Last Name required" });
        }
        if ($scope.registration.JobTitle.trim().length == 0) {
            errors.push({ message: "Job Title required" });
        }
        if ($scope.registration.CompanyName.trim().length == 0) {
            errors.push({ message: "Company Name required" });
        }
        if ($scope.registration.Address1.trim().length == 0) {
            errors.push({ message: "Address 1 required" });
        }
        if ($scope.registration.City.trim().length == 0) {
            errors.push({ message: "City required" });
        }
        if ($scope.registration.State.trim().length == 0) {
            errors.push({ message: "State required" });
        }
        if ($scope.registration.Country.trim().length == 0) {
            errors.push({ message: "Country required" });
        }

        $scope.errors = errors;

        if (errors.length == 0) {
            var contactRegistration = {
                EmailAddress: $scope.registration.EmailAddress,
                Password: $scope.registration.Password,
                FirstName: $scope.registration.FirstName,
                LastName: $scope.registration.LastName,
                JobTitle: $scope.registration.JobTitle,
                Phone: $scope.registration.Phone,
                Cell: $scope.registration.Cell,
                CompanyName: $scope.registration.CompanyName,
                CompanyAddress1: $scope.registration.Address1,
                CompanyAddress2: $scope.registration.Address2,
                CompanyCity: $scope.registration.City,
                CompanyState: $scope.registration.State,
                CompanyZipCode: $scope.registration.ZipCode,
                CompanyCountry: $scope.registration.Country
            }

            safeService.register(contactRegistration)
                .then(function (result) {
                    if (result.data.success) {
                        errors.push({ message: "Added " + $scope.registration.FirstName + " " +  $scope.registration.LastName });
                        $scope.registration.EmailAddress = "";
                        $scope.registration.Password = "";
                        $scope.registration.ConfirmPassword = "";
                        $scope.registration.FirstName = "";
                        $scope.registration.LastName = "";
                        $scope.registration.JobTitle = "";
                        $scope.registration.Phone = "";
                        $scope.registration.Cell = "";
                        $scope.registration.CompanyName = "";
                        $scope.registration.Address1 = "";
                        $scope.registration.Address2 = "";
                        $scope.registration.City = "";
                        $scope.registration.State = "";
                        $scope.registration.ZipCode = "";
                        $scope.registration.Country = "";

                    }
                    else {
                    //for (var i = 0; i < result.data.errorList.length; i++) {
                    //    errors.push({ message: result.data.errorList[i] });
                    //}
                    if (result.data.fieldErrors) {
                        for (var i = 0; i < result.data.fieldErrors.length; i++) {
                            errors.push({ message: result.data.fieldErrors[i] });
                        }
                    }
                    if (result.data.fieldErrorCodes) {
                        for (var i = 0; i < result.data.fieldErrorCodes.length; i++) {
                            errors.push({ message: result.data.fieldErrorCodes[i] });
                        }
                    }
                    if (result.data.globalErrors) {
                        for (var i = 0; i < result.data.globalErrors.length; i++) {
                            errors.push({ message: result.data.globalErrors[i] });
                        }
                    }
                    if (result.data.globalErrorCodes) {
                        for (var i = 0; i < result.data.globalErrorCodes.length; i++) {
                            errors.push({ message: result.data.globalErrorCodes[i] });
                        }
                    }
                }
            }, function (err) {
                errors.push({ message: "Error" });
                errors.push({ message: err.data.exceptionMessage });
                errors.push({ message: err.data.exceptionType });

            });
        }

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);