{
    //散点图，基于Iris Example示例程序修改
    
    var data, dimensions, extents = new Object();      // 全局变量：data为数据，dimensions为维度名称，extents是各维度的值域

    function stringToFloat(d) {                                      // stringToFloat：数据类型转换
        for (var i = 0; i < d.length; i++) {                      // 遍历每一个数据对象
            for (var v_dim in d[i]) {                                  // 遍历对象中的每个属性/维度，v_dim为属性名
                if (v_dim != "城市") {
                    var t_value = parseFloat(d[i][v_dim])      // parseFloat：将 字符串数据 转换为 浮点数值
                    d[i][v_dim] = t_value;                               // 对象[属性名] 的方式可以取得 对象中某个属性的值
                }
            }
        }
        return d;
    };

    function getDimensions(d) {                                    // getDimensions：获取各属性的信息
        dimensions = d3.keys(data[0])                            // 获取所有属性名
            .filter(function (v_dim) {
                return v_dim != "城市";       // 不计入Class属性
            });
        console.log("Dimensions:", dimensions);
        for (var i = 0; i < dimensions.length; i++) {           // dimensions是一个数组
            var t_dim = dimensions[i]
            extents[t_dim] = d3.extent(d, function (v_d) {   // d3.extent：获取数组的上下边界
                return v_d[t_dim];                                         // d3.extent：第一个参数为数组，第二个参数为返回维度取值的函数
            });                                                                      // 获取 各维度数据 的 上下边界
        }
        console.log("Extents:", extents);
    };

    function readData(v_df) {                                        // readData：读取数据，参数为“定时器”
        d3.csv("urbanData.csv", function (d) {                     // d3.csv从csv文件中读取数据，得到一个 对象数组
            console.log("Original data:", d);                     // console.log 是输出语句，可以在浏览器的console中看到结果
            data = stringToFloat(d);                                 // 数据类型转换
            console.log("Processed data:", data);
            getDimensions(data);
            v_df.resolve();                                                  // 将参数“定时器”释放掉
        });
    };
}
// ------------------- 数据处理模块 End ------------------- 


// ------------------- 维度选择模块 Start ------------------- 
{
    var value_to_dims = {
        "1": "GDP(亿)",
        "2": "人口(万)",
        "3": "财政收入(亿元)",
        "4": "支出(亿元)",
        "5": "三产比例",
        "6": "医院数量",
        "7": "医生数量(万)",
        "8": "旅客(万)",
        "9": "货物(万吨)",
        "10": "人均工资(元)",
        "11": "商品零售额(亿)",
        "12": "进出口额(M$)",
        "13": "高校学生(万)",
        "14": "销售面积(万m2)",
        "15": "房价(元)"
    }, // value 与维度的对应关系 
        scatterplot_axes = { "x": null, "y": null };

    function getAxes() {                                                                   // getAxes：获取当前所选的x、y维度
        var x_value = $("#x_axis").val(), y_value = $("#y_axis").val(); // 取得下拉栏选项的value
        scatterplot_axes.x = value_to_dims[x_value];                        // x轴所选维度的名称
        scatterplot_axes.y = value_to_dims[y_value];                        // y轴所选维度的名称
    };

    window.onload = function () {                               // onload：页面加载完成后，执行该函数
        $(".axis_selector select")                                   // jquery选中下拉栏组件
            .on("change", function () {                                  // .on绑定事件“change”：下拉选项改变即触发回调函数
                if (data != undefined) {                                   // 如果数据已经读取完毕，则更新视图
                    getAxes();                                                  // 获取当前x、y轴的维度
                    drawScatterPlot(data);
                }
            });
    };
}
// ------------------- 维度选择模块 End ------------------- 


