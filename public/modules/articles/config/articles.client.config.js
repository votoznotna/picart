'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?', true);
		//Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles', null, true);
		//Menus.addSubMenuItem('topbar', 'articles', 'Post Article', 'articles/create', null, false);
	}
]);
