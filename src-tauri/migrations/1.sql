CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  title TEXT NOT NULL,
  tags TEXT,
  description TEXT,
  context INTEGER
);

CREATE TABLE kvstore (
    k TEXT PRIMARY KEY NOT NULL,
    v TEXT
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  aliases TEXT,
  description TEXT,
  contexts TEXT
);

CREATE TABLE contexts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created INTEGER NOT NULL
);

CREATE TABLE alarms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT,
  timestamp INTEGER NOT NULL
);