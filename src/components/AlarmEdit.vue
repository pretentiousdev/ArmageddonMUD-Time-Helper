<script setup lang="ts">

import { ElNotification, FormInstance } from 'element-plus';
import { onBeforeMount, reactive, ref } from 'vue';
import { ArmAlarm } from '../models/ArmAlarm';
import { ArmEvent } from '../models/ArmEvent';
import { useDataStore } from '../stores/data';
import DateSelector from './DateSelector.vue';

const data = useDataStore();
const props = defineProps<{
    date?: Date,
    event?: (null | ArmEvent),
    alarm?: (null | ArmAlarm),
}>();

const emit = defineEmits<{
    (e: 'close'): void,
}>();

onBeforeMount(() => {
    if (props.date) {
        vals.date = props.date;
    }

    if (props.event) {
        vals.date = props.event.timestamp;
        vals.title = props.event.title;
    }

    if (props.alarm) {
        vals.date = props.alarm.timestamp;
        vals.title = props.alarm.title;
        vals.body = props.alarm.body;
        vals.id = props.alarm.id;
        vals.timeout = props.alarm.timeout;
    }
})

const form = ref<FormInstance>()

const vals = reactive<{
    id: number,
    date: Date,
    title: string,
    body: string,
    timeout: null | number,
}>({
    id: -1,
    date: new Date(),
    title: '',
    body: '',
    timeout: null
})


const validateDate = (rule: any, value: Date, callback: any) => {
    if (value.getTime() <= Date.now()) {
        callback(new Error('The selected time must be in the future.'))
        return;
    } else {
        callback()
    }
}

const rules = reactive({
    date: [{ validator: validateDate, trigger: 'change' }],
})

function onSubmit(formEl: FormInstance | undefined) {
    if (!formEl) {
        return;
    }
    formEl.validate(async (valid, fields) => {
        if (valid) {
            vals.date.setSeconds(0);
            const alarm: ArmAlarm = {
                id: vals.id, title: (vals.title === '' ? 'ArmageddonMUD Alarm!' : vals.title),
                body: vals.body, timestamp: vals.date, timeout: vals.timeout
            }
            if (alarm.id !== -1) {
                await data.updateAlarm(alarm);
                ElNotification({
                    title: 'Alarm Updated',
                    message: `'${alarm.title}' has been updated.`,
                    type: 'success',
                })
            } else {
                data.addAlarm(alarm)
                ElNotification({
                    title: 'Alarm Added',
                    message: alarm.title + ' has been added to alarms.',
                    type: 'success',
                })
            }
            close(formEl);
        }
    })
}

function close(formEl: FormInstance | undefined) {
    if (formEl) {
        formEl.resetFields();
    }
    emit("close");
}


</script>

<template>
    <div>
        <el-form ref="form" :model="vals" :rules="rules" label-width="auto" label-position="right"
            style="width:600px;">
            <el-form-item prop="title" label="Title">
                <el-input v-model="vals.title" placeholder="ArmageddonMUD Alarm!" />
            </el-form-item>
            <el-form-item prop="body" label="Message">
                <el-input v-model="vals.body" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item prop="date" label="Time">
                <div style="margin:0 auto">
                    <date-selector v-model:date="vals.date" />
                </div>
            </el-form-item>
            <el-form-item>
                
            </el-form-item>
        </el-form>
        <div style="margin: 0 auto; margin-top:10px">
                    <el-button @click="close(form)">Cancel</el-button>
                    <el-button type="primary" @click="onSubmit(form)">Save</el-button>

                </div>
    </div>
</template>

<style scoped>
:deep(.el-form-item__error) {
    left:28%;
}

.el-form {
    margin: 0 auto;
}
</style>