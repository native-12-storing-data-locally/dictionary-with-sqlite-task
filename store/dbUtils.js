
import * as SQLite from "expo-sqlite";

let database = null;

function getDatabase() {
  if (!database) {
    if (typeof SQLite.openDatabase !== "function") {
      throw new Error(
        "Цей код потребує версії expo-sqlite зі старим API openDatabase()."
      );
    }

    database = SQLite.openDatabase("dictionary.db");
  }

  return database;
}

function executeSql(sql, params = []) {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      },
      (error) => reject(error)
    );
  });
}

export async function init() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS theme (
      id INTEGER PRIMARY KEY NOT NULL,
      isDark INTEGER NOT NULL
    );
  `);

  await executeSql(
    "INSERT OR IGNORE INTO theme (id, isDark) VALUES (1, 1)"
  );
}

export async function addWord(word) {
  await executeSql(
    "INSERT OR REPLACE INTO words (word, data) VALUES (?, ?)",
    [word.word, JSON.stringify(word)]
  );
}

export async function updateWord(word) {
  await executeSql(
    "INSERT OR REPLACE INTO words (word, data) VALUES (?, ?)",
    [word.word, JSON.stringify(word)]
  );
}

export async function deleteWord(wordText) {
  await executeSql("DELETE FROM words WHERE word = ?", [wordText]);
}

export async function getWords() {
  const result = await executeSql("SELECT data FROM words");
  const words = [];

  for (let i = 0; i < result.rows.length; i += 1) {
    words.push(JSON.parse(result.rows.item(i).data));
  }

  return words;
}

export async function getTheme() {
  const result = await executeSql(
    "SELECT isDark FROM theme WHERE id = 1"
  );

  if (result.rows.length === 0) {
    return true;
  }

  return result.rows.item(0).isDark === 1;
}

export async function setTheme(isDark) {
  await executeSql(
    `INSERT OR REPLACE INTO theme (id, isDark)
     VALUES (1, ?)`,
    [isDark ? 1 : 0]
  );
}
