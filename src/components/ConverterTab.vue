<script setup lang="ts">
import { ref, Ref, computed, watch, onBeforeMount, onBeforeUnmount, reactive } from 'vue'
import { ZalanthanTime } from '../models/ZalanthanTime';
import { DateTime, Duration } from 'luxon';
import { useSettingsStore } from '../stores/settings';
import { useDataStore } from '../stores/data';
import EditableICDate from './EditableICDate.vue';
import DateSelector from './DateSelector.vue';
import EventEdit from './EventEdit.vue';
import { storeToRefs } from 'pinia'
import { ElNotification } from 'element-plus';
import ContextEdit from './ContextEdit.vue';


const settings = useSettingsStore();
const data = useDataStore();
const { converterDate } = storeToRefs(settings);

settings.$onAction(({ name, after }) => {
  if (name === 'setConverterDate') {
    stopFollowingTime();
  }
  after((result) => {
    calculateRelativeTimeString();
  })
});

function setNow() {
  converterDate.value = new Date();
}

function setNextDawn() {
  stopFollowingTime();
  converterDate.value = ZalanthanTime.nextDawn(new Date());
}

function unitsToString(units: string[], data: any) {
  let s = "";
  for (var i = 0; i < units.length; i++) {
    let unit = units[i];
    let datum = data[unit];
    if (datum && datum > 0) {
      if (s !== "") {
        s += ", ";
      }
      s += datum + " ";
      if (datum === 1) {
        s += unit.slice(0, -1);
      } else {
        s += unit;
      }
    }
  }
  return s;
}

function addDawnAlarm() {
  let dawn = ZalanthanTime.nextDawn(new Date());
  data.newAlarm("Dawn!", "It is dawn on Zalanthas.", dawn);

  const duration = Duration.fromMillis(dawn.getTime() - Date.now());
  const durationObj = duration.shiftTo("hours", "minutes", "seconds", "millisecond").toObject();
  const oocTime = unitsToString(["hours", "minutes", "seconds"], durationObj);
  const icTime = ZalanthanTime.relativeString(ZalanthanTime.relativeTime(new Date(), dawn));
  let durationMessage = `<span>(OOC) In ${oocTime} <br />(IC) ${icTime}`;

  ElNotification({
    title: "Alarm Set for Dawn",
    dangerouslyUseHTMLString:true,
    message: durationMessage,
    type: "info",
    duration: 5000
  })

}

onBeforeMount(() => {
  data.loadEventsWithContexts()
  data.loadTags();
  data.loadAlarms();
  data.loadContexts();
  followTime();
})

onBeforeUnmount(() => {
  if (timeTicker.value) {
    clearInterval(timeTicker.value);
  }
  timeTicker.value = null;
})

// defineProps<{ msg: string }>()

const timeTicker: Ref<null | number> = ref(null);

function followTime() {
  setNow();
  clearTimeout(relativeTimeout);
  relativeTimeString.value = "That is now.";
  if (timeTicker.value) {
    clearInterval(timeTicker.value);
  }
  timeTicker.value = setInterval(setNow, 1000);
}

function stopFollowingTime() {
  if (timeTicker.value) {
    clearInterval(timeTicker.value);
  }
  timeTicker.value = null;
  queueRelativeTicker();
}

function pickerOpened() {
  stopFollowingTime();
}

function updateDate(newDate: Date) {
  if (timeTicker.value) {
    clearInterval(timeTicker.value);
    timeTicker.value = null;
  }
  converterDate.value = newDate;
  queueRelativeTicker();
}

let relativeTimeout: number;
function queueRelativeTicker() {
  calculateRelativeTimeString();
  clearTimeout(relativeTimeout);
  let diff = selectedDate.value.getTime() - Date.now();
  //diff = 60000 - Math.abs(diff % 60000);
  diff = diff % 60000;
  if (diff <= 0) {
    diff = 60000 + diff;
  } else {
    //diff = 60000 - diff;
  }
  relativeTimeout = setTimeout(queueRelativeTicker, diff);
}

