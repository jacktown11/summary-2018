(function(w){
    var J = {
        dataFormatInfo: {
            itemPos: [1, 2, 4, 7, 8, 9, 10, 11, 12],
            itemName: ['date', 'washFace', 'pushUp', 'learnTime', 'brushTeeth', 'washFoot', 'shower', 'notBreakRule', 'score'],
            commonConfig: {
                failColor: '#f00',
                succeedColor: '#080',
                failCount: 0,
                // used for boolean type
                
                barColor: '#080',
                averageColor: '#f40',
                sum: 0,
                isShowSubTitle: true
                // used for number type
            },
            itemStaticConfig: [{
                type: 'date',
                name: 'date'
            },{
                type: 'boolean',
                name: '是否洗冷水脸',
                title: '是否洗冷水脸',
                succeedStr: '洗了冷水脸',
                failString: '没洗冷水脸',
            },{
                type: 'number',
                name: '俯卧撑统计',
                title: '俯卧撑统计',
                tooltipName: '俯卧撑次数'
            },{
                type: 'number',
                name: '学习时间(小时)',
                title: '学习时间(小时)',
                tooltipName: '学习时间'
            }, {
                type: 'boolean',
                name: '是否刷牙',
                title: '是否刷牙',
                succeedStr: '刷了牙',
                failString: '没刷牙'
            }, {
                type: 'boolean',
                name: '是否洗脚',
                title: '是否洗脚',
                succeedStr: '洗了脚',
                failString: '没洗脚'
            }, {
                type: 'boolean',
                name: '是否洗澡',
                title: '是否洗澡',
                succeedStr: '洗了澡',
                failString: '没洗澡'
            }, {
                type: 'boolean',
                name: '是否违规',
                title: '是否违规',
                succeedStr: '没违规',
                failString: '违规了'
            }, {
                type: 'number',
                name: '评分',
                title: '评分', 
                tooltipName: '评分',
                isShowSubTitle:false
            }]
        },
        // 取得数据中有效数据的位置、命名信息及它们在作图时的基本配置参数

        originData: [],
        // original data to get from data.json
        processedData: [], 
        // data having been processed from original data, and is used to draw diagrams
        diagramNodes: [],
        // 用于绘图的dom节点数组
        init: function(){
            var self = this;
            self.getData(function(){
                self.processeData();
                self.draw();
            });
        },
        getData: function(callback){
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "data.json", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200)
                    {   
                        self.originData = JSON.parse(xhr.responseText);
                        callback && callback();
                    }else {
                        alert("失败");
                    }
                }
            };
            xhr.send(null);
        },
        processeData: function(){
            var self = this,
                origin = this.originData,   
                // 以表格行为外层数组项的数组
                mid = [],   
                // 转换为以列为外层数组项的数组
                //例如：把origin[1][x],origin[2][x],...,origin[n][x]合并成数组，成为mid[x]
                res = [],
                // 结果数组，其每一项都是一个含有详细绘图参数的对象
                dataInfo = this.dataFormatInfo,
                itemPos = dataInfo.itemPos,
                len,len1,i,j,temp;

            // 转换得到mid
            origin.shift(); // 第一项为表头行，去除
            len = origin.length;
            len1 = itemPos.length;
            for(i = 0; i < len1; i++){
                mid.push([]);
                res.push({});
            }
            for(i = 0; i < len; i++){
                for(j = 0; j < len1; j++){
                    mid[j].push(parseFloat(origin[i][itemPos[j]]));
                }
            }

            // 填充结果数组res中每个元素对象的数据属性(datax,datay,failCount)
            res.forEach(function(item, index, arr){
                var extend = self.extend;
                extend(item, dataInfo.commonConfig);
                extend(item, dataInfo.itemStaticConfig[index]);
                item.datax = mid[0];

                if(item.type === 'boolean'){
                    item.datay = mid[index].map(function(item1, index1, arr1){
                        if(item1 ===1){
                            return 1;
                        }else{
                            item.failCount++;
                            return {
                                value: 1,
                                itemStyle: {
                                    color: dataInfo.commonConfig.failColor
                                }
                            }; 
                        }
                    });
                }else if(item.type === 'number'){
                    item.datay = mid[index];
                    item.datay.forEach(function(item2,index2, arr2){
                        item.sum += item2;
                    });
                }
            });

            res.shift();    //第一项是日期(用户横坐标)，不单独绘成一个图
            self.processedData = res;
        },
        draw: function(){
            var self = this,
                data = this.processedData,
                len = data.length,
                i;
            data.sort(function(item1, item2){
                return (item1.type === 'boolean' && item2.type === 'number') ? 1 : -1;
            });

            var parentNode = document.getElementById('draw'),
                id,div;
            for(i = 0; i < len; i++){
                id = 'id'+Date.now();
                div = document.createElement('div');
                div.id = id;
                parentNode.appendChild(div);
                self.diagramNodes.push(div);
                if(data[i].type === 'boolean'){
                    self.genBooleanTypeChart(div, data[i]);
                }else if(data[i].type === 'number'){
                    console.log(data[i]);
                    self.genNumberTypeChart(div, data[i]);
                }
            }
        },
        genBooleanTypeChart: function(elem, data) {
            var myChart = echarts.init(elem);
            var option = {
                title: {
                    text: data.title,
                    left: 'center',
                    subtext: '共计' + data.datay.length + '天，' + data.failString + data.failCount + '天',
                    subtextStyle: {
                        color: '#333'
                    }
                },
                tooltip: {
                    show: true,
                    formatter: function (params) {
                        params = params[0];
                        if (params.color === data.failColor) {
                            return params.axisValue + '<br>' + data.succeedStr;
                        } else {
                            return params.axisValue + '<br>' + data.failString;
                        }
                    },
                    trigger: 'axis'
                },
                legend: {
                    show: false
                },
                xAxis: [
                    {
                        type: 'category',
                        splitLine: {
                            show: false
                        },
                        data: data.datax
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: data.name,
                        type: "bar",
                        itemStyle: {
                            normal: {
                                areaStyle: {
                                    type: 'default'
                                },
                                color: data.succeedColor
                            }
                        },
                        markLine: {},
                        data: data.datay
                    }
                ]
            };
            myChart.setOption(option);
        },
        genNumberTypeChart: function(elem, data) {
            var myChart = echarts.init(elem);
            var option = {
                title: {
                    text: data.title,
                    left: 'center',
                    subtext: !data.isShowSubTitle ? '' : ('总计：' + String(data.sum).replace(/^(\S+\.\S)\S*/g, '$1')),
                    subtextStyle: {
                        color: '#333',
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    show: true,
                    formatter: function (params) {
                        params = params[0];
                        return params.axisValue + '<br>' + data.tooltipName + '<br>' + params.value;
                    },
                    trigger: 'axis'
                },
                legend: {
                    show: false,
                },
                xAxis: [
                    {
                        type: 'category',
                        splitLine: {
                            show: false
                        },
                        data: data.datax
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: data.name,
                        type: "bar",
                        itemStyle: {
                            normal: {
                                areaStyle: {
                                    type: 'default'
                                },
                                color: data.barColor
                            }
                        },
                        markLine: {
                            lineStyle: {
                                color: data.averageColor
                            },
                            data: [{
                                name: '平均值',
                                type: 'average'
                            }]
                        },
                        data: data.datay
                    }
                ]
            };
            myChart.setOption(option);
        },
        extend: function(target, src) {
            var key;
            for(key in src){
                target[key] = src[key];
            }
            return target;
        }
    };

    J.init();

})(window);