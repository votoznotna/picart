/**
 * Created by User on 1/19/2015.
 */

'use strict';

angular.module('galleries').controller('GalleriesController', ['$scope', '$stateParams', '$location', '$http', '$window', 'Authentication', 'Galleries',
    function($scope, $stateParams, $location, $http,  $window, Authentication, Galleries) {

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

            $http.post('upload', formData, {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).success(function(result) {
                $location.path('galleries');
                $scope.uploadedImgSrc = result.src;
                $scope.sizeInBytes = result.size;
            }).error(function(data, status, headers, config) {
                $scope.hasFormError = true;
                $scope.formErrors = status || data ? data.message : "Unknown error";
                //$scope.error = data.message;
            });


/*            var gallery = new Galleries({
                title: $scope.gallery.title,
                content: $scope.gallery.content
            });
            gallery.$save(function(response) {
                //$location.path('galleries/' + response._id);
                $location.path('galleries');

               // $window.history.back();
            }, function(errorResponse) {
                $scope.hasFormError = true;
                $scope.formErrors = errorResponse.statusText;
            });*/
        };


        $scope.remove = function(gallery) {
            if (gallery) {
                gallery.$remove();

                for (var i in $scope.galleries) {
                    if ($scope.galleries[i] === gallery) {
                        $scope.galleries.splice(i, 1);
                    }
                }
            } else {
                $scope.gallery.$remove(function() {
                    $location.path('galleries');
                });
            }
        };

        $scope.update = function() {

            $scope.$broadcast('show-errors-event');

            if ($scope.galleryForm.$invalid)
                return;

            var gallery = $scope.gallery;

            gallery.$update(function() {
                //$location.path('galleries/' + gallery._id);
                $location.path('galleries');

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
            $location.path('galleries');
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
    }
]);