//const converterDate: Ref<Date> = ref(new Date());
const selectedDate: Ref<Date> = ref(new Date());

watch(converterDate, () => {
  selectedDate.value = converterDate.value;
});

const selectedArmDate = computed(() => {
  return new ZalanthanTime(selectedDate.value);
});

const relativeTimeString = ref("Relative string not derived.");

function calculateRelativeTimeString() {
  relativeTimeString.value = ZalanthanTime.relativeString(ZalanthanTime.relativeTime(new Date(), converterDate.value));
}

function editableDateChange(seconds: number) {
  stopFollowingTime();
  let d = new Date(converterDate.value.getTime() + seconds * 1000);

  if (seconds < ZalanthanTime.dayToOOCSeconds) {
    d.setMilliseconds(0);
    d.setSeconds(0);
    let mins = d.getMinutes();
    mins = mins - (mins % 10);
    d.setMinutes(mins);
  }
  converterDate.value = d;
}

const newEventVisible = ref(false);

const eventDate = ref(new Date());

const vals = reactive<{
    editContextVisible: boolean;
}>({
    editContextVisible: false,
})

const moons = computed(() => {
  let m = selectedArmDate.value.getMoons();
  let moons = ""
  if (m.jihae !== '') {
    moons += m.jihae + "\n"
  }
  if (m.lirathu !== '') {
    moons += m.lirathu + "\n"
  }
  if (m.blackmoon !== '') {
    moons += m.blackmoon + "\n"
  }
  return moons
})

</script>

<template>
  <el-dialog v-model="newEventVisible" title="New Event" :destroy-on-close="true" width="80%"
    @open="eventDate = converterDate" center>
    <EventEdit :event="null" @close="newEventVisible = false" :date="eventDate" />
  </el-dialog>
  <el-dialog v-model="vals.editContextVisible"
    width="80%"
    title="New Context"
    :destroy-on-close="true"
    :before-close="() => { vals.editContextVisible = false;}"
    >
        <ContextEdit @close="vals.editContextVisible = false;" />
    </el-dialog>
  <p v-show="settings.displayServerTime">
    {{
        DateTime.fromJSDate(selectedDate)
          .setZone("America/New_York")
          .toLocaleString(settings.locale())
    }}
    (Server)
  </p>
  <p>
    {{ DateTime.fromJSDate(selectedDate).toLocaleString(settings.locale()) }}
  </p>
  <p v-if="settings.converterLocale.icDateMode === 'editable' || settings.converterLocale.icDateMode === 'both'">
    <EditableICDate :arm-date="selectedArmDate" @change="editableDateChange" />
  </p>
  <p v-if="settings.converterLocale.icDateMode === 'normal' || settings.converterLocale.icDateMode === 'both'">
    <span v-html="selectedArmDate.dateString()" />
  </p>
  <p>
    {{ relativeTimeString }} (IC)
  </p>

  <p v-if="settings.displayMoons" style="white-space:pre">
    {{ moons }}
  </p>
  <div style="margin-bottom:8px">

  </div>
  <div>
    <table style="margin:auto">
      <tr>
        <td>
          <el-button @click="newEventVisible = true">+Event</el-button>
        </td>
        <td>
          <el-button-group>
            <el-button @click="setNextDawn">
              Next Dawn
            </el-button>
            <el-button @click="addDawnAlarm">
              <ion-icon name="alarm-outline" style="font-size:20px;"></ion-icon>
            </el-button>
          </el-button-group>
        </td>
        <td>
          <el-button v-if="timeTicker === null" style="width:163px;" @click="followTime">Follow current time.
          </el-button>
          <el-button v-else @click="stopFollowingTime" style="width:163px;">Stop time at now.</el-button>
        </td>
      </tr>
    </table>
  </div>
  <p>
    <DateSelector :date="converterDate" @update:date="(val) => updateDate(val)" @picker-opened="pickerOpened" />
  </p>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}

:deep(table.el-date-table) {
  font-size: 14px;
}
</style>
