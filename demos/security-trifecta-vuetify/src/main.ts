import { registerPlugins } from '@/plugins';
import { Device } from '@ionic-enterprise/identity-vault';
import { createApp } from 'vue';
import App from './App.vue';
import './styles/Button.css';
import './styles/responsive.css';

Device.setHideScreenOnBackground(true);

const app = createApp(App);
registerPlugins(app);
app.mount('#app');
