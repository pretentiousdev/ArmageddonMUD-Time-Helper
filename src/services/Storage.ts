import Database from 'tauri-plugin-sql-api';
import type { QueryResult } from 'tauri-plugin-sql-api';
import type { ArmEvent } from '../models/ArmEvent';
import { Tag } from '../models/Tag';
import { ArmAlarm } from '../models/ArmAlarm';
import { ArmContext } from '../models/ArmContext';

let db: null | Database = null;

async function connect() {
  if (!db) {
    try {
      db = await Database.load('sqlite:arm-events.db')
      console.log("Connection established?")
    } catch (e) {
      console.log(e);
      console.log("Error in connect");
    }
    
  }
}

async function allEvents(contexts?: number[]): Promise<ArmEvent[]> {
  await connect();
  let query = "SELECT * FROM events"
  if (contexts) {
    query += " WHERE context IN (" + contexts.join(",") + ")"
  }

  try {
    if (db) {
      let res: any[] = await db.select(query);
      res.forEach(function (item, index, arr) {
        arr[index].tags = JSON.parse(arr[index].tags);
        arr[index].timestamp = new Date(arr[index].timestamp);
        arr[index].pinned = false;
      });
      return res as ArmEvent[];
    } else {
      console.log("No db?");
    }
  } catch (e) {
    console.log(e);
  }
  return [];
}

async function allTags() {
  await connect();
  let query = "SELECT * FROM tags order by lower(name)"
  try {
    if (db) {
      let res: any[] = await db.select(query);
      res.forEach(function (item, index, arr) {
        arr[index].aliases = JSON.parse(arr[index].aliases);
      });
      return res as Tag[];
    }
  } catch (e) {
    console.log(e);
  }
  return []
}

async function allContexts() {
  await connect();
  let query = "SELECT * FROM contexts ORDER BY created";
  try {
    if (db) {
      let res: any[] = await db.select(query);
      res.forEach(function (item, index, arr) {
        arr[index].created = new Date(arr[index].created)
      });
      return res as ArmContext[];
    }
  } catch (e) {
    console.log(e);
    console.log("eeeeh?");
  }
  return []
}

async function testCreate(): Promise<number> {
  connect();
  if (db) {
    let res: QueryResult = await db.execute('INSERT INTO events (timestamp, title, tags, description, context) VALUES ($1,$2,$3,$4,$5)', [
      Date.now(),
      "This is a test!",
      ["tag1", "tag2", "tag3"],
      "This is the description",
      0
    ]);
    return res.lastInsertId
  }
  return -1;
}

async function addEvent(event: ArmEvent): Promise<number> {
  await connect();
  if (db) {
    let res = await db.execute('INSERT INTO events (timestamp, title, tags, description, context) VALUES ($1,$2,$3,$4,$5)', [
      event.timestamp.getTime(),
      event.title,
      event.tags,
      event.description,
      event.context
    ]);
    return res.lastInsertId;
  } else {
    console.warn(`There is not a valid DB connection`);
    return -1;
  }
}

async function addTag(tag: Tag) {
  await connect();
  if (db) {
    let res = await db.execute('INSERT INTO tags (name, description, aliases) VALUES ($1,$2,$3)',[
      tag.name,
      tag.description,
      tag.aliases
    ])
    return res.lastInsertId;
  } else {
    console.log("No db? addTag")
  }

  return -1;
}

async function updateEventTags(ev: ArmEvent) {
  await connect();
  if (db) {
    await db.execute('UPDATE events SET tags = $1 WHERE id = $2', [
      ev.tags,
      ev.id
    ])
  }
}

async function deleteTag(tagID: number) {
  await connect();
  if (db) {
    await db.execute('DELETE FROM tags WHERE id = $1', [
      tagID
    ])
  }
}

async function deleteContext(contextID: number) {
  await connect();
  if (db) {
    await db.execute('DELETE FROM contexts WHERE id = $1', [contextID]);
    await db.execute('DELETE FROM events WHERE context = $1', [contextID]);
  }
}

async function updateTag(tag: Tag) {
  await connect();
  if (db) {
    await db.execute('UPDATE tags SET name = $1, description = $2, aliases = $3 WHERE id = $4', [
      tag.name,
      tag.description,
      tag.aliases,
      tag.id,
    ])
  }
}

