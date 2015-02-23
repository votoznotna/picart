'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', 'Authentication', 'Menus',
	function($rootScope, $scope, Authentication, Menus) {

/*		$scope.master =  {title: '', content: ''};
		$rootScope.extQuery = angular.copy($scope.master);
		$scope.query = angular.copy($scope.master);*/

		$rootScope.extQuery = '';

		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.searchExhibits = function(){
			var value = angular.element(document.querySelector('#searchBox')).val();
			$rootScope.extQuery = value;
		}

		$scope.clearSearch = function(){
			angular.element(document.querySelector('#searchBox')).val('');
			$rootScope.extQuery = '';
		}

		$scope.playGo = function(value){
			var action = value ? 'startPlayer' : 'stopPlayer';
			$rootScope.$broadcast(action);
			angular.element('body').trigger('click');
		}

		$scope.playPrev = function(){
			$rootScope.$broadcast('prevShot');
			angular.element('body').trigger('click');
		}

		$scope.playNext = function(){
			$rootScope.$broadcast('nextShot');
			angular.element('body').trigger('click');
		}

		$scope.signout = function(){
			window.location.href = "/auth/signout";
		}
	}
]);
