<script setup lang="ts">
import { ElNotification, FormInstance } from 'element-plus';
import { Settings } from 'luxon';
import { onMounted, reactive, ref } from 'vue';
import { ArmContext } from '../models/ArmContext';
import { useDataStore } from '../stores/data';
import { useSettingsStore } from '../stores/settings';
const data = useDataStore();
const settings = useSettingsStore();

const vals = reactive({
    name: '',
    id: -1,
    makeDefault: true,
})

const props = defineProps<{
    context?: (null | ArmContext),
}>()

const emit = defineEmits<{
    (e: 'close'): void,
    (e: 'created', id: number): void
}>()

onMounted(() => {
    if (props.context) {
        vals.name = props.context.name
        vals.id = props.context.id
    }
})

const validateName = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('A name is required for the context.'))
        return;
    } else {
        let name = value.toLowerCase();
        for (let i = 0; i < data.allContexts.length; i++) {
            const con = data.allContexts[i]
            if (vals.id === con.id) {
                continue;
            }
            if (name === con.name.toLowerCase()) {
                callback(new Error(`There is already a context with the name '${con.name}'`))
                return;
            }
        }
        callback()
    }
}

const rules = reactive({
    name: [{ validator: validateName, required: true, trigger: 'blur' }],
})

const form = ref<FormInstance>()
const onSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate(async (valid, fields) => {
        if (valid) {
            if (vals.id !== -1) {
                await data.updateContext(vals.id, vals.name)
                ElNotification({
                    title: 'Context Updated',
                    message: vals.name + ' has been updated.',
                    type: 'success',
                })
            } else {
                let newContext = await data.addContext(vals.name);
                ElNotification({
                    title: 'Context Added',
                    message: vals.name + ' has been added.',
                    type: 'success',
                })
                if (vals.makeDefault) {
                    settings.defaultContext = newContext.id;
                }
                emit("created", newContext.id);
            }
            formEl.resetFields();
            formEl.clearValidate();
            emit("close");
        } else {
            return false
        }
    })


}

function close(formEl: FormInstance | undefined) {
    if (formEl) {
        formEl.resetFields();
    }
    emit("close");
}

</script>


<template>
    <div style="display: flex; justify-content: center;">
        <div>

            <el-form ref="form" :model="vals" :rules="rules" label-width="auto" label-position="right"
                style="width:600px;">
                <el-form-item prop="name" label="Name">
                    <el-input v-model="vals.name" />
                </el-form-item>
                <!-- This stops the app from resetting if enters is hit in the input above. No idea why yet. -->
                <el-input v-show="false"/>
                <el-checkbox v-if="vals.id === -1" v-model="vals.makeDefault" label="Make default context" size="large"
                    style=" margin-bottom:15px;" />
                <div style="margin: 0 auto;">
                    <el-button @click="close(form)">Cancel</el-button>
                    <el-button type="primary" @click="onSubmit(form)">Save</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
</style>