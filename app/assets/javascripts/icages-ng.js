'use strict'

var icages = angular.module('icages', [])
	.controller('SummaryCtrl', ['$scope', '$http', function($scope, $http) {
		$http.get("../results/result-" + SUBMISSION_ID  + ".json").
			success(function(data) {
				console.log(data);
			});
	}
]);

