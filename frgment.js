
genBooleanTypeChart(document.getElementById('chart0'), {
    type: 'boolean',
    name: '洗脸统计',
    datax: data.index,
    datay: data.simpleBar,
    title: '洗脸统计',
    succeedStr: '洗脸',
    succeedColor: '#080',
    failString: '没洗脸',
    failColor: '#f00',
    failCount: 10
});
genNumberTypeChart(document.getElementById('chart1'), {
    type: 'number',
    name: '俯卧撑统计',
    title: '俯卧撑统计',
    tooltipName: '俯卧撑次数',

    barColor: '#080',
    averageColor: '#f40',

    datax: data.index,
    datay: data.simpleLine
});