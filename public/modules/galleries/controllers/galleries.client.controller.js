/**
 * Created by User on 1/19/2015.
 */

'use strict';

angular.module('galleries').controller('GalleriesController',
    ['$scope', '$stateParams', '$state','$http', '$window', 'Authentication', 'Galleries', 'messaging', 'events',
    function($scope, $stateParams, $state, $http,  $window, Authentication, Galleries, messaging, events) {

        $scope.master = {};

        $scope.recaptcha = null;

        $scope.gallery = angular.copy($scope.master);

        $scope.authentication = Authentication;

        $scope.create = function() {

            $scope.$broadcast('show-errors-event');

            if ($scope.galleryForm.$invalid)
                return;

            var formData = new FormData();
            formData.append('image', $scope.gallery.picture.file);
            formData.append('title', $scope.gallery.title);
            formData.append('content', $scope.gallery.content);
            formData.append('recaptcha', $scope.recaptcha);
            //formData.append('g-recaptcha-response', angular.element(document.getElementById("g-recaptcha-response")).val());

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


        $scope.remove = function(gallery) {
            if (gallery)    {
                gallery.$remove();

                for (var i in $scope.galleries) {
                    if ($scope.galleries[i] === gallery) {
                        $scope.galleries.splice(i, 1);
                    }
                }
            } else {
                $scope.gallery.$remove(function() {
                    $state.go('exhibition');
                });
            }
        };

        $scope.update = function() {

            $scope.$broadcast('show-errors-event');

            if ($scope.galleryForm.$invalid)
                return;

            var gallery = $scope.gallery;

            gallery.$update(function() {
                $state.go('exhibition');
            }, function(errorResponse) {
                $scope.hasFormError = true;
                $scope.formErrors = errorResponse.statusText;
                //$scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.galleries = Galleries.query();
        };

        $scope.findOne = function() {
            $scope.gallery = Galleries.get({
                galleryId: $stateParams.galleryId
            });
        };

        $scope.cancelForm = function () {
           // $window.history.back();
            $state.go('exhibition');
        };

        $scope.resetForm = function () {
            $scope.$broadcast('hide-errors-event');
            $scope.clearPicture();
            $scope.gallery = angular.copy($scope.master);
            $scope.hasFormError = false;
            $scope.formErrors = null;
            $scope.galleryForm.$setPristine();
            $scope.galleryForm.$setUntouched();
        };

        $scope.clearPicture = function() {
            $scope.gallery.picture  = null;
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
