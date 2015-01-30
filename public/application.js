'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
	.config(['$locationProvider',
		function($locationProvider) {
			$locationProvider.hashPrefix('!');
		}
	])
/*	.config(function(blockUIConfig) {
		//blockUIConfig.templateUrl = 'block-ui-overlay.html';
		//blockUIConfig.template = '<div class="progress"></div>';
		//Change the default overlay message
		//blockUIConfig.message = '';

	})*/
	.config(function(grecaptchaProvider) {
		grecaptchaProvider.setParameters({
			sitekey : window.recaptchaSiteKey,
			theme: 'light'
		})
	});
	//.run(function($templateCache) {
	//	$templateCache.put('block-ui-overlay.html', '<div class="progress"></div>');
	//});


//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
