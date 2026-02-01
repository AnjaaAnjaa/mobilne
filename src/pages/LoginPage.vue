<template>
  <q-page class="auth-page">
    <div class="auth-wrap">
      <q-card class="auth-card">
        <q-card-section class="q-pb-sm">
          <div class="text-h5 text-weight-bold">Prijava</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Prijavi se za pristup svojim ljubimcima i pregledima.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <q-form class="q-gutter-md" @submit.prevent="login">
            <q-input
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              inputmode="email"
              standout
              rounded
              dense
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="mail" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              label="Lozinka"
              autocomplete="current-password"
              standout
              rounded
              dense
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPwd ? 'visibility_off' : 'visibility'"
                  @click="showPwd = !showPwd"
                  :aria-label="showPwd ? 'Sakrij lozinku' : 'Prikaži lozinku'"
                />
              </template>
            </q-input>

            <q-btn
              unelevated
              class="auth-btn"
              label="Prijavi se"
              color="yellow-7"
              text-color="black"
              type="submit"
              :loading="loading"
              :disable="!email || !password"
              no-caps
              rounded
            />

            <q-btn
              flat
              class="full-width"
              label="Nemam račun — Registracija"
              to="/register"
              no-caps
            />
          </q-form>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-banner v-if="debugText" dense class="bg-grey-2 text-grey-9 rounded-borders">
            <div class="text-caption">
              <div class="text-weight-medium">Debug</div>
              <div class="q-mt-xs">
                API: <b>{{ baseURL }}</b>
              </div>
              <pre class="auth-pre">{{ debugText }}</pre>
            </div>
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const email = ref('')
const password = ref('')
const showPwd = ref(false)
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
    data: err?.response?.data,
    url: err?.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err?.config?.url,
    method: err?.config?.method,
  }
}

async function login() {
  loading.value = true
  debugText.value = 'Šaljem /auth/login ...'

  try {
    const payload = { email: email.value.trim(), password: password.value }
    const res = await api.post('/auth/login', payload)

    localStorage.setItem('token', res.data?.token || '')
    localStorage.setItem('user', JSON.stringify(res.data?.user || null))

    $q.notify({ type: 'positive', message: 'Uspješna prijava' })
    await router.push('/pets')
  } catch (err) {
    const info = formatErr(err)
    debugText.value = JSON.stringify(info, null, 2)

    $q.notify({
      type: 'negative',
      message: info?.data?.message || `Greška pri prijavi`,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100%;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-wrap {
  width: 100%;
  max-width: 420px;
}
.auth-card {
  border-radius: 18px;
}
.auth-btn {
  width: 100%;
  height: 46px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.auth-pre {
  margin: 8px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
