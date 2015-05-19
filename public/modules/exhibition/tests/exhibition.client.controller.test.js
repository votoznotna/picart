/**
 * Created by User on 3/20/2015.
 */
(function() {
    // Exhibitino Controller Spec
    describe('ExhibitionController', function() {
        // Initialize global variables
        var ExhibitionController,
            scope,
            rootScope,
            $httpBackend,
            $stateParams,
            $location;

        beforeEach(function() {
            jasmine.addMatchers({
                toEqualData: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });

        // Then we can start by loading the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        beforeEach(module(function($urlRouterProvider) { $urlRouterProvider.deferIntercept(); }));

        beforeEach(inject(function($controller, _$rootScope_, _$location_, _$stateParams_, _$httpBackend_) {
            // Set a new global scope
            scope = _$rootScope_.$new();
            rootScope =  _$rootScope_;

            // Point global variables to injected services
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;


            // Initialize the Exhibition controller.
            ExhibitionController = $controller('ExhibitionController', {
                $scope: scope
            });
        }));

/*        afterEach(function() {
            $httpBackend.flush(); // You'll want to add this to confirm things are working
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });*/

        it('$scope.find() should create an array with at least one exhibit object fetched from XHR', inject(function(Exhibition) {
            // Create sample exhibit using the Exhibition service
            var sampleExhibit = new Exhibition({
                title: 'An Exhibit about SOMETHING',
                content: 'SOMETHING rocks!'
            });

            // Create a sample exhibits array that includes the new exhibit
            var sampleExhibition = [sampleExhibit];

            // Set GET response
            $httpBackend.expectGET('api/exhibition').respond(sampleExhibition);
            //$httpBackend.expectGET('modules/core/views/home.client.view.html').respond({});

            // Run controller functionality
            scope.find();
            $httpBackend.flush();

            // Test scope value
            expect(rootScope.exhibition).toEqualData(sampleExhibition);
        }));
    });
}());
