(function(id) {
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
                m++;
            }
        }


        nodes.map(function(d, i) {
            d.x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
            d.y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
            var r = Math.round(d.value * 60);
            d.radius = r;
            if (clusters[d.color] === null || r > clusters[d.color].radius) clusters[d.color] = d;
            return d;
        });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

        var svg = d3.select("#bubble_chart > section").append("svg")
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
                return colorScale(d.color);
            });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")
            .style("-ms-user-select", "none")
            .style("cursor", "default")
            .text(function(d) {
                return d.name;
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
            width = 1000+ barLabelWidth,
            height = data.length * barHeight;

        var x = d3.scale.linear()
            .range([0, width - margin.left - margin.right - barLabelWidth]);


        var y = d3.scale.ordinal()
            .rangeBands([0, height], .1, .5);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(height)
            .outerTickSize(0)
            .ticks(numOfTicks, ".2f");

        // var yAxis = d3.svg.axis()
        //     .scale(y)
        //     .orient("left");

        var svg = d3.select("#bar_chart > section").append("svg")
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        x.domain([d3.min(data, function(d) {
            return d.value;
        }), d3.max(data, function(d) {
            return d.value;
        })]).nice();

        y.domain(data.map(function(d) {
            return d.name;
        }));

        // xAxis, vertical ticks
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
                return y(d.name);
            })
            .attr("dy", "1.35em")
            .attr("text-anchor", "end")
            .text(function(d) {
                return d.name;
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
                return y(d.name);
            })
            .style("fill", function(d) {
                return colorScale(d.color);
            })
            .attr("height", y.rangeBand())
            .attr("width", function(d) {
                return x(d.value);
            });

        chart.selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("x", function(d) {
                return x(d.value);
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("dy", "1.35em")
            .attr("dx", "0.5em")
            .text(function(d) {
                return d3.format(".3f")(d.value);
            });
            
        // .on('click', function(d) {
        //     window.location.href = d.url;
        // });
    });


})(SUBMISSION_ID);

