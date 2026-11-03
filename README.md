# BotConnecta / Whaticket — Guia de Execução Local e Integração n8n (`budget-system`)

Este documento reúne as instruções para rodar o projeto localmente e o manual completo das **regras de negócio, comandos, webhooks e endpoints** para conectar este sistema ao **n8n** e ao sistema de gestão e orçamentos (**`print-shop-budget-system`** - Gráfica São João).

---

## 1. Acesso e Execução em Ambiente Local (`localhost`)

### 🌐 URLs e Portas
| Serviço | Endereço Local | Descrição |
| :--- | :--- | :--- |
| **Frontend (Painel Web)** | `http://localhost:3000` | Interface de atendimento, filas, Kanban e configurações |
| **Backend (API & Webhooks)** | `http://localhost:8080` | Servidor Express, Socket.IO, Baileys v7 e rotas n8n/WAHA |
| **PostgreSQL 18.6** | `127.0.0.1:5432` | Banco de dados `whaticket` (usuário: `whaticket`) |
| **Redis 5.0.14** | `127.0.0.1:6379` | Gerenciamento de filas Bull e cache de sessões |

### 🔑 Credenciais Padrão (Administrador)
- **E-mail:** `admin@admin.com`
- **Senha:** `adminpro`

### ▶️ Como Iniciar os Serviços Localmente (Windows PowerShell)
Caso reinicie o computador, execute os comandos abaixo em terminais separados:

```powershell
# 1. Iniciar Redis (porta 6379)
& "C:\Users\Rai\.gemini\antigravity-ide\scratch\.local-services\redis\redis-server.exe" --port 6379 --bind 127.0.0.1

# 2. Iniciar PostgreSQL (porta 5432)
& "C:\Users\Rai\.gemini\antigravity-ide\scratch\.local-services\pgsql\native\bin\postgres.exe" -D "C:\Users\Rai\.gemini\antigravity-ide\scratch\.local-services\pgdata" -p 5432 -h 127.0.0.1

# 3. Iniciar Backend (porta 8080)
cd C:\Users\Rai\.gemini\antigravity-ide\scratch\engenharia-reversa\backend
node --experimental-require-module dist/server.js

# 4. Iniciar Frontend (porta 3000)
cd C:\Users\Rai\.gemini\antigravity-ide\scratch\engenharia-reversa\frontend
$env:NODE_OPTIONS="--openssl-legacy-provider"
$env:PORT="3000"
npx react-scripts start
```

> **Dica:** Sempre que alterar arquivos TypeScript em `backend/src`, recompile com `npm run build` dentro da pasta `backend` (e mantenha o arquivo `dist/helpers/validateLicense.js`).

---

## 2. Passo a Passo para Conectar ao n8n e ao `budget-system`

Os 3 workflows prontos do n8n estão na pasta [`./n8n/`](./n8n):
1. [`n8n/workflow_atendente_ia.json`](./n8n/workflow_atendente_ia.json) — **Atendente IA (Triagem e Orçamentos)**
2. [`n8n/workflow_orcamento.json`](./n8n/workflow_orcamento.json) — **Disparo Automático de Orçamento em PDF + Agente de Aceite/Recusa**
3. [`n8n/workflow_notificacao_os.json`](./n8n/workflow_notificacao_os.json) — **Notificação de Mudança de Status de Ordem de Serviço (OS)**

### Passo 1: Importar os Workflows no n8n
1. Abra o seu painel do **n8n** (ex.: `http://localhost:5678`).
2. Importe os 3 arquivos JSON da pasta `n8n/`.
3. Configure a credencial da **Groq API** nos nós `"Groq Chat Model"` (modelo `llama-3.3-70b-versatile`).
4. Caso o seu sistema `print-shop-budget-system` esteja rodando localmente (ex.: `http://localhost:3001` em vez de `https://pdv.saojoao.net`), ajuste a URL nos nós HTTP `"Listar Pendentes"`, `"Exportar PDF da API"`, `"Avisar Sistema"` e `"Registrar no Sistema"` do `workflow_orcamento.json`.
5. **Ative** os 3 workflows no n8n.

