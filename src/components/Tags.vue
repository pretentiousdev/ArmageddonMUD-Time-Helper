<script setup lang="ts">
import { computed, ref, reactive, Ref } from 'vue';
import { useDataStore } from '../stores/data';
import { Tag } from '../models/Tag';
import { ArmEvent } from '../models/ArmEvent';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { dataType } from 'element-plus/es/components/table-v2/src/common';
import TagEdit from './TagEdit.vue';
const data = useDataStore();

const vals = reactive({
    search: '',
    itemsDisplayed: 10,
    itemsAffected: 0,
    tagEditVisible: false,
})

const tagsData = computed(() => {
    if (vals.search === '') {
        return data.allTags;
    } else {
        let s = vals.search.toLowerCase();
        return data.allTags.filter((tag: Tag) => {
            if (tag.name.toLowerCase().includes(s)) {
                return true;
            }
            if (tag.description.toLowerCase().includes(s)) {
                return true;
            }

            for (let i = 0; i < tag.aliases.length; i++) {
                if (tag.aliases[i].includes(s)) {
                    return true;
                }
            }

            return false;
        })
    }
})

function askDeleteTag(tag: Tag) {
    vals.itemsAffected = 0;

    data.allEvents.forEach((ev: ArmEvent) => {
        if (ev.tags.includes(tag.id)) {
            vals.itemsAffected++;
        }
    })

    ElMessageBox.confirm(
        `This will remove this tag from ${vals.itemsAffected} events`,
        `Deleting Tag ${tag.name}`,
        {
            confirmButtonText: 'Delete Tag',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(async () => {
        await data.deleteTag(tag.id)
        ElNotification({
            title: 'Tag Deleted',
            message: `Deleted  '${tag.name}'`,
            type: 'success',
        })
    }).catch(() => {
        //Canceled.
    })
}

const editingTag: Ref<null | Tag> = ref(null);
const tagEditTitle = computed(() => {
    if (editingTag.value === null) {
        return "New Tag"
    } else {
        return "Edit Tag"
    }
})

const page = ref(1);
const pageSize = ref(10);
const tagsDataPage = computed(() => {
    console.log(`computing. Page ${page.value}`);
    let start = (page.value - 1) * pageSize.value;
    let end = (page.value) * pageSize.value;
    let evs = tagsData.value.slice(start, end)
    return evs
})

</script>
<template>
    <el-dialog v-model="vals.tagEditVisible" width="80%" :title="tagEditTitle" :destroy-on-close="true" >
        <TagEdit :tag="editingTag" @close="editingTag = null; vals.tagEditVisible = false;"/>
    </el-dialog>
    <el-button @click="vals.tagEditVisible = true">+Tag</el-button>
    <el-table :data="tagsDataPage" style="width:80%; margin: 0 auto" empty-text="No Tags">
        <el-table-column label="Name" prop="name" width="400" />
        <el-table-column label="Aliases">
            <template #default="props">
                <el-tag v-for="alias in props.row.aliases" :key="alias" class="event-tag" :disable-transitions="true"
                    style="flex-wrap: wrap; margin-right:5px; margin-top: 2px; margin-bottom:2px;">
                    {{ alias }}
                </el-tag>
            </template>

        </el-table-column>
        <el-table-column align="right">
            <template #header>
                <el-input v-model="vals.search" size="small" placeholder="Type to search" :clearable="true" />
            </template>
            <template #default="scope" width="100">
                <el-button type="danger" size="small" @click="askDeleteTag(scope.row)">
                    <el-icon size="18px"><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="editingTag = scope.row; vals.tagEditVisible = true;">
                    <el-icon size="18px"><Edit /></el-icon>
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination v-model="page" :hide-on-single-page="true" v-on:current-change="(p) => {page = p}" :page-size="pageSize" layout="prev, pager, next" :total="tagsData.length" style="justify-content: center;" />
</template>



<style scoped>
ion-icon {
    font-size: 18px
}
</style>