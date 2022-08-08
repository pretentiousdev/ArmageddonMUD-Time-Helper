import { defineStore } from "pinia";
import { reactive } from "vue";


export const useControllerStore = defineStore('controller', () => {

    const pinned = reactive<{
        visible: boolean
    }>({
        visible: false
    })

    const help = reactive<{
        visible: boolean
    }>({
        visible: false
    })


    return { pinned, help }
})