import { useAuth } from '@/auth/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { registerPlugins } from '@/plugins';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { createApp } from 'vue';
import App from './App.vue';
import { useEncryption } from './composables/encryption';
import './styles/Button.css';
import './styles/responsive.css';

PrivacyScreen.enable({ android: { privacyModeOnActivityHidden: 'splash' } });

const { initializeAuth } = useAuth();
const { initializeEncryption } = useEncryption();
const { initializeVault } = useSessionVault();
const app = createApp(App);
registerPlugins(app);
Promise.all([initializeAuth(), initializeEncryption(), initializeVault()]).then(() => app.mount('#app'));
