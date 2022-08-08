<script setup lang="ts">
import { ElInput, ElNotification, FormInstance } from 'element-plus';
import { ref, reactive, nextTick, onMounted } from 'vue'
import { Tag, addAlias, hasName } from '../models/Tag';
import { useDataStore } from '../stores/data';

const data = useDataStore();

const emit = defineEmits<{
    (e: 'close'): void,
    (e: 'created', id: number): void
}>()


const props = defineProps<{
    tag?: (null | Tag),
    alias?: string
}>()

onMounted(() => {
    if (props.tag) {
        tagForm.name = props.tag.name;
        tagForm.description = props.tag.description;
        tagForm.aliases = [...props.tag.aliases];
        tagForm.editID = props.tag.id
    }

    if (props.alias) {
        addAlias(props.alias, tagForm.aliases)
    }
})

const tagForm = reactive<{
    name: string,
    description: string,
    aliases: string[],
    inputVisible: boolean,
    inputValue: string,
    editID: number

}>({
    name: '',
    description: '',
    aliases: [],
    inputVisible: false,
    inputValue: '',
    editID: -1,
})

const handleClose = (alias: string) => {
    tagForm.aliases.splice(tagForm.aliases.indexOf(alias), 1)
}

const InputRef = ref<InstanceType<typeof ElInput>>()
const showInput = () => {
    tagForm.inputVisible = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}

const handleInputConfirm = (enterKey: boolean) => {
    if (tagForm.inputValue) {
        let n = tagForm.inputValue.toLowerCase();
        for (let i = 0; i < data.allTags.length; i++) {
            if (hasName(data.allTags[i], n)) {
                ElNotification({
                    title: 'Cannot add alias',
                    message: `The tag '${data.allTags[i].name}' already has a name or alias '${n}'`,
                    type: 'error',
                })
                tagForm.inputValue = ''
                return;
            }
        }
        addAlias(tagForm.inputValue, tagForm.aliases)
        //tagForm.aliases.push(tagForm.inputValue)
    }
    if (!enterKey) {
        tagForm.inputVisible = false
    }
    tagForm.inputValue = ''
}

const handleEscape = () => {
    tagForm.inputVisible = false;
    tagForm.inputValue = '';
}

const validateName = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('A name is required for the tag.'))
        return;
    } else {
        let name = value.toLowerCase();
        for (let i = 0; i < data.allTags.length; i++) {
            const tag = data.allTags[i]
            if (tagForm.editID === tag.id) {
                continue;
            }
            if (name === tag.name.toLowerCase()) {
                callback(new Error(`There is already a tag with the name '${tag.name}'`))
                return;
            }

            for (let j = 0; j < tag.aliases.length; j++) {
                if (tag.aliases[j] == name) {
                    callback(new Error(`The tag '${tag.name}' has an alias with this name. Delete that alias first if you want to make a tag with this name.`))
                    return;
                }
            }
        }
        callback()
    }
}

const rules = reactive({
    name: [{ validator: validateName, required: true, trigger: 'blur' }],
})

const form = ref<FormInstance>()
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate(async (valid, fields) => {
        if (valid) {
            if (tagForm.editID !== -1) {
                const tag: Tag = {
                    id: tagForm.editID,
                    name: tagForm.name,
                    description: tagForm.description,
                    aliases: tagForm.aliases,
                    contexts: []
                };
                data.updateTag(tag);
                ElNotification({
                    title: 'Tag Updated',
                    message: tagForm.name + ' has been updated.',
                    type: 'success',
                })
            } else {
                let id = await data.addTag(tagForm.name, tagForm.description, tagForm.aliases);
                ElNotification({
                    title: 'Tag Added',
                    message: tagForm.name + ' has been added to tags.',
                    type: 'success',
                })
                emit("created", id);
            }
            formEl.resetFields();
            formEl.clearValidate();
            emit("close");
        } else {
            return false
        }
    })


}

const cancelForm = (formEl: FormInstance | undefined) => {
    if (formEl) {
        formEl.resetFields();
        formEl.clearValidate();
    }

    emit("close");
}

</script>

<template>
    <div style="display: flex; justify-content: center;">
        <el-form ref="form" :model="tagForm" :rules="rules" label-width="auto" label-position="right"
            style="width:600px;">
            <el-form-item prop="name" label="Name">
                <el-input v-model="tagForm.name" />
            </el-form-item>
            <!-- This stops the app from resetting if enters is hit in the input above. No idea why yet. -->
            <el-input v-show="false" />
            <el-form-item prop="aliases" label="Aliases">
                <div style="display:flex; flex-wrap: wrap;">
                    <el-tag v-for="alias in tagForm.aliases" :key="alias" class="alias-tag" closable
                        :disable-transitions="false" @close="handleClose(alias)">
                        {{ alias }}
                    </el-tag>
                    <el-input v-if="tagForm.inputVisible" ref="InputRef" v-model="tagForm.inputValue" class="alias-tag"
                        style="width:100px;" size="small" @keyup.enter="handleInputConfirm(true)"
                        @keyup.escape="handleEscape" @blur="handleInputConfirm(false)" />
                    <el-button v-else class="button-new-tag alias-tag" size="small" @click="showInput">
                        + New Alias
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item prop="description" label="Description">
                <el-input v-model="tagForm.description" type="textarea" :rows="6" />
            </el-form-item>

            <el-form-item>
                <div style="margin: 0 auto;">
                    <el-button @click="cancelForm(form)">Cancel</el-button>
                    <el-button type="primary" @click="submitForm(form)">Save</el-button>

                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<style scoped>
:deep(.el-form-item__label) {
    font-size: 15px;
}

.alias-tag {
    margin-right: 5px;
    margin-top: 2px;
    margin-bottom: 2px;
}
</style>