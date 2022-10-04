<template>
    <el-dialog v-model="editVisible" width="80%" :destroy-on-close="true" title="Edit Event">
        <EventEdit :event="editingEvent" @close="closeEditEvent" />
    </el-dialog>
    <el-dialog v-model="vals.newAlarmVisible" width="80%" :destroy-on-close="true" title="New Alarm From Event">
        <AlarmEdit :event="selectedEvent" @close="vals.newAlarmVisible = false" />
    </el-dialog>
    <el-dialog v-model="vals.searchOptionsVisible" :fullscreen="true" :destroy-on-close="true" title="Search Events">
        <SearchEvents :filter="data.eventSearchFilter" @close="vals.searchOptionsVisible = false"
            @filter="(f: any) => data.eventSearchFilter = f" />
    </el-dialog>
    <el-button style="float:right" @click="controller.pinned.visible = true" size="small" :icon="Collection">View Pinned
    </el-button>
    <el-button v-if="data.eventSearchFilter === null" :icon="Search" @click="vals.searchOptionsVisible = true"
        size="small">Search</el-button>

    <div v-else>
        Only displaying events that match searched parameters.
        <el-button size="small" @click="vals.searchFilterOptionsVisible = true">View</el-button>
        <el-button size="small" @click="vals.searchOptionsVisible = true">Edit</el-button>
        <el-button size="small" @click="data.addSearchToPinned()">Add to Pinned</el-button>
        <el-button size="small" @click="data.eventSearchFilter = null">Clear</el-button>
    </div>
    <div>
        <el-table :data="eventsDataPage" style="width:80%; margin: 0 auto; height:550px;"
            v-loading="data.filteringEvents" element-loading-text="Searching Events..." empty-text="No Events">
            <el-table-column type="expand">
                <template #default="props">
                    <div m="4">
                        <!-- {{ data.getContext(props.row.context).name}} -->
                        <table style="margin:0 auto;width:90%;">
                            <tr>
                                <td style="width:55%">
                                    <p m="t-0 b-2" style="white-space: pre-line">{{ props.row.description }}
                                    </p>
                                </td>
                                <td>
                                    <el-tag v-for="tag in props.row.tags" :key="tag" class="event-tag"
                                        style="flex-wrap: wrap; margin-right:5px; margin-top: 2px; margin-bottom:2px;">
                                        {{ data.getTag(tag).name }}
                                    </el-tag>
                                </td>
                            </tr>
                        </table>


                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Title" prop="title" width="300" />
            <!-- <el-table-column label="Date" prop="timestamp" width="300" /> -->
            <el-table-column label="Date">
                <template #default="scope">
                    {{ DateTime.fromJSDate(scope.row.timestamp)
                            .toLocaleString(DateTime.DATETIME_SHORT)
                    }}
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template #header>
                    <el-input v-model="vals.search" size="small" placeholder="Type to filter results"
                        :clearable="true" />
                </template>
                <template #default="scope" width="100">
                    <el-button type="danger" size="small" @click="askDeleteEvent(scope.row)">
                        <!-- <ion-icon name="trash-outline"></ion-icon>Delete -->
                        <el-icon size="18px">
                            <Delete />
                        </el-icon>
                    </el-button>
                    <el-button size="small" @click="editingEvent = scope.row; editVisible = true">
                        <!-- <ion-icon name="create-outline"></ion-icon>Edit -->
                        <el-icon size="18px">
                            <Edit />
                        </el-icon>
                    </el-button>
                    <el-button size="small" @click="data.togglePinned(scope.row)"
                        :type="scope.row.pinned ? 'primary' : 'default'">
                        <el-icon size="18px">
                            <CollectionTag />
                        </el-icon>
                    </el-button>
                    <el-button size="small" @click="viewEvent(scope.row)">
                        <!-- <ion-icon name="eye-outline"></ion-icon>View -->
                        <el-icon size="18px">
                            <View />
                        </el-icon>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <div style="margin: 0 auto">
        <el-pagination v-model="page" v-on:current-change="(p: number) => { page = p }" :page-size="pageSize"
            layout="prev, pager, next" :total="eventsData.length" style="justify-content: center;"
            :hide-on-single-page="true" />
    </div>

    <el-dialog v-model="vals.searchFilterOptionsVisible" width="90%" :destroy-on-close="true">
        <el-descriptions class="margin-top" title="Search Parameters" direction="vertical" :column="1" border>
            <el-descriptions-item v-if="data.eventSearchFilter?.tags"
                :label="data.eventSearchFilter.anyTags ? 'Any of Tags' : 'All of Tags'">
                <el-tag v-for="tag in data.eventSearchFilter.tags" :key="tag" class="event-tag"
                    style="flex-wrap: wrap; margin-right:5px; margin-top: 2px; margin-bottom:2px;">
                    {{ data.getTag(tag).name }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="data.eventSearchFilter?.words"
                :label="data.eventSearchFilter.anyWords ? 'Any of Words' : 'All of Words'">
                {{ data.eventSearchFilter.words.join(", ") }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.eventSearchFilter?.contexts" label="Contexts">
                {{ data.eventSearchFilter.contexts.map((val) => { return data.getContext(val).name }).join(", ") }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.eventSearchFilter?.start" label="After Date">
                {{ DateTime.fromJSDate(data.eventSearchFilter.start).toLocaleString(DateTime.DATETIME_SHORT) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.eventSearchFilter?.end" label="Before Date">
                {{ DateTime.fromJSDate(data.eventSearchFilter.end).toLocaleString(DateTime.DATETIME_SHORT) }}
            </el-descriptions-item>
        </el-descriptions>
    </el-dialog>
    <el-dialog v-model="vals.viewVisible" width="90%" :destroy-on-close="true">
        <el-descriptions class="margin-top" :title="selectedEvent?.title" :column="2" border>
            <template #extra>
                <el-button size="small" @click="setConverterDate">Set Converter Date</el-button>
                <el-button size="small" v-if="selectedEventInFuture" @click="vals.newAlarmVisible = true"
                    icon="AlarmClock">Set Alarm</el-button>
                <el-button size="small" @click="editingEvent = selectedEvent; editVisible = true" icon="Edit">
                    Edit
                </el-button>
                <el-button @click="data.togglePinned(selectedEvent!)"
                    :type="selectedEvent?.pinned === true ? 'primary' : 'default'" size="small" icon="CollectionTag">
                    {{ selectedEvent?.pinned === true ? 'Unpin' : 'Pin' }}
                </el-button>
            </template>
            <el-descriptions-item :span="2">
                <template #label>
                    <div class="cell-item">
                        Tags
                    </div>
                </template>
                <el-tag v-for="tag in selectedEvent?.tags" :key="tag" class="event-tag"
                    style="flex-wrap: wrap; margin-right:5px; margin-top: 2px; margin-bottom:2px;">
                    {{ data.getTag(tag).name }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="2">
                <template #label>
                    <div class="cell-item">
                        Context
                    </div>
                </template>
                {{ data.getContext(selectedEvent!.context).name }}
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    <div class="cell-item">
                        OOC Time
                    </div>
                </template>
                <p> {{ OOCTime }}</p>
            </el-descriptions-item>
            <el-descriptions-item :min-width="80">
                <template #label>
                    <div class="cell-item">
                        IC Time
                    </div>
                </template>
                <p> <span v-html="ICTime" /> </p>
                <p> {{ relativeTime }}</p>
            </el-descriptions-item>
            <el-descriptions-item style="white-space:pre-line;" :min-width="100" :span="2">
                <template #label>
                    <div class="cell-item">
                        Description
                    </div>
                </template>
                <p style="white-space: pre-line;">{{ selectedEvent?.description }}</p>

            </el-descriptions-item>
        </el-descriptions>
    </el-dialog>

</template>

<script setup lang="ts">
import { useDataStore } from '../stores/data';
import { computed, ref, Ref, reactive } from 'vue'
import { ArmEvent, filterOptions } from '../models/ArmEvent';
import { DateTime } from 'luxon';
import { ZalanthanTime } from '../models/ZalanthanTime';
import { useSettingsStore } from '../stores/settings';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import { hasName } from '../models/Tag';
import EventEdit from './EventEdit.vue';
import AlarmEdit from './AlarmEdit.vue';
import SearchEvents from './SearchEvents.vue';
import { Search } from '@element-plus/icons-vue';
import { useControllerStore } from '../stores/controller';
import { Collection } from '@element-plus/icons-vue';
const data = useDataStore();
const settings = useSettingsStore();
const controller = useControllerStore();

const vals = reactive({
    search: '',
    viewVisible: false,
    editVisible: false,
    newAlarmVisible: false,
    searchOptionsVisible: false,
    searchFilterOptionsVisible: false,
})
const editVisible = ref(false);

const selectedEvent: Ref<null | ArmEvent> = ref(null);


function setConverterDate() {
    if (selectedEvent.value) {
        settings.setConverterDate(selectedEvent.value.timestamp)
        ElNotification({
            title: 'Time set!',
            message: 'Converter date has been set to the time of this event.',
            type: 'success',
        })
    }
}

const OOCTime = computed(() => {
    if (selectedEvent.value) {
        return DateTime.fromJSDate(selectedEvent.value.timestamp)
            .toLocaleString(DateTime.DATETIME_SHORT)
    } else {
        return "Something went wrong."
    }
})

const selectedArmDate = computed(() => {
    if (selectedEvent.value) {
        return new ZalanthanTime(selectedEvent.value.timestamp)
    }
})

const selectedEventInFuture = computed(() => {
    if (selectedEvent.value) {
        let diff = selectedEvent.value.timestamp.getTime() - Date.now();
        return (diff > 0);
    }

    return false;
})

const ICTime = computed(() => {
    if (selectedArmDate.value) {
        return selectedArmDate.value.dateString();
    } else {
        return "Something went wrong."
    }
})

function viewEvent(ev: ArmEvent) {
    selectedEvent.value = ev;
    vals.viewVisible = true;
    if (selectedEvent.value) {
        clearTimeout(relativeTimeout);
    }
    queueRelativeTicker();
}

let relativeTimeout: number;
function queueRelativeTicker() {
    comparisonDate.value = new Date();
    if (selectedEvent.value) {
        let diff = selectedEvent.value.timestamp.getTime() - Date.now();
        //diff = 60000 - Math.abs(diff % 60000);
        diff = diff % 60000;
        if (diff <= 0) {
            diff = 60000 + diff;
        } else {
            //diff = 60000 - diff;
        }
        relativeTimeout = setTimeout(queueRelativeTicker, diff);
    }
}


const comparisonDate = ref(new Date())
const relativeTime = computed(() => {
    if (selectedEvent.value) {
        return ZalanthanTime.relativeString(ZalanthanTime.relativeTime(comparisonDate.value, selectedEvent.value.timestamp))
    } else {
        return "Not calculated."
    }
})

const eventsData = computed(() => {
    if (vals.search === '') {
        return data.filteredEvents;
    } else {
        let s = vals.search.toLowerCase();
        return data.filteredEvents.filter((ev: ArmEvent) => {
            if (ev.title.toLowerCase().includes(s)) {
                return true;
            }
            if (ev.description.toLowerCase().includes(s)) {
                return true;
            }

            for (let i = 0; i < ev.tags.length; i++) {
                const t = data.getTag(ev.tags[i]);
                if (t.name.toLowerCase().includes(s)) {
                    return true;
                }

                for (let j = 0; j < t.aliases.length; j++) {
                    if (t.aliases[j].includes(s)) {
                        return true;
                    }
                }
            }

            return false;
        })
    }
})

const page = ref(1);
const pageSize = ref(10);
const eventsDataPage = computed(() => {
    console.log(`computing. Page ${page.value}`);
    let start = (page.value - 1) * pageSize.value;
    let end = (page.value) * pageSize.value;
    let evs = eventsData.value.slice(start, end)
    return evs
})

const editingEvent: Ref<null | ArmEvent> = ref(null);

function closeEditEvent() {
    vals.editVisible = false;
    editVisible.value = false;
    editingEvent.value = null;
}

function askDeleteEvent(ev: ArmEvent) {
    ElMessageBox.confirm(
        `Are you sure you want to delete '${ev.title}'?`,
        `Deleting Event `,
        {
            confirmButtonText: 'Delete Event',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(async () => {
        await data.deleteEvent(ev.id);
        ElNotification({
            title: 'Event Deleted',
            message: `Deleted  '${ev.title}'`,
            type: 'success',
        })
    }).catch(() => {
        //Canceled.
    })
}
</script>

<style scoped>
ion-icon {
    font-size: 18px;
}
</style>