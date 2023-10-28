<template>
  <ion-page>
    <ion-content class="ion-text-center">
      <ion-card>
        <ion-card-header>
          <ion-card-title> Login </ion-card-title>
          <ion-card-subtitle>Welcome to the Ionic Authentication Playground</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-input
                data-testid="email-input"
                label="E-Mail Address"
                label-placement="floating"
                name="email"
                type="email"
                v-model="email"
                email
                required
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                data-testid="password-input"
                label="Password"
                label-placement="floating"
                name="password"
                type="password"
                v-model="password"
                required
              >
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-label>
                <ion-button
                  expand="block"
                  :disabled="!formIsValid"
                  @click="signIn('Basic')"
                  data-testid="basic-signin-button"
                  >Sign In with Email</ion-button
                >
              </ion-label>
            </ion-item>
          </ion-list>

          <div class="error-message ion-padding" data-testid="basic-form-error-message">
            <div v-for="(error, idx) of errors" :key="idx">{{ error }}</div>
          </div>

          <div class="auth-button-area">
            <div>--OR--</div>
            <ion-button expand="block" color="auth0" @click="signIn('Auth0')" data-testid="auth0-signin-button">
              <ion-icon slot="end" src="/auth0-logo.svg"></ion-icon>
              Sign In with Auth0
            </ion-button>
          </div>

          <div class="auth-button-area">
            <div>--OR--</div>
            <ion-button expand="block" color="aws" @click="signIn('AWS')" data-testid="aws-signin-button">
              <ion-icon slot="end" :icon="logoAmazon"></ion-icon>
              Sign In with AWS
            </ion-button>
          </div>

          <div class="auth-button-area">
            <div>--OR--</div>
            <ion-button expand="block" color="azure" @click="signIn('Azure')" data-testid="azure-signin-button">
              <ion-icon slot="end" :icon="logoMicrosoft"></ion-icon>
              Sign In with Azure
            </ion-button>
          </div>

          <div class="error-message" data-testid="error-message">
            <div>{{ errorMessage }}</div>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonContent,
} from '@ionic/vue';
import { logoAmazon, logoMicrosoft } from 'ionicons/icons';
import { useForm, useField } from 'vee-validate';
import { object as yupObject, string as yupString } from 'yup';
import { AuthVendor } from '@/models';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';

const errorMessage = ref<string>();

const validationSchema = yupObject({
  email: yupString().required().email().label('Email Address'),
  password: yupString().required().label('Password'),
});
const { errors, meta } = useForm({ validationSchema });
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const formIsValid = computed(() => meta.value.valid);

const { login } = useAuth();
const { initializeUnlockMode } = useSessionVault();
const router = useRouter();

const signIn = async (vendor: AuthVendor): Promise<void> => {
  try {
    await (vendor === 'Basic' ? login(vendor, email.value, password.value) : login(vendor));
    await initializeUnlockMode();
    router.replace('/');
  } catch (err) {
    errorMessage.value = 'Invalid email and/or password';
  }
};
</script>

<style scoped>
.auth-button-area {
  margin-top: 1em;
  font-size: large;
}

@media (min-width: 0px) {
  ion-card {
    margin-top: 20%;
    margin-left: 5%;
    margin-right: 5%;
  }
}

@media (min-width: 576px) {
  ion-card {
    margin-top: 15%;
    margin-left: 10%;
    margin-right: 10%;
  }
}

@media (min-width: 768px) {
  ion-card {
    margin-top: 15%;
    margin-left: 20%;
    margin-right: 20%;
  }
}

@media (min-width: 992px) {
  ion-card {
    margin-top: 10%;
    margin-left: 25%;
    margin-right: 25%;
  }
}

@media (min-width: 1200px) {
  ion-card {
    margin-top: 10%;
    margin-left: 30%;
    margin-right: 30%;
  }
}
</style>
