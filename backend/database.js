
//verbose is only for detailed logging of
//db
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the database file (nodes.db)
const db = new sqlite3.Database(path.join(__dirname, 'nodes.db'), (err) => {
  if (err) {
    console.error('❌ Database failed to open:', err.message);
  } else {
    console.log('📂 Database opened successfully');
  }
});
// Create the table if it doesn't exist
//serialize to ensure that the queries are executed in order
//ensures querys run one after other
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phase INTEGER NOT NULL,
      categories TEXT,
      parentIds TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Failed to create table:', err);
    } else {
      console.log('✅ Database table ready!');
    }
  });
});
//exporting our db for other 
module.exports = db;