<template>
    <el-dialog v-model="visible" :fullscreen="false" :center="false" :before-close="close">
        <div style="text-align:center; margin-bottom:20px;">
            <el-radio-group v-model="time.future" style="margin-bottom:15px;">
                <el-radio-button :label="false">In the Past</el-radio-button>
                <el-radio-button :label="true">In the Future</el-radio-button>
            </el-radio-group>
            <table style="margin:auto; font-size:110%; vertical-align:text-bottom">
                <tr>
                    <td class="adjuster-label">
                        Hours:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number class="adjust-input" v-model="time.hours" :min="0" size="small" />
                    </td>
                </tr>
                <tr>
                    <td class="adjuster-label">
                        Days:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number v-model="time.days" :min="0" size="small" />
                    </td>
                </tr>
                <tr>
                    <td class="adjuster-label">
                        Weeks:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number v-model="time.weeks" :min="0" size="small" />
                    </td>
                </tr>
                <tr>
                    <td class="adjuster-label">
                        Months:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number v-model="time.months" :min="0" size="small" />
                    </td>
                </tr>
                <tr>
                    <td class="adjuster-label">
                        Years:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number v-model="time.years" :min="0" size="small" />
                    </td>
                </tr>
                <tr>
                    <td class="adjuster-label">
                        Ages:
                    </td>
                    <td class="adjuster-control">
                        <el-input-number v-model="time.ages" :min="0" size="small" />
                    </td>
                </tr>
            </table>
        </div>

        <span slot="footer" class="dialog-footer">
            <div style="text-align:center">
                <el-button @click="close">Cancel</el-button>
                <el-button type="primary" @click="confirm">Confirm</el-button>
            </div>
        </span>
    </el-dialog>

</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ZalanthanTime } from '../models/ZalanthanTime';

const props = defineProps({
    modelValue: Boolean,
})

const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void,
    (e: 'change', seconds: number): void,
}>()


const visible = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emit("update:modelValue", val);
    }
})

const time = reactive({
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
    years: 0,
    ages: 0,
    future: true,
});

function confirm() {
    let diff = time.hours * ZalanthanTime.hourToOOCSeconds +
        time.days * ZalanthanTime.dayToOOCSeconds +
        time.weeks * ZalanthanTime.weekToOOCSeconds +
        time.months * ZalanthanTime.monthToOOCSeconds +
        time.years * ZalanthanTime.yearToOOCSeconds +
        time.ages * ZalanthanTime.ageToOOCSeconds;

    if (!time.future) {
        diff = diff * (-1);
    }

    emit("change", diff);
    close();
}

function close() {
    time.hours = 0;
    time.days = 0;
    time.weeks = 0;
    time.months = 0;
    time.years = 0;
    time.ages = 0;
    time.future = true;
    visible.value = false;
}

</script>

<style scoped>
table {
    border-spacing: 5px 5px;
}

.adjuster-label {
    padding-right: 5px;
    vertical-align: middle;
}

.adjuster-control {
    padding-left: 5px;
}

tr {
    line-height: 1;
}
</style>