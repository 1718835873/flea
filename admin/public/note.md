##express中的中间件  express.static的使用
>app.use("/static",express.static(path.join(__dirname,"./public")))

##commonJs的规范
- require 返回外部模块所输出的API
- exports 模块必须使用”exports“对象来作为输出的唯一表示。(module.exports)

##set方法
>set方法用于指定变量的值
>>app.set("views",__dirname+"/views")

>>app.set("view engine","ejs")

##res.redirect方法
>res.redirect方法允许网址的重定向
>>res.redirect("/hello/anime")

##mongoDB学习
+ 文档(document)  集合(collection)  文档存储在集合中，类似于关系型数据库中的表

**下载mongodb npm install mongodb**
**npm install mongoose使用这个**
```nodejs
const mongoose=require("mongoose")
<!-- mongodb://主机名:端口号/数据库名称 -->
mongoose.connect("mongodb://localhost:27017/user",{useNewUrlParser:true},(err)=>{
	if(err){
		console.log(err)
		return;
	}
	console.log("链接数据库成功")
})

<!-- 创建模型对象 -->
let Schema=mongoose.Schema;
let personSchema=new Schema({
	name:String,
	age:Number,
	sex:{
		type:String,
		default:"男"
	},
	chat:String
})
<!-- 定义模型 -->
const personModel=mongoose.model("person",personSchema)

```


##如何使用mongoose连接数据库
```nodejs
<!-- dbConn.js  连接数据库-->
const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog",{useNewUrlParse:ture},(err)=>{
	if(err){
		console.log(err)
		return;
	}
	console.log("数据库连接成功")
})
module.exports=mongoose;
```

```nodejs
<!-- users.js  定义数据模型 -->
const mongoose=require("./dbConn.js")
const UserSchema=mongoose.Schema({
	username:{
		type:String,
		unique:true,
		required:true
	},
	password:{
		type:String
	},
	gender:{
		type:String
	},
	avatar:{
		type:String
	},
	phone:{
		type:String
	},
	userId:{
		type:String
	},
	state:{
		type:Number,
		default:1
	}
})

<!-- 将数据模型暴露出去 -->
module.exports=mongoose.model("users",UserSchema)


```


**查询使用?userId=123212  req.query.userId**
**参数使用/:id    req.params.id**


