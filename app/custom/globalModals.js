var USL = USL || {};
USL.GlobalModals = USL.GlobalModals || {};
USL.GlobalModals.initLicenseModals = function(modal, data, modalType, size) {
    return modal.open({
        templateUrl: 'app/views/partials/modal-EditLicense.html',
        controller: 'editLicenseController',
        size: size,
        resolve: {
            data: function() {
                return [data];
            }
        }
    });
};


USL.GlobalModals.initCreateLicenseModals = function(modal, data, modalType, size) {
    return modal.open({
        templateUrl: 'app/views/partials/modal-CreateLicense.html',
        controller: 'createLicenseController',
        size: size,
        resolve: {
            data: function() {
                //return [$scope.licenseDetail];
            }        
        }
    });
};