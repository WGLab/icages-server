'use strict'

var icages = angular.module('icages', ['ui.bootstrap'])
    .controller('SummaryCtrl', ['$scope', '$http', '$timeout', '$modal', function($scope, $http, $timeout, $modal) {


        //Constants for obj key strings
        var F_NAME = "Name",
            F_CHILDREN = "children",
            F_URL = "Gene_url",
            F_CATEGORY = "Category",
            F_PHENO_SCORE = "Phenolyzer_score",
            F_ICAGES_SCORE = "iCAGES_gene_score",
            F_MUT = "Mutation",
            F_SCORE_CAT = "Score_category",
            F_REF_ALLELE = "Reference_allele",
            F_DRIVER_MUT_SCORE = "Driver_mutation_score",
            F_ALT_ALLELE = "Alternative_allele",
            F_PROTEIN_SYNTAX = "Protein_syntax",
            F_END_POS = "End_position",
            F_MUT_CATEGORY = "Mutation_category",
            F_START_POS = "Start_position",
            F_MUT_SYNTAX = "Mutation_syntax",
            F_CHROMOSOME = "Chromosome",
            F_DRIVER = "Driver",
            F_BIOSYS_PROBABILITY = "Biosystems_probability",
            F_DRUG_NAME = "Drug_name",
            F_PUBCHEM_PROBABILITY = "PubChem_active_probability",
            F_DIRECT_TARGET_GENE = "Direct_target_gene",
            F_ICAGES_DRUG_SCORE = "iCAGES_drug_score",
            F_FINAL_TARGET_GENE = "Final_target_gene";


        var _dataFields = [F_NAME, F_MUT, F_PHENO_SCORE, F_ICAGES_SCORE, F_CATEGORY, F_DRIVER, F_CHILDREN, F_URL];

        var _mutationFields = [F_PROTEIN_SYNTAX, F_DRIVER_MUT_SCORE]

        var _mutationMoreFields = [F_SCORE_CAT, F_REF_ALLELE, F_ALT_ALLELE, F_END_POS, F_MUT_CATEGORY, F_START_POS, F_CHROMOSOME];


        var _map = {};

        _map[F_NAME] = "Gene Name";
        _map[F_CHILDREN] = "Drug";
        _map[F_CATEGORY] = "Category";
        _map[F_PHENO_SCORE] = "Phenolyzer score";
        _map[F_ICAGES_SCORE] = "iCAGES score";
        _map[F_MUT] = "Mutation";
        _map[F_DRIVER] = "Driver";
        _map[F_SCORE_CAT] = "Score Category";
        _map[F_REF_ALLELE] = "Reference allele";
        _map[F_DRIVER_MUT_SCORE] = "Driver Mutation Score";
        _map[F_ALT_ALLELE] = "Alternative Allele";
        _map[F_PROTEIN_SYNTAX] = "Protein Syntax";
        _map[F_END_POS] = "End Position";
        _map[F_MUT_CATEGORY] = "Mutation Category";
        _map[F_START_POS] = "Start Position";
        _map[F_MUT_SYNTAX] = "Mutation Syntax";
        _map[F_CHROMOSOME] = "Chromosome";

        $scope.colNameMap = _map;

        $scope.rowspan = function(s) {
            return s === F_MUT ? 1 : 2;
        }

        $scope.colspan = function(s) {
            return s === F_MUT ? 3 : 1;
        }

        function processDataForTable(data) {
            var result = [];
            data.forEach(function(d) {
                var r = {};
                r.otherFields = [];
                r.firstRow = true;

                var muts;

                _dataFields.forEach(function(i) {
                    switch (i) {
                        case F_URL:
                            r.url = d[i];
                            break;
                        case F_NAME:
                            r.geneName = d[i];
                            break;
                        case F_MUT:
                            if (d[i].length > 0) {
                                muts = d[i];
                                r.mutation = muts[0];
                            }
                            break;
                        case F_CHILDREN:
                            r.drugs = d[i] || [];
                            break;
                        default:
                            r.otherFields.push(d[i]);
                            break;
                    }
                });

                r.rowspan = muts ? muts.length : 1;
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

        $scope.getDrugName = function(obj) {
            return obj[F_DRUG_NAME];
        }

        $scope.openMutationModal = function(datum) {

            var mutationModal = $modal.open({
                templateUrl: '/ng-templates/mutationModal.html',
                controller: "MutationModalCtrl",
                size: "sm",
                resolve: {
                    datum: function() {
                        return datum;
                    },
                    fields: function() {
                        return _mutationMoreFields;
                    },
                    map: function() {
                        return _map;
                    }
                }

            });

            mutationModal.result.then(function() {

            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });

        }

        $http.get("../results/result-" + SUBMISSION_ID + ".json")
            .success(function(data) {
                console.log(data);


                $scope.log = data.Log;
                var gData = data.Output;
                if (gData.length > 0) {


                    $scope.headers = _dataFields.filter(function(k) {
                        return k !== F_URL;
                    });

                    $scope.mutationPrimaryField = F_MUT_SYNTAX;
                    $scope.mutationFields = _mutationFields;
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

    }])
    .controller("MutationModalCtrl", ['$scope', '$modalInstance', 'datum', 'fields', 'map', function($scope, $modalInstance, datum, fields, map) {

        $scope.datum = datum;
        $scope.fields = fields;
        $scope.map = map;

        $scope.ok = function() {
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };



    }]);
