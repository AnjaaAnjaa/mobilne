<template>
  <q-page class="q-pa-md">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Moji ljubimci</div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          color="grey-8"
          icon="refresh"
          label="Osvježi"
          :loading="loading"
          @click="loadPets"
        />
        <q-btn outline color="blue-8" icon="add" label="Dodaj ljubimca" @click="openAddDialog" />
        <q-btn
          color="yellow-7"
          text-color="black"
          icon="event"
          label="Nadolazeći pregledi"
          to="/upcoming"
        />
      </div>
    </div>

    <q-card v-if="loading" class="q-pa-md">Učitavam ljubimce...</q-card>

    <q-card v-else-if="pets.length === 0" class="q-pa-md text-center">
      <div class="text-subtitle1 q-mb-sm">Još nemaš dodanih ljubimaca 🐾</div>
      <div class="text-caption text-grey-7">Klikni na "Dodaj ljubimca" da započneš.</div>
    </q-card>

    <q-list v-else bordered separator>
      <q-item v-for="p in pets" :key="p.id_pet" clickable @click="openPet(p)">
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ p.name }}</q-item-label>
          <q-item-label caption>
            Vrsta: {{ p.species }}
            <span v-if="p.breed"> • Pasmina: {{ p.breed }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side class="row items-center q-gutter-xs">
          <!-- EDIT -->
          <q-btn flat round dense icon="edit" color="primary" @click.stop="openEditDialog(p)" />
          <!-- DELETE -->
          <q-btn flat round dense icon="delete" color="negative" @click.stop="confirmDelete(p)" />
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- DIALOG: DODAJ -->
    <q-dialog v-model="addDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6">Dodaj ljubimca</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="addForm.name" label="Ime *" filled />
          <q-input v-model="addForm.species" label="Vrsta" filled />
          <q-input v-model="addForm.breed" label="Pasmina" filled />
          <q-input v-model="addForm.notes" label="Napomena" type="textarea" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            label="Spremi"
            color="yellow-7"
            text-color="black"
            :loading="addLoading"
            @click="addPet"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: UREDI -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6">Uredi ljubimca</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editForm.name" label="Ime *" filled />
          <q-input v-model="editForm.species" label="Vrsta" filled />
          <q-input v-model="editForm.breed" label="Pasmina" filled />
          <q-input v-model="editForm.notes" label="Napomena" type="textarea" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            label="Spremi"
            color="yellow-7"
            text-color="black"
            :loading="editLoading"
            @click="savePetEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: BRISANJE -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Brisanje ljubimca</q-card-section>
        <q-card-section>
          Sigurno želiš obrisati ljubimca: <b>{{ petToDelete?.name }}</b
          >?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="negative" label="Obriši" :loading="deleteLoading" @click="deletePet" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const pets = ref([])
const loading = ref(false)

async function loadPets() {
  loading.value = true
  try {
    const r = await api.get('/pets')
    pets.value = Array.isArray(r.data) ? r.data : []
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Greška pri dohvaćanju ljubimaca.',
    })
  } finally {
    loading.value = false
  }
}

function openPet(p) {
  router.push(`/pets/${p.id_pet}`)
}

/* ADD */
const addDialog = ref(false)
const addLoading = ref(false)
const addForm = ref({ name: '', species: '', breed: '', notes: '' })

function openAddDialog() {
  addForm.value = { name: '', species: '', breed: '', notes: '' }
  addDialog.value = true
}

async function addPet() {
  if (!addForm.value.name || !addForm.value.species) {
    $q.notify({ type: 'negative', message: 'Ime i vrsta su obavezni.' })
    return
  }
  addLoading.value = true
  try {
    await api.post('/pets', {
      name: addForm.value.name,
      species: addForm.value.species,
      breed: addForm.value.breed || null,
      notes: addForm.value.notes || null,
    })
    addDialog.value = false
    await loadPets()
    $q.notify({ type: 'positive', message: 'Ljubimac dodan.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu dodati ljubimca.',
    })
  } finally {
    addLoading.value = false
  }
}

/* EDIT */
const editDialog = ref(false)
const editLoading = ref(false)
const editPetId = ref(null)
const editForm = ref({ name: '', species: '', breed: '', notes: '' })

function openEditDialog(p) {
  editPetId.value = p.id_pet
  editForm.value = {
    name: p.name,
    species: p.species,
    breed: p.breed || '',
    notes: p.notes || '',
  }
  editDialog.value = true
}

async function savePetEdit() {
  if (!editPetId.value) return
  if (!editForm.value.name || !editForm.value.species) {
    $q.notify({ type: 'negative', message: 'Ime i vrsta su obavezni.' })
    return
  }

  editLoading.value = true
  try {
    await api.put(`/pets/${editPetId.value}`, {
      name: editForm.value.name,
      species: editForm.value.species,
      breed: editForm.value.breed || null,
      notes: editForm.value.notes || null,
    })
    editDialog.value = false
    await loadPets()
    $q.notify({ type: 'positive', message: 'Ljubimac je ažuriran.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu ažurirati ljubimca.',
    })
  } finally {
    editLoading.value = false
  }
}

/* DELETE */
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const petToDelete = ref(null)

function confirmDelete(p) {
  petToDelete.value = p
  deleteDialog.value = true
}

async function deletePet() {
  if (!petToDelete.value) return
  deleteLoading.value = true
  try {
    await api.delete(`/pets/${petToDelete.value.id_pet}`)
    deleteDialog.value = false
    petToDelete.value = null
    await loadPets()
    $q.notify({ type: 'positive', message: 'Ljubimac obrisan.' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Ne mogu obrisati ljubimca.',
    })
  } finally {
    deleteLoading.value = false
  }
}

onMounted(loadPets)
</script>
