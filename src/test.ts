import mariadb from "mariadb";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({path: path.join(__dirname, "..", ".env")});
console.log(path.join(__dirname, "..", ".env"));


export const dat = async (Befehl: string, params?: any[]) =>
{
    let con;
    try
    {
        const pool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWD,
            database: process.env.DB_DB
        });
        console.log(pool);

        con = await pool.getConnection();
        let result = await con.query(Befehl, params || undefined);
        await pool.end();
        return result;
    }
    catch(err)
    {
        throw err;
    }
    finally {
        if(con) con.release();
    }
}

(async() => {
    const owo = await dat("select version();");
    fs.writeFileSync("result.json", JSON.stringify(owo));
    
})();