### Passo 2: Configurações Já Pré-Cadastradas no Whaticket (`http://localhost:3000`)
O banco de dados local já está pré-configurado para uso individual da **Gráfica São João**:
1. **Filas (`Queues`) já criadas e vinculadas ao seu usuário `Admin`:**
   - `1` — **Triagem Bot** (`#2563EB`): fila de entrada vinculada à integração n8n.
   - `2` — **Comercial / Orçamentos** (`#D97706`): fila humana para onde a IA transfere orçamentos sob medida e atendimentos humanos.
   - `3` — **Impressões Rápidas** (`#16A34A`): fila humana para onde a IA transfere pedidos de impressões comuns após coletar o arquivo, cor (P&B/colorido) e cópias.
2. **Etiquetas de Classificação da Triagem (`Tags` + Kanban) já criadas:**
   - **`Atendimento Humano`** (`#DC2626` - Vermelho): aplicada automaticamente (`<TAG_HUMANO>`) quando a IA não sabe uma informação, não está compreendendo o cliente ou evita ficar repetitiva.
   - **`Impressões Comuns`** (`#2563EB` - Azul): aplicada automaticamente (`<TAG_IMPRESSAO>`) quando a IA conclui a triagem de impressões básicas (boletos, trabalhos, cópias, documentos).
   - **`Orçamentos`** (`#D97706` - Âmbar): aplicada automaticamente (`<AGUARDANDO_HUMANO>`) quando a IA coleta todos os dados do orçamento sob medida e registra a solicitação no **Painel de Avisos** do `print-shop-budget-system`.
   - **`Orçamento Enviado`** (`#0284C7` - Azul Claro): aplicada automaticamente quando o PDF do orçamento é enviado ao cliente via `/api/sendFile`.
   - **`Orçamento Aprovado`** (`#16A34A` - Verde): aplicada automaticamente quando o cliente aprova o orçamento (`[ACEITO]`).
3. **Integração n8n (`n8n Gráfica São João`) já cadastrada:**
   - **URL do n8n (`urlN8N`):**
     ```text
     http://localhost:5678/webhook/grafica-whatsapp, http://localhost:5678/webhook/orcamento-resposta
     ```
   - **Transferência Automática (`enableTransfer`):** Ativa para a fila **Comercial / Orçamentos** (`queueId: 2`) e usuário **Admin** (`userId: 1`).
4. **Conexão WhatsApp (`Gráfica São João`) já criada:**
   - **Token:** `grafica123` (padrão `isDefault: true`, vinculada à fila `Triagem Bot` e à integração `n8n Gráfica São João`).
   - Basta acessar **Conexões** em `http://localhost:3000` e ler o **QR Code** com o seu WhatsApp.

### Passo 3: Configurar o `.env` do `print-shop-budget-system`
No arquivo `.env` do projeto `print-shop-budget-system` (ou nas Configurações do Sistema), aponte o webhook de OS para o n8n:
```env
N8N_OS_WEBHOOK_URL=http://localhost:5678/webhook/status-os
API_INTEGRATION_TOKEN=TYPEBOT_GRAFIKA_KEY_2026
```

---

## 3. Regras de Negócio e Comandos da Automação

### 🤖 Regra 1: Controle Manual do Bot pelo Atendente (`#pausar` e `#bot`)
- **Pausar a IA em uma conversa:** Se um atendente enviar a mensagem `#pausar` (pelo WhatsApp Web/celular ou diretamente), o workflow do n8n pausa o robô para aquele cliente.
- **Reativar a IA em uma conversa:** Se a equipe enviar `#bot`, o cliente é removido da lista de pausados e a IA volta a responder.
- **Desativar Bot por Contato no Painel:** No painel do Whaticket (`http://localhost:3000`), você também pode ativar a chave **"Desabilitar Bot"** diretamente no cadastro do Contato, ou simplesmente atribuir o ticket a um atendente humano (o Whaticket só aciona o webhook do n8n quando o ticket está sem atendente atribuído).

### 🧑‍💼 Regra 2: Triagem e Transbordo Humano Automático (`<AGUARDANDO_HUMANO>`)
O **Atendente IA** (`workflow_atendente_ia.json`) opera sob 4 cenários:
1. **Cenário 1 — Impressões Básicas (Boletos, Trabalhos, Cópias, Documentos):**
   - Pede o arquivo (preferencialmente PDF), pergunta se é colorido ou P&B, pergunta a quantidade de cópias e confirma entrada na fila de impressão.