// ------------------- 数据渲染模块 Start ------------------- 
{
    var svg_length = document.getElementById('scatter').clientHeight,
        svg_width = document.getElementById('scatter').clientWidth,
        sc_margin = svg_length * 0.15,
        sc_length = svg_length * 0.7,                          // svg 以及 scatterplot 的大小、边距
        sc_length2 = svg_width * 0.8,
        point_r = 6;
    var state = "new";                                                  // state：标记当前状态为“创建”或“更新”

    function bindData(d) {                                           // bindData：给图元绑定数据
        var t_points = d3.select("#dataPoints")
            .selectAll(".dataPoint")
            .data(d);                                      // 更新数据
        t_points.exit().remove();                                     // 去除多余元素
        t_points.enter()                                                   // 添加缺少的元素
            .append("g")                                                       // g 是 svg 中的分组容器，类似于 html 中的 div
            .attr("class", "dataPoint");
        t_points = d3.selectAll(".dataPoint");
        return t_points;
    };

    function drawAxes() {                                                              // drawAxes：更新数轴
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        console.log("X Axis: " + x_dim, " Y Axis: " + y_dim);
        var x_scale = d3.scale.linear()                                             // 创建线性比例尺（即线性映射关系）
            .domain(extents[x_dim])                                 // domain：原数据的值域
            .range([sc_margin, sc_margin + sc_length2]);   // range：映射后数据的值域
        var y_scale = d3.scale.linear()
            .domain(extents[y_dim])
            .range([sc_margin + sc_length, sc_margin]);    // 注意：svg 中，y轴坐标由上至下递增
        var x_axis = d3.svg.axis().scale(x_scale).orient("bottom"),
            y_axis = d3.svg.axis().scale(y_scale).orient("left");           // 生成数轴
        if (state == "new") {                                                                 // 如果“new”，则创建数轴的图元容器
            d3.select("#scatterSVG").append("g")
                .attr("class", "dataAxis")
                .attr("id", "x_axis_g")
                .attr("transform", "translate(" + [0, sc_margin + sc_length] + ")")             // 数轴平移
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [sc_margin + sc_length - 50, 30] + ")")     // 平移数轴名称
                .append("text");
            d3.select("#scatterSVG").append("g")
                .attr("class", "dataAxis")
                .attr("id", "y_axis_g")
                .attr("transform", "translate(" + [sc_margin, 0] + ")")
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [- 20, sc_margin - 20] + ")")
                .append("text");
        }
        d3.select("#x_axis_g").call(x_axis);                                          // 画出数轴图元
        d3.select("#x_axis_g text").text(x_dim);                                  // 写上数轴名称
        d3.select("#y_axis_g").call(y_axis);
        d3.select("#y_axis_g text").text(y_dim);
        return { x: x_scale, y: y_scale };                                                  // 返回比例尺
    };

    function movePoints(v_points, v_scales) {                                          // movePoints：移动数据点
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        var x_scale = v_scales.x, y_scale = v_scales.y;
        var t_get_position = function (d) {
            var x_value = d[x_dim], y_value = d[y_dim];
            return "translate(" + [x_scale(x_value), y_scale(y_value)] + ")";   // translate 为平移
            // scale(value) 负责数据映射工作
        }
        if (state == "new") {
            v_points.attr("transform", t_get_position);                                   // transform 为几何变换
        } else {
            v_points.transition()                                                                      // 使用 transition 动画更新数据
                .duration(1000)                                                                             // 动画时长：1000毫秒
                .attr("transform", t_get_position);
        }
    };

    function drawEachPoint(d) {                            // drawEachPoint：在每个 g 容器内画出数据
        var t_children = d3.select(this).select("*");  // this在这里指向“调用drawEachPoint函数的对象”，即 g 容器
        if (!t_children.empty()) {                                // select("*") 即选择所有子元素，非空则说明已经渲染
            return;
        }                                                                   // 不预先判断会造成重复渲染

        d3.select(this)
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", point_r)
            .attr("class", "datapoint")
            .attr("id", "point" + d["城市"]);

        d3.select(this).append("rect")
            .attr("x", - point_r)
            .attr("y", - point_r)
            .attr("width", point_r * 2)
            .attr("height", point_r * 2)
            .attr("class", "foreground")
            .attr("fill-opacity", 0);                                      // 不透明度为0的隐藏图层，用于交互
    };

    function bindTooltip(v_points) {                           // bindTooltip：绑定 tooltip
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<p>" + "城市" + ": " + d["城市"] + "</p>" +
                    "<p>" + x_dim + ": " + d[x_dim] + "</p>" +
                    "<p>" + y_dim + ": " + d[y_dim] + "</p>";
            });                                                        // 设置 tooltip 的内容
        v_points.call(tip);
        v_points.select(".foreground")
            .on("mouseover", tip.show)                              // mouseover：鼠标悬浮在元素上时触发函数 tip.show
            .on("mouseout", tip.hide);                                 // mouseout：鼠标离开元素时触发函数 tip.hide
    };

    function drawScatterPlot(d) {                                // drawScatterPlot：渲染模块的主函数
        if (state == "new") {
            d3.select("#scatterSVG")
                .attr("width", svg_width)
                .attr("height", svg_length)                                // 设置 svg 的长宽
                .append("g")
                .attr("id", "dataPoints");
        }
        var t_scales = drawAxes();                                 // 更新并渲染数轴
        var t_points = bindData(d);                               // 绑定数据。数组用以接收多个函数返回值
        movePoints(t_points, t_scales);                         // 依照数据移动图元的 g 容器
        t_points.each(drawEachPoint);                          // 渲染每个图元
        bindTooltip(t_points);                                        // 绑定 tooltip
        state = "update";                                               // 变为“更新”状态
    };
}
// ------------------- 数据渲染模块 End ------------------- 


//  ------------------- 主程序 Start ------------------- 
{
    var t_df = $.Deferred();                                        // jquery提供的“定时器”，用于同步操作
    readData(t_df);                                                     // 读数据，将定时器传为参数
    t_df.done(function () {                                            // 定时器.done：定义“定时器释放”后的后续操作
        getAxes();                                                          // 获取当前x、y轴的维度
        drawScatterPlot(data);
    });
}
//  ------------------- 主程序 End ------------------- 