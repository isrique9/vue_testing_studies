<!-- src/components/form/inputs/PersonalData/Cpf.vue -->
<template>
  <div class="mb-3 cpf-field">
    <label for="cpf">CPF</label>
    <input
        type="tel"
        inputmode="numeric"
        class="form-control"
        :class="{ 'is-invalid': error }"
        id="cpf"
        name="cpf"
        maxlength="14"
        placeholder="Digite um CPF"
        required
        :value="displayValue"
        @input="handleInput"
        @focus="onFocus"
        @blur="onBlur"
        ref="inputRef"
    />
    <div id="cpf_feedback" class="invalid-feedback" v-if="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'Cpf',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      error: '',
      isFocused: false
    }
  },
  computed: {
    displayValue() {
      if (this.isFocused) {
        return this.modelValue
      } else {
        return this.formatCpf(this.modelValue)
      }
    }
  },
  methods: {
    formatCpf(value) {
      const digits = value.replace(/\D/g, '').slice(0, 11)
      if (digits.length <= 11) {
        return digits
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
      return digits
    },
    handleInput(event) {
      const input = event.target
      const start = input.selectionStart
      const end = input.selectionEnd

      const rawDigits = input.value.replace(/\D/g, '').slice(0, 11)
      this.$emit('update:modelValue', rawDigits)

      this.$nextTick(() => {
        input.setSelectionRange(start, end)
      })

      this.error = ''
    },
    validarCPF(cpfStr) {
      const cpf = cpfStr.replace(/\D/g, '')
      if (cpf.length !== 11) return false
      if (/^(\d)\1+$/.test(cpf)) return false
      let soma = 0, resto
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i)
      resto = (soma * 10) % 11
      if (resto === 10 || resto === 11) resto = 0
      if (resto !== parseInt(cpf[9])) return false
      soma = 0
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i)
      resto = (soma * 10) % 11
      if (resto === 10 || resto === 11) resto = 0
      if (resto !== parseInt(cpf[10])) return false
      return true
    },
    validateField() {
      const raw = this.modelValue.replace(/\D/g, '')
      if (!raw) {
        this.error = 'CPF é obrigatório'
      } else if (raw.length !== 11) {
        this.error = 'CPF deve ter 11 dígitos'
      } else if (!this.validarCPF(raw)) {
        this.error = 'CPF inválido'
      } else {
        this.error = ''
      }
      this.$emit('validation', { field: 'cpf', valid: !this.error })
    },
    onFocus() {
      this.isFocused = true
      this.$nextTick(() => {
        this.$refs.inputRef.select()
      })
    },
    onBlur() {
      this.isFocused = false
      this.validateField()
    }
  }
}
</script>

<style scoped>
@import "@/assets/css/form/main.css";

#cpf {
  max-width: 898px;
}

@media (min-width: 2000px) {
  .cpf-field {
    margin-bottom: 1.5rem;
  }
}
</style>
