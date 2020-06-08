var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const now_date = moment().format('YYYY-MM-DD HH:mm:ss');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, '172.30.1.44', function () {
    console.log('서버 실행 중...');
});

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "testandroid",
    password: "ranch0104",
    port: "3306"
});

app.post('/user/join', function (req, res) {
    console.log(req.body);
    var userId = req.body.userId;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;
    var patient_id = req.body.patient_id;
    var userEmail = req.body.userEmail;

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO Users VALUES (?,?,?,?,?)';
    var params = [userId, userPwd, userName, patient_id, userEmail];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = 'join 에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '회원가입에 성공했습니다.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
});

app.post('/user/time', function (req, res) {
    console.log(req.body);
    var medName = req.body.medName;
    var patientname = req.body.patientname;
    var medTime = req.body.medTime;
    date = now_date;
    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO TimeSetting (patientname,medName,medTime,date) VALUES (?,?,?,?)';
    var params = [patientname, medName, medTime, date];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = 'time 에러가 발생했습니다';
        console.log(medName+'time에서 받은 약이름');

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '약 주기 등록에 성공했습니다.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
});

app.post('/user/delmeddata', function(req, res){
    var pos = req.body.pos;
    var medName;
    var message;
    var patientname = req.body.patientname;
    console.log(patientname+"!!!");
    var sql= 'select * from TimeSetting where patientname=?';
    var sqldel= 'delete from TimeSetting where medName=? and patientname=?';
    connection.query(sql, patientname, function (err, result) {
        var resultCode = 404;
        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
            } else {
                resultCode = 200;
                medName = result[pos].medName;
                var param = [medName, patientname];
                connection.query(sqldel, param, function(err, result){
                    console.log('삭제 완료'+medName+patientname);
                    message = "삭제 완료"
                })
                }
            }

        
        res.json({
            'code': resultCode,
            'message':message
        });
   })
});

app.post('/user/mednamecheck', function (req, res) {
    console.log(req.body);
    var medName = req.body.medName;
    var medTime = req.body.medTime;
    var patientName = req.body.patientName;
    date = now_date;
    // 삽입을 수행하는 sql문.
    var sql= 'select * from TimeSetting where medName=? and patientName=?';
    var sqldel= 'delete from TimeSetting where medName=? and patientName=?';
    var sqlinsert= 'INSERT INTO alltimelist (medName,medTime,patientname,date) VALUES (?,?,?,?)';
    var params = [medName, medTime, patientName, date];
    var params1 =[medName, patientName];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sqlinsert,params,function (err, result){
        console.log('삽입성공')
        connection.query(sql, params1, function (err, result) {
            var resultCode = 404;
            var message = 'medtimecheck 에러가 발생했습니다';
            console.log('찾기'+patientName+medName);
            if (result.length===0) {
                resultCode = 200;
                message = '성공'
            } else if(req.body.medName === result[0].medName) {
                resultCode = 100;
                message = '동일한 약 이름이 있습니다.';
                connection.query(sqldel, params1, function (err, result){
                    console.log('삭제 완료');
                });
            } 
            console.log(req.body.medName+'check 후 약이름');
    
            res.json({
                'code': resultCode,
                'message': message,
                'medName': req.body.medName,
                'medTime' : req.body.medTime
            });
        });

    });
});


app.post('/user/gettime', function (req, res) {
    var medNameApp =[];
    var medTimeApp =[];
    var patientname = req.body.patientname;
    var sql = 'select * from TimeSetting where patientname=?';

    connection.query(sql, patientname, function (err, result) {
        var resultCode = 404;
        console.log(patientname+"!@!#!@#!");
        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
            } else {
                resultCode = 200;
                for(i=0; i<result.length; i++){
                    medNameApp[i] = result[i].medName;
                    medTimeApp[i] = result[i].medTime;
                    console.log(medNameApp[i]);
                    console.log(medTimeApp[i]);
                    console.log(i);
                    console.log(result.length);
                }
            }

        }

        res.json({
            'code': resultCode,
            'length':result.length,
            'medNameApp': medNameApp,
            'medTimeApp' : medTimeApp
        });
    })
});

app.post('/user/login', function (req, res) {
    var userId = req.body.userId;
    var userPwd = req.body.userPwd;
    var sql = 'select * from Users where UserId = ?';

    connection.query(sql, userId, function (err, result) {
        var resultCode = 404;
        var message = 'login 에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
            } else if (userPwd !== result[0].UserPwd) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                resultCode = 200;
                message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
            }
        }

        res.json({
            'code': resultCode,
            'message': message,
            'userid' : result[0].UserName
        });
    })
});