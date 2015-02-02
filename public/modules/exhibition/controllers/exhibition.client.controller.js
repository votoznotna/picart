/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitionController',
    ['$scope', '$stateParams', '$state','$http', '$window', 'Authentication', 'Exhibition', 'messaging', 'events',
        function($scope, $stateParams, $state, $http,  $window, Authentication, Exhibition, messaging, events) {

            $scope.master = {};

            $scope.recaptcha = null;

            $scope.exhibit = angular.copy($scope.master);

            $scope.authentication = Authentication;

            $scope.create = function() {

                $scope.$broadcast('show-errors-event');

                if ($scope.exhibitForm.$invalid)
                    return;

                var formData = new FormData();
                formData.append('image', $scope.exhibit.picture.file);
                formData.append('title', $scope.exhibit.title);
                formData.append('content', $scope.exhibit.content);
                formData.append('recaptcha', $scope.recaptcha);

                messaging.publish(events.message._SERVER_REQUEST_STARTED_);

                $http.post('upload', formData, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(
                    function(result) {
                        $state.go('exhibition');
                    },
                    function(result) {
                        $scope.hasFormError = true;
                        $scope.formErrors = result ? result.data.message : "Unknown error";
                    }).finally(function(){
                        messaging.publish(events.message._SERVER_REQUEST_ENDED_);
                    });

            };

            $scope.remove = function(exhibit) {
                if (exhibit)    {
                    exhibit.$remove();

                    for (var i in $scope.exhibition) {
                        if ($scope.exhibition[i] === exhibit) {
                            $scope.exhibition.splice(i, 1);
                        }
                    }
                } else {
                    $scope.exhibit.$remove(function() {
                        $state.go('exhibition');
                    });
                }
            };

            $scope.update = function() {

                $scope.$broadcast('show-errors-event');

                if ($scope.exhibitForm.$invalid)
                    return;

                var exhibit = $scope.exhibit;

                exhibit.$update(function() {
                    $state.go('exhibition');
                }, function(errorResponse) {
                    $scope.hasFormError = true;
                    $scope.formErrors = errorResponse.statusText;
                    //$scope.error = errorResponse.data.message;
                });
            };

            $scope.find = function() {
                $scope.exhibition = Exhibition.query();
            };

            $scope.findOne = function() {
                $scope.exhibit = Exhibition.get({
                    exhibitId: $stateParams.exhibitId
                });
            };

            $scope.cancelForm = function () {
                // $window.history.back();
                $state.go('exhibition');
            };

            $scope.resetForm = function () {
                $scope.$broadcast('hide-errors-event');
                $scope.clearPicture();
                $scope.exhibit = angular.copy($scope.master);
                $scope.hasFormError = false;
                $scope.formErrors = null;
                $scope.exhibitForm.$setPristine();
                $scope.exhibitForm.$setUntouched();
            };

            $scope.clearPicture = function() {
                $scope.exhibit.picture  = null;
                angular.element(document.querySelector('#picture')).val("");
            };

            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

                jQuery('.magnify').imageMagnify(
                    {
                        magnifyby: 3.5,
                        thumbdimensions: [300, 200]
                    }
                );
            });

        }
    ]);