2. **Cenário 2 — Orçamentos Sob Medida (Adesivos, Banners, Cartões, Tags, Etiquetas):**
   - Pergunta em cascata (1 pergunta por vez): se já possui arte pronta $\rightarrow$ quantidade e tamanho aproximado.
   - Ao coletar todos os dados, a IA encerra a triagem adicionando internamente a tag `<AGUARDANDO_HUMANO>`.
   - **O que acontece automaticamente:**
     1. A tag `<AGUARDANDO_HUMANO>` é removida do texto visível ao cliente.
     2. O chat é pausado na memória do n8n.
     3. O Whaticket transfere o ticket automaticamente para a fila humana (**Comercial / Orçamentos**), desativa o bot no ticket (`isBot: false, useIntegration: false`) e alerta a equipe no painel em tempo real.
3. **Cenário 3 — Formatação de Currículos:**
   - Orienta o cliente a usar o link digital de geração de currículo em PDF.
4. **Cenário 4 — Recebimento de Áudio ou Ligação:**
   - Caso o cliente envie um áudio ou tente ligar, responde automaticamente pedindo para enviar por escrito.

### 📄 Regra 3: Envio Automático de Orçamentos em PDF e Agente de Aceite (`[ACEITO]` / `[NEGADO]`)
O workflow `workflow_orcamento.json` possui dois ciclos integrados:
1. **Disparo do PDF (a cada 5 minutos ou via Webhook `/webhook/whaticket-integration`):**
   - Consulta no `budget-system`: `GET /api/orcamentos?status=a_enviar`.
   - Exporta o PDF em Base64: `GET /api/orcamentos/:id/export`.
   - Verifica se o telefone possui WhatsApp válido no Whaticket: `GET http://localhost:8080/api/contacts/check-exists?phone=...`.
   - Envia o PDF com legenda ao cliente via Whaticket: `POST http://localhost:8080/api/sendFile` (o arquivo aparece também no histórico do ticket no painel do Whaticket).
   - Atualiza o orçamento para `"status": "enviado"` no `budget-system`, registra o cliente como `"aguardando resposta do orçamento"` por até 7 dias e notifica o dono da gráfica (`5591981284851`).
2. **Captura de Aceite ou Negação (`/webhook/orcamento-resposta`):**
   - Quando o cliente responde à mensagem do orçamento, o **Agente de Aceite (IA)** conversa com ele para identificar se ele aprova ou recusa:
     - **Aprovação (`[ACEITO]`):** Agradece ao cliente, envia `POST /api/orcamentos/:id/resposta` com `{ "decisao": "aceito" }` para o `budget-system` e avisa o dono no WhatsApp.
     - **Recusa (`[NEGADO: motivo]`):** Pergunta educadamente o motivo (preço, prazo, desistência, etc.), registra `{ "decisao": "negado", "motivo": "..." }` no `budget-system` e avisa o dono no WhatsApp.

### 📦 Regra 4: Notificação Automática de Status de OS (`workflow_notificacao_os.json`)
- Sempre que uma Ordem de Serviço (OS) muda de status no Kanban/sistema do `budget-system`, a função `dispatchOsStatusNotification` envia os dados para `/webhook/status-os` no n8n.
- O n8n envia a mensagem formatada ao WhatsApp do cliente via `POST http://localhost:8080/api/sendText` e envia um comprovante de notificação para o número do proprietário da gráfica.

---

## 4. Referência de Endpoints da API (Whaticket $\leftrightarrow$ n8n)

### 4.1. Rotas da Camada de Compatibilidade WAHA / Base64
Aceitam autenticação via header `X-Api-Key: grafica123` ou `Authorization: Bearer <TOKEN_DA_CONEXAO>` (com fallback automático para a conexão padrão da empresa 1).

#### 1. Enviar Mensagem de Texto (com suporte a Transbordo Automático)
- **Endpoint:** `POST http://localhost:8080/api/sendText` (ou `POST /api/messages/sendText`)
- **Body (JSON):**
  ```json
  {
    "session": "default",
    "chatId": "5591981284851@c.us",
    "text": "Olá! Seu atendimento foi encaminhado para nossa equipe.",
    "ticketId": 15,
    "integrationId": 1,
    "transbordo": false,
    "noTicket": false
  }
  ```
  *(Se `transbordo: true` ou se `text` contiver `<AGUARDANDO_HUMANO>`, o ticket é transferido imediatamente para atendimento humano).*

