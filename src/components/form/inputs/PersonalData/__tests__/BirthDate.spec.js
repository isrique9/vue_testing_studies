// src/components/__tests__/BirthDate.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import BirthDate from '../BirthDate.vue'

describe('BirthDate.vue', () => {
  let wrapper

  const getInput = () => wrapper.find('input#birth_date')
  const getFeedback = () => wrapper.find('#birth_feedback')

  beforeEach(() => {
    wrapper = mount(BirthDate, {
      props: {
        modelValue: ''
      }
    })
  })

  it('renderiza input e label corretamente', () => {
    expect(wrapper.find('label[for="birth_date"]').exists()).toBe(true)
    expect(getInput().exists()).toBe(true)
    expect(getInput().attributes('placeholder')).toBe('DD/MM/AAAA')
    expect(getInput().attributes('maxlength')).toBe('10')
  })

  it('exibe valor formatado quando não está focado', async () => {
    await wrapper.setProps({ modelValue: '15071990' })
    expect(getInput().element.value).toBe('15/07/1990')
  })

  it('ao receber foco, mostra o valor sem formatação e seleciona o texto', async () => {
    await wrapper.setProps({ modelValue: '15071990' })
    await getInput().trigger('focus')

    expect(getInput().element.value).toBe('15071990')
    expect(wrapper.vm.isFocused).toBe(true)
  })

  it('mantém raw enquanto digitando (focado) e emite update:modelValue com dígitos', async () => {
    await getInput().trigger('focus')
    const input = getInput()

    // Digita "1507"
    await input.setValue('1507')
    // O componente emite update:modelValue com os dígitos
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    // O último evento deve ter '1507'
    expect(emitted[emitted.length - 1][0]).toBe('1507')

    // Simula a atualização da prop pelo pai
    await wrapper.setProps({ modelValue: '1507' })

    // Como está focado, deve mostrar o raw
    expect(input.element.value).toBe('1507')
  })

  it('ao perder o foco (blur), formata e valida', async () => {
    await wrapper.setProps({ modelValue: '15071990' })
    await getInput().trigger('focus')
    await getInput().setValue('15071990') // já está, mas vamos garantir
    await wrapper.setProps({ modelValue: '15071990' })

    await getInput().trigger('blur')

    // Após blur, deve mostrar formatado
    expect(getInput().element.value).toBe('15/07/1990')
    // Não deve haver erro (data válida)
    expect(getFeedback().exists()).toBe(false)
  })

  describe('validação', () => {
    it('valida campo obrigatório quando vazio', async () => {
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('Data de nascimento é obrigatória')
      expect(wrapper.emitted('validation')[0][0]).toEqual({ field: 'birth_date', valid: false })
    })

    it('valida data incompleta (menos de 8 dígitos)', async () => {
      await wrapper.setProps({ modelValue: '1507' })
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('Data incompleta. Digite DDMMAAAA.')
    })

    it('valida data inválida (ex: 32/13/2020)', async () => {
      await wrapper.setProps({ modelValue: '32132020' }) // 32/13/2020
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('Data de nascimento inválida.')
    })

    it('valida data inexistente (ex: 29/02/2023 - não bissexto)', async () => {
      await wrapper.setProps({ modelValue: '29022023' }) // 29/02/2023 não existe
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('Data inexistente.')
    })

    it('valida data com ano anterior a 1910', async () => {
      await wrapper.setProps({ modelValue: '01011800' })
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('Data de nascimento inválida.')
    })

    it('valida data com ano futuro (maior que ano atual)', async () => {
      vi.useFakeTimers()
      const mockDate = new Date(2025, 0, 1) // 01/01/2025
      vi.setSystemTime(mockDate)

      // Cria um novo wrapper especificamente para este teste
      const localWrapper = mount(BirthDate, {
          props: { modelValue: '' }
      })
      const input = localWrapper.find('input#birth_date')
      await localWrapper.setProps({ modelValue: '01012026' }) // 01/01/2026
      await input.trigger('blur')

      const feedback = localWrapper.find('#birth_feedback')
      expect(feedback.exists()).toBe(true) // verifica se o feedback apareceu
      expect(feedback.text()).toBe('Data de nascimento inválida.')

      vi.useRealTimers() // restaura os timers reais
    })

    it('aceita data válida', async () => {
      await wrapper.setProps({ modelValue: '15071990' })
      await getInput().trigger('blur')
      expect(getFeedback().exists()).toBe(false)
      expect(wrapper.emitted('validation')[0][0]).toEqual({ field: 'birth_date', valid: true })
    })

    it('chama validateField no blur e emite validation', async () => {
      const validateSpy = vi.spyOn(wrapper.vm, 'validateField')
      await wrapper.setProps({ modelValue: '15071990' })
      await getInput().trigger('blur')
      expect(validateSpy).toHaveBeenCalled()
    })
  })

  it('emite validation apenas no blur, não ao digitar', async () => {
    await getInput().trigger('focus')
    await getInput().setValue('1')
    await wrapper.setProps({ modelValue: '1' })
    // Nenhum evento validation deve ter sido emitido ainda
    expect(wrapper.emitted('validation')).toBeUndefined()

    // Agora blur
    await getInput().trigger('blur')
    expect(wrapper.emitted('validation')).toHaveLength(1)
  })
})