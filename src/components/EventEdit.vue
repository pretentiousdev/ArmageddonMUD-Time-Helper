<script setup lang="ts">
import { ElInput, ElNotification, FormInstance, FormRules } from 'element-plus';
import { ref, reactive, nextTick, Ref, onMounted } from 'vue'
import { ArmEvent } from '../models/ArmEvent';
import DateSelector from './DateSelector.vue';
import { useDataStore } from '../stores/data';
import TagEdit from './TagEdit.vue'
import { useSettingsStore } from '../stores/settings';
const settings = useSettingsStore();
const data = useDataStore();


const props = defineProps<{
    date?: Date,
    event: (null | ArmEvent),
}>()

const emit = defineEmits<{
    (e: 'close'): void,
}>()

onMounted(() => {
    if (props.event) {
        validateForm.title = props.event.title
        validateForm.description = props.event.description
        validateForm.tags = [...props.event.tags]
        validateForm.id = props.event.id
        date.value = props.event.timestamp
        validateForm.context = props.event.context
    }
})

const validateForm = reactive<{
    title: string,
    description: string,
    tags: number[],
    id: number,
    inputValue: string,
    inputVisible: boolean,
    context: number
}>({
    title: '',
    description: '',
    tags: [],
    id: -1,
    inputValue: '',
    inputVisible: false,
    context: settings.defaultContext
})

const vals = reactive({
    newTagVisible: false,
    newTagAlias: '',
})

const date = props.date ? ref(props.date) : ref(new Date());

function onSubmit(formEl: FormInstance | undefined) {
    if (!formEl) {
        return;
    }
    formEl.validate(async (valid, fields) => {
        if (valid) {
            const ev: ArmEvent = {
                id: validateForm.id, title: validateForm.title, description: validateForm.description,
                timestamp: date.value, context: validateForm.context, tags: [...validateForm.tags], pinned: false
            }
            if (validateForm.id !== -1) {
                await data.updateEvent(ev);
                ElNotification({
                    title: 'Event Updated',
                    message: `'${ev.title}' has been updated.`,
                    type: 'success',
                })
            } else {
                data.addEvent(validateForm.title, validateForm.description, validateForm.tags, date.value, validateForm.context);
                ElNotification({
                    title: 'Event Added',
                    message: validateForm.title + ' has been added to events.',
                    type: 'success',
                })
            }
            close(formEl);
        } else {
        }
    })
}

function close(formEl: FormInstance | undefined) {
    if (formEl) {
        formEl.resetFields();
    }
    emit("close");
}

const form = ref<FormInstance>()

const rules = reactive<FormRules>({
    title: [
        { required: true, message: "Event title is required", trigger: 'change' },
    ]
});

const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: number) => {
    validateForm.tags.splice(validateForm.tags.indexOf(tag), 1)
}

const showInput = () => {
    validateForm.inputVisible = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}

const handleInputConfirm = (enterKey: boolean) => {
    if (validateForm.inputValue) {
        let tag = data.getTagByName(validateForm.inputValue)
        if (tag) {
            validateForm.tags.push(tag.id);
        } else {
            vals.newTagVisible = true;
            vals.newTagAlias = validateForm.inputValue;
            ElNotification({
                title: 'Invalid tag',
                message: `There is no tag with the name or alias of ${validateForm.inputValue}`,
                type: 'info',
            })
        }
    }
    if (!enterKey) {
        validateForm.inputVisible = false
    }
    validateForm.inputValue = ''
}

const handleEscape = () => {
    validateForm.inputVisible = false;
    validateForm.inputValue = '';
}

</script>

<template>
    <el-dialog v-model="vals.newTagVisible" :destroy-on-close="true" title="New Tag">
        <TagEdit @close="vals.newTagVisible = false;" @created="(id) => validateForm.tags.push(id)"
            :alias="vals.newTagAlias" />
    </el-dialog>
    <div style="display: flex; justify-content: center;">
        <el-form ref="form" :model="validateForm" label-width="auto" label-position="right" :rules="rules"
            style="width:600px;">

            <el-form-item prop="title" label="Title">
                <el-input v-model="validateForm.title" />
            </el-form-item>
            <el-form-item prop="tags" label="Tags">
                <div style="display:flex; flex-wrap: wrap;">
                    <el-tag v-for="tag in validateForm.tags" :key="tag" class="event-tag" closable
                        :disable-transitions="false" @close="handleClose(tag)">
                        {{ data.getTag(tag).name }}
                    </el-tag>
                    <el-input v-if="validateForm.inputVisible" ref="InputRef" v-model="validateForm.inputValue"
                        class="event-tag" style="width:100px;" size="small" @keyup.enter="handleInputConfirm(true)"
                        @keyup.escape="handleEscape" @blur="handleInputConfirm(false)" />
                    <el-button v-else class="button-new-tag event-tag" size="small" @click="showInput">
                        + New Tag
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item prop="description" label="Description">
                <el-input v-model="validateForm.description" type="textarea" :rows="6" />
            </el-form-item>
            <el-form-item prop="context" label="Context">
                <el-select v-model="validateForm.context" filterable placeholder="Select" style="width:85%; margin: 0 auto">
                    <el-option v-for="item in data.allContexts" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item prop="time" label="Time">
                <div style="margin:0 auto">
                    <date-selector v-model:date="date" />
                </div>
            </el-form-item>

            <el-form-item>
                <div style="margin: 0 auto;">
                    <el-button @click="close(form)">Cancel</el-button>
                    <el-button type="primary" @click="onSubmit(form)">Save</el-button>

                </div>
            </el-form-item>
        </el-form>

    </div>
</template>

<style scoped>
:deep(.el-form-item__label) {
    font-size: 15px;
}

.event-tag {
    margin-right: 5px;
    margin-top: 2px;
    margin-bottom: 2px;
}
</style>