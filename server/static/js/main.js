
/**
 * 数组去重
 * @param  {
 *          list:目标数组
 *         }
 */
var myArrayUnique = function(list) {
    var ret = [];
    var temp = {};
    for (var i = 0; i < list.length; i++) {
        if (!temp[list[i]]) {
            ret.push(list[i]);
            temp[list[i]] = true;
        }
    }
    return ret;
}

/**
 * 判断{数组/对象}是否为空
 * @param  {
 *          o:{数组/对象}
 *         }
 */
var isEmptyObject = function(o) {
    if (typeof(o) != 'object'){
        return false;
    }
    for (var k in o) {
        return false;
    }
    return true;
}

 /**
 * 判断{值/数组/对象}是否为空
 * @param  {
 *          p:{值/数组/对象}
 *         }
 * include: null undefined {} [] NaN
 * except: 0
 */
var nullOrEmpty = function(p) {
    return !p && p !== 0;
    // return !(p !== undefined && p !== null && (typeof(p) == 'number' ? !isNaN(p) : true) && p.length !== 0 && !isEmptyObject(p));
}

 /**
 * 获取url中的参数对象
 * @param  {
 *          url:url地址
 *         }
 * @return {参数对象}
 */
var getUrlParameter = function(url) {
    url = url || location.href;
    var paraString = url.substring(url.indexOf('?') + 1, url.length).split('&');
    var paraObj = {};
    paraString.forEach(function(e){
        paraObj[decodeURIComponent(e.split('=')[0])] = decodeURIComponent(e.split('=')[1]);
    });
    return paraObj;
}


 /**
 * 绑定数据
 * @param  {
 *          data:数据对象,
 *          tempcontainer:目标元素(JQ对象),
 *          tag:数据标识，默认('tmp-id')
 *         }
 * 遍历 "tmp-id":{"tmp-id":123456} || [{a:1},{a:2}]
 * 遍历替换 "tmp-Obj" = true
 */
var bindField = function(data, tempcontainer, tag) {
    var clone = tempcontainer.clone(true);
    tag = tag ? tag : 'tmp-id';

    clone.find('[' + tag + ']').each(function() {
        var item = $(this);
        var datafield = item.attr(tag);
        var datavalue = data ? data[datafield] : null;

        if (datavalue === null || datavalue === undefined) {
            datavalue = '';
        }
        if (!item.is(':input') || item.is('button')) {
            item.html(datavalue);
        } else if (item.is('input:checkbox') || item.is('input:radio')) {
            item.prop('checked', !!datavalue);
        } else {
            item.val(datavalue);
        }
    });
    tempcontainer.replaceWith(clone);
}

 /**
 * 页面输入控制
 * @param  {
 *          ele:对象元素
 *         }
 */
var inputControl = function(ele) {
    // 数字验证
    $(ele).delegate(':input.num',
        'keyup',
        function() {
            var c = $(this).val().match(/\d/g);
            $(this).val(c == null ? '' : c.join(''));
        });
    // 按下ESC清空输入
    $(ele).delegate(':input',
        'keydown',
        function(e) {
            if (e.which === 27) {
                $(this).val(null);
            }
        });
}

 /**
 * 日期格式化，兼容
 * @param  {
 *          dateTime:日期字符串
 *         }
 */
var dateFmt = function(dateTime){
    if (!dateTime)
        return '';
    var _tmp = dateTime.toString();
    if (0 <= _tmp.toString().indexOf('T')) {
        ;
    }else if (0 <= _tmp.toString().indexOf('-')){
        _tmp = _tmp.replace(/-/g,'/');
    }
    else{
        ;
    }
    return new Date(_tmp);
}

 /**
 * 计算年龄,生日第二天加一岁
 * @param  {
 *          birthDate:出生日期,
 *          nowDate:计算日期，默认(当前日期)
 *         }
 */
var calcAge = function(birthDate, nowDate) {
    var nowDate = nowDate ? new Date(nowDate) : new Date();
    birthDate = new Date(birthDate);
    var yearOld = nowDate.getFullYear() - birthDate.getFullYear();
    return (birthDate.getMonth() * 100 + birthDate.getDate()) < (nowDate.getMonth() * 100 + nowDate.getDate()) ? yearOld : (yearOld - 1);
}

 /**
 * 计算日期
 * @param  {
 *          orgDate: 初始日期，字符串
 *          evla: 日期偏移,整数 N或 -N
 *         }
 * @e.g. calcDate('2016-01-05', -10).toLocaleDateString()
 * ==> "2015/12/26"
 */
