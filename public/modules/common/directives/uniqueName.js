/**
 * Created by User on 1/24/2015.
 */
angular.module('common').directive('uniqueName', function(mongolab) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            var mongoDbCollection = attrs["mongoCollection"];
            var mongoDbName = window.dbName;

            var getByNameSuccessHandler = function (response) {
                if(response.data && response.data.length > 0) {
                    ctrl.$setValidity('uniqueName', false);
                }
                else{
                    ctrl.$setValidity('uniqueName', true);
                }
            };

            var getByNameErrorHandler = function () {
                ctrl.$setValidity('uniqueName', true);
            };

            ctrl.$parsers.unshift(function (viewValue) {
                // do nothing unless we match a valid name
                if ((viewValue !== null) && (viewValue !== undefined) && (viewValue !== '')) {
                    mongolab.query(mongoDbName, mongoDbCollection, {q: {title_searchable: viewValue.toLowerCase()}})
                        .then(getByNameSuccessHandler, getByNameErrorHandler);
                }

                return viewValue;
            });
        }
    };
});
