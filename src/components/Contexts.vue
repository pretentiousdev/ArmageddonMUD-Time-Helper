<script setup lang="ts">
import { ElMessageBox, ElNotification } from 'element-plus';
import { reactive } from 'vue';
import { ArmContext } from '../models/ArmContext';
import { useDataStore } from '../stores/data';
import { useSettingsStore } from '../stores/settings';
import ContextEdit from './ContextEdit.vue';
const data = useDataStore();
const settings = useSettingsStore();


const vals = reactive<{
    search: string;
    editContextVisible: boolean;
    editingContext: (null | ArmContext);
    itemsAffected: number
}>({
    search: '',
    editContextVisible: false,
    editingContext: null,
    itemsAffected: 0,
})

async function askDeleteContext(context: ArmContext) {
    vals.itemsAffected = await data.numEventsForContext(context.id);


    ElMessageBox.confirm(
        `Deleting context '${context.name}' will remove ${vals.itemsAffected} events. Are you sure you want to do this?`,
        `Deleting Context`,
        {
            confirmButtonText: 'Delete Context',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(async () => {
        if (context.id === settings.defaultContext) { settings.defaultContext = 2 }
        await data.deleteContext(context.id);
        ElNotification({
            title: 'Context Deleted',
            message: `Deleted  '${context.name}' and ${vals.itemsAffected} events.`,
            type: 'success',
        })
    }).catch(() => {
        //Canceled.
    })
}


</script>

<template>
    <div>
        <div style="width:80%; margin:0 auto;"><span style="float:left">Default Context: <el-select style="padding-right:50px;width:500px;" v-model="settings.defaultContext" filterable placeholder="Select">
                    <el-option v-for="item in data.allContexts.slice(1)" :key="item.id" :label="item.name" :value="item.id" />
                </el-select><el-button @click="vals.editContextVisible = true">+Context</el-button></span></div>
        <el-table :data="data.allContexts" style="width:80%; margin: 0 auto">
        <el-table-column label="Name" prop="name" />
        <el-table-column align="right">
            <template #header>
                <el-input v-model="vals.search" size="small" placeholder="Type to search" :clearable="true" />
            </template>
            <template #default="scope" width="100">
                <span v-if="scope.row.id > 2">
                <el-button type="danger" size="small" @click="askDeleteContext(scope.row)">
                    <el-icon size="18px"><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="vals.editingContext = scope.row; vals.editContextVisible = true">
                    <el-icon size="18px"><Edit /></el-icon>
                </el-button>
                </span>
            </template>
        </el-table-column>
        </el-table>
    </div>
    <el-dialog v-model="vals.editContextVisible"
    width="80%"
    :title="(vals.editingContext ? 'Edit' : 'New') + ' Context'"
    :destroy-on-close="true"
    :before-close="() => { vals.editContextVisible = false;vals.editingContext = null;}"
    >
        <ContextEdit @close="vals.editContextVisible = false; vals.editingContext = null;" :context="vals.editingContext" />
    </el-dialog>
</template>

<style scoped>

</style>