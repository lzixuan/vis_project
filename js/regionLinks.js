{
    //高铁联系力导向图，与各视图链接
    
    var json = new Object();
    //节点颜色图例
    var color = d3.scale.category10();
    var groupArray = new Array("京津鲁", "东北", "宁沪杭", "福厦", "华中", "两广", "川渝");
    var rectSVG = d3.select('#colorSamples')
            .append("svg")
            .attr("height", 30)
            .attr("width", document.getElementById("select").clientWidth);
    for (var i = 1; i <= 7; i++)
    {
        rectSVG.append("rect")
            .attr("width", 16)
            .attr("height", 8)
            .attr("x", (i - 1) * 80)
            .attr("y", 1)
            .attr("fill", color(i));
        rectSVG.append("text")
            .attr("x", (i - 1) * 80 + 20)
            .attr("y", 9)
            .text(groupArray[i - 1]);
    }
    //鼠标在高铁连通图的节点上
    function highlight_mouseover(d) {
        //突出平行坐标轴部分的path
        foreground.style('opacity', function (q) {
            if (d.id == q["城市"]) {
                return 1;
            }
            else
                return 0.1;
        });
        d3.select('#path' + d.id)
            .attr('stroke-width', '2px');
        //突出散点图中的对应数据点
        d3.selectAll('.dataPoint')
            .attr("opacity", function(q){
                if (q["城市"] == d.id)
                    return 1;
                else
                    return 0.5;
            });
        d3.select('#point' + d.id)
            .style("fill", "yellow")
            .style("stroke", "yellow");
        //突出力导向图中相邻的边
        /*var index = 0;
        //console.log("click id:", d.id);
        for (var i in json.nodes)
        {
            //console.log("perm id:", json.nodes[i].id);
            if (json.nodes[i].id == d.id)
                break;
            index++; 
        }*/
        //console.log("index:", index);
        d3.selectAll('.link')
            .attr("opacity", function(q){
                if (q.source.id == d.id || q.target.id == d.id)
                    return 1;
                else
                    return 0.1;
        });
        document.getElementById("select_rail").innerText = "您在高铁网中选择的城市：" + d.id;
    }
    //鼠标移开
    function highlight_mouseout(d) {
        brush();
        d3.selectAll('.dataPoint')
            .attr("opacity", 1);
        d3.select('#path' + d.id)
            .attr('stroke-width', '1px');
        d3.select('#point' + d.id)
            .style("fill", "steelblue")
            .style("stroke", "steelblue");
        d3.selectAll('.link')
        .attr("opacity", 1);
        document.getElementById("select_rail").innerText = "您在高铁网中选择的城市："
    }
    var width = document.getElementById('regionGraph').clientWidth,
        height = document.getElementById('regionGraph').clientHeight;

    var svg2 = d3.select("#regionGraph")
        .append("svg")
        .attr('width', width)
        .attr('height', height);
    //力导向图参数
    var force = d3.layout.force()
        .gravity(0.1)
        .distance(150)
        .charge(-300)
        .size([width, height]);
    d3.json('node_link.json', function (error, jsonData) {
        if (error)
            throw error;
        json = jsonData;
        force.nodes(json.nodes)
            .links(json.links)
            .start();
        var link = svg2.selectAll(".link")
            .data(json.links)
            .enter()
            .append("line")
            .attr("class", "link");
        var node = svg2.selectAll(".node")
            .data(json.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", function (d) {
                return "node" + d.id;
            });
        console.log(json.nodes);

        node.append('circle')
            .attr("r", 8)
            .attr("fill", function (d) {
                return color(d.group);
            })
            .on("mouseover", function (d, i) {
                highlight_mouseover(d);
                d3.select(this)
                    .attr("fill", "yellow");
            })
            .on("mouseout", function (d, i) {
                highlight_mouseout(d);
                d3.select(this)
                    .attr("fill", color(d.group));
            });
        force.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    });
}