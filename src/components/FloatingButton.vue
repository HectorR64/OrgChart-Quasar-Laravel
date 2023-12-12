<template>
  <q-btn
    round
    color="green"
    class="floating-button"
    @click="onClick"
  >
    <slot></slot>
  </q-btn>
</template>

<script>
export default {
  name: 'FloatingButton',
  emits: ['click'],
  methods: {
    onClick() {
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.floating-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 999;
}
</style>
