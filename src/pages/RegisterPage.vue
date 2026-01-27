<template>
  <q-page class="column flex-center q-pa-xl">
    <q-card style="width: 420px; max-width: 90vw" class="q-pa-lg">
      <div class="text-h5 text-weight-bold q-mb-md text-center">Registracija</div>

      <q-form class="q-gutter-md" @submit.prevent="register">
        <q-input v-model="full_name" label="Ime" />
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Lozinka" type="password" />
        <q-input v-model="password2" label="Ponovi lozinku" type="password" />

        <q-btn
          label="Registriraj se"
          type="submit"
          color="yellow-7"
          text-color="black"
          class="full-width"
          :loading="loading"
        />

        <q-btn flat label="Već imam račun — Prijava" class="full-width" to="/login" />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const full_name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const loading = ref(false)

async function register() {
  if (password.value !== password2.value) {
    $q.notify({ type: 'negative', message: 'Lozinke se ne podudaraju.' })
    return
  }

  loading.value = true
  try {
    await api.post('/auth/register', {
      full_name: full_name.value,
      email: email.value,
      password: password.value,
    })

    $q.notify({ type: 'positive', message: 'Registracija uspješna ✅' })
    router.push('/login')
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Greška pri registraciji.',
    })
  } finally {
    loading.value = false
  }
}
</script>
