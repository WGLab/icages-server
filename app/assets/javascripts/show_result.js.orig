(function(id) {
<<<<<<< HEAD

    var colorScale = d3.scale.ordinal()
        .domain(["neither", "cancer gene census", "kegg cancer pathway"])
        .range(['#5cb85c', '#d62728', '#1f77b4']);

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
            if (clusters[nodes[n].category] === undefined) {
                clusters[nodes[n].category] = null;
=======
    var width = 960,
        height = 650,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

    var n = 200, // total number of nodes
        m = 10, // number of distinct clusters
        nodes, node, clusters = {};

    var colorScale = d3.scale.category10()
        .domain(["black", "red", "blue"])
        .range(['#5cb85c', '#d62728', '#1f77b4']);

    d3.json("../results/result-" + id + ".json", function(error, root) {
        m = 0
        nodes = root.children;
        for (var n in nodes) {
            if (clusters[nodes[n].color] === undefined) {
                clusters[nodes[n].color] = null;
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
                m++;
            }
        }


        nodes.map(function(d, i) {
            d.x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
            d.y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
<<<<<<< HEAD
            var r = Math.round(d.icages * 60);
            d.radius = r;
            if (clusters[d.category] === null || r > clusters[d.category].radius) clusters[d.category] = d;
=======
            var r = Math.round(d.value * 60);
            d.radius = r;
            if (clusters[d.color] === null || r > clusters[d.color].radius) clusters[d.color] = d;
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            return d;
        });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

<<<<<<< HEAD
        var svg = d3.select("#bubble_chart > section").append("svg")
=======
        var svg = d3.select("#bubbleChart").append("svg")
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            .attr("width", width)
            .attr("height", height);

        node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(force.drag);

        node.append("circle")
            .style("fill", function(d) {
<<<<<<< HEAD
                return colorScale(d.category);
=======
                return colorScale(d.color);
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")
            .style("-ms-user-select", "none")
            .style("cursor", "default")
            .text(function(d) {
<<<<<<< HEAD
                return d.gene;
=======
                return d.name;
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
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

<<<<<<< HEAD
        function tick(e) {
            node
                .each(cluster(10 * e.alpha * e.alpha))
                .each(collide(.5))
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        }

        // Move d to be adjacent to the cluster node
        function cluster(alpha) {
            return function(d) {
                var cluster = clusters[d.category];
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
                            r = d.radius + quad.point.radius + (d.category === quad.point.category ? padding : clusterPadding);
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
    }


    /*
        no side effect to data
    */
    function plotBar(data) {


=======
    });

    function tick(e) {
        node
            .each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        return function(d) {
            var cluster = clusters[d.color];
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

    // Resolves collisions between d and all other circles.
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
                        r = d.radius + quad.point.radius + (d.color === quad.point.color ? padding : clusterPadding);
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

    d3.json("../results/result-" + id +".json", function(error, result) {

        data = result.children;
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
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
<<<<<<< HEAD
            width = 1000 + barLabelWidth,
            height = data.length * barHeight;

        var x = d3.scale.linear()
            .range([0, width - margin.left - margin.right - barLabelWidth]);


        y = d3.scale.ordinal()
            .rangeBands([0, height], .1, .5);
=======
            width = 1000 - margin.left - margin.right + barLabelWidth,
            height = data.length * barHeight - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width - barLabelWidth]);


        var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], .1);
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(height)
            .outerTickSize(0)
            .ticks(numOfTicks, ".2f");

<<<<<<< HEAD
        var svg = d3.select("#bar_chart > section").append("svg")
            .attr("width", width)
=======
        // var yAxis = d3.svg.axis()
        //     .scale(y)
        //     .orient("left");

        var svg = d3.select("#barChart").append("svg")
            .attr("width", width + margin.left + margin.right)
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        x.domain([d3.min(data, function(d) {
<<<<<<< HEAD
            return d.icages;
        }), d3.max(data, function(d) {
            return d.icages;
        })]).nice();

        y.domain(data.map(function(d) {
            return d.gene;
        }));

        // xAxis vertical ticks
=======
            return d.value;
        }), d3.max(data, function(d) {
            return d.value;
        })]).nice();

        y.domain(data.map(function(d) {
            return d.name;
        }));

        // xAxis, vertical ticks
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
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
                return d.url;
            })
            .attr("target", "_blank")
            .append("text")
            .attr('y', function(d) {
<<<<<<< HEAD
                return y(d.gene);
=======
                return y(d.name);
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            })
            .attr("dy", "1.35em")
            .attr("text-anchor", "end")
            .text(function(d) {
<<<<<<< HEAD
                return d.gene;
=======
                return d.name;
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            });

        // bars

        var chart = svg.append("g")
            .attr("transform", "translate(" + barLabelWidth + ")");

        chart.selectAll("a")
            .data(data)
            .enter().append("a")
            .attr("xlink:href", function(d) {
                return d.url;
            })
            .append("rect")
            .attr("class", "bar")
            .attr("y", function(d) {
<<<<<<< HEAD
                return y(d.gene);
            })
            .style("fill", function(d) {
                return colorScale(d.category);
            })
            .attr("height", y.rangeBand())
            .attr("width", function(d) {
                return x(d.icages);
=======
                return y(d.name);
            })
            .style("fill", function(d) {
                return colorScale(d.color);
            })
            .attr("height", y.rangeBand())
            .attr("width", function(d) {
                return x(d.value);
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            });

        chart.selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("x", function(d) {
<<<<<<< HEAD
                return x(d.icages);
            })
            .attr("y", function(d) {
                return y(d.gene);
=======
                return x(d.value);
            })
            .attr("y", function(d) {
                return y(d.name);
>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
            })
            .attr("dy", "1.35em")
            .attr("dx", "0.5em")
            .text(function(d) {
<<<<<<< HEAD
                return d3.format(".3f")(d.icages);
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
        url: "URL",
    };

    function generateTable(data) {
        var datum = data[0];
        var subheads = [];

        var thead = $('<thead></thead');
        var tr = $('<tr></tr>');

        var comp_head;

        for (var d in datum) {
            if (typeof datum[d] === "object" && !datum[d] instanceof Array) {
                tr.append($('<th></th>', {
                    "rowspan": 1,
                    "colspan": Object.keys(datum[d]).length,
                    html: colNameMap[d]
                }));
                subheads = subheads.concat(Object.keys(datum[d]));

            } else if ((datum[d] instanceof Array) && (datum[d].length > 0) && typeof(datum[d][0] === "object")) {
                tr.append($('<th></th>', {
                    "rowspan": 1,
                    "colspan": Object.keys(datum[d][0]).length,
                    html: colNameMap[d]
                }));
                comp_head = d;
                subheads = subheads.concat(Object.keys(datum[d][0]));

            } else if (typeof datum[d] === "boolean" || d === "url") {
                continue;
            } else {
                tr.append($('<th></th>', {
                    "rowspan": 2,
                    html: colNameMap[d]
                }))
            }
        }

        thead.append(tr);

        tr = $('<tr></tr>');

        for (var i in subheads) {
            tr.append($('<th></th>', {
                html: colNameMap[subheads[i]]
            }))
        }

        thead.append(tr);

        $('#summary_table').append(thead);

        //real deal 

        var tbody = $('<tbody></tbody>');
        $('#summary_table').append(tbody);

        var gene, rowspan;

        for (var g in data) {
            gene = data[g];
            tr = $('<tr></tr>');
            tbody.append(tr);
            rowspan = gene[comp_head].length;

            for (var f in gene) {
                if (f === comp_head) {
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
                } else if (typeof gene[f] === "boolean" || f === "url" ) {
                    continue;
                } else {
                    tr.append($('<td></td>', {
                        html: f === "gene" ? $('<a></a>', {
                            html: gene[f],
                            href: gene["url"]
                        }) : gene[f],
                        "rowspan": rowspan
                    }));
                }
            }
        }
        
        var tb_clone = $($('#summary_table')[0].cloneNode());
        tb_clone.attr("id", "header_clone").css({
            position: "fixed",
            top: "0",
            width: $('#summary_table').outerWidth() + 'px'
        });
        tb_clone.append($('#summary_table thead').clone());
        $('thead', tb_clone).css("background-color", "white");
        $('.container.hz-content').append(tb_clone);
        var ths = $('th', $('#summary_table'));
        $('th', tb_clone).each(function(i) {
            $(this).css("width", $(ths[i]).outerWidth() + 'px');
        });
        tb_clone.hide();

        var tableTop = $('#summary_table').offset()['top'];
        $(window).scroll(function() {
            if ($(window).scrollTop() > tableTop) {
                tb_clone.show();
            } else {
                tb_clone.hide();
            }
        });
    }


    // Main logic
    // should be ../results/result-" + id + ".json on server
    d3.json("../results/result-" + id + ".json", function(error, result) {
        var plotData = result.filter(function(d) {
            return d.driver;
        })
        plotBubble(plotData);
        plotBar(plotData);
        generateTable(result);
    });

=======
                return d3.format(".3f")(d.value);
            });
            
        // .on('click', function(d) {
        //     window.location.href = d.url;
        // });
    });


>>>>>>> 18580dc0a8db62f8542224ce6184f09f796d93b1
})(SUBMISSION_ID);

