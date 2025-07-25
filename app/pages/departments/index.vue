<template>
  <div>
    <h1>Department Page</h1>
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