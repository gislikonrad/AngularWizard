(function(window, undefined){
	window.angular.module('ngWizard', [])
		.service('wizardData', function() {
			return { data: {} };
		})
		.directive('wizard', [function() {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,				
				controller: ['$scope', '$routeParams', '$window', 'wizardData', function($scope, $routeParams, $window, wizardData) {
					var steps = [],
						currentStep = (function(){
							var step = parseInt($routeParams.step);
							if(step.toString() === 'NaN') {
								wizardData.data = {};
								var loc = $window.location.href;
								if(loc.lastIndexOf('?') < Math.max(0, loc.indexOf('#'))){
									$window.location.href += '?step=1';
								}
								else {
									$window.location.href += '&step=1';
								}
							}
							return step;
						})(),						
						setCurrentStep = function(number) {						
								var href = $window.location.href,
									regex = /([&?]step=)\d/gim,
									replace = regex.exec(href)[1],
									newHref = href.replace(regex, replace + number.toString());
									
								$window.location.href = newHref;
						},
						data = ($scope.data = wizardData.data);
						
					this.addStep = function(step) {
						var previous = 0;
						angular.forEach(steps, function(s){
							previous = s.number;
							if(s.number === step.number) {
								throw 'A step number should be unique per wizard';
							}
						});
						if(step.number !== (previous + 1)) {
							throw 'Steps should be in sequence.';
						}
						
						step.active = (step.number === currentStep);
						steps.push(step);
					};
					
					$scope.previous = function() {	
						wizardData.data = $scope.data;
						setCurrentStep(currentStep - 1);
					};
					
					$scope.next = function() {
						wizardData.data = $scope.data;
						setCurrentStep(currentStep + 1);
					};
				}],
				template: '<div ng-transclude></div>'
			};
		}])
		.directive('step', function() {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				require: '^wizard',
				scope: {
					number: '='
				},
				link: function(scope, element, attrs, wizardCtrl)  {
					var n = parseInt(scope.number);
					if(!n || n < 0) {
						throw 'A step number should be a positive integer.';
					}					
					wizardCtrl.addStep(scope);
				},
				template: '<div ng-show="active" ng-transclude></div>'
			};
		});
})(this);