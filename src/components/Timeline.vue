<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ArmEvent } from '../models/ArmEvent';
import { useDataStore } from '../stores/data';
import { ZalanthanTime } from '../models/ZalanthanTime';
import { More } from '@element-plus/icons-vue';
import EventView from './EventView.vue';

const data = useDataStore();

interface eventNode {
    ev: ArmEvent;
    visible: boolean;
}

interface visibleNode {
    ev: null | ArmEvent;
    hidden: ArmEvent[];
    sinceLast: string;
    sinceLastOOC: string;
    sourceIndex: number;
}

const vals = reactive<{
    sourceEvents: eventNode[];
    selectedEvent: null | ArmEvent;
    viewVisible: boolean
}>({
    sourceEvents: [],
    selectedEvent: null,
    viewVisible: false
})

function setSource(evs: ArmEvent[]) {
    vals.sourceEvents = evs.map((e) => { return { ev: e, visible: true } }).sort((e1, e2) => {
        const e1t = e1.ev.timestamp.getTime();
        const e2t = e2.ev.timestamp.getTime();
        if (e1t > e2t) {
            return 1;
        }
        else if (e1t < e2t) {
            return -1;
        }
        else {
            return 0;
        }
    })
}

const eventNodes = computed(() => {
    let lastVis: null | ArmEvent = null;
    const nodes: visibleNode[] = [];
    let hiddenNode: null | visibleNode = null;
    for (let i = 0; i < vals.sourceEvents.length; i++) {
        const ev = vals.sourceEvents[i];
        if (ev.visible) {
            const node: visibleNode = { ev: ev.ev, hidden: [], sinceLast: '', sinceLastOOC: '', sourceIndex: i }
            if (lastVis) {
                node.sinceLast = ZalanthanTime.differenceString(ZalanthanTime.relativeTime(ev.ev.timestamp, lastVis.timestamp)) + ' (IC)'
                node.sinceLastOOC
            }
            lastVis = ev.ev;
            hiddenNode = null;
            nodes.push(node);
        } else {
            if (hiddenNode) {
                hiddenNode.hidden.push(ev.ev);
            } else {
                hiddenNode = { ev: null, hidden: [ev.ev], sinceLast: '', sinceLastOOC: '', sourceIndex: i };
                nodes.push(hiddenNode);
            }
        }
    }
    return nodes;
})

function hideEvent(id: number) {
    for (let i = 0; i < vals.sourceEvents.length; i++) {
        if (vals.sourceEvents[i].ev.id === id) {
            vals.sourceEvents[i].visible = false;
            return;
        }
    }
}

function showHidden(hidden: ArmEvent[]) {
    const ids = hidden.map((ev) => { return ev.id });
    for (let i = 0; i < vals.sourceEvents.length; i++) {
        const ev = vals.sourceEvents[i];
        if (ids.includes(ev.ev.id)) {
            ev.visible = true;
        }
    }
}

const handleLoad = (command: string) => {
    switch (command) {
        case "all":
            setSource(data.allEvents);
            break;
        case "pinned":
            setSource(data.pinnedEvents);
            break;
        case "search":
            setSource(data.filteredEvents);
            break;
    }
}

</script>

<template>
    <div style="width:80%; margin: 0 auto">
        <div>
            <el-dropdown @command="handleLoad">
                <span class="el-dropdown-link">
                    Load<el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="search" :disabled="data.eventSearchFilter === null">Search Results
                        </el-dropdown-item>
                        <el-dropdown-item command="pinned" :disabled="data.pinnedEvents.length === 0">Pinned Events
                        </el-dropdown-item>
                        <el-dropdown-item command="all">All Events</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <el-timeline>
            <el-timeline-item v-for="(ev, index) in eventNodes" :key="ev.sourceIndex" center :timestamp="ev.sinceLast"
                placement="top">
                <el-card v-if="ev.ev !== null">
                    <table style="width:100%">
                        <tr>
                            <td style="width:20%"></td>
                            <td>{{ ev.ev.title }}</td>
                            <td style="width:20%">
                                <el-button size="small" style=" margin-right:5px;" @click="hideEvent(ev.ev!.id)">
                                    <el-icon size="18px">
                                        <Hide />
                                    </el-icon>
                                </el-button>
                                <el-button size="small" style=" margin-right:10px;"
                                    @click="vals.selectedEvent = ev.ev; vals.viewVisible = true">
                                    <el-icon size="18px">
                                        <View />
                                    </el-icon>
                                </el-button>
                            </td>
                        </tr>
                    </table>

                    <span style="float:right">

                    </span>
                </el-card>
            <span v-else>
                <el-dropdown split-button class="hidden" size="small" @click="showHidden(ev.hidden)" @command="(v: ArmEvent) => showHidden([v])">
                    {{ev.hidden.length}} hidden
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="e in ev.hidden" :command="e"> {{ e.title}} </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                </span>
            </el-timeline-item>
        </el-timeline>
        <el-dialog v-model="vals.viewVisible" :destroy-on-close="true" width="90%">
            <EventView :event="vals.selectedEvent" />
        </el-dialog>
    </div>
</template>

<style scoped>
:deep(.el-card__body) {
    padding: 10px 0 10px 0;
}

.el-button.hidden, .el-dropdown.hidden {
    float: left;
    margin-left: 10px;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-small)
}

:deep(.hidden .el-button) {
    color: var(--el-text-color-secondary);
}

el-icon {
    font-size: 22px;
    ;
}

.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}
</style>