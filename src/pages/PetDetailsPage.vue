<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Detalji ljubimca</div>
      <q-btn label="Nazad" flat icon="arrow_back" to="/pets" />
    </div>

    <q-card class="q-mb-lg">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">{{ pet.name }}</div>
          <div class="text-subtitle2 text-grey-7">Vrsta: {{ pet.species }}</div>
        </div>

        <q-chip v-if="nextVisitLabel" color="yellow-7" text-color="black">
          Sljedeći pregled: {{ nextVisitLabel }}
        </q-chip>
      </q-card-section>
    </q-card>

    <div class="row items-center justify-between q-mb-sm">
      <div class="text-h6">Pregledi</div>
      <q-btn label="Dodaj pregled" color="yellow-7" text-color="black" @click="openAddDialog" />
    </div>

    <q-card v-if="loading" class="q-pa-md">Učitavam...</q-card>

    <q-table v-else :rows="rows" :columns="columns" row-key="id_visit" flat hide-bottom>
      <template v-slot:body-cell-visit_date="props">
        <q-td>{{ formatDate(props.value) }}</q-td>
      </template>

      <template v-slot:body-cell-next_visit_date="props">
        <q-td class="text-center">
          <q-badge v-if="props.value" :color="isUpcoming(props.value) ? 'positive' : 'grey-6'">
            {{ formatDate(props.value) }}
          </q-badge>
          <span v-else>-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td class="text-center">
          <q-btn flat round dense icon="edit" color="primary" @click="openEditDialog(props.row)" />
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            :loading="deleteLoadingId === props.row.id_visit"
            @click="deleteVisit(props.row.id_visit)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- DIALOG: ADD VISIT -->
    <q-dialog v-model="addDialog">
      <q-card style="min-width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">Dodaj pregled</q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="addForm.visit_date" label="Datum pregleda (YYYY-MM-DD) *" filled />
          <q-select v-model="addForm.type" :options="visitTypes" label="Tip pregleda *" filled />
          <q-input v-model="addForm.clinic" label="Veterinar / klinika" filled />
          <q-input v-model.number="addForm.weight" label="Težina (kg)" type="number" filled />
          <q-input v-model="addForm.diagnosis" label="Dijagnoza" filled />
          <q-input v-model="addForm.treatment" label="Terapija" filled />
          <q-input v-model="addForm.next_visit_date" label="Sljedeći pregled (YYYY-MM-DD)" filled />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            label="Spremi"
            color="yellow-7"
            text-color="black"
            :loading="saveLoading"
            @click="saveVisit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: EDIT VISIT -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">Uredi pregled</q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="editForm.visit_date" label="Datum pregleda (YYYY-MM-DD) *" filled />
          <q-select v-model="editForm.type" :options="visitTypes" label="Tip pregleda *" filled />
          <q-input v-model="editForm.clinic" label="Veterinar / klinika" filled />
          <q-input v-model.number="editForm.weight" label="Težina (kg)" type="number" filled />
          <q-input v-model="editForm.diagnosis" label="Dijagnoza" filled />
          <q-input v-model="editForm.treatment" label="Terapija" filled />
          <q-input
            v-model="editForm.next_visit_date"
            label="Sljedeći pregled (YYYY-MM-DD)"
            filled
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            label="Spremi"
            color="yellow-7"
            text-color="black"
            :loading="editLoading"
            @click="updateVisit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const route = useRoute()
const petId = Number(route.params.id)
const $q = useQuasar()

const loading = ref(false)
const saveLoading = ref(false)
const editLoading = ref(false)
const deleteLoadingId = ref(null)

const pet = ref({ id_pet: petId, name: 'Učitavam...', species: '-' })
const visits = ref([])

const visitTypes = ['Cijepljenje', 'Kontrola', 'Operacija', 'Tretman', 'Pregled zuba', 'Ostalo']

const columns = [
  { name: 'visit_date', label: 'Datum pregleda', field: 'visit_date', align: 'left' },
  { name: 'type', label: 'Tip', field: 'type', align: 'left' },
  { name: 'clinic', label: 'Klinika', field: 'clinic', align: 'left' },
  { name: 'weight', label: 'Težina (kg)', field: 'weight', align: 'right' },
  { name: 'next_visit_date', label: 'Sljedeći pregled', field: 'next_visit_date', align: 'center' },
  { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
]

const rows = computed(() => visits.value)

function isValidDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}
function formatDate(val) {
  if (!val) return ''
  const [y, m, d] = String(val).slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}
function isUpcoming(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  return d >= today
}

const nextVisitLabel = computed(() => {
  const upcoming = visits.value
    .filter((v) => v.next_visit_date && isUpcoming(v.next_visit_date))
    .map((v) => v.next_visit_date)
    .sort()
  return upcoming.length ? formatDate(upcoming[0]) : ''
})

