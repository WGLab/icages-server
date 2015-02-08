'use strict'

var icages = angular.module('icages', [])
    .controller('SummaryCtrl', ['$scope', '$http', function($scope, $http) {

        $scope.colNameMap = {
            gene: "Gene Name",
            mutation: "Mutation",
            mutation_syntax: "Mutation Syntax",
            protein_syntax: "Protein Syntax",
            radial: "Radial SVM score",
            phenolyzer: "Phenolyzer score",
            icages: "iCAGES score",
            category: "Category",
            driver: "Driver",
            children: "Drug"
        };

        $scope.rowspan = function(s) {
        	return s === "mutation" ? : 1 : 2;
        }

        $scope.colspan = function(s) {
        	return s === "mutation" ? : 3 : 1;
        }

        $http.get("../results/result-" + SUBMISSION_ID + ".json").
        success(function(data) {
            console.log(data);



            $scope.log = data.log;
            $scope.data = data.output;
            if ($scope.data.length > 0) {

            	var hs = Object.keys($scope.data[0]);
            	$scope.headers = hs.filter(function(h) {
            		return h !== "url";
            	});

                $scope.subHeaders = Object.keys($scope.data[0]["mutation"][0]);
            }

        });
    }]);