var calcDate = function(orgDate, evla) {
    return new Date(new Date(orgDate).getTime() + (evla) * 24 * 3600 * 1000).toJSON().substring(0, 10);
}

 /**
 * 滚动页面到元素的位置如 $('#id')
 * @param  {
 *          ele:元素
 *         }
 */
var scrollToEle = function(ele){
    document.body.scrollTop = ele.offset() ? ele.offset().top : 0;
}

/* 获得对象的类型,返回其中之一
注意： 此方法在不同浏览器中有坑，此处只以Chrome V8引擎为准
[
    "Array",    // []
    "Boolean",  // true
    "Date",     // new Date()
    "Error",    // Error()
    "Function", // function(){}
    "global",   // window
    "HTMLBodyElement",  // document
    "Null",     // null
    "Number",   // 1,NaN
    "Object",   // {}
    "RegExp",   // /\w+/g
    "String",   // ''
    "Undefined" // undefined
    // File FileList
]
*/
var getObjectType = function(o) {
    return Object.prototype.toString.call(o).match(/\w+/g)[1];
}

/*
* 将字符串中的html字符转义为html实体返回
*/
var getHtmlEntity = function(htm){
    return $('<textarea></textarea>').html(ccc).val();
}

/*
* 获取JQ对象的完整Html
*/
var getSelfHtml = function(ele) {
    return $(ele).prop('outerHTML');
}

/*
* 将 a_b_c 转化为aBC
*/
var toUp = function(str) {
    for (var i = 97; i < 123; i++) {
        str = str.replace(new RegExp('_' + String.fromCharCode(i), 'g'), String.fromCharCode(i - 32));
    }
    return str;
}

/*
* 将 a_b_c 转化为aBC，用于数据库字段转换
*/
var underlineToUp = function(obj) {
    if (getObjectType(obj) == 'Object') {
        for (var e in obj) {
            var ne = self.toUp(e);
            if (getObjectType(obj[e]) == 'Object') {
                underlineToUp(obj[e]);
                obj[ne] = $.extend(true, {}, obj[e]);
            } else if (getObjectType(obj[e]) == 'Array') {
                for (var i in obj[e]) {
                    underlineToUp(obj[e][i]);
                    obj[ne] = $.extend(true, [], obj[e]);
                }
            } else {
                obj[ne] = obj[e];
            }
            if (ne != e) {
                delete obj[e];
            }
        }
    } else if (getObjectType(obj) == 'Array') {
        for (var i in obj) {
            underlineToUp(obj[i]);
        }
    }
}

var loopUpChar = function(obj){
    var eMapOld = [];
    for(var e in obj){
        eMapOld.push(e);
    }
    var eMapNew = toUp(eMapOld.join('*')).split('*');
    for(var i = 0; i < eMapOld.length;i++){
        obj[eMapNew[i]] = obj[eMapOld[i]];
        delete obj[eMapOld[i]];
    }
    return obj;
}

/**
 * 容错式toString
 * @param  {[obj]}
 * @return {[string]}
 */
var stringify = function(obj) {
    return (obj === undefined || obj === null) ? '' || obj.toString();
}

/**
 * 首字母大写
 * @param  {[string]} 'aaa bbb ccc,ddd,eee'
 * @return {[string]} 'Aaa Bbb Ccc,Ddd,Eee'
 */
var capitalWord = function(word) {
    return word.replace(/\b([a-z])/g, function(all, letter) {
        return letter.toUpperCase();
    });
}

/**
 * 拼接的body转换为object
 * @param  {[string]} bodyString "a=1&b=2&c=3"
 * @return {[object]}         {"a":1,"b":2,"c":3}
 */
var body2Json = function(bodyString) {
    var paraString = bodyString.split('&');
    var jsonObj = {}
    for (var i = 0; i < paraString.length; i++) {
        jsonObj[decodeURIComponent(paraString[i].split('=')[0])] = decodeURIComponent(paraString[i].split('=')[1]);
    }
    return jsonObj;
}

/**
 * object转换为拼接的body
 * @param  {[object]} jsonObj {"a":1,"b":2,"c":3}
 * @return {[string]}         "a=1&b=2&c=3"
 */
