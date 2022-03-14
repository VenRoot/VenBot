const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

console.log(process.env);

const dat = async (Befehl, params) =>
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
    
        con = await pool.getConnection();
        let result = await con.query(Befehl, params || undefined);
        await pool.end();
        return result;
    }
    catch(err)
    {
        console.error(JSON.stringify(err));
        throw err;
    }
    finally {
        if(con) con.release();
    }
}

(async () => {
    const allUsers = await dat('SELECT * FROM accepted');
    allUsers.forEach(({username, id}) => {
        console.log(`${username} (${id})`);
    });
})();


