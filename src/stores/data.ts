import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, reactive, Ref, ref } from 'vue';
import { ArmAlarm } from '../models/ArmAlarm';
import { ArmEvent, filterOptions } from '../models/ArmEvent';
import { Tag, hasName } from '../models/Tag';
import storage from '../services/Storage';
import notify from '../services/Notifications'
import { ArmContext } from '../models/ArmContext';
import { moonsState, ZalanthanTime } from '../models/ZalanthanTime';

export const useDataStore = defineStore('data', () => {
    const allEvents: Ref<ArmEvent[]> = ref([]);
    const pinnedEvents: Ref<ArmEvent[]> = ref([]);
    const allTags: Ref<Tag[]> = ref([]);
    const allAlarms: Ref<ArmAlarm[]> = ref([]);
    const allContexts: Ref<ArmContext[]> = ref([])
    const tagIDMap: Ref<Map<number, Tag>> = ref(new Map<number, Tag>());
    const undefinedTag: Tag = {id: -1, name: 'Not a valid tag', description: '', aliases: [], contexts: []};
    let alarmCheck: null | number = null;
    const moonsCache: moonsState[] = loadMoonsCache();

    const eventSearchFilter: Ref<filterOptions | null> = ref(null);
    const filteringEvents = ref(false);
    const filteredEvents = computed(() => {
        if (eventSearchFilter.value === null) {
            return allEvents.value;
        }
        const f = eventSearchFilter.value;
        filteringEvents.value = true;
        const res = allEvents.value.filter((ev) => {
            if (f.start && f.start > ev.timestamp) {
                return false;
            }

            if (f.end && f.end < ev.timestamp) {
                return false;
            }

            if (f.contexts && !f.contexts.includes(ev.context)) {
                return false;
            }

            if (f.tags) {
                if (f.anyTags && f.anyTags === true) {
                    let containsTags = false;
                    for (let i = 0; i < f.tags.length; i++) {
                        if (ev.tags.includes(f.tags[i])) {
                            containsTags = true;
                            break;
                        }
                    }
                    if (!containsTags) {
                        return false;
                    }
                } else {
                    for (let i = 0; i < f.tags.length; i++) {
                        if (!ev.tags.includes(f.tags[i])) {
                            return false;
                        }
                    }
                }
            }

            if (f.words) {
                if (f.anyWords && f.anyWords === true) {
                    let containsWords = false;
                    for (let i = 0; i < f.words.length; i++) {
                        if (ev.title.toLowerCase().includes(f.words[i])) {
                            containsWords = true;
                            break;
                        }
                        if (ev.description.toLowerCase().includes(f.words[i])) {
                            containsWords = true;
                            break;
                        }
                    }
                    if (!containsWords) {
                        return false;
                    }
                } else {
                    for (let i = 0; i < f.words.length; i++) {
                        if (!ev.title.toLowerCase().includes(f.words[i]) && !ev.description.toLowerCase().includes(f.words[i])) {
                            return false;
                        }
                    }
                }
            }
            return true;
        })
        filteringEvents.value = false;
        return res;
    })
    const alarmCheckInterval = 1000 * 60 * 60 * 6;

    async function loadEventsWithContexts(contexts?: number[]) {
        let evs = await storage.allEvents(contexts)
        allEvents.value = evs
    }

    function addToPinned(ev: ArmEvent): boolean {
        if (ev.pinned) { return false }
        ev.pinned = true;
        pinnedEvents.value.unshift(ev);
        return true;
    }

    function loadMoonsCache(): moonsState[] {
        const d = new ZalanthanTime(new Date());
        d.hour = 1;
        const moons: moonsState[] = []
        for (let i = 0; i < ZalanthanTime.daysPerMonth; i++) {
            d.day = i;
            moons.push(d.getMoons())
        }
        return moons;
    }

    function addSearchToPinned() {
        for (let i = filteredEvents.value.length - 1; i >= 0; i--) {
            const ev = filteredEvents.value[i];
            addToPinned(ev)
        }
    }

    function togglePinned(ev: ArmEvent) {
        for (let i = 0; i < pinnedEvents.value.length; i++) {
            if (pinnedEvents.value[i].id === ev.id) {
                pinnedEvents.value[i].pinned = false;
                pinnedEvents.value.splice(i,1);
                return
            }
        }
        ev.pinned = true;
        pinnedEvents.value.unshift(ev);
        return;
    }

    function removeFromPinned(eventID: number) {
        for (let i = 0; i < pinnedEvents.value.length; i++) {
            if (pinnedEvents.value[i].id === eventID) {
                pinnedEvents.value[i].pinned = false;
                pinnedEvents.value.splice(i,1);
                return;
            }
        }
    }

    async function loadTags() {
        tagIDMap.value = new Map<number, Tag>();
        allTags.value = await storage.allTags();
        allTags.value.forEach((tag) => {
            tagIDMap.value.set(tag.id, tag);
        })
    }

    async function loadContexts() {
        allContexts.value = await storage.allContexts();
        if (allContexts.value.length === 0) {
            addContext('Historical')
            addContext('Zalanthas');
        }
    }

    async function numEventsForContext(contextID: number) {
        let num = await storage.numEventsForContext(contextID);
        return num;
    }

    function getTag(id: number) {
        let tag = tagIDMap.value.get(id);
        if (tag) {
            return tag;
        } else {
            return undefinedTag;
        }
    }

    let undefinedContext: ArmContext = {name: 'No such Context', id: -1, created: new Date()};
    function getContext(id: number): ArmContext {
        for (let i = 0; i < allContexts.value.length; i++) {
            const con = allContexts.value[i];
            if (con.id === id) {
                return con;
            }
        }
        return undefinedContext
    }

    function getTagByName(name: string) {
        let n = name.toLowerCase();
        for (let i = 0; i < allTags.value.length; i++) {
            if (hasName(allTags.value[i],n))  {
                return allTags.value[i]
            }
        }
        return null;
    }

    async function addEvent(title: string, description: string, tags: number[], timestamp: Date, context: number) {
        let event: ArmEvent = {
            id: -1,
            title: title,
            description: description,
            tags: [...tags],
            timestamp: timestamp,
            context: context,
            pinned: false
        }
        let id = await storage.addEvent(event);
        event.id = id;
        allEvents.value.push(event);
    }

    async function addTag(name: string, description: string, aliases: string []) {
        let tag: Tag = { name: name, id: 0, description: description, aliases: [...aliases], contexts: []}
        let lname = name.toLowerCase();
        let pos = -1
        for (let i = 0, len = allTags.value.length; i < len; i++) {
            if (lname === allTags.value[i].name.toLowerCase()) {
                return -1;
            }
            if (lname < allTags.value[i].name.toLowerCase()) {

                allTags.value.splice(i, 0, tag);
                pos = i;
                break;
            }
        }

        if (pos === -1) {
            allTags.value.push(tag);
        }

        let id = await storage.addTag(tag);
        if (id !== -1) {
            tag.id = id;
            tagIDMap.value.set(id, tag);
            return id;
        } else {
            console.log("Problem adding tag.")
            
        }

        return -1;
    }

    async function deleteTag(tagID: number) {
        for (let i = 0; i < allEvents.value.length; i++) {
            const ev = allEvents.value[i];
            const index = ev.tags.indexOf(tagID, 0);
            if (index > -1) {
                ev.tags.splice(index, 1);
            }
            await storage.updateEventTags(ev);
        }

        for (let i = 0; i < allTags.value.length; i++) {
            if (allTags.value[i].id === tagID) {
                allTags.value.splice(i, 1);
                break;
            }
        }

        await storage.deleteTag(tagID)
    }

    async function deleteContext(contextID: number) {
        for (let i = 0; i < allContexts.value.length; i++) {
            if (allContexts.value[i].id === contextID) {
                allContexts.value.splice(i, 1);
                break;
            }
        }

        allEvents.value = allEvents.value.filter((element, index, array) => {
            return (element.context !== contextID);
        })
        await storage.deleteContext(contextID)
    }

    async function updateTag(tag: Tag) {
        await storage.updateTag(tag);
        for (let i = 0; i < allTags.value.length; i++) {
            const t = allTags.value[i];
            if (t.id === tag.id) {
                t.name = tag.name;
                t.description = tag.description;
                t.aliases = [...tag.aliases];
                return;
            }
        }
    }

    async function updateEvent(ev: ArmEvent) {
        await storage.updateEvent(ev);
        for (let i = 0; i < allEvents.value.length; i++) {
            const e = allEvents.value[i];
            if (e.id === ev.id) {
                e.title = ev.title;
                e.description = ev.description;
                e.tags = [...ev.tags];
                e.timestamp = ev.timestamp;
                e.context = ev.context;
                return;
            }
        }
    }

    async function updateAlarm(alarm: ArmAlarm) {
        await storage.updateAlarm(alarm);
        for (let i = 0; i < allAlarms.value.length; i++) {
            const a = allAlarms.value[i];
            if (alarm.id === a.id) {
                a.title = alarm.title;
                a.body = alarm.body;
                a.timestamp = alarm.timestamp;
                if (a.timeout) { 
                    clearTimeout(a.timeout);
                    a.timeout = null;
                    setAlarm(a);
                }
                return;
            }
        }
    }

    async function deleteEvent(evID: number) {
        await storage.deleteEvent(evID);
        for (let i = 0; i < allEvents.value.length; i++) {
            if (allEvents.value[i].id === evID) {
                allEvents.value.splice(i, 1);
                if (allEvents.value[i].pinned) {
                    removeFromPinned(allEvents.value[i].id)
                }
                break;
            }
        }
    }

    async function deleteAlarm(alarm: ArmAlarm) {
        await storage.deleteAlarm(alarm.id);
        if (alarm.timeout) {
            clearTimeout(alarm.timeout)
        }
        for (let i = 0; i < allAlarms.value.length; i++) {
            if (allAlarms.value[i].id === alarm.id) {
                allAlarms.value.splice(i, 1);
                break;
            }
        }
    }

    async function addAlarm(alarm: ArmAlarm) {
        let a = {
            id: alarm.id, title: alarm.title, body: alarm.body,
            timestamp: alarm.timestamp, timeout: alarm.timeout
        }

        let id = await storage.addAlarm(alarm);
        a.id = id;
        allAlarms.value.push(a);
        setAlarm(a);
        notify.checkForPermissions();
    }

    async function newAlarm(title: string, body: string, time: Date) {
        let alarm = {
            id: -1,
            title: title,
            body: body,
            timestamp: time,
            timeout: null
        }

        addAlarm(alarm);
    }

    async function addContext(name: string) {
        let newContext = await storage.addContext(name);
        if (newContext.id !== -1) {
            allContexts.value.push(newContext)
        } else {
            console.log('Problem adding context.')
        }

        return newContext;
    }

    async function updateContext(id: number, name: string) {
        for (let i = 0; i < allContexts.value.length; i++) {
            if (allContexts.value[i].id === id) {
                allContexts.value[i].name = name;
                storage.updateContext(id, name)
                return;
            }
        }
    }

    function setAlarm(alarm: ArmAlarm) {
        const day = 1000 * 60 * 60 * 24;
        const threshhold = day * 2;
        if (alarm.timeout === null) {
            const timeMillis = (alarm.timestamp.getTime() - Date.now())
            if (threshhold >= timeMillis) {
                alarm.timeout = setTimeout(() => { doAlarm(alarm) }, timeMillis)
            } else {
            }
        }
    }

    function doAlarm(alarm: ArmAlarm) {
        ElNotification({
            title: alarm.title,
            message: alarm.body,
            icon: 'AlarmClock',
            duration: 0
        });
        notify.osNotify(alarm.body, alarm.title);
        deleteAlarm(alarm);
    }

    function checkAlarms() {
        for (let i = 0; i < allAlarms.value.length; i++) {
            if (allAlarms.value[i].timeout === null) {
                setAlarm(allAlarms.value[i]);
            }
        }

        alarmCheck = setTimeout(checkAlarms, alarmCheckInterval);
    }

    async function loadAlarms() {
        let alarms = await storage.allAlarms();
        allAlarms.value = alarms;
        allAlarms.value.forEach((val) => {
            console.log(val)
            setAlarm(val)
        })
        if (alarmCheck === null) {
            alarmCheck = setTimeout(checkAlarms, alarmCheckInterval);
        }
    }   


    return {
        loadEventsWithContexts,
        allEvents, 
        addEvent, 
        addTag, 
        allTags, 
        loadTags, 
        getTag, 
        getTagByName,
        deleteTag,
        updateTag,
        deleteEvent,
        updateEvent,
        addAlarm,
        newAlarm,
        updateAlarm,
        loadAlarms,
        allAlarms,
        deleteAlarm,
        allContexts,
        addContext,
        loadContexts,
        deleteContext,
        getContext,
        numEventsForContext,
        updateContext,
        pinnedEvents,
        addToPinned,
        addSearchToPinned,
        removeFromPinned,
        togglePinned,
        filteredEvents,
        eventSearchFilter,
        filteringEvents,
        moonsCache
     }
});