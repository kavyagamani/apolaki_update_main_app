# Frontend Components Reference

Complete guide to all reusable UI components in the Apolaki Solar Platform.

---

## Quick Start

Looking to use components? Here are the most common ones:

- **Button**: Interactive clickable elements → [Button](#button-component)
- **Card**: Content containers → [Card](#card-component)
- **Badge**: Small labels/tags → [Badge](#badge-component)
- **Modal**: Dialog boxes → [Modal](#modal-component)
- **Alert**: Notification messages → [Alert](#alert-component)

All components are located in `frontend/src/components/`

---

## Component Library

### Button Component

**File**: `frontend/src/components/Button.vue`

Interactive button element with multiple variants and sizes.

**Props**:
- `variant`: primary, secondary, success, warning, danger, outline, ghost
- `size`: sm, md, lg
- `type`: button, submit, reset
- `href`: Optional link destination
- `disabled`: Boolean disable state
- `loading`: Boolean loading state

**Example**:
```vue
<Button variant="primary" size="lg" @click="handleClick">
  Click Me
</Button>

<Button variant="outline" :loading="isLoading">
  {{ isLoading ? 'Processing...' : 'Submit' }}
</Button>

<Button variant="danger" disabled>Delete</Button>
```

**Variants**:
- `primary`: Orange gradient (default)
- `secondary`: Gray background
- `success`: Green background
- `warning`: Yellow background
- `danger`: Red background
- `outline`: Bordered with transparent fill
- `ghost`: No background

---

### Card Component

**File**: `frontend/src/components/Card.vue`

Container component for grouping content with consistent styling.

**Props**:
- `variant`: default, primary, success, warning, danger, subtle
- `clickable`: Boolean to add hover effects

**Example**:
```vue
<Card variant="primary">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

<Card variant="success" clickable @click="navigate">
  <p>Click to navigate</p>
</Card>
```

**Variants**:
- `default`: Blue accent border (default)
- `primary`: Orange accent
- `success`: Green accent
- `warning`: Yellow accent
- `danger`: Red accent
- `subtle`: Minimal gray border

---

### Badge Component

**File**: `frontend/src/components/Badge.vue`

Small label for statuses, tags, and categories.

**Props**:
- `variant`: primary, secondary, success, warning, danger, info
- `size`: sm, md, lg
- `icon`: Optional emoji or icon

**Example**:
```vue
<Badge variant="success">Active</Badge>
<Badge variant="danger" icon="✕">Error</Badge>
<Badge variant="warning" size="sm">Warning</Badge>
```

**Variants**:
- `primary`: Blue
- `secondary`: Gray
- `success`: Green
- `warning`: Yellow
- `danger`: Red
- `info`: Cyan

---

### Modal Component

**File**: `frontend/src/components/Modal.vue`

Dialog box for displaying important content or collecting input.

**Props**:
- `modelValue`: Boolean to show/hide (v-model)
- `title`: Dialog title
- `size`: sm, md, lg, xl

**Slots**:
- `default`: Main content
- `footer`: Footer actions

**Example**:
```vue
<template>
  <Modal v-model="showModal" title="Confirm Action" size="lg">
    <p>Are you sure?</p>
    
    <template #footer>
      <Button @click="showModal = false">Cancel</Button>
      <Button variant="danger" @click="handleConfirm">Delete</Button>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
```

---

### Alert Component

**File**: `frontend/src/components/Alert.vue`

Notification message with different severity levels.

**Props**:
- `type`: success, warning, danger, info
- `closable`: Boolean to show close button
- `modelValue`: Boolean to show/hide (v-model)

**Example**:
```vue
<Alert type="success">
  Operation completed successfully!
</Alert>

<Alert type="danger" v-model="showError">
  An error occurred. Please try again.
</Alert>
```

---

## Dashboard Components

The Dashboard view (`frontend/src/views/Dashboard.vue`) showcases modern UI patterns:

### Hero Section
Eye-catching header with key metrics displayed prominently.

### KPI Cards
Modern cards showing key performance indicators with trend indicators.

### Data Table
Professional table with sorting, filtering, and inline actions.

### Quick Actions
Card-based navigation grid to main features.

### Charts
Bar and pie charts for performance analytics.

### Components Showcase
Reference implementation of all UI components.

---

## Using Components

### Import

```vue
<script setup>
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import Alert from '@/components/Alert.vue'
</script>
```

### In Templates

```vue
<template>
  <Card variant="primary">
    <h2>Create New Installation</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Name</label>
        <input v-model="formData.name" type="text" class="input">
      </div>
      
      <Button variant="primary" type="submit" :loading="isSubmitting">
        Create
      </Button>
    </form>
  </Card>
</template>
```

---

## Styling Guidelines

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #f97316 | Main brand color, CTAs |
| Secondary | #ea580c | Secondary actions |
| Success | #22c55e | Positive states, confirmations |
| Warning | #eab308 | Warnings, caution |
| Danger | #ef4444 | Errors, destructive actions |
| Info | #06b6d4 | Information, alerts |
| Gray | #f3f4f6-#111827 | Neutral, backgrounds, text |

### Typography

- **Headings**: System font, bold
- **Body**: System font, regular
- **Mono**: Monospace for code

### Spacing

- `0.25rem` (4px)
- `0.5rem` (8px)
- `0.75rem` (12px)
- `1rem` (16px)
- `1.5rem` (24px)
- `2rem` (32px)
- `3rem` (48px)

### Responsive Breakpoints

| Breakpoint | Screen Size | Usage |
|-----------|------------|-------|
| Mobile | 0-640px | Phones |
| Tablet | 641-768px | Tablets |
| Desktop | 769-1024px | Small laptops |
| Large | 1025px+ | Large screens |

---

## Form Elements

### Text Input

```vue
<div class="form-group">
  <label for="name">Name</label>
  <input 
    id="name"
    v-model="name"
    type="text"
    placeholder="Enter name"
    class="input"
  >
</div>
```

### Select Dropdown

```vue
<div class="form-group">
  <label for="status">Status</label>
  <select id="status" v-model="status" class="input">
    <option value="">Select status...</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>
```

### Checkbox

```vue
<label class="checkbox-label">
  <input v-model="agreed" type="checkbox" class="checkbox">
  <span>I agree to terms</span>
</label>
```

### Textarea

```vue
<div class="form-group">
  <label for="notes">Notes</label>
  <textarea 
    id="notes"
    v-model="notes"
    class="input"
    rows="5"
  ></textarea>
</div>
```

---

## Creating New Components

### Template Structure

```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})

defineEmits(['action'])
</script>

<style scoped>
.my-component {
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
}
</style>
```

### Best Practices

1. Use `<script setup>` syntax
2. Define props with validation
3. Use meaningful emit names
4. Scope all styles
5. Document with JSDoc
6. Support multiple variants
7. Include loading/disabled states
8. Test with different props

---

## Component Composition

### Basic Example

```vue
<template>
  <Card variant="primary">
    <h3>User Profile</h3>
    
    <div v-if="loading" class="spinner">Loading...</div>
    
    <div v-else class="profile">
      <p><strong>{{ user.name }}</strong></p>
      <p class="text-gray-600">{{ user.email }}</p>
      
      <Badge variant="success" v-if="user.active">
        Active
      </Badge>
    </div>
    
    <div class="actions">
      <Button variant="outline" @click="edit">Edit</Button>
      <Button variant="danger" @click="delete">Delete</Button>
    </div>
  </Card>
</template>
```

---

## Accessibility

### Best Practices

1. **Labels**: Always use `<label>` for form inputs
2. **ARIA**: Add aria-labels where needed
3. **Keyboard**: Ensure Tab navigation works
4. **Color**: Don't rely on color alone
5. **Contrast**: Maintain WCAG AA compliance
6. **Focus**: Visible focus states

### Example

```vue
<input
  id="email"
  v-model="email"
  type="email"
  class="input"
  aria-label="Email address"
  aria-describedby="email-error"
>
<p v-if="error" id="email-error" class="error">{{ error }}</p>
```

---

## Testing Components

### Example Test

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  it('renders with text', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('supports different variants', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger' }
    })
    expect(wrapper.classes()).toContain('btn-danger')
  })
})
```

---

## Common Patterns

### Loading State

```vue
<Button :loading="isLoading" @click="handleSubmit">
  {{ isLoading ? 'Loading...' : 'Submit' }}
</Button>
```

### Disabled State

```vue
<Button :disabled="!formValid" type="submit">
  Submit
</Button>
```

### Error Handling

```vue
<Alert v-if="error" type="danger">
  {{ error.message }}
</Alert>
```

### Empty State

```vue
<div v-if="items.length === 0" class="empty-state">
  <p>No items yet</p>
  <Button @click="create">Create New</Button>
</div>
```

---

## Performance Tips

1. **Lazy load**: Use async components for heavy views
2. **Memoize**: Cache computed properties
3. **Optimize**: Minimize re-renders
4. **Bundle**: Use code splitting
5. **Compress**: Optimize images
6. **Cache**: Leverage browser cache

---

## Troubleshooting

### Component Not Rendering

1. Check import statement
2. Verify component exists
3. Check for syntax errors
4. Review console logs

### Styling Not Applied

1. Check scoped style syntax
2. Verify class names
3. Check CSS specificity
4. Clear browser cache

### Props Not Working

1. Check prop names (case-sensitive)
2. Verify prop types match
3. Check default values
4. Review parent component

---

## Resources

- [Vue 3 Documentation](https://vuejs.org)
- [Component Design](https://design.apolaki.com)
- [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) - Detailed reference
- `frontend/src/views/Dashboard.vue` - Working examples

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0
