/**
 * Created by User on 1/19/2015.
 */
'use strict';

// Setting up route
angular.module('galleries').config(['$stateProvider',
    function($stateProvider) {
        // Galleries state routing
        $stateProvider.
            state('exhibition', {
                url: '/exhibition',
                templateUrl: 'modules/galleries/views/list-galleries.client.view.html'
            }).
            state('createExhibit', {
                url: '/exhibition/create',
                templateUrl: 'modules/galleries/views/create-gallery.client.view.html'
            }).
            state('viewExhibit', {
                url: '/exhibition/:exhibitId',
                templateUrl: 'modules/galleries/views/view-gallery.client.view.html'
            }).
            state('editExhibit', {
                url: '/exhibition/:exhibitId/edit',
                templateUrl: 'modules/galleries/views/edit-gallery.client.view.html'
            });
    }
]);
