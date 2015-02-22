/**
 * Created by User on 2/1/2015.
 */
'use strict';

// Setting up route
angular.module('exhibition').config(['$stateProvider',
    function($stateProvider) {
        // Exhibition state routing
        $stateProvider.
            state('exhibition', {
                url: '/exhibition',
                templateUrl: 'modules/exhibition/views/list-exhibition.client.view.html'
            }).
            state('exhibitionExpress', {
                url: '/exhibition/express',
                templateUrl: 'modules/exhibition/views/list-exhibition.client.view.html'
            }).
            state('player', {
                url: '/player',
                templateUrl: 'modules/exhibition/views/player-exhibition.client.view.html'
            }).
            state('createExhibit', {
                url: '/exhibition/create',
                templateUrl: 'modules/exhibition/views/create-exhibit.client.view.html'
            }).
            state('viewExhibit', {
                url: '/exhibition/:exhibitId',
                templateUrl: 'modules/exhibition/views/view-exhibit.client.view.html'
            }).
            state('editExhibit', {
                url: '/exhibition/:exhibitId/edit',
                templateUrl: 'modules/exhibition/views/edit-exhibit.client.view.html'
            });
    }
]);
