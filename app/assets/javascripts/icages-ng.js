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

        $http.get("../results/result-" + SUBMISSION_ID + ".json").
        success(function(data) {
            console.log(data);

            $scope.log = data.log;
            $scope.data = data.output;
            if ($scope.data.length > 0) {
                $scope.headers = Object.keys($scope.data[0]);
                $scope.subHeaders = Object.keys($scope.data[0]["mutation"]);
            }

        });
    }]);
