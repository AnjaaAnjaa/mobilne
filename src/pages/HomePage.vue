<template>
  <q-page class="column flex-center q-pa-xl">
    <!-- LOGO  -->
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-icon name="pets" size="64px" />
      <div class="text-h4 text-weight-bold">PetCare</div>
    </div>

    <!-- TEKST -->
    <div class="text-h5 text-center text-weight-medium q-mb-md">
      Dobrodošli u PetCare aplikaciju
    </div>

    <div class="text-subtitle1 text-center q-mb-xl" style="max-width: 700px">
      Jedina aplikacija potrebna za brigu o vašem malom prijatelju.
    </div>

    <!-- GUMBI -->
    <div class="row q-gutter-md">
      <q-btn label="Prijava" color="yellow-7" text-color="black" size="lg" to="/login" />

      <q-btn
        label="Registracija"
        outline
        color="yellow-7"
        text-color="black"
        size="lg"
        to="/register"
      />
    </div>
  </q-page>
</template>
