const mysql =require("mysql");
module.exports={
	config:{
		host:"175.24.107.158",
		port:"3306",
		user:"market",
		password:"2Fk6LsEr4NRnhSi3",
		database:"market"
	},
	sqlConnect:function(sql,sqlArr,callBack){
		var pool=mysql.createPool(this.config);
		pool.getConnection((err,conn)=>{
			if(err){
				console.log('错误',err)
				console.log("数据库获取连接失败");
				return;
			}
			conn.query(sql,sqlArr,callBack);
			conn.release()
		})
	}
}