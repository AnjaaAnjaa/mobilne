<template>
  <q-page class="q-pa-md">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Nadolazeći pregledi</div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          color="grey-8"
          icon="refresh"
          label="Osvježi"
          :loading="loading"
          @click="loadUpcoming"
        />

        <!-- LOGOUT -->
        <q-btn color="negative" icon="logout" label="Odjava" @click="logout" />
      </div>
    </div>

    <!-- LOADING -->
    <q-card v-if="loading" class="q-pa-md"> Učitavam nadolazeće preglede... </q-card>

    <!-- EMPTY -->
    <q-card v-else-if="rows.length === 0" class="q-pa-md"> Nema nadolazećih pregleda. </q-card>

    <!-- TABLE -->
    <q-table v-else :rows="rows" :columns="columns" row-key="id_visit" flat hide-bottom>
      <template v-slot:body-cell-type="props">
        <q-td>
          <q-badge color="blue-7">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-next_visit_date="props">
        <q-td class="text-right">
          <q-badge color="positive">
            {{ formatDate(props.value) }}
          </q-badge>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const rows = ref([])

const columns = [
  { name: 'pet_name', label: 'Ljubimac', field: 'pet_name', align: 'left' },
  { name: 'type', label: 'Pregled', field: 'type', align: 'left' },
  { name: 'next_visit_date', label: 'Datum', field: 'next_visit_date', align: 'right' },
]

function formatDate(val) {
  if (!val) return '-'
  const [y, m, d] = String(val).slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}

async function loadUpcoming() {
  loading.value = true
  try {
    const r = await api.get('/upcoming')
    rows.value = Array.isArray(r.data) ? r.data : []
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Greška pri dohvaćanju pregleda.',
    })
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  $q.notify({
    type: 'info',
    message: 'Uspješno ste se odjavili.',
  })

  router.push('/login')
}

onMounted(loadUpcoming)
</script>
