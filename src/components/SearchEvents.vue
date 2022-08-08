<script setup lang="ts">
import { onBeforeMount, reactive, Ref, ref } from 'vue';
import { Tag } from '../models/Tag';
import { ArmContext } from '../models/ArmContext';
import { useDataStore } from '../stores/data';
import { useSettingsStore } from '../stores/settings';
import { Search } from '@element-plus/icons-vue';
import { filterOptions } from '../models/ArmEvent';


interface Option {
  key: number
  label: string
  disabled: boolean
}

const props = defineProps<{
    filter: null | filterOptions
}>();

const emit = defineEmits<{
    (e: 'close'): void,
    (e: 'filter', filter: filterOptions): void
}>();

const data = useDataStore();
const settings = useSettingsStore();
const selectedTags: Ref<number[]> = ref([])
const selectedContexts: Ref<number[]> = ref([])
const activeNames = ref(['1'])

onBeforeMount(async () => {
  if (props.filter) {
    if (props.filter.start) {
      vals.startDate = props.filter.start.toDateString();
    }
    if (props.filter.end) {
      vals.endDate = props.filter.end.toDateString();
    }
    if (props.filter.anyTags && props.filter.anyTags === true) {
      vals.tagSearch = "any"
    }
    if (props.filter.anyWords && props.filter.anyWords === true) {
      vals.textSearch = "any"
    }
    if (props.filter.words) {
      vals.text = props.filter.words.join(" ");
    }
    if (props.filter.tags) {
      selectedTags.value = [...props.filter.tags]
    }
    if (props.filter.contexts) {
      selectedContexts.value = [...props.filter.contexts]
    }
  }
})

const vals = reactive<{
  startDate: string;
  endDate: string;
  tagSearch: "all" | "any";
  textSearch: "all" | "any";
  text: string;
}>({
  startDate: '',
  endDate: '',
  tagSearch: 'all',
  textSearch: 'all',
  text: '',
})


function submit() {
  let res: filterOptions = {};
  
  if (vals.text !== '') {
    res.words = vals.text.toLowerCase().split(/\s+/);
    res.anyWords = vals.textSearch === "any";
  }

  if (selectedTags.value.length > 0) {
    res.tags = [...selectedTags.value]
    res.anyTags = vals.tagSearch === "any"
  }

  if (vals.startDate !== '') {
    res.start = new Date(vals.startDate)
  }

  if (vals.endDate !== '') {
    res.end = new Date(vals.endDate)
  }

  if (selectedContexts.value.length > 0) {
    res.contexts = [...selectedContexts.value]
  }
  
  emit("filter", res)
  close()
}

function close() {
 emit("close")
}
</script>

<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="Text" name="1">
        <div style="display: flex;align-items: center; justify-content: center; margin-bottom: 15px;">
            Search for events containing
            <el-radio-group v-model="vals.textSearch" size="small">
              <el-radio-button label="all" />
              <el-radio-button label="any" />
            </el-radio-group>
            of these words in the title or description.
        </div>
        <el-input v-model="vals.text" placeholder="Words to search for" style="width:500px;" />
      </el-collapse-item>
      <el-collapse-item title="Tags" name="2">
        <div style="display: flex;align-items: center; justify-content: center; margin-bottom: 15px;">
          Search for events containing
          <el-radio-group v-model="vals.tagSearch" size="small" style="margin-left: 10px; margin-right:10px">
            <el-radio-button label="all" />
            <el-radio-button label="any" />
          </el-radio-group>
          of these tags.
        </div>
        <el-transfer v-model="selectedTags" style="text-align: left; display: inline-block" filterable
          :titles="['Available Tags', 'Selected Tags']" :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }" :data="data.allTags.map((val: Tag) => { return { key: val.id, label: val.name, disabled: false } })"
          @change="">
          <template #default="{ option }">
            <span>{{ option.label }}</span>
          </template>
          <template #left-footer>
            <el-button class="transfer-footer" size="small">Operation</el-button>
          </template>
          <template #right-footer>
            <el-button class="transfer-footer" size="small">Operation</el-button>
          </template>
        </el-transfer>
      </el-collapse-item>
      <el-collapse-item title="Contexts" name="3">
        <el-transfer v-model="selectedContexts" style="text-align: left; display: inline-block" filterable
          :titles="['Available Contexts', 'Selected Contexts']" :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }"
          :data="data.allContexts.map((val: ArmContext) => { return { key: val.id, label: val.name, disabled: false } })"
          @change="">
          <template #default="{ option }">
            <span>{{ option.label }}</span>
          </template>
          <template #left-footer>
            <el-button class="transfer-footer" size="small">Operation</el-button>
          </template>
          <template #right-footer>
            <el-button class="transfer-footer" size="small">Operation</el-button>
          </template>
        </el-transfer>
      </el-collapse-item>
      <el-collapse-item title="Date range" name="4">
        <div>From:
          <el-date-picker v-model="vals.startDate" type="datetime" placeholder="Pick a Date" format="YYYY/MM/DD hh:mm A"
            style="margin-right:50px;" />
          To:
          <el-date-picker v-model="vals.endDate" type="datetime" placeholder="Pick a Date"
            format="YYYY/MM/DD hh:mm A" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
  <div style="margin-top:15px;">
  <el-button @click="close">Cancel</el-button><el-button :icon="Search" @click="submit" type="primary">Search</el-button>
  </div>
</template>

<style scoped>
:deep(.el-transfer) {
  --el-transfer-panel-width: 400px;
}

:deep(.el-radio-group) {
  margin-right:5px;
  margin-left:5px;

}
</style>