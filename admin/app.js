const express=require("express");
const request=require("request");

const mysql=require("mysql")
const fs=require("fs")
const multer=require("multer")
var upload=multer({dest:"./uploads/"})  //当前目录下建立文件夹uploads

const path=require("path")


const app=express();
const bodyParser=require("body-parser")
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use("/static",express.static(path.join(__dirname,"/uploads")))
//静态资源文件夹

const appid="wx5be97245abee7fdc"
const appSecret="f8cb85ba2928ac3d12bd7d3b9c4e818e"

const port =30001;

const session=require("express-session")

app.use(session({
	secret:"recommand 128",
	cookie:{maxAge:60*1000}
}))
const dbConn=require("./controllers/conn.js")


// 图片上传
app.post("/api/uploadImg",upload.single("file"),(req,res)=>{
	var mime=req.file.mimetype.split("/")[1]
	var newFileName=req.file.filename+"."+mime.trim()
	res.send({
		code:"1",
		msg:"文件上传成功",
		fileName:newFileName
	})
})

// 用户登录
app.get("/api/login",(req,res,next)=>{
	const code=req.query.code
	const url=`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
	request(url,(err,wxresult,body)=>{
		res.send({
			"code":1,
			"msg":"请求数据成功",
			"data":body
		})
	})  
})


app.get("/api/userToken",(req,res,next)=>{
	const tokenUrl=`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appSecret}`;
	request(tokenUrl,(err,wxres,body)=>{
		res.send({
			code:1,
			msg:'操作成功',
			data:body
		})
	})
})
// 保存用户信息
app.post("/api/saveInfo",(req,res)=>{
	var userInfo=req.body;
	var userName=userInfo.userName;
	var avatar=userInfo.avatar;
	
	// 判断数据库中是否有这个人
	var queryUser=`select * from user where userName=?`
	var queryUserPara=[userName]
	var queryCallBack=(err,queryData)=>{
		if(err){
			console.log("数据库出错了");
			res.send({
				"code":-1,
				"msg":"数据库失败"
			})
		}else{
			// console.log("queryData.RowDataPacket",queryData.RowDataPacket)
			if(queryData.length>0){
				// 数据库中已存在该用户
				res.json({
					"code":1,
					"list":queryData,
					"msg":"获取数据成功1"
				})
			}else{
				var sql=`insert into user (userName,avatar,iscustom,wechat,isseller) values(?,?,1,"",0)`;
				var sqlArr=[userName,avatar];
				var callBack=(err,data)=>{
					if(err){
						console.log("连接出错了");
						res.send({
							"code":-1,
							"msg":"获取数据失败2"
						})
					}else{
						// 重新获取用户信息
						var userId=data.insertId;
						var selSql="select * from user where userId=?"
						var selArr=[userId]
						var selCallBack=(err,selData)=>{
							if(err){
								res.send({
									code:-1,
									msg:"获取数据失败"
								})
							}else{
								res.json({
									"code":1,
									"list":selData,
									"msg":"获取数据成功"
								})
							}
						}
						dbConn.sqlConnect(selSql,selArr,selCallBack)
						
					}
				}
				dbConn.sqlConnect(sql,sqlArr,callBack)
			}
		}
	}
	dbConn.sqlConnect(queryUser,queryUserPara,queryCallBack)

	
})

// 根据用户Id获取用户信息
app.get("/api/getUserInfoById",(req,res)=>{
	var userId=req.query.userId;
	console.log("---------------------")
	console.log(userId)
	var sql="select * from user where userId=?";
	var sqlArr=[userId];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})

// 根据用户id更新手机号和微信号
app.post("/api/updatePhoneById",(req,res)=>{
	var userId=req.body.userId;
	var phone=req.body.phone;
	// var wechat=req.body.wechat;
	console.log("---------------------")
	console.log(userId)
	var sql="update user set phone=? where userId=?";
	var sqlArr=[phone,userId];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 根据用户id更新手机号和微信号
app.post("/api/updateWechatById",(req,res)=>{
	var userId=req.body.userId;
	// var phone=req.body.phone;
	var wechat=req.body.wechat;
	console.log("---------------------")
	console.log(userId)
	var sql="update user set wechat=? where userId=?";
	var sqlArr=[wechat,userId];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 获取优质卖家
app.get("/api/allSeller",(req,res)=>{
	var sql="select * from  user where isseller=1 limit 4";
	var sqlArr=[];
	var callBack=(err,data)=>{
		if(err){
			console.log("连接出错了",err);
			res.send({
				"code":-1,
				"msg":"获取数据失败"
			})
		}else{
			res.send({
				"code":1,
				"list":data,
				"msg":"获取数据成功"
			})
		}
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 获取商品
app.get("/api/allGoods",(req,res)=>{
	var page=(req.query.page==undefined)?0:req.query.page;//获取当前页码
	console.log("page",page)
	var startPage=page*5//计算每页几条数据
	var count="select count(*) as count from goods";//统计数据库中有多少条数据
	console.log("输出记录")
	var sql=`select * from goods limit ${startPage} , 5`;
	var sqlArr=[];
	var callBack=(err,countRes)=>{
		if(err){
			console.log("连接出错了",err);
			res.send({
				"code":-1,
				"msg":"获取数据失败"
			})
			return;
		}else{
			res.count=countRes[0].count
			console.log(res.count)
		}
	}
	dbConn.sqlConnect(count,sqlArr,callBack)
	
	
	var callBack=(err,getRes)=>{
		if(err){
			console.log("连接出错了",err);
			res.send({
				"code":-1,
				"msg":"获取数据失败"
			})
			return;
		}else{
			res.send({
				"code":1,
				"msg":"获取数据成功",
				"page":page,
				count:res.count,
				data:getRes
			})
		}
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})


//根据id获取商品详情
app.get("/api/getGoodsById",(req,res)=>{
	var id=req.query.id;
	var sql="select * from goods where id=?"
	var sqlArr=[id]
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
			return;
		}
		res.send({
			code:1,
			msg:'获取数据成功',
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 上传发布的商品
app.post("/api/publishGoods",(req,res)=>{
	console.log(req.body)
	var tag=req.body.type;
	var goodsName=req.body.title;
	var price=req.body.price;
	var descrip=req.body.descrip;
	var sellerId=req.body.sellerId;
	var sellerName=req.body.sellerName;                                                                             
	var sellerAvatar=req.body.sellerAvatar;
	var sellerPhone=req.body.sellerPhone;
	var wechat=req.body.sellerWechat;
	var publishTime=req.body.publishTime;
	var goodsImg=req.body.goodsImg;
	// 插入数据  标签 商品名称  商品价格  描述  卖家id  卖家名称  卖家头像  微信  发布时间  商品图片
	var sql="insert into goods (tag,goodsName,price,descrip,sellerId,sellerName,sellerPhone,sellerAvatar,wechat,publishTime,goodsImg) values (?,?,?,?,?,?,?,?,?,?,?)";
	var sqlArr=[tag,goodsName,price,descrip,sellerId,sellerName,sellerPhone,sellerAvatar,wechat,publishTime,goodsImg];
	var callBack=(err,data)=>{
		if(err){
			console.log(err)
			res.send({
				code:-1,
				msg:'上传数据失败'
			})
			return false;
		}
		
		res.send({
			code:1,
			msg:"上传数据成功",
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 注册成为商家

app.post("/api/registerSeller",(req,res)=>{
	var userId=req.body.userId;
	var phone=req.body.phone;
	var wechat=req.body.wechat;
	
	var sql="update user set isseller=1 , wechat=? ,phone=?  where userId=?"
	var sqlArr=[phone,wechat,userId];
	var callBack=(err,data)=>{
		console.log(data)
		if(err){
			res.send({
				code:-1,
				msg:"注册成为商家失败"
			})
			return false;
		}
		
		res.send({
			code:1,
			msg:'注册成为商家成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 获取发布的商品
app.get("/api/myPublishGoods",(req,res)=>{
	var userId=req.query.userId;
	var sql="select * from goods where sellerId=?";
	var sqlArr=[userId];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
			return false;
		}
		
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 删除发布的商品
app.get("/api/delPublishGoods",(req,res)=>{
	var id=req.query.id;
	var sql="delete from goods where id=?";
	var sqlArr=[id];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"删除数据失败"
			})
		}
		
		res.send({
			code:1,
			msg:"删除数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
	
})


// 查询发布的商品  两个表连接查询  根据用户名   查询条件是  商品名称  商户 
app.get("/api/searchGoods",(req,res)=>{
	console.log(req.query.words)
	var mainWords=req.query.words || "";
	
	if(mainWords.length<1){
		var sql="select * from goods";
	}else{
		var sql=`select * from goods  where sellerName like "%${mainWords}%" or goodsName like "%${mainWords}%" or tag like "%${mainWords}%" `;
	}
	console.log("-------------------------",mainWords)
	
	var sqlArr=[];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"查询数据失败"
			})
		}
		res.send({
			code:1,
			msg:"查询数据成功",
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 根据买家Id获取商品列表
app.get("/api/getGoodsBySellerId",(req,res)=>{
	var sellerId=req.query.sellerId;
	var sql="select * from goods where sellerId=?";
	var sqlArr=[sellerId];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack);
	
})



// 收藏表 加入收藏
app.post("/api/love",(req,res)=>{
	var goodsId=req.body.goodsId;
	var goodsImg=req.body.goodsImg;
	var goodsName=req.body.goodsName;
	var descrip=req.body.descrip;
	var loveId=req.body.loveId;
	var sellerId=req.body.sellerId;
	var publishTime=req.body.publishTime;
	
	var sql="insert into love (goodsId,goodsImg,goodsName,descrip,loveId,sellerId,publishTime) values (?,?,?,?,?,?,?)"
	var sqlArr=[goodsId,goodsImg,goodsName,descrip,loveId,sellerId,publishTime];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:'收藏失败'
			})
		}
		res.send({
			code:1,
			msg:'收藏成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})

// 更新商品表中的likeNum； 根据商品id
app.get("/api/updateLikeNumByGoodsId",(req,res)=>{
	var id=req.query.id;
	var sql="update goods set likeNum=likeNum+1 where id=?";
	var sqlArr=[id];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:'收藏失败'
			})
		}
		res.send({
			code:1,
			msg:'收藏成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})


// 取消收藏
app.post("/api/cancleLove",(req,res)=>{
	var goodsId=req.body.goodsId;
	var loveId=req.body.userId;
	
	var sql="delete from love where goodsId=? and loveId=?";
	var sqlArr=[goodsId,loveId];
	var callBack=(err,data)=>{
		if(err){
			console.log(err)
			res.send({
				code:-1,
				msg:'取消收藏失败'
			})
		}
		res.send({
			code:1,
			msg:'取消收藏成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
// 更新商品表中的likeNum； 根据商品id
app.get("/api/updateLikeNumByGoodsId",(req,res)=>{
	var id=req.query.id;
	var sql="update goods set likeNum=likeNum-1 where id=?";
	var sqlArr=[id];
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:'取消收藏失败'
			})
		}
		res.send({
			code:1,
			msg:'取消收藏成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})

// 根据收藏者id 和商品id 获取收藏表中的数据
app.post("/api/getLoveGoodsById",(req,res)=>{
	var loveId=req.body.userId;
	var goodsId=req.body.goodsId;
	var sql="select * from love where loveId=? and goodsId=?"
	var sqlArr=[loveId,goodsId]
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:"获取数据成功",
			data:data
		})
	}
	dbConn.sqlConnect(sql,sqlArr,callBack)
})


// 根据用户id获取收藏的数据

app.get('/api/getLoveGooDsByUserId',(req,res)=>{
	var userId=req.query.userId;
	var sql="select * from love where loveId=?";
	var sqlArr=[userId]
	var callBack=(err,data)=>{
		if(err){
			res.send({
				code:-1,
				msg:"获取数据失败"
			})
		}
		res.send({
			code:1,
			msg:'获取数据成功',
			data:data
		})
	}
	
	dbConn.sqlConnect(sql,sqlArr,callBack)
})
app.listen(port,()=>{
	console.log("app is start") 
})