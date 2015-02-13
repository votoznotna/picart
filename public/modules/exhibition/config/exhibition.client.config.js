/**
 * Created by User on 2/1/2015.
 */
'use strict';

// Configuring the Articles module
angular.module('exhibition').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Exhibition', 'exhibition', null, null, true);
        Menus.addMenuItem('topbar', 'Player', 'player', null, null, true);
        Menus.addMenuItem('topbar', 'New Exhibit', 'exhibition/create', null, null, false);
    }
]);
