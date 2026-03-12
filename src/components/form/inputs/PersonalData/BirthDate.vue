<!-- src/components/form/inputs/PersonalData/BirthDate.vue -->
<template>
  <div class="mb-3 birth-field">
    <label for="birth_date">Data de nascimento</label>
    <input
      type="tel"
      inputmode="numeric"
      class="form-control"
      :class="{ 'is-invalid': error }"
      id="birth_date"
      name="birth_date"
      placeholder="DD/MM/AAAA"
      required
      maxlength="10"
      :value="displayValue"
      @input="handleInput"
      @focus="onFocus"
      @blur="onBlur"
      ref="inputRef"
    />
    <div id="birth_feedback" class="invalid-feedback" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'BirthDate',
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
        return this.formatBirth(this.modelValue)
      }
    }
  },
  methods: {
    formatBirth(value) {
      const digits = value.replace(/\D/g, '').slice(0, 8)
      if (digits.length <= 2) return digits
      if (digits.length <= 4) return digits.replace(/(\d{2})(\d+)/, '$1/$2')
      return digits.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3')
    },
    handleInput(event) {
      const input = event.target
      const start = input.selectionStart
      const end = input.selectionEnd

      const rawDigits = input.value.replace(/\D/g, '').slice(0, 8)
      this.$emit('update:modelValue', rawDigits)

      this.$nextTick(() => {
        input.setSelectionRange(start, end)
      })

      this.error = ''
    },
    validateField() {
      const raw = this.modelValue.replace(/\D/g, '')
      if (raw.length === 0) {
        this.error = 'Data de nascimento é obrigatória'
        this.$emit('validation', { field: 'birth_date', valid: false })
        return
      }
      if (raw.length !== 8) {
        this.error = 'Data incompleta. Digite DDMMAAAA.'
        this.$emit('validation', { field: 'birth_date', valid: false })
        return
      }
      const formatted = this.formatBirth(raw)
      const regexData =
        /^(?:(?:31\/(?:0?[13578]|1[02]))|(?:29|30\/(?:0?[1,3-9]|1[0-2]))|(?:0?[1-9]|1\d|2[0-8])\/(?:0?[1-9]|1[0-2]))\/\d{4}$|^(29\/0?2\/(?:\d{2}(?:0[48]|[2468][048]|[13579][26])|\d{4}))$/
      if (!regexData.test(formatted)) {
        this.error = 'Data de nascimento inválida.'
        this.$emit('validation', { field: 'birth_date', valid: false })
        return
      }
      const [dia, mes, ano] = formatted.split('/').map(Number)
      const anoAtual = new Date().getFullYear()
      if (ano < 1910 || ano > anoAtual) {
        this.error = 'Data de nascimento inválida.'
        this.$emit('validation', { field: 'birth_date', valid: false })
        return
      }
      const data = new Date(ano, mes - 1, dia)
      if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
      ) {
        this.error = 'Data inexistente.'
        this.$emit('validation', { field: 'birth_date', valid: false })
        return
      }
      this.error = ''
      this.$emit('validation', { field: 'birth_date', valid: true })
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
</style>
