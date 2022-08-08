import { createApp, VueElement } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import "element-plus/theme-chalk/dark/css-vars.css";
import "./styles/themes.css"
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const pinia = createPinia()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }


app.use(pinia).use(ElementPlus).mount('#app')
