import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "ant-design-vue/dist/reset.css";
import Antd from "ant-design-vue";
import { createPinia } from 'pinia'
import './style.css'

const app = createApp(App);
app.use(router);
app.use(createPinia())
app.use(Antd);
app.mount("#app");
