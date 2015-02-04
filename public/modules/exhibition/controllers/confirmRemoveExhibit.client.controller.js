/**
 * Created by User on 2/3/2015.
 */
"use strict"

angular.module('exhibition').controller('RemoveExhibitionConfirmationController',
    ['$rootScope','$scope', '$modalInstance', 'exhibitName',
        function($rootScope, $scope, $modalInstance, exhibitName) {

    $scope.exhibitName = exhibitName;

    $scope.ok = function () {
            $modalInstance.close(true);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
