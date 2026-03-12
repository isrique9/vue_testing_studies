// src/components/__tests__/Counter.spec.ts

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from '../Counter.vue'

describe('Counter.vue', () => {
  it('deve iniciar com contagem 0', () => {
    const wrapper = mount(Counter)
    // Encontra o elemento pelo data-testid
    const countEl = wrapper.find('[data-testid="count"]')
    expect(countEl.text()).toBe('Contagem: 0')
  })

  it('deve incrementar ao clicar no botão', async () => {
    const wrapper = mount(Counter)
    const button = wrapper.find('button')
    await button.trigger('click')
    const countEl = wrapper.find('[data-testid="count"]')
    expect(countEl.text()).toBe('Contagem: 1')
  })
})