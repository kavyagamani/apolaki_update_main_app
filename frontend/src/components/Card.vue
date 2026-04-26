<template>
  <div :class="['card', `card-${variant}`, { 'card-clickable': clickable }]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'subtle'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-default {
  border-top: 4px solid var(--solar-gold, #FFB81C);
}

.card-primary {
  border-top: 4px solid var(--solar-gold, #FFB81C);
  background: linear-gradient(135deg, rgba(255, 184, 28, 0.02) 0%, transparent 100%);
}

.card-success {
  border-top: 4px solid #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, transparent 100%);
}

.card-warning {
  border-top: 4px solid #eab308;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.02) 0%, transparent 100%);
}

.card-danger {
  border-top: 4px solid #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, transparent 100%);
}

.card-subtle {
  border: 1px solid #e5e7eb;
  background: #fafafa;
}

.card-clickable {
  cursor: pointer;
  border: 2px solid transparent;
}

.card-clickable:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--solar-gold, #FFB81C);
}
</style>
