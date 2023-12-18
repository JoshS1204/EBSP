import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import store from "./store"
import router from "./router"

const app = createApp(App)

app.use(store)
app.use(router)
app.use(VueKonva)
app.mount('#app')
