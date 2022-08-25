<script setup lang="ts">
import { ElNotification } from 'element-plus';
import { ArmEvent } from '../models/ArmEvent';
import { useSettingsStore } from '../stores/settings';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useDataStore } from '../stores/data';
import { DateTime } from 'luxon';
import { ZalanthanTime } from '../models/ZalanthanTime';

const props = defineProps<{
    event: (null | ArmEvent),
}>()

const settings = useSettingsStore();
const data = useDataStore();

function setConverterDate() {
    if (props.event) {
        settings.setConverterDate(props.event.timestamp)
        ElNotification({
            title: 'Time set!',
            message: 'Converter date has been set to the time of this event.',
            type: 'success',
        })
    }
}

const selectedEventInFuture = computed(() => {
    if (props.event) {
        let diff = props.event.timestamp.getTime() - Date.now();
        return (diff > 0);
    } else {
        return false;
    }
})

const OOCTime = computed(() => {
    if (props.event) {
        return DateTime.fromJSDate(props.event.timestamp)
            .toLocaleString(DateTime.DATETIME_SHORT)
    } else {
        return "Something went wrong."
    }
})

const selectedArmDate = computed(() => {
    if (props.event) {
        return new ZalanthanTime(props.event.timestamp)
    }
})

const ICTime = computed(() => {
    if (selectedArmDate.value) {
        return selectedArmDate.value.dateString();
    } else {
        return "Something went wrong."
    }
})


onBeforeMount(async () => {
  queueRelativeTicker();
})

onBeforeUnmount(async() => {
    clearTimeout(relativeTimeout);
})

let relativeTimeout: number;
function queueRelativeTicker() {
    comparisonDate.value = new Date();
    if (props.event) {
        let diff = props.event.timestamp.getTime() - Date.now();
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
    if (props.event) {
        return ZalanthanTime.relativeString(ZalanthanTime.relativeTime(comparisonDate.value, props.event.timestamp))
    } else {
        return "Not calculated."
    }
})
    
</script>

<template>
    <el-descriptions class="margin-top" :title="props.event?.title" :column="2" border>
            <!-- <template #extra>
                <el-button size="small" @click="setConverterDate">Set Converter Date</el-button>
                <el-button size="small" v-if="selectedEventInFuture" @click="vals.newAlarmVisible = true"
                    icon="AlarmClock">Set Alarm</el-button>
                <el-button size="small" @click="editingEvent = selectedEvent; editVisible = true" icon="Edit">
                    Edit
                </el-button>
                <el-button type="primary" size="small" icon="CollectionTag">
                    Pin
                </el-button>
            </template> -->
            <el-descriptions-item :span="2">
                <template #label>
                    <div class="cell-item">
                        Tags
                    </div>
                </template>
                <el-tag v-for="tag in props.event?.tags" :key="tag" class="event-tag"
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
                {{ data.getContext(props.event!.context).name }}
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
                <p style="white-space: pre-line;">{{ props.event?.description }}</p>

            </el-descriptions-item>
        </el-descriptions>
</template>

<style scoped>

</style>