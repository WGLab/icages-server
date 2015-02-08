'use strict'

var icages = angular.module('icages', [])
	.controller('SummaryCtrl', ['$scope', function($scope) {
		$http.get("../results/result-" + SUBMISSION_ID  + ".json").
			success(function(data) {
				console.log(data);
			});
	}
]);

