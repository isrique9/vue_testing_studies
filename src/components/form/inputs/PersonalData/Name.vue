<!-- src/components/form/inputs/PersonalData/Name.vue -->
<template>
  <div class="mb-3 name-field">
    <label for="name">Nome completo</label>
    <input
      type="text"
      class="form-control"
      :class="{ 'is-invalid': error }"
      id="name"
      name="name"
      placeholder="Digite um nome completo"
      maxlength="80"
      required
      :value="modelValue"
      @input="handleInput"
      @focus="onFocus"
      @blur="validateField"
      ref="inputRef"
    />
    <small class="char-count">{{ currentLength }}/80</small>
    <div id="name_feedback" class="invalid-feedback" v-if="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'Name',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentLength() {
      return this.modelValue?.length || 0
    }
  },
  data() {
    return {
      error: ''
    }
  },
  methods: {
    handleInput(event) {
      const input = event.target
      const start = input.selectionStart
      const end = input.selectionEnd

      let value = input.value
      value = value.replace(/^\s+/, '')
      value = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '')

      if (value !== input.value) {
        input.value = value
        this.$nextTick(() => {
          input.setSelectionRange(start, end)
        })
      }

      this.$emit('update:modelValue', value)
      this.error = ''
    },
    validateField() {
      const trimmed = this.modelValue.trim()
      if (!trimmed) {
        this.error = 'Nome é obrigatório'
      } else {
        const fullNameRegex =
          /^(?!.*\b[A-Za-zÀ-ÖØ-öø-ÿ]{21,}\b)(?:[A-Za-zÀ-ÖØ-öø-ÿ]{2,}\s+){1,}[A-Za-zÀ-ÖØ-öø-ÿ]{2,}$/
        if (!fullNameRegex.test(trimmed)) {
          const words = trimmed.split(/\s+/)
          const hasLongWord = words.some(word => word.length > 20)
          if (hasLongWord) {
            this.error = 'Cada nome deve ter no máximo 20 caracteres'
          } else {
            this.error = 'Informe nome e sobrenome válidos (apenas letras, mínimo 2 caracteres cada)'
          }
        } else {
          this.error = ''
        }
      }
      this.$emit('validation', { field: 'name', valid: !this.error })
    },
    onFocus() {
      this.$nextTick(() => {
        this.$refs.inputRef.select()
      })
    }
  }
}
</script>

<style scoped>
@import "@/assets/css/form/main.css";

.name-field {
  width: 100%;
}

@media (min-width: 2000px) {
  .name-field {
    margin-bottom: 1.5rem;
  }
}

.char-count {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}
</style>
