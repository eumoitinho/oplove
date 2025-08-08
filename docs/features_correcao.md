# 🔧 Features para Correção/Desativação - OpenLove

> **Última atualização:** 07/08/2025  
> **Status:** 📝 Documentando features a corrigir ou desativar temporariamente

## 🔴 FEATURES DESATIVADAS TEMPORARIAMENTE

### 1. **Conta Business/Profissional**
**Status:** ❌ DESATIVADO  
**Motivo:** Refatoração completa necessária  
**Problemas identificados:**
- Duplicação de campos no fluxo de registro
- Página `/business/register` redundante e com identidade visual diferente
- Fluxo confuso após registro (pede mesmos dados novamente)
- Dashboard business não está pronto

**Ações tomadas:**
- Card de seleção business desabilitado com overlay "Em breve"
- Mantido código para futura reativação
- Redirecionamento para `/business/register` removido

**Para reativar:**
1. Refatorar completamente o fluxo business
2. Integrar dashboard business com identidade visual do projeto
3. Eliminar duplicação de dados
4. Criar fluxo único e consistente

---

### 2. **Plano Casal (Dupla Hot)**
**Status:** ❌ DESATIVADO  
**Motivo:** Necessita desenvolvimento adicional  
**Problemas:**
- Sistema de perfis sincronizados não implementado
- Posts compartilhados não funcionam
- Badge "Dupla Verificada" não existe
- Monetização conjunta não desenvolvida

**Para reativar:**
- Implementar sistema de vinculação de contas
- Criar sincronização de perfis
- Desenvolver timeline compartilhada
- Adicionar badges especiais

---

## 🟡 FEATURES COM PROBLEMAS A CORRIGIR

### 1. **Sistema de Verificação de Identidade**
**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO  
**Problemas:**
- FaceScan 3D não está funcional
- Liveness Detection não implementado
- Processamento automático não existe (apenas simulação)
- Falta integração com APIs de verificação real

---

### 2. **Monetização de Conteúdo**
**Status:** ⚠️ INCOMPLETO  
**Problemas:**
- Sistema de assinaturas de perfil não funcional
- Comissões não são calculadas corretamente
- Falta sistema de pagamento para criadores
- Dashboard de ganhos não existe

---

### 3. **OpenDates**
**Status:** ⚠️ MENCIONADO MAS NÃO EXISTE  
**Problema:** Feature citada nos planos mas não implementada

---

### 4. **Chamadas de Voz/Vídeo**
**Status:** ⚠️ NÃO IMPLEMENTADO  
**Problema:** WebRTC não configurado, apenas UI existe

---

### 5. **Comunidades**
**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO  
**Problemas:**
- Criação de comunidades não funciona completamente
- Sistema de moderação ausente
- Falta integração com chat em grupo

---

### 6. **Eventos**
**Status:** ⚠️ BÁSICO  
**Problemas:**
- Criação limitada
- Falta sistema de RSVP
- Sem integração com calendário
- Sem notificações de eventos

---

## 🟢 FEATURES MENCIONADAS MAS NÃO CRÍTICAS

### 1. **Marketplace**
**Status:** 📋 PLANEJADO  
**Não implementado, sem previsão**

### 2. **Live Streaming**
**Status:** 📋 PLANEJADO  
**Não implementado, sem previsão**

### 3. **Jogos do Casal**
**Status:** 📋 MENCIONADO  
**Parte do plano casal desativado**

---

## 📝 NOTAS IMPORTANTES

### Prioridade de Correção:
1. **Primeiro:** Estabilizar features existentes
2. **Segundo:** Completar features parciais
3. **Terceiro:** Considerar novas features

### Comunicação com Usuários:
- Ser transparente sobre features em desenvolvimento
- Não prometer funcionalidades não implementadas
- Usar "Em breve" para features desativadas

### Refatoração Sugerida:
1. **Foco no MVP:** Chat, posts, perfis, stories
2. **Desativar temporariamente:** Features complexas incompletas
3. **Implementar gradualmente:** Uma feature completa por vez

---

## 🔄 HISTÓRICO DE MUDANÇAS

### 07/08/2025
- Conta Business desativada para refatoração
- Plano Casal removido temporariamente
- Documento criado para tracking de features

---

**IMPORTANTE:** Este documento deve ser atualizado sempre que uma feature for desativada ou reativada.