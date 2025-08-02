import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'

let db: any = null

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    })
    
    // Actualizar tablas con campos de Twitter, país, categorías
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
    `)
  }
  return db
}

export async function createUser(twitterUsername: string, password: string, twitterAvatar: string) {
  const db = await getDb()
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    const result = await db.run(
      'INSERT INTO users (twitterUsername, password, twitterAvatar) VALUES (?, ?, ?)',
      [twitterUsername, hashedPassword, twitterAvatar]
    )
    return { id: result.lastID, twitterUsername, twitterAvatar }
  } catch (error) {
    throw new Error('User already exists')
  }
}

export async function findUserByTwitterUsername(twitterUsername: string) {
  const db = await getDb()
  return await db.get('SELECT * FROM users WHERE twitterUsername = ?', [twitterUsername])
}

export async function findUserById(id: number) {
  const db = await getDb()
  return await db.get('SELECT id, twitterUsername, twitterAvatar, totalVotes, created_at FROM users WHERE id = ?', [id])
}

export async function getTopChefs(limit: number = 10) {
  const db = await getDb()
  return await db.all(`
    SELECT 
      u.id,
      u.twitterUsername,
      u.twitterAvatar,
      COUNT(DISTINCT r.id) as recipeCount,
      COALESCE(SUM(r.votes), 0) as totalVotes
    FROM users u
    LEFT JOIN recipes r ON u.id = r.userId
    GROUP BY u.id
    ORDER BY totalVotes DESC, recipeCount DESC
    LIMIT ?
  `, [limit])
}

export async function getTopRecipes(limit: number = 10) {
  const db = await getDb()
  return await db.all(`
    SELECT 
      r.*,
      u.twitterUsername,
      u.twitterAvatar
    FROM recipes r
    JOIN users u ON r.userId = u.id
    ORDER BY r.votes DESC, r.created_at DESC
    LIMIT ?
  `, [limit])
}

export async function getLatestRecipes(limit: number = 10) {
  const db = await getDb()
  return await db.all(`
    SELECT 
      r.*,
      u.twitterUsername,
      u.twitterAvatar
    FROM recipes r
    JOIN users u ON r.userId = u.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `, [limit])
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}
