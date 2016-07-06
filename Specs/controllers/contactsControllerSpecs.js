
describe("contactsController Test", function () {
    var scope,
        ngAuthSettings,
        $location,
        contactsService,
        q,
        controllerDeff,
        controller;
    var results = { data: ["Contact 1", "Contact 2"] };

    beforeEach(function () {
        var contactsServiceMock = {};
        var locationMock = {};
        module('AngularAuthApp', function ($provide) {
            $provide.value('contactsService', contactsServiceMock);
        });
        contactsServiceMock.searchContacts = function () { };
        contactsServiceMock.getContacts = function() {};
    });
    beforeEach(inject(function ($rootScope, $controller, _contactsService_, _$q_) {
        contactsService = _contactsService_;
        scope = $rootScope.$new();
        q = _$q_;
        controllerDeff = q.defer();
        spyOn(contactsService, 'getContacts').and.returnValue(controllerDeff.promise);
        controller = $controller('contactsController', { $scope: scope, contactsService: contactsService});
    }));

    it('constructor should call contactsService.getContacts"', function () {
        var deferred = q.defer();
        controllerDeff.resolve(results);
        expect(contactsService.getContacts).toHaveBeenCalled();
    });
    it('constructor should fill lists of contacts"', function () {
        var deferred = q.defer();
        controllerDeff.resolve(results);
        scope.$root.$digest();
        expect(scope.contacts).toEqual(results.data);
    });
    it('search method should call contactsService.search"', function () {
        var deferred = q.defer();
        controllerDeff.resolve(results);
        spyOn(contactsService, 'searchContacts').and.returnValue(deferred.promise);
        scope.search();
        deferred.resolve(results);
        expect(contactsService.searchContacts).toHaveBeenCalled();
    });
    it('search method should fill list of contacts"', function () {
        var deferred = q.defer();
        var searchResults = { data: ["Contact 1"] };
        controllerDeff.resolve(results);
        spyOn(contactsService, 'searchContacts').and.returnValue(deferred.promise);
        scope.search();
        deferred.resolve(searchResults.data);
        scope.$root.$digest();
        expect(scope.contacts).toEqual(searchResults.data);
    });


});

