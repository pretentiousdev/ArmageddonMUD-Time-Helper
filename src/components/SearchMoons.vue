<script setup lang="ts">import { computed, onBeforeMount, ref, Ref } from 'vue';
import { ZalanthanTime, withOrdinal } from '../models/ZalanthanTime';
import { useDataStore } from '../stores/data';
import { useSettingsStore } from '../stores/settings';
import { DateTime, Duration } from 'luxon';

const jihaePhase: Ref<string[]> = ref([])
const jihaePhaseDirection: Ref<string[]> = ref([])
const jihaePos: Ref<string[]> = ref([])
const jihaeHeight: Ref<string[]> = ref([])
const lirathuPhase: Ref<string[]> = ref([])
const lirathuPhaseDirection: Ref<string[]> = ref([])
const lirathuPos: Ref<string[]> = ref([])
const lirathuHeight: Ref<string[]> = ref([])
const blackmoonPos: Ref<string[]> = ref([])
const blackmoonHeight: Ref<string[]> = ref([])
const data = useDataStore();
const settings = useSettingsStore();

const props = defineProps<{
    referenceDate?: Date
}>();

const emit = defineEmits<{
    (e: 'close'): void
}>();

const referenceDate = ref(new Date())
onBeforeMount(async () => {
    if (props.referenceDate) {
        referenceDate.value = props.referenceDate
    }
})

const optionsSelected = computed(() => {
    return (jihaePhase.value.length > 0) || (jihaePhaseDirection.value.length > 0) || (jihaePos.value.length > 0) ||
        (jihaeHeight.value.length > 0) || (lirathuPhase.value.length > 0) || (lirathuPhaseDirection.value.length > 0) ||
        (lirathuPos.value.length > 0) || (lirathuHeight.value.length > 0) || (blackmoonPos.value.length > 0) ||
        (blackmoonHeight.value.length > 0)
})

const referenceArmDate = computed(() => {
    return new ZalanthanTime(referenceDate.value);
})

const referenceNextDawn = computed(() => {
    return new ZalanthanTime(ZalanthanTime.nextDawn(referenceDate.value));
})

const calculationOffset = ref(0);

const calculatedTime = computed(() => {
    if (matchedDays.value.length === 0) {
        return referenceDate.value;
    }
    let lastDay = referenceNextDawn.value.day;
    let daysUntil = 0;
    let offset = calculationOffset.value;
    for (let i = 0; offset >= 0; i++) {
        const nextDay = matchedDays.value[i % matchedDays.value.length]
        if (nextDay < lastDay || (nextDay === lastDay && calculationOffset.value !== offset)) {
            daysUntil += (nextDay + ZalanthanTime.daysPerMonth) - lastDay;
        } else {
            daysUntil += nextDay - lastDay;
        }
        lastDay = nextDay;
        offset--;
    }
    return new Date(ZalanthanTime.nextDawn(referenceDate.value).getTime() + (daysUntil * ZalanthanTime.dayToOOCSeconds * 1000))
})

const calculatedArmDate = computed(() => {
    return new ZalanthanTime(calculatedTime.value);
})

const calculatedMoons = computed(() => {

    let m = calculatedArmDate.value.getMoons()
    let moons = ""
    if (m.jihae !== '') {
        moons += m.jihae + "<br />"
    }
    if (m.lirathu !== '') {
        moons += m.lirathu + "<br />"
    }
    if (m.blackmoon !== '') {
        moons += m.blackmoon + "<br />"
    }
    return moons
})


const matchedDays = computed(() => {
    calculationOffset.value = 0;
    let referenceDay = referenceArmDate.value.day + 1;
    const days: number[] = []
    if (!optionsSelected.value) { return days }
    for (let i = 0; i < ZalanthanTime.daysPerMonth; i++) {
        const checkDay = (referenceDay + i) % ZalanthanTime.daysPerMonth;
        const moonsForDay = data.moonsCache[checkDay];
        if (jihaePhase.value.length > 0 && !jihaePhase.value.includes(moonsForDay.jihaePhase)) {
            continue;
        }
        if (jihaePhaseDirection.value.length > 0 && !jihaePhaseDirection.value.includes(moonsForDay.jihaePhaseDirection)) {
            continue;
        }
        if (jihaePos.value.length > 0 && !jihaePos.value.includes(moonsForDay.jihaePos)) {
            continue;
        }
        if (jihaeHeight.value.length > 0 && !jihaeHeight.value.includes(moonsForDay.jihaeHeight)) {
            continue;
        }
        if (lirathuPhase.value.length > 0 && !lirathuPhase.value.includes(moonsForDay.lirathuPhase)) {
            continue;
        }
        if (lirathuPhaseDirection.value.length > 0 && !lirathuPhaseDirection.value.includes(moonsForDay.lirathuPhaseDirection)) {
            continue;
        }
        if (lirathuPos.value.length > 0 && !lirathuPos.value.includes(moonsForDay.lirathuPos)) {
            continue;
        }
        if (lirathuHeight.value.length > 0 && !lirathuHeight.value.includes(moonsForDay.lirathuHeight)) {
            continue;
        }
        if (blackmoonPos.value.length > 0 && !blackmoonPos.value.includes(moonsForDay.blackmoonPos)) {
            continue;
        }
        if (blackmoonHeight.value.length > 0 && !blackmoonHeight.value.includes(moonsForDay.blackmoonHeight)) {
            continue;
        }

        days.push(checkDay)
    }
    return days
})

