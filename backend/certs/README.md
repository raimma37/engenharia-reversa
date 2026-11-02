# Pasta de Certificados Padrão EFI/Gerencianet

Esta pasta é usada como fallback quando nenhum certificado específico da empresa é encontrado.

## Funcionamento

O sistema agora funciona com **fallback inteligente**:

1. **1ª Prioridade:** Certificado específico da empresa (`backend/certificados/`)
2. **2ª Prioridade:** Certificado de qualquer outra empresa 
3. **3ª Prioridade:** Certificado padrão desta pasta (`certs/`)

## Arquivos

- `homologacao.p12` - Certificado para sandbox/teste
- `producao.p12` - Certificado para produção

## Como usar certificados por empresa

1. Faça login como super usuário
2. Vá em Configurações → seção "Configuração Pix Efi (Gerencianet)"  
3. Faça upload do arquivo .p12 específico da empresa
4. O sistema usará automaticamente o certificado correto por empresa

## Logs de diagnóstico 

```
🔍 [Gn] Buscando certificado para empresa 2
🔄 [Gn] Procurando certificado de outras empresas...
📋 [Gn] Usando certificado de empresa 1: /path/certificado.p12
✅ [Gn] Certificado alternativo existe: /path/certificado.p12
```