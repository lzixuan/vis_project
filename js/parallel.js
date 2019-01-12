{
    //平行坐标轴
    
    var m = [30, 10, 10, 10],
        w = document.getElementById('parallel').clientWidth - m[1] - m[3],
        h = document.getElementById('parallel').clientHeight - m[0] - m[2];
    var x = d3.scale.ordinal().rangePoints([20, w], .5),
        y = {};
    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;
    var svg = d3.select("#parallel").append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    d3.csv('urbanData.csv', function (error, cities) {
        if (error)
            throw error;
        //获取定量维度,domain为数据值域，range为图形值域
        x.domain(dimensions = d3.keys(cities[0]).filter(function (d) {
            return d != "城市" && (y[d] = d3.scale.linear()
                .domain(d3.extent(cities, function (p) { return +p[d]; }))
                .range([h, 0]));
        }));
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(cities)
            .enter().append("path")
            .attr("d", path);
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(cities)
            .enter().append("path")
            .attr("d", path)
            .attr("id", function (d) {
                return "path" + d["城市"];
            });
        //各维度坐标轴需要平移
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) { return "translate(" + x(d) + ")"; });
        g.append("g")
            .attr("class", "axis")
            .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
            .append("text")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(String);
        //刷选框
        g.append("g")
            .attr("class", "brush")
            .each(function (d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });
    function path(d) {
        return line(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }
    //刷选范围内不透明，范围外增加透明度
    function brush() {
        var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
            extents = actives.map(function (p) { return y[p].brush.extent(); });
        foreground.style("opacity", function (d) {
            return actives.every(function (p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? 1 : 0.1;
        });
    }
}