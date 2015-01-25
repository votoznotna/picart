/**
 * Created by User on 1/19/2015.
 */
'use strict';

// Configuring the Articles module
angular.module('galleries').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Galleries', 'galleries', 'dropdown', '/galleries(/create)?', true);
        Menus.addSubMenuItem('topbar', 'galleries', 'List of Galleries', 'galleries', null, true);
        Menus.addSubMenuItem('topbar', 'galleries', 'New Gallery', 'galleries/create', null, false);
    }
]);