async function updateEvent(ev: ArmEvent) {
  await connect();
  if (db) {
    await db.execute(
      'UPDATE events SET title = $1, description = $2, tags = $3, timestamp = $4, context = $5 WHERE id = $6', [
        ev.title,
        ev.description,
        ev.tags,
        ev.timestamp.getTime(),
        ev.context,
        ev.id
      ])
  }
}

async function deleteEvent(evID: number) {
  await connect();
  if (db) {
    await db.execute('DELETE FROM events WHERE id = $1', [
      evID
    ])
  }
}

async function deleteAlarm(alarmID: number) {
  await connect();
  if (db) {
    let res = await db.execute('DELETE FROM alarms where id = $1', [
      alarmID
    ])
  }
}

async function addAlarm(alarm: ArmAlarm) {
  await connect();
  if (db) {
    let res = await db.execute('INSERT INTO alarms (title, body, timestamp) VALUES ($1, $2, $3)', [
      alarm.title, alarm.body, alarm.timestamp.getTime()
    ]);
    return res.lastInsertId;
  } else {
    console.log("Problem with DB?")
  }

  return -1;
}

async function addContext(name: string) {
  let context = {name: name, id: -1, created: new Date()}
  await connect();
  if (db) {
    let res = await db.execute('INSERT INTO contexts (name, created) VALUES ($1, $2)',
      [context.name, context.created.getTime()]
      )
      context.id = res.lastInsertId;
  } else {
    console.log("No db connection: addContext()")
  }

  return context
}

async function updateAlarm(alarm: ArmAlarm) {
  await connect();
  if (db) {
    await db.execute('UPDATE alarms SET title = $1, body = $2, timestamp = $3 WHERE id = $4', [
      alarm.title, alarm.body, alarm.timestamp.getTime(), alarm.id
    ])
  }
}

async function allAlarms(): Promise<ArmAlarm[]> {
  await connect();
  let query = "SELECT * FROM alarms"

  try {
    if (db) {
      let res: any[] = await db.select(query);
      res.forEach(function (item, index, arr) {
        arr[index].timestamp = new Date(arr[index].timestamp);
        arr[index].timeout = null;
      });
      return res as ArmAlarm[];
    } else {
      console.log("No db?");
    }
  } catch (e) {
    console.log(e);
  }
  return [];
}

async function numEventsForContext(contextID: number): Promise<number> {
  await connect();
  if (db) {
    /* Select count(*) has not been working for some reason. It just keeps returning.[{COUNT(*): null}] */
    let res: any[] = await db.select("SELECT id FROM events WHERE context = $1", [contextID]);
    return res.length;
  }

  return 0;
}

export interface filterOptions {
  tags?: number[];
  contexts: number[];
  start?: Date;
  end?: Date;
}

async function filterEvents(tagIDs: number[], contexts?: number[]): Promise<number[]> {
  let tags = tagIDs.join(',')
  let query = `SELECT events.id, events.title FROM events, json_each(events.tags) WHERE json_each.value in (${tags})`;
  if (contexts) {
    let c = 
    query += ` AND context in (`
  }
  await connect();
  if (db) {
    let res: any[] = await db.select(query);
    res = res.map((val) => { return val.id })
    return res as number[];
  }
  return [];
}

async function updateContext(contextID: number, name: string) {
  await connect();
  if(db) {
    await db.execute('UPDATE contexts SET name = $1 WHERE id = $2', [name, contextID]);
  }
}

async function kvStore(key: string, value: string) {
  await connect();
  if (db) {
    await db.execute('INSERT into kvstore (k, v) VALUES ($1, $2) ON CONFLICT(k) DO UPDATE SET v = $2', [
      key, value
    ]);
  }
}

export interface kv {
  key: string,
  value: string
}

async function kvLoadAll(): Promise<kv[]> {
  await connect();
  if (db) {
    const res: any[] = await db.select('SELECT * FROM kvstore');
    res.forEach((kv) => {
      kv.key = kv.k;
      kv.value = kv.v;
    })
    return res as kv[];
  }
  return [];
}


export default {
  allEvents,
  addEvent,
  testCreate,
  addTag,
  allTags,
  updateEventTags,
  deleteTag,
  updateTag,
  deleteEvent,
  updateEvent,
  addAlarm,
  updateAlarm,
  allAlarms,
  deleteAlarm,
  addContext,
  allContexts,
  deleteContext,
  numEventsForContext,
  updateContext,
  kvStore,
  kvLoadAll
};