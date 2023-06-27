var mysql=require('mysql');

var dbConnect={

    getConnection:function(){
        var conn=mysql.createConnection({
            host:"localhost",
            user:"root", //Replace with company's database account username
            password:"Y0nGcoCk04c0@cH", //Replace with company's database account password
        });
        return conn;
    }
}
module.exports=dbConnect;