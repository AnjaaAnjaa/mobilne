<template>
  <q-page class="app-page">
    <div class="app-container">
      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">Nadolazeće</div>
          <div class="text-caption text-grey-7 q-mt-xs">Sljedeći pregledi po datumima.</div>
        </div>

        <div class="row items-center q-gutter-xs">
          <q-btn
            round
            dense
            flat
            icon="refresh"
            :loading="loading"
            @click="loadUpcoming"
            :aria-label="'Osvježi'"
          />
          <q-btn
            round
            dense
            flat
            icon="logout"
            color="negative"
            @click="logout"
            :aria-label="'Odjava'"
          />
        </div>
      </div>

      <!-- LOADING -->
      <q-card v-if="loading" class="app-card q-pa-md"> Učitavam nadolazeće preglede... </q-card>

      <!-- EMPTY -->
      <q-card v-else-if="rows.length === 0" class="app-card q-pa-md">
        <div class="text-subtitle1 text-weight-medium">Nema nadolazećih pregleda</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Dodaj “sljedeći pregled” u detaljima pregleda i pojavit će se ovdje.
        </div>

        <q-btn
          class="app-btn full-width q-mt-md"
          color="yellow-7"
          text-color="black"
          icon="pets"
          label="Idi na ljubimce"
          to="/pets"
          no-caps
          rounded
          unelevated
        />
      </q-card>

      <!-- MOBILE LIST (always) -->
      <div v-else class="q-gutter-sm">
        <q-card
          v-for="u in rowsSorted"
          :key="u.id_visit"
          class="app-card"
          clickable
          @click="goToPet(u.id_pet)"
        >
          <q-card-section class="q-pb-sm">
            <div class="row items-start justify-between">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">
                  {{ u.pet_name }}
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">ID ljubimca: {{ u.id_pet }}</div>
              </div>

              <q-badge color="positive" class="q-ml-sm">
                {{ formatDate(u.next_visit_date) }}
              </q-badge>
            </div>

            <div class="row items-center q-gutter-xs q-mt-sm">
              <q-chip dense color="blue-7" text-color="white" icon="event_note">
                {{ u.type }}
              </q-chip>

              <q-chip
                v-if="u.clinic"
                dense
                color="grey-3"
                text-color="grey-9"
                icon="local_hospital"
              >
                {{ u.clinic }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="between" class="q-px-md q-py-sm">
            <div class="text-caption text-grey-7">Tapni za detalje ljubimca</div>

            <q-btn
              flat
              dense
              icon="chevron_right"
              @click.stop="goToPet(u.id_pet)"
              aria-label="Otvori"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- SMALL FOOTER SPACE -->
      <div style="height: 10px"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const rows = ref([])

function formatDate(val) {
  if (!val) return '-'
  const [y, m, d] = String(val).slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}

const rowsSorted = computed(() => {
  return [...rows.value].sort((a, b) =>
    String(a.next_visit_date).localeCompare(String(b.next_visit_date)),
  )
})

async function loadUpcoming() {
  loading.value = true
  try {
    const r = await api.get('/upcoming')
    rows.value = Array.isArray(r.data) ? r.data : []
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška pri dohvaćanju pregleda.' })
  } finally {
    loading.value = false
  }
}

function goToPet(id_pet) {
  router.push(`/pets/${id_pet}`)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  $q.notify({ type: 'info', message: 'Uspješno ste se odjavili.' })
  router.push('/login')
}

onMounted(loadUpcoming)
</script>
