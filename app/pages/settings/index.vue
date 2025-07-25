<template>
  <div>
    <h1>Settings Page</h1>
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