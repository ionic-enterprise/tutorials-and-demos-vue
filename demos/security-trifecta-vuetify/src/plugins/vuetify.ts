/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          aws: '#ff9900',
          danger: '#eb445a',
          warning: '#ffc409',
        },
      },
      dark: {
        colors: {
          aws: '#ff9900',
          danger: '#ff4961',
          warning: '#ffd534',
        },
      },
    },
  },
});
