module.exports=function(app){
	app.get("/",(req,res)=>{
		res.send("hello root")
	})
	app.get("/custom",(req,res)=>{
		res.send("hello custom")
	})
	app.get("/admin",(req,res)=>{
		res.send("hello admin")
	})
}