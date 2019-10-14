var express = require('express');
var fs = require("fs");

var app = express();

var HOST = "manga.snowail.me"; // 如果不是在本机上使用，请改成实际的ip地址
                        // 后面的图片的URL会使用这个变量来构造
var PORT = 3000;

/**
 * 错误提示
 */
var ErrorHelper = {
    'internal_error': function () {
        return {
            'msg': 'something wrong with server',
            'code': 1
        };
    },
    'missing_param': function (param) {
        return {
            'msg': 'missing param: ' + param,
            'code': 2
        };
    },
    'error_param': function (param, data) {
        return {
            'msg': 'the param ' + param + '(' + data + ') is illegal',
            'code': 3
        }
    },
    'not_found': function (param) {
        return {
            'msg': 'cannot find ' + param,
            'code': 4
        };
    }
};

/**
 * 检查参数格式
 */
function checkParam(param) {
    return /^[^\.\\\/]+$/.test(param);
}


app.use('/', express.static('public'));

/**
 * 获取漫画列表
 */
app.get('/get_cartoon_list', function (req, res) {
    fs.readdir(__dirname + '/public/store', function (err , files) {
        if (err) {
            res.jsonp(ErrorHelper.internal_error());
        }
        res.jsonp({'cartoon': files, 'code': 0});
    });
});

/**
 * 获取章节信息
 */
// app.get('/get_chapter_list', function (req, res) {

//     var cartoon = req.query.cartoon;
//     if (!cartoon) {
//         res.jsonp(ErrorHelper.missing_param('cartoon'));
//         return;
//     }
//
//     if (!checkParam(cartoon)) {
//         res.jsonp(ErrorHelper.error_param('cartoon', cartoon));
//         return;
//     }
//     var cartoon_dir = __dirname + '/public/store/' + cartoon;
//     fs.exists(cartoon_dir + '/index', function (exists) {
//         if (!exists) {
//             res.jsonp(ErrorHelper.not_found(cartoon));
//             return;
//         }
//         fs.readFile(cartoon_dir + '/index', function (err, data) {
//             if (err) {
//                 res.jsonp(ErrorHelper.internal_error());
//                 return;
//             }
//
//             var chapter_list = data.toString().split('\n').filter(function (d) {
//                 return d.length > 0;
//             });
//
//             res.jsonp({'chapter': chapter_list, 'code': 0});
//         });
//     });
// });

app.get('/get_img_list', function (req, res) {

    var cartoon = req.query.cartoon;
    if (!cartoon) {
        res.jsonp(ErrorHelper.missing_param('cartoon'));
        return;
    }
    if (!checkParam(cartoon)) {
        res.jsonp(ErrorHelper.error_param('cartoon', cartoon));
        return;
    }
    // var chapter = req.query.chapter;
    // if (!chapter) {
    //     res.jsonp(ErrorHelper.missing_param('chapter'));
    //     return;
    // }
    // if (!checkParam(chapter)) {
    //     res.jsonp(ErrorHelper.error_param('chapter', chapter));
    //     return;
    // }

    var cartoon_dir = __dirname + '/public/store/' + cartoon;
    fs.exists(cartoon_dir + '/index', function (exists) {
        if (!exists) {
            res.jsonp(ErrorHelper.not_found(cartoon));
            return;
        }
        fs.readdir(cartoon_dir + '/' , function (err, images) {
            if (err) {
                res.jsonp(ErrorHelper.error_param('cartoon', cartoon));
                return;
            }
            // 按名字排序
            images.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });

            var urls = images.map(function (image) {
                return 'http://' + HOST + ':' + PORT + '/store/' + cartoon + '/' + '/' + image;
            });
            res.jsonp({'img': urls, 'code': 0});
        });
    });
});

var server = app.listen(PORT, function () {
    console.log("应用实例，访问地址为 http://%s:%s", HOST, PORT);
});
