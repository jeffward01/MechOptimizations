describe("breadcrumbDirective Test", function () {
    var outerscope,
        innerscope,
        element;
    beforeEach(module('AngularAuthApp'));
    beforeEach(inject(function($rootScope, $compile) {
        element = angular.element("<breadcrumbs></breadcrumbs>");
        outerscope = $rootScope;
        $compile(element)(outerscope);
        innerscope = element.isolateScope();
        outerscope.$digest();
    }));

});
