<script setup lang="ts">
import ConverterTab from './ConverterTab.vue'
import { reactive, ref } from 'vue';
import { ElNotification, TabsPaneContext } from 'element-plus';
import Tags from './Tags.vue'
import Events from './Events.vue';
import SettingsVue from './Settings.vue';
import { useSettingsStore } from '../stores/settings';
import { useControllerStore } from '../stores/controller';
import Alarms from './Alarms.vue';
import Contexts from './Contexts.vue';
import Timeline from './Timeline.vue';
import PinnedView from './PinnedView.vue';
import Help from './help/Help.vue';
const activeName = ref('time');
const vals = reactive({
  settingsVisible: false
})

const settings = useSettingsStore();
const controller = useControllerStore();

const handleClick = (tab: TabsPaneContext, event: Event) => {
}

function noHelp() {
  ElNotification({
    title: "Uh oh!",
    message: "Help hasn't been implemented yet. You're on your own!",
    type: "error",
  });
}

</script>

<template>
  <el-drawer v-model="controller.pinned.visible" title="Pinned Events" size="60%" direction="rtl">
   <PinnedView />
  </el-drawer>
  <el-dialog v-model="controller.help.visible" :fullscreen="true">
   <Help />
  </el-dialog>
  <el-drawer v-model="vals.settingsVisible" title="Settings" size="40%" direction="rtl">
    Theme: <el-select v-model="settings.theme" class="m-2" placeholder="Select"
      style="margin-bottom:10px;margin-top:10px;">
      <el-option v-for="item in settings.themes" :key="item.value" :label="item.label" :value="item.value" />

    </el-select>
    <SettingsVue />
  </el-drawer>
  <span style="position:absolute; top:3px; right: 15px; z-index:999">
    <el-button @click="controller.help.visible = true">
      <ion-icon name="help-circle-outline"></ion-icon>&nbsp;Help
    </el-button>
    <el-button @click="vals.settingsVisible = true">
      <ion-icon name="settings-outline"></ion-icon>&nbsp;Settings
    </el-button>
  </span>
  <el-tabs v-model="activeName" class="demo-tabs" type="border-card" @tab-click="handleClick">
    <el-tab-pane label="Time Converter" name="time">
      <ConverterTab />
    </el-tab-pane>
    <el-tab-pane label="Events" name="events">
      <Events />
    </el-tab-pane>
    <el-tab-pane label="Tags" name="tags">
      <Tags />
    </el-tab-pane>
    <el-tab-pane label="Alarms" name="alarms">
      <Alarms />
    </el-tab-pane>
    <el-tab-pane label="Contexts" name="contexts">
      <Contexts />
    </el-tab-pane>
    <el-tab-pane label="Timeline" name="timeline">
      <Timeline />
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
ion-icon {
  font-size: 20px;
}

:deep(.el-tabs__nav) {
  float: none;
}

:deep(.el-tabs__item) {
  font-size: 17px;
}

:deep(.el-tabs--border-card) {
  border-right: none;
  border-left: none;
  border-bottom: none;
  border: none;
}

:deep(.el-tabs__content) {
  overflow: unset;
}

.el-tabs--border-card {
  border-right: none;
  border-left: none;
  border-bottom: none;
}
</style>