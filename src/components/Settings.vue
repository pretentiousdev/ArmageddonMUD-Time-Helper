<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { useDataStore } from '../stores/data';
import osNotify from '../services/Notifications'

const notify = osNotify;

const settings = useSettingsStore();
const data = useDataStore();

const dateFormatOptions = {
  weekday: [
    { label: "Don't Show", value: "" },
    { label: "Abbreviated", value: "short" },
    { label: "Show", value: "long" }
  ],
  month: [
    { label: "Show", value: "long" },
    { label: "Abbreviated", value: "short" },
    { label: "Numeric", value: "numeric" },
    { label: "Always 2 Digits", value: "2-digit" }
  ]
};

function reloadFromDB() {
  data.loadEventsWithContexts();
  data.loadTags();
  data.loadAlarms();
  data.loadContexts();
}

</script>

<template>
  <!-- <div style="margin-bottom:10px;"><el-button @click="reloadFromDB">Reload</el-button><el-button @click="notify.osNotify('hello!')">Notify</el-button></div> -->
  <div style="margin-bottom:15px;">
    <el-checkbox v-model="settings.displayServerTime" border>Display Server Time</el-checkbox>
  </div>
  <div style="margin-bottom:15px;">
    <el-checkbox v-model="settings.displayMoons" border>Display Moons</el-checkbox>
  </div>
  <div>
    <span class="settings-category">IC Date Mode:</span><br />
    <el-radio-group v-model="settings.converterLocale.icDateMode">
      <el-radio label="normal">Normal</el-radio>
      <el-radio label="editable">Editable</el-radio>
      <el-radio label="both">Both</el-radio>
    </el-radio-group>
  </div>

  <div style="margin-top:20px;" class="settings-category">
    OOC Date Format:
  </div>
  <div style="margin-top:10px; line-height:2.5">
    <table style="margin:auto">
      <tr>
        <td style="padding-right:5px;" class="setting-subcategory">
          Weekday:&nbsp;
        </td>
        <td>
          <el-select v-model="settings.converterLocale.weekdayFormat" placeholder="Select">
            <el-option style="display:block" v-for="item in dateFormatOptions.weekday" :key="item.value"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </td>
      </tr>
      <tr>
        <td style="padding-right:5px;" class="setting-subcategory">
          Month: &nbsp;
        </td>
        <td>
          <el-select v-model="settings.converterLocale.monthFormat" placeholder="Select">
            <el-option style="display:block" v-for="item in dateFormatOptions.month" :key="item.value"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </td>
      </tr>

      <tr>
        <td class="setting-subcategory">Day:</td>
        <td style="float:left;">
          <el-checkbox v-model="settings.converterLocale.day2Digits">Always 2 digits</el-checkbox>
        </td>
      </tr>
    </table>


    <el-radio-group v-model="settings.converterLocale.hour12">
      <el-radio-button :label="true">12-hour</el-radio-button>
      <el-radio-button :label="false">24-hour</el-radio-button>
    </el-radio-group>
    <!-- <el-checkbox
          v-model="settings.converterLocale.displaySeconds"
          style="padding-left:5px"
          >Seconds</el-checkbox
        > -->
    <div>
      <el-checkbox v-model="settings.converterLocale.displaySeconds">Display Seconds</el-checkbox>
    </div>
  </div>
</template>

<style scoped>
div {
  font-size: 1em;
}
</style>