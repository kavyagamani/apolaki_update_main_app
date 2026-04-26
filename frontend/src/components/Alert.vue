<template>
  <transition name="alert-slide">
    <div v-if="visible" :class="['alert', `alert-${type}`]" role="alert">
      <span class="alert-icon">{{ icons[type] }}</span>
      <div class="alert-content">
        <slot />
      </div>
      <button v-if="closable" class="alert-close" @click="close">✕</button>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(true)

const icons = {
  success: '✓',
  warning: '⚠️',
  danger: '✕',
  info: 'ⓘ'
}

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  font-size: 0.95rem;
  animation: slideIn 0.3s ease;
}

.alert-icon {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.alert-content {
  flex: 1;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-close:hover {
  opacity: 1;
}

/* Types */
.alert-success {
  background: #dcfce7;
  color: #166534;
  border-color: #22c55e;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border-color: #eab308;
}

.alert-danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-color: #ef4444;
}

.alert-info {
  background: #cffafe;
  color: #164e63;
  border-color: #06b6d4;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s;
}

.alert-slide-enter-from,
.alert-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
