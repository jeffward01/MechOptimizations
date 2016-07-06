'use strict';
app.factory('htmlService', [function () {
    var htmlServiceFactory = {};
        htmlServiceFactory.changeModalClass = _changeModalClass;

        function _changeModalClass(className) {
            $(".modal-dialog").removeClass("modal-sm").removeClass("modal-lg").addClass(className);
        }

        return htmlServiceFactory;
    }
]);