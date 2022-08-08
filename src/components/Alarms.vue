<script setup lang="ts">import { computed, reactive, ref } from 'vue';
import { ArmAlarm } from '../models/ArmAlarm';
import { useDataStore } from '../stores/data';
import { DateTime } from 'luxon';
import AlarmEdit from './AlarmEdit.vue';
import { ElMessageBox, ElNotification } from 'element-plus';

const data = useDataStore();

const vals = reactive<{
    alarmEditVisible: boolean;
    editingAlarm: null | ArmAlarm;
    search: string;
}>({
    alarmEditVisible: false,
    editingAlarm: null,
    search: ''
})

const alarmEditTitle = computed(() => {
    if (vals.editingAlarm === null) {
        return "New Alarm"
    } else {
        return "Edit Alarm"
    }
})

const alarmsData = computed(() => {
    if (vals.search === '') {
        return data.allAlarms;
    } else {
        let s = vals.search.toLowerCase();
        return data.allAlarms.filter((ev: ArmAlarm) => {
            if (ev.title.includes(s)) {
                return true;
            }
            if (ev.body.toLowerCase().includes(s)) {
                return true;
            }
            return false;
        })
    }
})

const page = ref(1);
const pageSize = ref(10);
const alarmsDataPage = computed(() => {
    console.log(`computing. Page ${page.value}`);
    let start = (page.value - 1) * pageSize.value;
    let end = (page.value) * pageSize.value;
    let evs = alarmsData.value.slice(start, end)
    return evs
})


function askDeleteAlarm(alarm: ArmAlarm) {
    ElMessageBox.confirm(
        `Are you sure you want to delete this alarm?`,
        `Deleting Alarm ${alarm.title}`,
        {
            confirmButtonText: 'Delete Alarm',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(async () => {
        await data.deleteAlarm(alarm)
        ElNotification({
            title: 'Alarm Deleted',
            message: `Deleted  '${alarm.title}'`,
            type: 'success',
        })
    }).catch(() => {
        //Canceled.
    })
}

</script>

<template>
    <el-dialog v-model="vals.alarmEditVisible" width="80%" :title="alarmEditTitle" :destroy-on-close="true" >
        <AlarmEdit :alarm="vals.editingAlarm" @close="vals.editingAlarm = null; vals.alarmEditVisible = false;"/>
    </el-dialog>
    <el-button @click="vals.alarmEditVisible = true">+Alarm</el-button>
    <el-table :data="alarmsDataPage" style="width:80%; margin: 0 auto">
    <el-table-column label="Date">
            <template #default="scope">
                {{ DateTime.fromJSDate(scope.row.timestamp)
                        .toLocaleString(DateTime.DATETIME_SHORT)
                }}
            </template>
        </el-table-column>
        <el-table-column label="Title" prop="title"  />
        <el-table-column label="Message" prop="body"  />
        <el-table-column align="right">
            <template #header>
                <el-input v-model="vals.search" size="small" placeholder="Type to search" :clearable="true" />
            </template>
            <template #default="scope" width="100">
                <el-button type="danger" size="small" @click="askDeleteAlarm(scope.row)">
                    <el-icon size="18px"><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="vals.editingAlarm = scope.row; vals.alarmEditVisible = true;">
                    <el-icon size="18px"><Edit /></el-icon>
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination v-model="page" :hide-on-single-page="true" v-on:current-change="(p) => {page = p}" :page-size="pageSize" layout="prev, pager, next" :total="alarmsData.length" style="justify-content: center;" />
</template>

<style scoped>
</style>