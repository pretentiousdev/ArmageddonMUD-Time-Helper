<script setup lang="ts">
import { computed } from 'vue';
import { ZalanthanTime, ordinalFor } from '../models/ZalanthanTime';

const props = defineProps({
    armDate: {
        type: ZalanthanTime,
        //required: true
        default: new ZalanthanTime(new Date())
    }
});

const emit = defineEmits<{
    (e: 'change', seconds: number): void
}>();

interface selectOption {
    label: string,
    value: number,
}

let hourOptions: selectOption[] = ZalanthanTime.hoursInDay.map((name: string, index: number) => { return { label: name, value: index } })
let dayOptions: selectOption[] = ZalanthanTime.daysInWeek.map((name: string, index: number) => { return { label: name, value: index } })
let monthOptions: selectOption[] = ZalanthanTime.monthsInYear.map((name: string, index: number) => { return { label: name, value: index } })

const hour = computed({
    get() {
        return props.armDate.hour
    },
    set(val) {
        let diff = (val - props.armDate.hour) * ZalanthanTime.hourToOOCSeconds;
        emit("change", diff);
    }
});

const day = computed({
    get() {
        return props.armDate.dayInWeek
    },
    set(val) {
        let diff = (val - (props.armDate.day % ZalanthanTime.daysPerWeek)) * ZalanthanTime.dayToOOCSeconds;
        emit("change", diff);
    }
})

const dayNumber = computed({
    get() {
        return props.armDate.day + 1
    },
    set(val) {
        // let diff = (val - (props.armDate.day % ZalanthanTime.daysPerWeek)) * ZalanthanTime.dayToOOCSeconds;
        // emit("change", diff);
    }
})

const year = computed({
    get() {
        return props.armDate.year + 1
    },
    set(val) {
        // let diff = (val - props.armDate.year) * ZalanthanTime.yearToOOCSeconds;
        // emit("change", diff);
    }
})

const month = computed({
    get() {
        return props.armDate.month
    },
    set(val) {
        let diff = (val - props.armDate.month) * ZalanthanTime.monthToOOCSeconds;
        emit("change", diff);
    }
})

const age = computed({
    get() {
        return props.armDate.age + 1
    },
    set(val) {
        // let diff = (val - props.armDate.age) * ZalanthanTime.ageToOOCSeconds;
        // emit("change", diff);
    }
})

function daySelectChange(prev: number | undefined, cur: number | undefined) {
    if (prev === undefined || cur === undefined) {
        return;
    }
    let diff = (prev - cur) * ZalanthanTime.dayToOOCSeconds
    emit("change", diff);
}

function yearNumberSelectChange(prev: number | undefined, cur: number | undefined) {
    if (prev === undefined || cur === undefined) {
        return;
    }
    let diff = (prev - cur) * ZalanthanTime.yearToOOCSeconds
    emit("change", diff);
}

function ageSelectChange(prev: number | undefined, cur: number | undefined) {
    if (prev === undefined || cur === undefined) {
        return;
    }
    let diff = (prev - cur) * ZalanthanTime.ageToOOCSeconds
    emit("change", diff);
}

</script>

<template>
    <p style="line-height:2.5">
        It is&nbsp;
        <el-select v-model="hour" placeholder="Select" style="width:145px">
            <el-option style="display:block" v-for="item in hourOptions" :key="item.value" :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        &nbsp;on&nbsp;
        <el-select v-model="day" placeholder="Select" style="width:110px">
            <el-option style="display:block" v-for="item in dayOptions" :key="item.value" :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        , the&nbsp;
        <el-input-number v-model="dayNumber" @change="daySelectChange" controls-position="right" style="width: 95px;"/>
        {{ ordinalFor(armDate.day + 1) }} day of
        <el-select v-model="month" placeholder="Select" style="width:155px">
            <el-option style="display:block" v-for="item in monthOptions" :key="item.value" :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        <br />In the Year of {{ armDate.yearName }}, year
        <el-input-number v-model="year" @change="yearNumberSelectChange" controls-position="right"
            style="width:95px;" />
        of the
        <el-input-number v-model="age" @change="ageSelectChange" controls-position="right" style="width:95px;" />
        {{ ordinalFor(age) }} Age.
    </p>
</template>

<style scoped>
</style>