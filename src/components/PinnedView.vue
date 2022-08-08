<script setup lang="ts">
import { reactive } from 'vue';
import { ArmEvent } from '../models/ArmEvent';
import { useDataStore } from '../stores/data';
import { View, Close } from '@element-plus/icons-vue';
import EventView from './EventView.vue';

const data = useDataStore();

const vals = reactive<{
    selectedEvent: null | ArmEvent;
    viewVisible: boolean;
}>({
    selectedEvent: null,
    viewVisible: false
})
</script>


<template>
    <div>
        <el-dialog :destroy-on-close="true" title="View Event" v-model="vals.viewVisible" width="80%">
            <EventView :event="vals.selectedEvent"/>
        </el-dialog>
        <el-table :data="data.pinnedEvents" style="width:95%; margin: 0 auto">
            <el-table-column  prop="title" />
            <el-table-column align="right">
                <!-- <template #header></template> -->
                <template #default="scope">
                <el-button size="small" @click="vals.selectedEvent = scope.row; vals.viewVisible = true">
                        <el-icon size="18px">
                            <View />
                        </el-icon>
                    </el-button>
                    <el-button size="small" @click="data.removeFromPinned(scope.row.id)" type="danger">
                        <el-icon size="18px">
                            <Close />
                        </el-icon>
                    </el-button>
                    
                </template>
            </el-table-column>
        </el-table>

    </div>
</template>

<style scoped>
</style>