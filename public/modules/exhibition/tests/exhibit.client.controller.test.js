/**
 * Created by User on 3/20/2015.
 */
/**
 * Created by User on 3/20/2015.
 */
(function() {
    // Exhibit Controller Spec
    describe('ExhibitController', function() {
        // Initialize global variables
        var ExhibitController,
            scope,
            $httpBackend,
            $stateParams,
            $location;

        beforeEach(module(ApplicationConfiguration.applicationModuleName));

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


        beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
            // Set a new global scope
            scope = $rootScope.$new();

            // Point global variables to injected services
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;

            // Initialize the Exhibit controller.
            ExhibitController = $controller('ExhibitController', {
                $scope: scope
            });
        }));

/*
        it('$scope.findOne() should create an array with one exhibit object fetched from XHR using a exhibitId URL parameter', inject(function(Exhibition) {
            // Define a sample exhibit object
            var sampleExhibit = new Exhibition({
                title: 'An Exhibit about SOMETHING',
                content: 'SOMETHING rocks!'
            });

            // Set the URL parameter
            $stateParams.exhibitId = '525a8422f6d0f87f0e407a33';

            // Set GET response
            $httpBackend.expectGET(/api\/exhibition\/([0-9a-fA-F]{24})$/).respond(sampleExhibit);

            // Run controller functionality
            scope.findOne();
            $httpBackend.flush();

            // Test scope value
            expect(scope.exhibit).toEqualData(sampleExhibit);
        }));
*/

/*
        it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Exhibition) {
            // Create a sample exhibit  object
            var sampleExhibitPostData = new Exhibition({
                title: 'An Exhibit about SOMETHING',
                content: 'SOMETHING rocks!'
            });

            // Create a sample exhibit response
            var sampleExhibitResponse = new Exhibition({
                _id: '525cf20451979dea2c000001',
                title: 'An Exhibit about SOMETHING',
                content: 'SOMETHING rocks!'
            });

            // Fixture mock form input values
            scope.title = 'An Exhibit about SOMETHING';
            scope.content = 'SOMETHING rocks!';

            // Set POST response
            $httpBackend.expectPOST('exhibition', sampleExhibitPostData).respond(sampleExhibitResponse);

            // Run controller functionality
            scope.create();
            $httpBackend.flush();

            // Test form inputs are reset
            expect(scope.title).toEqual('');
            expect(scope.content).toEqual('');

            // Test URL redirection after the exhibit was created
            expect($location.path()).toBe('/ehibition/' + sampleExhibitResponse._id);
        }));
*/

/*
        it('$scope.update() should update a valid exhibit', inject(function(Exhibition) {
            // Define a sample exhibit put data
            var sampleExhibitPutData = new Exhibition({
                _id: '525cf20451979dea2c000001',
                title: 'An Exhibit about SOMETHING',
                content: 'SOMETHING Rocks!'
            });

            // Mock exhibit in scope
            scope.exhibit = sampleExhibitPutData;

            // Set PUT response
            $httpBackend.expectPUT(/exhibition\/([0-9a-fA-F]{24})$/).respond();

            // Run controller functionality
            scope.update();
            $httpBackend.flush();

            // Test URL location to new object
            expect($location.path()).toBe('/exhibition/' + sampleExhibitPutData._id);
        }));
*/

/*
        it('$scope.remove() should send a DELETE request with a valid exhibitId and remove the exhibit from the scope', inject(function(Exhibition) {
            // Create new exhibit object
            var sampleExhibit = new Exhibition({
                _id: '525a8422f6d0f87f0e407a33'
            });

            // Create new exhibits array and include the exhibit
            scope.exhibition = [sampleExhibit];

            // Set expected DELETE response
            $httpBackend.expectDELETE(/exhibition\/([0-9a-fA-F]{24})$/).respond(204);

            // Run controller functionality
            scope.delete();
            $httpBackend.flush();

            // Test array after successful delete
            expect(scope.exhibition.length).toBe(0);
        }));
*/
    });
}());

