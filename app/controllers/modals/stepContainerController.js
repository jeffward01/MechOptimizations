'use strict';
app.controller('stepContainerController', ['$scope', '$modalInstance', 'licensesService','$state','$stateParams','htmlService', function ($scope, $modalInstance, licensesService, $state, $stateParams, htmlService) {
  
    $scope.ok = function () {

    };

    $scope.adobeSubjectLine = null;
    $scope.adobeContent = null;
    $scope.templatePreviewData = null;
    $scope.licenseAttachments = null;
    $scope.selectedLicense = null;
    $scope.selectedProducts = [];
    $scope.selectedProductId = null;
    $scope.selectedRecipients = [];
    $scope.additionalEmails = [];

    $scope.selectedTemplate = null;
    $scope.selectedTermOption = null;
    $scope.actionId = 0;
    $scope.reloadNeeded = false;
    $scope.cancel = function () {
        var currentStates = $state.$current.name.split('.');
        currentStates.pop();
        currentStates.pop();
        $state.go(currentStates.join('.'), {}, {reload:$scope.reloadNeeded});
    };
    $scope.cancelToLicenseDetails = function () {
        var currentStates = $state.$current.name.split('.');
        currentStates.pop();
        currentStates.pop();
        $state.go(currentStates.join('.'), {}, { reload: $scope.reloadNeeded });

        //This code below leaves the modal background open on close.  This error was introduced after angular 1.3.5 upgrade.
        // ^^ above fixes it.
        //$state.reload().then(function () {
        //    $state.go('SearchMyView.DetailLicense', { licenseId: $scope.selectedLicense.licenseId });
        //    USL.Common.CloseModalBackground();
        //    $('body').removeClass('modal-open');
        //    $('.modal-backdrop').remove();
        //});
     
    }

    $scope.goToParent = function (args, reload) {
        var currentStates = $state.$current.name.split('.');
        currentStates.pop();
        currentStates.pop();
        $state.go(currentStates.join('.'), args, { reload: reload });
    }
    $scope.modalPreviousStep = function(args) {
        var states = {};
        states['CreateLicense'] = 'AddProducts';
        states['EditRates'] = 'EditConfigs';
        states['AddProducts'] = 'EditLicense';
        states['EditConfigs'] = 'AddProducts';
        states['EditConfigsInProducts'] = 'AddProductsInProducts';
        states['AddProductsInProducts'] = 'CreateLicense';
        states['GenerateDocumentPreview'] = 'GenerateDocument';
        states['CreateProductAddTracks'] = 'CreateProduct';
        var currentStates = $state.$current.name.split('.');
        var currentState = currentStates.pop();
        var nextState = states[currentState];
        if (nextState) currentStates.push(nextState);
        if (args != null) {
            $state.go(currentStates.join('.'), args);
        }
        else {
            $state.go(currentStates.join('.'));
        }
    }
    $scope.goToState = function(stateName, args) {
        var currentStates = $state.$current.name.split('.');
        currentStates.pop();
        currentStates.push(stateName);
        $state.go(currentStates.join('.'), args);
    }
    $scope.modalNextStep = function(args) {
        var states = {};
        states['CreateLicense'] = 'AddProducts';
        states['EditLicense'] = 'AddProducts';
        states['AddProducts'] = 'EditConfigs';
        states['EditConfigs'] = 'EditRates';
        states['GenerateDocument'] = 'GenerateDocumentPreview';
        states['CreateProduct'] = 'CreateProductAddTracks';
        states['AddProductsInProducts'] = 'EditConfigsInProducts';
        //new
        states['EditProduct'] = 'CreateProductAddTracks';
        var currentStates = $state.$current.name.split('.');
        var currentState = currentStates.pop();
        var nextState = states[currentState];
        if (nextState) currentStates.push(nextState);
        $state.go(currentStates.join('.'));
        $scope.reloadNeeded = true;
    }
    $scope.setParameter = function(name, value) {
        $scope[name] = value;
    }

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0,
    };


    $scope.loadParams = function () {
        if ($stateParams.licenseData) {
            $scope.selectedLicense = $stateParams.licenseData;
        }
        if ($stateParams.products) {
            angular.forEach($stateParams.products, function(item) {
                if (item.productHeader) {
                    var product = { licenseId: item.licenseId, product_id: item.productHeader.id, title: item.productHeader.title, recsArtist: item.productHeader.artist, recsLabel: item.productHeader.recordLabel, licensesNo: item.relatedLicensesNo }
                    product.recordingsNo = item.licensePRecordingsNo;
                    $scope.selectedProducts.push(product);
                } else {
                    $scope.selectedProducts.push(item);
                }
            });
        }
        if ($stateParams.actionId) $scope.actionId = $stateParams.actionId;
        if ($stateParams.productId) $scope.selectedProductId = $stateParams.productId;
        if ($stateParams.files) $scope.licenseAttachments = $stateParams.files;
    };
    $scope.loadParams();
    $scope.changeDialogSize = function(modalSize) {
        htmlService.changeModalClass("modal-" + modalSize);
    }
}]);