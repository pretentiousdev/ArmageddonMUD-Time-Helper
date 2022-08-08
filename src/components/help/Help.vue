<script setup lang="ts">
import { ref } from "vue";
import TimeConverterHelp from "./TimeConverterHelp.vue";
import EventsHelp from "./EventsHelp.vue";
import ContextHelp from "./ContextHelp.vue";
import TimelineHelp from "./TimelineHelp.vue";

const activeName = ref("timeconverter");
</script>

<template>
    <div>
        <el-tabs v-model="activeName" class="demo-tabs" style="width: 80%; margin: 0 auto">
            <el-tab-pane label="Time Converter" name="timeconverter">
                <time-converter-help />
            </el-tab-pane>
            <el-tab-pane label="Events" name="events">
                <events-help />
            </el-tab-pane>
            <el-tab-pane label="Contexts" name="contexts">
                <ContextHelp />
            </el-tab-pane>
            <el-tab-pane label="Timeline" name="timeline">
                <timeline-help />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style scoped>
:deep(p) {
    text-align: left;
}
</style>
