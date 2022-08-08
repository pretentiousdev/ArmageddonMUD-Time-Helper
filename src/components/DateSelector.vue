<template>
  <div style="display: flex; justify-content: center;">
    <el-button @click="data.fromICDateDialogVisible = true">From IC</el-button>
    <el-date-picker :modelValue="props.date" @update:model-value="(val) => $emit('update:date', val)"
      @focus="$emit('picker-opened')" type="datetime" placeholder="Pick a Date" format="YYYY/MM/DD hh:mm A"
      :clearable="false" />
    <el-button @click="data.adjusterVisible = true">Adjust IC</el-button>
  </div>

  <el-dialog v-model="data.fromICDateDialogVisible" title="From IC Date" width="70%" center>
    <el-input v-model="data.ICDateInput" :rows="4" type="textarea"
      placeholder="Input the IC date echoed by the 'time' command here" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.fromICDateDialogVisible = false; data.ICDateInput = '';">Cancel</el-button>
        <el-button type="primary" :disabled="convertedICDate === null" @click="setFromICDate">Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  <ICTimeAdjuster v-model="data.adjusterVisible" @change="(val) => adjustTime(val)" />
  
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ZalanthanTime } from '../models/ZalanthanTime';
import ICTimeAdjuster from './ICTimeAdjuster.vue'

const props = defineProps({
  date: Date,
})

const emit = defineEmits<{
  (e: 'picker-opened'): void,
  (e: 'update:date', d: Date): void
}>()

// defineEmits(['picker-opened', 'update:date']);
const data = reactive({
  fromICDateDialogVisible: false,
  adjusterVisible: false,
  ICDateInput: '',
});

const convertedICDate = computed(() => {
  if (data.ICDateInput == "") {
    return null;
  } else {
    return ZalanthanTime.ICDateToOOC(data.ICDateInput);
  }
})

function setFromICDate() {
  data.fromICDateDialogVisible = false;
  if (convertedICDate.value) {
    emit('update:date', convertedICDate.value)
  }
  data.ICDateInput = "";
}

function adjustTime(seconds: number) {
  if (props.date) {
    let newDate = new Date(props.date.getTime() + seconds * 1000)
    emit('update:date', newDate);
  }
}

</script>

<style scoped>
/* .el-button {
  /* margin-top: -7px; 
} */
</style>