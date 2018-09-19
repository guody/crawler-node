const http = require('http')
const cheerio = require('cheerio')
const mysql = require('mysql')

//配置mysql参数
const connection = mysql.createConnection({  
    host: '47.104.176.177',
    user: 'root',
    password: 'Guodi3519~',
    database: 'node_test'
})

//连接mysql
connection.connect();  

const baseUrl = "http://m.58.com/bj/chuzu/";

//默认访问首页
var page =1;

getData(baseUrl,page);

function getData(baseUrl,page) {
    // 页数判断
    if(page==1){
        url = `${baseUrl}?reform=pcfront`
    }else{
        console.log(url)
        url = `${baseUrl}pn${page}/?reform=pcfront`
    }


    http.get(url,function(res){
        var html = '';
        res.setEncoding('utf-8'); //防止中文乱码

        // 监听事件传输
        res.on('data', function(chunk) {
            html += chunk;
        });

        //数据传输完
        res.on('end',function(){ 
            var $ = cheerio.load(html, {decodeEntities: true});

            $(".list-info li").each(function(){
                let room = {}
                //title
                room.title = $(this).find("dl .tit strong").text().trim(); 
                // 封面图
                room.cover = $(this).find("a").eq(0).find(".thumbnail").attr("src");
                // 详情
                room.detail = $(this).find("a").eq(0).attr('href').trim();
                // 房屋描述
                room.desc = $(this).find("dl dd.attr").eq(0).find('span').text().trim();
                // 价格
                room.price = $(this).find("dl dd.attr").eq(1).find('.price').text().trim();
                // 消息发布人
                room.own = $(this).find("dl dd.attr").eq(1).find('.price').next('.zf_geren').text().trim();
                // 发布日期
                room.pubdate = $(this).find("dl dd.attr").eq(1).children('span').last().text().trim();
                
                // console.log(room)

                // 插入数据库
                var addSql = "insert into room(title,cover,detail,room_desc,price,own,pubdate) values (?,?,?,?,?,?,?)"; 
                var addParmas = [room.title,room.cover,room.detail,room.desc,room.price,room.own,room.pubdate];

                connection.query(addSql,addParmas,function(err,data){  
                    if(err){  
                        console.log(err)
                        console.log("数据库连接错误");  
                    }
                }) 
                
            })    


        })       

    })
    
    if(page < 3) { 
        getData(baseUrl, ++page); //递归执行，页数+1
      } else {
        console.log("数据获取完毕！");              
    }

}




