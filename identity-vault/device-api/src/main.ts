import { useSessionVault } from '@/composables/session-vault';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { IonicVue } from '@ionic/vue';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';

/* Theme variables */
import '@ionic/vue/css/palettes/dark.system.css';
import './theme/variables.css';

const { initializeVault } = useSessionVault();

PrivacyScreen.enable();

initializeVault().then(async () => {
  const app = createApp(App).use(IonicVue).use(router);
  await router.isReady();
  app.mount('#app');
});
