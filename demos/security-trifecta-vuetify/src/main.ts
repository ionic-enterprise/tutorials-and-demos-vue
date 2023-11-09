import { useSessionVault } from '@/composables/session-vault';
import { registerPlugins } from '@/plugins';
import { Device } from '@ionic-enterprise/identity-vault';
import { createApp } from 'vue';
import App from './App.vue';
import { useEncryption } from './composables/encryption';
import './styles/Button.css';
import './styles/responsive.css';

Device.setHideScreenOnBackground(true);

const { initializeEncryption } = useEncryption();
const { initializeVault } = useSessionVault();
const app = createApp(App);
registerPlugins(app);
Promise.all([initializeEncryption(), initializeVault()]).then(() => app.mount('#app'));
