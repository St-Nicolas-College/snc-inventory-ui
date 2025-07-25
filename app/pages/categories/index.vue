<template>
  <div>
    <h1>Categories Page</h1>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'role-check',
  allowedRoles: ['custodian']
})
</script>

<style>

</style>