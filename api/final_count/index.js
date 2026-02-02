const sql = require("mssql");

module.exports = async function (context, req) {
  // Read from SWA environment variables
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,    
    database: process.env.SQL_DATABASE, 
    options: {
      encrypt: true
    }
  };

  // Basic validation to avoid confusing silent failures
  const missing = [];
  ["SQL_USER","SQL_PASSWORD","SQL_SERVER","SQL_DATABASE"].forEach(k => {
    if (!process.env[k]) missing.push(k);
  });
  if (missing.length) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: `Missing environment variables: ${missing.join(", ")}` }
    };
    return;
  }

  let pool;
  try {
    pool = await sql.connect(config);

    const query = `
      SELECT Country, COUNT(*) AS StudentCount
      FROM dbo.Students
      GROUP BY Country
      ORDER BY StudentCount DESC;
    `;

    const result = await pool.request().query(query);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: result.recordset
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: "Database query failed",
        details: err.message
      }
    };
  } finally {
    try { await sql.close(); } catch (_) {}
  }
};
