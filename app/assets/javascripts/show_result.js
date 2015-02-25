(function(id) {

    var F_NAME = "Name",
        F_CHILDREN = "Children",
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
        F_MUT_CATEGORY = " Mutation_category",
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

    var colorScale = d3.scale.ordinal()
        .domain(["Other Category", "Cancer Gene Census", "KEGG Cancer Pathway", "drug"])
        .range(['#5cb85c', '#d62728', '#1f77b4', "rgb(226, 172, 158)"]);

    function plotBubble(data) {
        var width = 960,
            height = 650,
            padding = 1.5, // separation between same-color nodes
            clusterPadding = 6, // separation between different-color nodes
            maxRadius = 12;

        var m, // number of distinct clusters
            nodes = [],
            node, clusters = {};

        m = 0;
        nodes = $.extend(true, [], data);
        for (var n in nodes) {
            if (clusters[nodes[n][F_CATEGORY]] === undefined) {
                clusters[nodes[n][F_CATEGORY]] = null;
                m++;
            }
        }


        var links = d3.layout.tree().links(nodes).children(function(d) {
            return d[F_CHILDREN];
        });

        nodes = flatten(nodes);

        nodes.map(function(d, i) {
            //d.x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
            //d.y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
            if (d[F_CATEGORY] === undefined) {
                d.radius = Math.round(d[F_ICAGES_DRUG_SCORE] * 40);
            } else {
                d.radius = Math.round(d[F_ICAGES_SCORE] * 60);
                if (clusters[d[F_CATEGORY]] === null || d.radius > clusters[d[F_CATEGORY]].radius) clusters[d[F_CATEGORY]] = d;
            }
            d.radius = d.radius < 4 ? 4 : d.radius;
            return d;
        });

        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .linkDistance(100)
            .size([width, height])
            .gravity(gravity)
            .charge(charge)
            .on("tick", tick)
            .start();

        var svg = d3.select("#bubble_chart > section").append("svg")
            .attr("width", width)
            .attr("height", height);

        link = svg.selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });


        node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(force.drag);

        node.append("circle")
            .style("fill", function(d) {
                if (d[F_CATEGORY]) {
                    return colorScale(d[F_CATEGORY]);
                } else {
                    return colorScale("drug");
                }

            });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")
            .style("-ms-user-select", "none")
            .style("cursor", "default")
            .text(function(d) {
                if (d[F_NAME])
                    return d[F_NAME];
                else
                    return d[F_DRUG_NAME];
            });

        node.selectAll("circle").transition()
            .duration(750)
            .delay(function(d, i) {
                return i * 5;
            })
            .attrTween("r", function(d) {
                var i = d3.interpolate(0, d.radius);
                return function(t) {
                    return d.radius = i(t);
                };
            });

        function charge(d) {
            if (d[F_NAME])
                return 0.01;
            else
                return -0.005;
        }


        function gravity(d) {
            if (d[F_NAME])
                return 0.01;
            else
                return -0.005;
        }

        function tick(e) {
            node
                .each(cluster(1 * e.alpha * e.alpha))
                .each(collide(.1))
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                })
        }

        // Move d to be adjacent to the cluster node
        function cluster(alpha) {
            return function(d) {
                if (d[F_CATEGORY] === undefined) return;
                var cluster = clusters[d[F_CATEGORY]];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius;
                if (l != r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            };
        }

        // Resolves collisions between d and all other circles
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
            return function(d) {
                var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius + (d[F_CATEGORY] === quad.point[F_CATEGORY] ? padding : clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }

        function flatten(arr) {
            var nodes = [];

            function add_node(as) {
                as.forEach(function(d) {
                    if (d.children) {
                        add_node(d.children);
                    }
                    nodes.push(d);
                })
            }

            add_node(arr);
            return nodes;
        }

    }


    /*
        no side effect to data
    */
    function plotBar(data) {


        var numOfTicks = 10;
        var barLabelWidth = 50;
        var barLabelPadding = 5;
        var barHeight = 30;
        var margin = {
                top: 80,
                right: 50,
                bottom: 30,
                left: 80
            },
            width = 1000 + barLabelWidth,
            height = data.length * barHeight;

        var x = d3.scale.linear()
            .range([0, width - margin.left - margin.right - barLabelWidth]);


        y = d3.scale.ordinal()
            .rangeBands([0, height], .1, .5);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(height)
            .outerTickSize(0)
            .ticks(numOfTicks, ".2f");

        var svg = d3.select("#bar_chart > section").append("svg")
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        x.domain([d3.min(data, function(d) {
            return d[F_ICAGES_SCORE];
        }), d3.max(data, function(d) {
            return d[F_ICAGES_SCORE];
        })]).nice();

        y.domain(data.map(function(d) {
            return d[F_NAME];
        }));

        // xAxis vertical ticks
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + barLabelWidth + ",0)")
            .call(xAxis);

        // Top labels 
        svg.append("g")
            .attr("transform", "translate(" + barLabelWidth + ",0)")
            .selectAll("text")
            .data(x.ticks(numOfTicks))
            .enter().append("text")
            .attr("x", x)
            .attr("dx", "-1em")
            .attr("dy", "-0.5em")
            .text(function(d) {
                return d3.format(".2f")(d);
            });


        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (barLabelWidth - barLabelPadding) + ")")
            .selectAll("a")
            .data(data)
            .enter().append("a")
            .attr("xlink:href", function(d) {
                return d[F_URL];
            })
            .attr("target", "_blank")
            .append("text")
            .attr('y', function(d) {
                return y(d[F_NAME]);
            })
            .attr("dy", "1.35em")
            .attr("text-anchor", "end")
            .text(function(d) {
                return d[F_NAME];
            });

        // bars

        var chart = svg.append("g")
            .attr("transform", "translate(" + barLabelWidth + ")");

        chart.selectAll("a")
            .data(data)
            .enter().append("a")
            .attr("xlink:href", function(d) {
                return d[F_URL];
            })
            .append("rect")
            .attr("class", "bar")
            .attr("y", function(d) {
                return y(d[F_NAME]);
            })
            .style("fill", function(d) {
                return colorScale(d[F_CATEGORY]);
            })
            .attr("height", y.rangeBand())
            .attr("width", function(d) {
                return x(d[F_ICAGES_SCORE]);
            });

        chart.selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("x", function(d) {
                return x(d[F_ICAGES_SCORE]);
            })
            .attr("y", function(d) {
                return y(d[F_NAME]);
            })
            .attr("dy", "1.35em")
            .attr("dx", "0.5em")
            .text(function(d) {
                return d3.format(".3f")(d[F_ICAGES_SCORE]);
            });
    }

    var colNameMap = {
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

    function generateTable(data) {
        var datum = data[0];
        var subheads = [];

        var thead = $('<thead></thead>');
        var tr = $('<tr></tr>');


        for (var d in datum) {
            if (d === "url") continue;
            if (d === "mutation") {
                tr.append($('<th></th>', {
                    "rowspan": 1,
                    "colspan": Object.keys(datum[d][0]).length,
                    html: colNameMap[d]
                }));
                subheads = subheads.concat(Object.keys(datum[d][0]));
            } else {
                tr.append($('<th></th>', {
                    "rowspan": 2,
                    html: colNameMap[d]
                }));
            }
        }

        thead.append(tr);

        tr = $('<tr></tr>');

        for (var i in subheads) {
            tr.append($('<th></th>', {
                html: colNameMap[subheads[i]]
            }));
        }

        thead.append(tr);

        var tb = $('#summary_table');

        tb.append(thead);

        var tbody = $('<tbody></tbody>');
        tb.append(tbody);

        var gene, rowspan;

        function simpleField(gene, f) {
            switch (f) {
                case "gene":
                    return $('<a></a>', {
                        html: gene[f],
                        href: gene["url"]
                    });
                case "driver":
                    return gene[f] ? "Yes" : "no";
                case "children":

                    if (gene[f].length > 0) {
                        domlst = [$('<div></div>', {
                            html: gene[f][0]["drug"]
                        })];

                        ol = $('<ol></ol>', {
                            "class": "fadeIn"
                        });
                        for (i = 0; i < gene[f].length; i++) {
                            ol.append($('<li></li>', {
                                html: gene[f][i]["drug"]
                            }));
                        }
                        domlst.push(ol);
                        return domlst;
                    } else {
                        return "None";
                    }

                default:
                    return gene[f];
            }
        }

        for (var g in data) {
            gene = data[g];
            tr = $('<tr></tr>');

            tbody.append(tr);
            rowspan = gene["mutation"].length;

            for (var f in gene) {
                if (f === "url") continue;
                if (f === "mutation") {
                    for (var i = 0; i < gene[f].length; i++) {
                        if (i === 0) {
                            for (var k in gene[f][i]) {
                                tr.append($('<td></td>', {
                                    html: gene[f][i][k]
                                }));
                            }
                        } else {
                            var tr_2 = $('<tr></tr>');
                            for (var k2 in gene[f][i]) {
                                tr_2.append($('<td></td>', {
                                    html: gene[f][i][k2]
                                }));
                            }
                            tbody.append(tr_2);
                        }
                    }
                } else if (f !== "children") {
                    tr.append($('<td></td>', {
                        html: simpleField(gene, f),
                        "rowspan": rowspan
                    }));
                } else {
                    tr.append($('<td></td>', {
                        html: simpleField(gene, f),
                        "rowspan": rowspan,
                        "class": "hz-drug"
                    }));

                }
            }
        }



        $('.hz-drug').on("mouseenter", function() {
            $('div', this).css("visibility", "hidden");
            $('ol.fadeIn', this).show();
        });
        $('ol.fadeIn').on("mouseleave", function() {
            $('.hz-drug div').css("visibility", "initial");
            $(this).hide();
        });


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
    }


    // function generateLogInfo(log) {
    //     var keys = Object.keys(log);
    //     $(".log-info > li").each(function(i) {
    //         $("span", this).html(log[keys[i]]);
    //     });
    // }

    // Main logic
    //../results/result-1000.json
    // should be ../results/result-" + id + ".json on server
    d3.json("../results/result-" + id + ".json", function(error, result) {
        var plotData = result.Output.filter(function(d) {
            return d[F_DRIVER] === "TRUE";
        })
        plotBubble(plotData);
        plotBar(plotData);
        //generateLogInfo(result.log);
        //generateTable(result.output);

    });

})(SUBMISSION_ID);
