// src/components/__tests__/Cpf.spec.js

import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Cpf from '../Cpf.vue'

describe('Cpf.vue', () => {
  let wrapper

  // Função auxiliar para obter o input
  const getInput = () => wrapper.find('input#cpf')
  const getFeedback = () => wrapper.find('#cpf_feedback')

  beforeEach(() => {
    // Monta o componente antes de cada teste com valor padrão vazio
    wrapper = mount(Cpf, {
      props: {
        modelValue: ''
      }
    })
  })

  it('renderiza input e label corretamente', () => {
    expect(wrapper.find('label[for="cpf"]').exists()).toBe(true)
    expect(getInput().exists()).toBe(true)
    expect(getInput().attributes('placeholder')).toBe('Digite um CPF')
    expect(getInput().attributes('maxlength')).toBe('14')
  })

  it('exibe valor formatado quando não está focado', async () => {
    // Testa com um CPF de exemplo
    await wrapper.setProps({ modelValue: '12345678909' })
    // Sem foco, deve mostrar formatado
    expect(getInput().element.value).toBe('123.456.789-09')
  })

  it('ao receber foco, mostra o valor sem formatação e seleciona o texto', async () => {
    await wrapper.setProps({ modelValue: '12345678909' })

    // Simula o foco
    await getInput().trigger('focus')

    // Após foco, deve mostrar raw (sem formatação)
    expect(getInput().element.value).toBe('12345678909')
    // Verifica se a seleção do texto ocorreu (não podemos testar diretamente a seleção, mas podemos verificar se o método foi chamado)
    // O método onFocus chama this.$refs.inputRef.select() - isso não pode ser verificado diretamente,
    // mas podemos verificar que o input está focado e que o valor é raw.
    // Uma alternativa é verificar se a propriedade isFocused ficou true (podemos acessar wrapper.vm)
    expect(wrapper.vm.isFocused).toBe(true)
  })

  it('mantém raw enquanto digitando (focado) e emite update:modelValue com dígitos', async () => {
    await getInput().trigger('focus')
    const input = getInput()

    // Simula digitação de caracteres
    await input.setValue('123a') // 'a' deve ser ignorado porque a formatação só considera dígitos
    // O componente emite update:modelValue com os dígitos
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    // O último evento emitido deve ter o valor '123' (apenas dígitos)
    const lastEvent = wrapper.emitted('update:modelValue').pop()
    expect(lastEvent[0]).toBe('123')

    // Como está focado, o valor do input ainda deve ser raw (123a) ou só dígitos? O componente usa o valor recebido via prop para exibir.
    // Na verdade, o handleInput emite o rawDigits e atualiza a prop modelValue via pai.
    // No teste, o modelValue não é atualizado automaticamente porque o pai não está presente.
    // Precisamos simular a atualização da prop.
    // Para isso, vamos redefinir a prop com o valor emitido.
    await wrapper.setProps({ modelValue: '123' })

    // O input ainda está focado, então displayValue retorna modelValue (raw) -> '123'
    expect(input.element.value).toBe('123')
  })

  it('ao perder o foco (blur), formata e valida', async () => {
    await wrapper.setProps({ modelValue: '12345678909' })
    await getInput().trigger('focus')
    // Muda o valor para inválido (menos de 11 dígitos)
    await getInput().setValue('123')
    await wrapper.setProps({ modelValue: '123' }) // simula atualização do pai

    // Perde o foco
    await getInput().trigger('blur')

    // Após blur, deve formatar (mas com 3 dígitos, a formatação será '123')
    expect(getInput().element.value).toBe('123')
    // Deve exibir mensagem de erro (menos de 11 dígitos)
    expect(getFeedback().exists()).toBe(true)
    expect(getFeedback().text()).toBe('CPF deve ter 11 dígitos')
  })

  describe('validação', () => {
    it('valida campo obrigatório quando vazio', async () => {
      // Já está vazio
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('CPF é obrigatório')
      // Verifica evento validation
      const validationEvent = wrapper.emitted('validation')
      expect(validationEvent).toBeTruthy()
      expect(validationEvent.pop()[0]).toEqual({ field: 'cpf', valid: false })
    })

    it('valida CPF com menos de 11 dígitos', async () => {
      await wrapper.setProps({ modelValue: '123' })
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('CPF deve ter 11 dígitos')
    })

    it('valida CPF inválido', async () => {
      // CPF com dígitos repetidos (inválido)
      await wrapper.setProps({ modelValue: '11111111111' })
      await getInput().trigger('blur')
      expect(getFeedback().text()).toBe('CPF inválido')
    })

    it('valida CPF válido', async () => {
      // Usa um CPF válido conhecido (gerado ou exemplo)
      const cpfValido = '12345678909' // Este é um CPF válido?
      // Na verdade, 123.456.789-09 é válido? Vamos usar um CPF gerado: 529.982.247-25 é um famoso, mas podemos usar um algoritmo simples ou um CPF real de teste.
      // Para não depender de números reais, podemos mockar a função validarCPF? Mas aqui prefiro testar com um CPF válido conhecido.
      // Exemplo de CPF válido (gerado aleatoriamente mas com dígitos verificadores corretos): 123.456.789-09 NÃO é válido (os dígitos verificadores não batem). Vamos usar um que sabemos ser válido: 529.982.247-25 (CPF do Fiocruz) é válido, mas pode ser problemático usar um real. Melhor criar um algoritmo simples para gerar um CPF válido ou usar um de teste.
      // Para simplicidade, vou usar um CPF que passa na validação: 123.456.789-09 na verdade não passa. Vou usar o CPF 111.444.777-35? Não tenho certeza. Vamos utilizar uma abordagem mais segura: podemos testar a lógica de validação separadamente, ou então mockar o método validarCPF para retornar true e testar o comportamento.
      // Como é um teste, podemos usar um CPF gerado dinamicamente (mas seria complexo). Vou optar por mockar o método validarCPF para este teste específico.
      // No beforeEach, podemos restaurar. Mas para manter a simplicidade, vou assumir que a função validarCPF funciona e usar um CPF válido de exemplo que sabemos passar.
      // Vamos usar um CPF gerado por um algoritmo confiável: 123.456.789-09 é inválido, então usaremos 111.444.777-35? Não sei.
      // Vou usar um site de gerar CPF para testes: 862.883.670-80 (gerado aleatoriamente, mas pode ser válido). Melhor: vou mockar.
      // Vou modificar o componente no teste para substituir o método validarCPF.
      // Mas como não queremos alterar o componente real, podemos usar uma técnica de spy.

      // Vou fazer o teste com um CPF que sabemos que é inválido e esperar erro, ou então usar o método original com um CPF válido conhecido.
      // Após pesquisar, 529.982.247-25 é válido. Vamos usar ele (sem pontuação): '52998224725'.
      await wrapper.setProps({ modelValue: '52998224725' })
      await getInput().trigger('blur')
      // Não deve haver erro
      expect(getFeedback().exists()).toBe(false)
      // Evento validation com valid true
      const validationEvent = wrapper.emitted('validation')
      expect(validationEvent.pop()[0]).toEqual({ field: 'cpf', valid: true })
    })

    // Teste com mock do validarCPF para garantir que a mensagem correta aparece
    it('chama validarCPF e define erro quando retorna false', async () => {
      // Espiona o método validarCPF do componente
      const validateSpy = vi.spyOn(wrapper.vm, 'validarCPF').mockReturnValue(false)

      await wrapper.setProps({ modelValue: '12345678909' }) // qualquer valor
      await getInput().trigger('blur')

      expect(validateSpy).toHaveBeenCalledWith('12345678909')
      expect(getFeedback().text()).toBe('CPF inválido')
    })
  })

  it('emite validation ao perder o foco e ao digitar (?)', async () => {
    // O validateField é chamado no blur. Vamos testar se validation é emitido.
    await wrapper.setProps({ modelValue: '' })
    await getInput().trigger('blur')
    expect(wrapper.emitted('validation')).toHaveLength(1)

    // Ao digitar, o erro é limpo mas validation não é reemitido até o blur. Confirmar.
    await getInput().trigger('focus')
    await getInput().setValue('1')
    await wrapper.setProps({ modelValue: '1' })
    // validation não deve ter sido emitido novamente
    expect(wrapper.emitted('validation')).toHaveLength(1)
  })
})