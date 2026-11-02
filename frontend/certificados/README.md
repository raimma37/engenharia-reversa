# Pasta de Certificados EFI/Gerencianet

Esta pasta armazena os certificados `.p12` para integração com a API PIX da EFI (Gerencianet).

## Como Usar

1. **Acesso via Interface:** 
   - Faça login como super usuário
   - Vá em Configurações → Certificados EFI
   - Faça upload do arquivo `.p12`

2. **API Endpoint:**
   ```
   POST /settings/cert-upload?ref=certificadoEfi
   Content-Type: multipart/form-data
   Authorization: Bearer <token>
   ```

## Estrutura

- **Pasta:** `backend/certificados/`
- **Arquivo:** Nomeado conforme enviado pelo usuário
- **Configuração:** Salva em `Settings` com chave `certificado_certificadoEfi`
- **Uso:** Carregado dinamicamente em operações PIX por empresa

## Segurança

- ✅ Certificados são ignorados pelo Git (`.gitignore`)
- ✅ Acesso restrito a super usuários
- ✅ Validação de formato de arquivo (.p12)
- ✅ Certificados carregados por empresa (isolamento)

## Fallback

Se uma empresa não tiver certificado específico, o sistema usa:
- Certificado padrão em `backend/certs/producao.p12` (produção)
- Certificado padrão em `backend/certs/homologacao.p12` (sandbox)

## Debug

Logs são gerados com prefixo `[Gn]` para problemas relacionados a certificados:
```
📋 [Gn] Usando certificado da empresa 1: /path/to/certificado.p12
❌ [Gn] Erro ao buscar certificado: Error details
```