#### 2. Enviar Arquivo / PDF em Base64
- **Endpoint:** `POST http://localhost:8080/api/sendFile` (ou `POST /api/messages/send/base64`)
- **Body (JSON):**
  ```json
  {
    "session": "default",
    "chatId": "5591981284851@c.us",
    "file": {
      "mimetype": "application/pdf",
      "filename": "orcamento.pdf",
      "data": "JVBERi0xLjQK..."
    },
    "caption": "Olá! Segue o seu orçamento em anexo."
  }
  ```

#### 3. Verificar se Número Existe no WhatsApp
- **Endpoint:** `GET http://localhost:8080/api/contacts/check-exists?session=default&phone=5591981284851`
- **Resposta:**
  ```json
  {
    "numberExists": true,
    "existsInWhatsapp": true,
    "chatId": "559181284851@c.us",
    "jid": "559181284851@s.whatsapp.net",
    "number": "559181284851"
  }
  ```

#### 4. Simular "Digitando..." e Marcar como Lida
- `POST http://localhost:8080/api/startTyping` $\rightarrow$ `{ "chatId": "5591981284851@c.us" }`
- `POST http://localhost:8080/api/sendSeen` $\rightarrow$ `{ "chatId": "5591981284851@c.us", "ticketId": 15 }`

#### 5. Consultar Status de Entrega da Mensagem (`ack`)
- `GET http://localhost:8080/api/default/chats/:chatId/messages/:messageId`
- **Resposta:** `{ "id": "...", "chatId": "...", "ack": 2 }` (`ack >= 2` indica entregue ao aparelho).

---

### 4.2. Rota de Controle de Ticket do n8n (`POST /n8n-callback`)
Permite que o n8n execute ações administrativas diretamente sobre qualquer ticket do Whaticket:

- **Endpoint:** `POST http://localhost:8080/n8n-callback`
- **Ações suportadas (`action`):**
  - `"transfer"`: Transfere o ticket para fila/atendente humano e desativa a integração do bot.
  - `"close"`: Encerra o ticket (opcionalmente enviando mensagem de despedida em `"message"`).
  - `"open"`: Fecha o ticket atual e abre um novo ticket pendente para o contato.
  - `"assign"`: Atribui o ticket a um `queueId`, `userId` ou `whatsappId`.
  - `"update"`: Atualiza `status`, `queueId`, `userId` ou `whatsappId`.
- **Exemplo de Payload (Transferência usando configuração da Integração):**
  ```json
  {
    "action": "transfer",
    "ticketId": 15,
    "integrationId": 1,
    "token": "grafica123",
    "useIntegrationConfig": true
  }
  ```
  - **Exemplo de Payload (Transferência manual para uma fila ou usuário específico):**
  ```json
  {
    "action": "transfer",
    "ticketId": 15,
    "token": "grafica123",
    "queueId": 2,
    "userId": 1
  }
  ```

---

### 4.3. Formato do Payload Enviado pelo Whaticket ao Webhook do n8n
Sempre que o cliente envia uma mensagem no WhatsApp, o Whaticket envia um `POST` para a(s) URL(s) configurada(s) em `urlN8N` contendo tanto o objeto nativo do **Baileys** quanto o objeto normalizado **`payload`** (padrão WAHA):

```json
{
  "key": {
    "remoteJid": "559181284851@s.whatsapp.net",
    "fromMe": false,
    "id": "3EB0A1B2C3D4"
  },
  "pushName": "João Silva",
  "message": {
    "conversation": "Olá, preciso fazer 1000 cartões de visita"
  },
  "event": "message",
  "payload": {
    "id": "3EB0A1B2C3D4",
    "from": "559181284851@c.us",
    "to": "me@c.us",
    "fromMe": false,
    "body": "Olá, preciso fazer 1000 cartões de visita",
    "type": "chat",
    "hasMedia": false,
    "media": {
      "mimetype": "",
      "filename": ""
    },
    "ticketId": 15,
    "companyId": 1,
    "contactName": "João Silva"
  },
  "_integrationConfig": {
    "integrationId": 1,
    "ticketId": 15,
    "companyId": 1,
    "whatsappId": 1,
    "enableTransfer": true,
    "transferQueueId": 2,
    "transferUserId": 1,
    "enableCloseTicket": false
  }
}
```
