/**
 * Created by User on 1/19/2015.
 */
'use strict';

// Setting up route
angular.module('galleries').config(['$stateProvider',
    function($stateProvider) {
        // Galleries state routing
        $stateProvider.
            state('listGalleries', {
                url: '/galleries',
                templateUrl: 'modules/galleries/views/list-galleries.client.view.html'
            }).
            state('createGallery', {
                url: '/galleries/create',
                templateUrl: 'modules/galleries/views/create-gallery.client.view.html'
            }).
            state('viewGallery', {
                url: '/galleries/:galleryId',
                templateUrl: 'modules/galleries/views/view-gallery.client.view.html'
            }).
            state('editGallery', {
                url: '/galleries/:galleryId/edit',
                templateUrl: 'modules/galleries/views/edit-gallery.client.view.html'
            });
    }
]);
