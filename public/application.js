'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
	.config(['$locationProvider',
		function($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
			$locationProvider.hashPrefix('!');
		}
	])
	.config(function(grecaptchaProvider) {
		grecaptchaProvider.setParameters({
			sitekey : window.recaptchaSiteKey,
			theme: 'light'
		})
	})
	.value('shotDelay', 6000)
	.run(function (mongolab) {
		mongolab.setApiKey(window.mongolabApiKey);
	})
	.run(['$state', '$rootScope', '$location', 'messaging', 'events',
		function($state, $rootScope, $location, messaging, events) {
		//Check when routing starts
		//event, next, current
		$rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
			$rootScope.searchBar = false;
			$rootScope.playerBar = false;
            $rootScope.usersManager = false;
			messaging.publish(events.message._SERVER_REQUEST_ENDED_);
		});
	}]);


//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