async function loadPet() {
  const r = await api.get('/pets')
  const found = (Array.isArray(r.data) ? r.data : []).find((p) => p.id_pet === petId)
  pet.value = found || { id_pet: petId, name: 'Nepoznat', species: '-' }
}

async function loadVisits() {
  const r = await api.get(`/pets/${petId}/visits`)
  visits.value = Array.isArray(r.data) ? r.data : []
}

async function loadAll() {
  loading.value = true
  try {
    await loadPet()
    await loadVisits()
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu učitati podatke.',
    })
  } finally {
    loading.value = false
  }
}

/* ADD */
const addDialog = ref(false)
const addForm = ref({
  visit_date: '',
  type: '',
  clinic: '',
  weight: null,
  diagnosis: '',
  treatment: '',
  next_visit_date: '',
})

function openAddDialog() {
  addForm.value = {
    visit_date: '',
    type: '',
    clinic: '',
    weight: null,
    diagnosis: '',
    treatment: '',
    next_visit_date: '',
  }
  addDialog.value = true
}

async function saveVisit() {
  if (!addForm.value.visit_date || !addForm.value.type) {
    $q.notify({ type: 'negative', message: 'Datum pregleda i tip su obavezni.' })
    return
  }
  if (!isValidDate(addForm.value.visit_date)) {
    $q.notify({ type: 'negative', message: 'Datum pregleda mora biti YYYY-MM-DD.' })
    return
  }
  if (addForm.value.next_visit_date && !isValidDate(addForm.value.next_visit_date)) {
    $q.notify({ type: 'negative', message: 'Sljedeći pregled mora biti YYYY-MM-DD.' })
    return
  }
  if (addForm.value.next_visit_date && addForm.value.next_visit_date < addForm.value.visit_date) {
    $q.notify({ type: 'negative', message: 'Sljedeći pregled ne može biti prije pregleda.' })
    return
  }

  saveLoading.value = true
  try {
    await api.post('/visits', {
      id_pet: petId,
      ...addForm.value,
      clinic: addForm.value.clinic || null,
      weight: addForm.value.weight ?? null,
      diagnosis: addForm.value.diagnosis || null,
      treatment: addForm.value.treatment || null,
      next_visit_date: addForm.value.next_visit_date || null,
    })
    addDialog.value = false
    await loadVisits()
    $q.notify({ type: 'positive', message: 'Pregled dodan.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Greška pri spremanju pregleda.',
    })
  } finally {
    saveLoading.value = false
  }
}

/* EDIT */
const editDialog = ref(false)
const editVisitId = ref(null)
const editForm = ref({
  visit_date: '',
  type: '',
  clinic: '',
  weight: null,
  diagnosis: '',
  treatment: '',
  next_visit_date: '',
})

function openEditDialog(row) {
  editVisitId.value = row.id_visit
  editForm.value = {
    visit_date: row.visit_date,
    type: row.type,
    clinic: row.clinic || '',
    weight: row.weight ?? null,
    diagnosis: row.diagnosis || '',
    treatment: row.treatment || '',
    next_visit_date: row.next_visit_date || '',
  }
  editDialog.value = true
}

async function updateVisit() {
  if (!editVisitId.value) return

  if (!editForm.value.visit_date || !editForm.value.type) {
    $q.notify({ type: 'negative', message: 'Datum pregleda i tip su obavezni.' })
    return
  }
  if (!isValidDate(editForm.value.visit_date)) {
    $q.notify({ type: 'negative', message: 'Datum pregleda mora biti YYYY-MM-DD.' })
    return
  }
  if (editForm.value.next_visit_date && !isValidDate(editForm.value.next_visit_date)) {
    $q.notify({ type: 'negative', message: 'Sljedeći pregled mora biti YYYY-MM-DD.' })
    return
  }
  if (
    editForm.value.next_visit_date &&
    editForm.value.next_visit_date < editForm.value.visit_date
  ) {
    $q.notify({ type: 'negative', message: 'Sljedeći pregled ne može biti prije pregleda.' })
    return
  }

  editLoading.value = true
  try {
    await api.put(`/visits/${editVisitId.value}`, {
      visit_date: editForm.value.visit_date,
      type: editForm.value.type,
      clinic: editForm.value.clinic || null,
      weight: editForm.value.weight ?? null,
      diagnosis: editForm.value.diagnosis || null,
      treatment: editForm.value.treatment || null,
      next_visit_date: editForm.value.next_visit_date || null,
    })

    editDialog.value = false
    await loadVisits()
    $q.notify({ type: 'positive', message: 'Pregled ažuriran.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu ažurirati pregled.',
    })
  } finally {
    editLoading.value = false
  }
}

/* DELETE */
async function deleteVisit(id_visit) {
  deleteLoadingId.value = id_visit
  try {
    await api.delete(`/visits/${id_visit}`)
    await loadVisits()
    $q.notify({ type: 'positive', message: 'Pregled obrisan.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu obrisati pregled.',
    })
  } finally {
    deleteLoadingId.value = null
  }
}

onMounted(loadAll)
</script>
