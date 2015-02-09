'use strict'

var icages = angular.module('icages', [])
    .controller('SummaryCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

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
            return s === "mutation" ? 1 : 2;
        }

        $scope.colspan = function(s) {
            return s === "mutation" ? 3 : 1;
        }

        function processDataForTable(data) {
            var result = [];
            data.forEach(function(d) {
                var r = {};
                r.otherFields = [];
                r.firstRow = true;

                var muts = [{
                    mutation_syntax: "",
                    protein_syntax: "",
                    radial: ""
                }];

                for (var i in d) {
                    switch (i) {
                        case "url":
                            r.url = d[i];
                            break;
                        case "gene":
                            r.geneName = d[i];
                            break;
                        case "mutation":
                            if (d[i].length > 0) {
                                muts = d[i];
                                r.mutation = muts[0];
                            }
                            break;
                        case "children":
                            r.drugs = d[i];
                            break;
                        default:
                            r.otherFields.push(d[i]);
                            break;
                    }
                }

                r.rowspan = muts.length;

                result.push(r);
                for (var j = 1; j < muts.length; j++) {
                    result.push({
                        firstRow: false,
                        mutation: muts[j],
                        rowspan: 1
                    });
                }
            });

            return result;

        }

        $http.get("../results/result-" + SUBMISSION_ID + ".json")
            .success(function(data) {
                console.log(data);


                $scope.log = data.log;
                var gData = data.output;
                if (gData.length > 0) {

                    var hs = Object.keys(gData[0]);
                    $scope.headers = hs.filter(function(h) {
                        return h !== "url";
                    });

                    $scope.mutationHeaders = Object.keys(gData[0]["mutation"][0]);
                }


                $scope.geneData = processDataForTable(gData);

                console.log($scope.geneData);

                $timeout(function() {
                    $('.hz-drug').on("mouseenter", function() {
                        $('div', this).css("visibility", "hidden");
                        $('ol.fadeIn', this).show();
                    });
                    $('ol.fadeIn').on("mouseleave", function() {
                        $('.hz-drug div').css("visibility", "initial");
                        $(this).hide();
                    });

                });

            });

    }]);