var json2Body = function(jsonObj) {
    var bodyString = [];
    for (var e in jsonObj) {
        bodyString.push(encodeURIComponent(e) + '=' + encodeURIComponent(jsonObj[e]));
    }
    return bodyString.join('&');
}

/**
 * 计算持续时间
 * @param  {[date,date]} '2016/01/09 11:12:13'  '2016/03/02 09:08:07'
 * @return {[object]}    {day: 52, hours: 21, minute: 55, second: 54}
 */
var durationCalc = function(start_time, end_time) {
    var ms = (new Date(end_time)).getTime() - (new Date(start_time)).getTime();
    var ret = {};
    ms = ms / 1000;
    ret.day = parseInt(ms / (60 * 60 * 24));
    ms = ms % (60 * 60 * 24);
    ret.hours = parseInt(ms / (60 * 60));
    ms = ms % (60 * 60);
    ret.minute = parseInt(ms / (60));
    ret.second = ms % (60);
    return ret;
}

/**
 * 数组求和，最高效方法
 * @param  {[array]}    list [1,2,3,4,5]
 * @return {[int]}      15
 */
var sum = function(list) {
    var i = list.length - 1,
        ret = 0;
    for (; i >= 0; i--) {
        ret = ret + list[i];
    }
    return ret;
}

/**
 * 统一修复js原生tofixed的缺陷
 * @test 35.855 73.315 1.005 859.385 0.045
 1.04999999999999994 === 1.05
 1.0049999999999998 === 1.005
 1.0499999999999997 === 1.0499999999999996 === 1.0499999999999995
 */

Number.prototype._toFixed = Number.prototype._toFixed || Number.prototype.toFixed;
Number.prototype.toFixed = function(precision) {
    return (+(Math.round(+(this + 'e' + precision)) + 'e' + -precision))._toFixed(precision);
}

String.prototype.endsWith = function (suffix) {
  return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.startsWith = function(prefix) {
  return (this.substr(0, prefix.length) === prefix);
}

/**
 * stringFormat 通用字符串格式化 使用{{和}}来编码花括号
 * @param  {[string]}
 * @return {[string]}
    "{me}: Hello, {0}, are {you} feeling {1}?".formatUnicorn({you: 'wow',me: 'mom'})
-->"mom: Hello, {0}, are wow feeling {1}?"
    "{me}: Hello, {0}, are {you} feeling {1}?".formatUnicorn(['hei', 'good']);
-->"{me}: Hello, hei, are {you} feeling good?"
    "{me}: Hello, {0}, are {you} feeling {1}?".formatUnicorn('hei', 'good');
-->"{me}: Hello, hei, are {you} feeling good?"
    "{{me}}: Hello, {0}, are {you} feeling {1}?".formatUnicorn({you: 'wow',me: 'mom'});
-->"{me}: Hello, hei, are {you} feeling good?"
 */
String.prototype.formatUnicorn = function() {
    var e = this.toString();
    if (!arguments.length) return e;
    var t = typeof arguments[0],
        n = "string" == t || "number" == t ? Array.prototype.slice.call(arguments) : arguments[0];
    return this.replace(/\{\{|\}\}|\{(\w+|\d+)\}/g, function(j, k) {
        if (j == "{{") {
            return "{";
        }
        if (j == "}}") {
            return "}";
        }
        return n[k] || j;
    });
}

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
var isValidDate = function(dateString) {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split('/');
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

var isValidTime2 = function (timeString){
    if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString))
        return false;
    var parts = timeString.split(':');
    var hour = Number(parts[0]);
    var minute = Number(parts[1]);
    var second = Number(parts[2]);
    if (hour > 23 || minute > 59 || second > 59 || !hour || !minute || !second)
        return false;

    return true;
}


var isValidDate2 = function (dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString))
        return false;

    var parts = dateString.split('-');
    var year = Number(parts[0]);
    var month = Number(parts[1]);
    var day = Number(parts[2]);

    if (month >= 12 || !year || !month || !day)
        return false;

    var monthLen = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLen[1] = 29;

    if (day > monthLen[month - 1])
        return false;

    return true;
}

var isValidDateTime = function (dateTimeString){
    if (dateTimeString.indexOf(' ') === -1)
        return false;
    var parts = dateTimeString.split(' ');
    if (parts.length !== 2)
        return false;

    return isValidDate2(parts[0]) && isValidTime2(parts[1]);
}
