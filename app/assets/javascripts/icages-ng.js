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
                r.hasDrug = r.drugs.length > 0;

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

                    //Code for adding a header that is always on top
                    var tb = $('#summary_table');
                    var tb_clone = $(tb[0].cloneNode());
                    tb_clone.attr("id", "header_clone").css({
                        position: "fixed",
                        top: "0",
                        width: tb.outerWidth() + 'px'
                    });
                    tb_clone.append($('#summary_table thead').clone());
                    $('thead', tb_clone).css("background-color", "white");
                    $('.container.hz-content').append(tb_clone);
                    var ths = $('th', tb);

                    function resizeCloneTable() {
                        $('th', tb_clone).each(function(i) {
                            $(this).css("width", $(ths[i]).outerWidth() + 'px');
                        });
                        tb_clone.css({
                            "width": tb.outerWidth() + 'px',
                            "left": tb.offset()['left'] - $(window).scrollLeft()
                        });
                    }

                    resizeCloneTable();
                    tb_clone.hide();

                    var tableTop = tb.offset()['top'];

                    $(window).resize(resizeCloneTable);

                    $(window).scroll(function() {
                        if ($(window).scrollTop() > tableTop) {
                            tb_clone.show();
                            tb_clone.css("left", tb.offset()['left'] - $(window).scrollLeft());
                        } else {
                            tb_clone.hide();
                        }

                    });

                });

            });

    }]);
