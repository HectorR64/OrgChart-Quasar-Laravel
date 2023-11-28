<template>
  <div class="full-height row flex-center" style="margin-top: 20px;">
    <div class="column items-center">
      <img
        alt="Quasar logo"
        src="~assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px; margin-bottom: 20px"
      >
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-center">Iniciar Sesión</div>
        </q-card-section>

        <q-card-section class="q-mt-md">
          <q-input filled v-model="email" label="Email" type="email" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>
          <q-input filled v-model="password" :type="showPassword ? 'text' : 'password'" label="Contraseña" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="lock_outline" />
            </template>
            <template v-slot:append>
              <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="text-center">
          <q-btn label="Iniciar Sesión" @click="login" type="submit" color="primary" class="full-width" />
        </q-card-section>

        <div class="text-center q-my-md">
          <q-separator class="separator" />
        </div>

      </q-card>
    </div>
  </div>
</template>

<style>
.my-card {
  width: 400px;
}

.full-width {
  width: 100%;
}
</style>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import axios from 'axios';

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const $q = useQuasar();
const router = useRouter();

const login = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email: email.value,
      password: password.value
    });

    handleLoginSuccess(response.data);
  } catch (error) {
    console.error("Error de autenticación", error);
    const errorMessage = error.response ? error.response.statusText : "Error desconocido";
    $q.notify({
      message: `Error: ${errorMessage}`,
      color: 'red'
    });
  }
};

const handleLoginSuccess = (data) => {
  localStorage.setItem('access_token', data.access_token);

  const permissions = data.roles.flatMap(role => role.permissions.map(p => p.name));
  localStorage.setItem('permissions', JSON.stringify(permissions));

  router.push('/main');
};
</script>
