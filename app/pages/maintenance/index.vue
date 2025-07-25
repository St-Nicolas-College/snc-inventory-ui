<template>
  <div>
    <h1>Maintenance Page</h1>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'role-check',
  allowedRoles: ['custodian', 'staff']
})
</script>

<style>

</style>