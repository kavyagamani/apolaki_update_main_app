<template>
  <span :class="['badge', `badge-${variant}`, `badge-${size}`]">
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Variants */
.badge-primary {
  background: #dbeafe;
  color: #1e40af;
}

.badge-secondary {
  background: #e5e7eb;
  color: #374151;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #7f1d1d;
}

.badge-info {
  background: #cffafe;
  color: #164e63;
}

/* Sizes */
.badge-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.badge-lg {
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
}

.badge-icon {
  font-size: 1.1em;
}
</style>
