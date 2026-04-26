<template>
  <component
    :is="tag"
    :href="href"
    :type="type"
    :disabled="disabled"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-loading': loading, 'btn-disabled': disabled }]"
    @click="$emit('click')"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot />
  </component>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  href: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const tag = defineModel('href') ? 'a' : 'button'
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 250ms ease-in-out;
  font-size: 0.95rem;
  text-decoration: none;
  font-family: inherit;
  outline: none;
}

/* Variants - Consistent Color System per Design Guide */

/* SOLAR GOLD - Primary Variant */
.btn-primary {
  background: linear-gradient(135deg, #FFB81C 0%, #F5A700 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 184, 28, 0.25);
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 184, 28, 0.35);
  background: linear-gradient(135deg, #F5A700 0%, #E59500 100%);
}

.btn-primary:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 184, 28, 0.25);
}

/* SKY BLUE - Secondary Variant */
.btn-secondary {
  background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.25);
}

.btn-secondary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.35);
  background: linear-gradient(135deg, #0052A3 0%, #003D7A 100%);
}

.btn-secondary:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 102, 204, 0.25);
}

/* SUCCESS - Green Variant */
.btn-success {
  background: linear-gradient(135deg, #00B050 0%, #00843D 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 176, 80, 0.25);
}

.btn-success:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 176, 80, 0.35);
  background: linear-gradient(135deg, #00843D 0%, #006B32 100%);
}

.btn-success:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 176, 80, 0.25);
}

/* WARNING - Orange Variant */
.btn-warning {
  background: linear-gradient(135deg, #FF9500 0%, #EA580C 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.25);
}

.btn-warning:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.35);
  background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
}

.btn-warning:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 149, 0, 0.25);
}

/* DANGER - Red Variant */
.btn-danger {
  background: linear-gradient(135deg, #E74C3C 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.25);
}

.btn-danger:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.35);
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
}

.btn-danger:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.25);
}

/* OUTLINE - Bordered Style */
.btn-outline {
  background: transparent;
  color: #FFB81C;
  border: 2px solid #FFB81C;
}

.btn-outline:hover:not(.btn-disabled) {
  background: #FFF5DB;
  color: #F5A700;
  border-color: #F5A700;
}

.btn-outline:active:not(.btn-disabled) {
  background: #FFFBF0;
}

/* GHOST - Minimal Style */
.btn-ghost {
  background: transparent;
  color: #374151;
  border: 2px solid transparent;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: #F9FAFB;
  border-color: #E5E7EB;
}

.btn-ghost:active:not(.btn-disabled) {
  background: #F3F4F6;
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.05rem;
}

/* States */
.btn-disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  pointer-events: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
