const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function initDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Creating tables...');
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      twitterUsername TEXT UNIQUE NOT NULL,
      twitterAvatar TEXT,
      password TEXT NOT NULL,
      totalVotes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      cookingTime INTEGER NOT NULL,
      servings INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      image TEXT NOT NULL,
      country TEXT NOT NULL,
      category TEXT NOT NULL,
      userId INTEGER NOT NULL,
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
    
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recipeId, userId),
      FOREIGN KEY (recipeId) REFERENCES recipes (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
    
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      recipeId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipeId) REFERENCES recipes (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  console.log('Database initialized successfully!');
  await db.close();
}

initDb().catch(console.error);
