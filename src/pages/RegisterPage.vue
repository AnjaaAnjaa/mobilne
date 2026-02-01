<template>
  <q-page class="auth-page">
    <div class="auth-wrap">
      <q-card class="auth-card">
        <q-card-section class="q-pb-sm">
          <div class="text-h5 text-weight-bold">Registracija</div>
          <div class="text-caption text-grey-7 q-mt-xs">Kreiraj račun u par sekundi.</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <q-form class="q-gutter-md" @submit.prevent="register">
            <q-input
              v-model="fullName"
              label="Ime i prezime"
              autocomplete="name"
              standout
              rounded
              dense
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

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
              autocomplete="new-password"
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
                />
              </template>
            </q-input>

            <q-input
              v-model="password2"
              :type="showPwd2 ? 'text' : 'password'"
              label="Potvrdi lozinku"
              autocomplete="new-password"
              standout
              rounded
              dense
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="verified_user" />
              </template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPwd2 ? 'visibility_off' : 'visibility'"
                  @click="showPwd2 = !showPwd2"
                />
              </template>
            </q-input>

            <q-btn
              unelevated
              class="auth-btn"
              label="Kreiraj račun"
              color="yellow-7"
              text-color="black"
              type="submit"
              :loading="loading"
              :disable="!canSubmit"
              no-caps
              rounded
            />

            <q-btn flat class="full-width" label="Imam račun — Prijava" to="/login" no-caps />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const fullName = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const showPwd = ref(false)
const showPwd2 = ref(false)
const loading = ref(false)

const canSubmit = computed(() => {
  return (
    fullName.value.trim().length >= 2 &&
    email.value.trim().length >= 5 &&
    password.value.length >= 4 &&
    password2.value.length >= 4
  )
})

async function register() {
  if (password.value !== password2.value) {
    $q.notify({ type: 'negative', message: 'Lozinke se ne podudaraju.' })
    return
  }

  loading.value = true
  try {
    await api.post('/auth/register', {
      full_name: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })

    $q.notify({ type: 'positive', message: 'Registracija uspješna ✅' })
    await router.push('/login')
  } catch (err) {
    const msg = err?.response?.data?.message || 'Greška pri registraciji.'
    $q.notify({ type: 'negative', message: msg })
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
</style>