</script>

<template>
    <div>
        <p v-if="matchedDays.length === 0 && optionsSelected">
            The moons will never be in that configuration.
        </p>
        <p v-else>
            {{ DateTime.fromJSDate(calculatedTime).toLocaleString(settings.locale()) }} <br />
        <p><span v-html="calculatedArmDate.dateString()" /></p>
        <span v-html="calculatedMoons" />
        </p>
        <div v-if="matchedDays.length > 0">
            <el-button :disabled="calculationOffset === 0" @click="calculationOffset--" size="small">Previous
            </el-button>
            {{ withOrdinal(calculationOffset + 1) }} match
            <el-button :disabled="matchedDays.length === 0" @click="calculationOffset++" size="small">Next</el-button>
        </div>
        <!-- {{matchedDays}} -->

        <p>Jihae:</p>
        <div style="margin-bottom:10px;">
            <el-checkbox-group v-model="jihaePhase">
                <el-checkbox-button label="new moon">Almost imperceptible</el-checkbox-button>
                <el-checkbox-button label="new crescent">A thin crescent</el-checkbox-button>
                <el-checkbox-button label="crescent">A thick crescent</el-checkbox-button>
                <el-checkbox-button label="half-moon">Half illuminated</el-checkbox-button>
                <el-checkbox-button label="gibbous">Gibbous</el-checkbox-button>
                <el-checkbox-button label="full">Bright and full</el-checkbox-button>
            </el-checkbox-group>

        </div>

        <div>
            <el-checkbox-group v-model="jihaePhaseDirection" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="waxing">Waxing</el-checkbox-button>
                <el-checkbox-button label="waning">Waning</el-checkbox-button>
            </el-checkbox-group>

            <el-checkbox-group v-model="jihaeHeight" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="high">High in the sky</el-checkbox-button>
                <el-checkbox-button label="low">Low in the sky</el-checkbox-button>
                <el-checkbox-button label="none">Not visible</el-checkbox-button>
            </el-checkbox-group>
            <el-checkbox-group v-model="jihaePos" style="display:inline; margin-right:10px;">

                <el-checkbox-button label="west">Western sky</el-checkbox-button>
                <el-checkbox-button label="east">Eastern sky</el-checkbox-button>
            </el-checkbox-group>
        </div>
        <div style="margin-top:15px">
            Lirathu:
        </div>

        <div style="margin-bottom:10px;">
            <el-checkbox-group v-model="lirathuPhase">
                <el-checkbox-button label="new moon">Almost imperceptible</el-checkbox-button>
                <el-checkbox-button label="new crescent">A thin crescent</el-checkbox-button>
                <el-checkbox-button label="crescent">A thick crescent</el-checkbox-button>
                <el-checkbox-button label="half-moon">Half illuminated</el-checkbox-button>
                <el-checkbox-button label="gibbous">Gibbous</el-checkbox-button>
                <el-checkbox-button label="full">Bright and full</el-checkbox-button>
            </el-checkbox-group>

        </div>

        <div>
            <el-checkbox-group v-model="lirathuPhaseDirection" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="waxing">Waxing</el-checkbox-button>
                <el-checkbox-button label="waning">Waning</el-checkbox-button>
            </el-checkbox-group>
            <el-checkbox-group v-model="lirathuHeight" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="high">High in the sky</el-checkbox-button>
                <el-checkbox-button label="low">Low in the sky</el-checkbox-button>
                <el-checkbox-button label="none">Not visible</el-checkbox-button>
            </el-checkbox-group>
            <el-checkbox-group v-model="lirathuPos" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="west">Western sky</el-checkbox-button>
                <el-checkbox-button label="east">Eastern sky</el-checkbox-button>
            </el-checkbox-group>
        </div>

        <div style="margin-top:15px;">
            Black Moon:
        </div>
        <div>
            <el-checkbox-group v-model="blackmoonHeight" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="high">High in the sky</el-checkbox-button>
                <el-checkbox-button label="low">Low in the sky</el-checkbox-button>
                <el-checkbox-button label="none">Not visible</el-checkbox-button>
            </el-checkbox-group>
            <el-checkbox-group v-model="blackmoonPos" style="display:inline; margin-right:10px;">
                <el-checkbox-button label="west">Western sky</el-checkbox-button>
                <el-checkbox-button label="center">Center of the sky</el-checkbox-button>
                <el-checkbox-button label="east">Eastern sky</el-checkbox-button>
            </el-checkbox-group>

        </div>
        <p style="width: 75%; margin: 0 auto; margin-top:15px;">
            * Groups with no options selected will not limit results. Groups with multiple options selected will match
            on any of selected options.
            (E.G. Selecting 'High in the sky' and 'Low in the sky' for Jihae where 'Bright and full' is also selected
            will find the next date where
            Jihae is bright and full and high in the sky, or bright and full and low in the sky)
        </p>
        <el-button 
        type="primary"
        style="margin-top:15px"
        :disabled="matchedDays.length === 0"
        @click="settings.setConverterDate(calculatedTime); emit('close')">Set converter to this match</el-button>
    </div>
</template>


<style scoped>
</style>