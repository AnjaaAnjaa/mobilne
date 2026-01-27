<template>
  <q-page class="column flex-center q-pa-xl">
    <q-card style="width: 420px; max-width: 90vw" class="q-pa-lg">
      <div class="text-h5 text-weight-bold q-mb-md text-center">Prijava</div>

      <q-form class="q-gutter-md" @submit.prevent="login">
        <q-input v-model="email" label="Email" type="email" autocomplete="email" />
        <q-input
          v-model="password"
          label="Lozinka"
          type="password"
          autocomplete="current-password"
        />

        <q-btn
          label="Prijavi se"
          color="yellow-7"
          text-color="black"
          class="full-width"
          type="submit"
          :loading="loading"
        />

        <q-btn flat label="Nemam račun — Registracija" class="full-width" to="/register" />
      </q-form>

      <!-- Debug panel (da vidiš odmah što se dogodilo) -->
      <q-separator class="q-my-md" />
      <div class="text-caption text-grey-7">
        API baseURL: <b>{{ baseURL }}</b>
      </div>
      <div class="text-caption q-mt-sm">
        Zadnji rezultat:
        <pre style="white-space: pre-wrap; word-break: break-word; margin: 8px 0 0"
          >{{ debugText }}
        </pre>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const email = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const $q = useQuasar()

const baseURL = api?.defaults?.baseURL || '(unknown)'
const debugText = ref('')

function formatErr(err) {
  return {
    message: err?.message,
    code: err?.code,
    status: err?.response?.status,
    statusText: err?.response?.statusText,
    data: err?.response?.data,
    url: err?.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err?.config?.url,
    method: err?.config?.method,
    timeout: err?.config?.timeout,
  }
}

async function login() {
  loading.value = true
  debugText.value = 'Šaljem /auth/login ...'

  try {
    // mini "ping" prije logina (da znamo je li API živ i reachable)
    // Ako nemate /ping endpoint, ovo će samo failati i pokazati nam error.
    try {
      const pingRes = await api.get('/ping')
      console.log('PING OK', pingRes.status, pingRes.data)
    } catch (pingErr) {
      console.log('PING ERR', formatErr(pingErr))
    }

    const payload = { email: email.value, password: password.value }
    console.log('LOGIN payload', payload)

    const res = await api.post('/auth/login', payload)

    console.log('LOGIN OK', res.status, res.data)
    debugText.value = `LOGIN OK\nstatus: ${res.status}\nresponse:\n${JSON.stringify(res.data, null, 2)}`

    // token + user
    if (!res?.data?.token) {
      $q.notify({
        type: 'warning',
        message: 'Login je vratio response, ali nema tokena (provjeri backend response shape).',
      })
    }

    localStorage.setItem('token', res.data.token || '')
    localStorage.setItem('user', JSON.stringify(res.data.user || null))

    $q.notify({ type: 'positive', message: 'Uspješna prijava' })
    router.push('/pets')
  } catch (err) {
    const info = formatErr(err)
    console.error('LOGIN ERR', info)

    debugText.value = `LOGIN ERROR\n${JSON.stringify(info, null, 2)}`

    $q.notify({
      type: 'negative',
      message: info?.data?.message || `Greška pri prijavi (status: ${info.status ?? 'n/a'})`,
    })
  } finally {
    loading.value = false
  }
}
</script>
