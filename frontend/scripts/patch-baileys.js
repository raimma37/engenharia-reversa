#!/usr/bin/env node
/**
 * Patch pós-instalação para Baileys v7
 *
 * 1) Corrige o bug de contacts.upsert não ser emitido.
 *    Causa raiz: await faltando em mutationKeys() dentro de chat-utils.ts
 *    Ref: https://github.com/WhiskeySockets/Baileys/issues/1900
 *         https://github.com/WhiskeySockets/Baileys/pull/2288
 *
 * 2) Corrige rejeição de pairing code em versões que ainda validam value=14
 *    no validate-connection (WhatsApp passou a exigir value=24).
 *    Ref: https://github.com/WhiskeySockets/Baileys/issues/2364
 *
 * 3) Corrige TypeError: Cannot read properties of undefined (reading 'UPDATE')
 *    em handleMexNotification (messages-recv.js) quando proto.SyncdMutation
 *    ou SyncdOperation é undefined ao processar notificações MEX.
 */

const fs = require("fs");
const path = require("path");

const patchFile = (filePath, replacements, patchLabel) => {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  for (const replacement of replacements) {
    if (replacement.search.test(content)) {
      replacement.search.lastIndex = 0;
      const next = content.replace(replacement.search, replacement.replace);
      if (next !== content) {
        content = next;
        changed = true;
        console.log(`✅ [PATCH-BAILEYS] ${patchLabel} aplicado (${replacement.desc}) em: ${filePath}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }

  console.log(`ℹ️  [PATCH-BAILEYS] ${patchLabel} já aplicado ou não necessário em: ${filePath}`);
  return true;
};

const chatUtilsPaths = [
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "lib", "Utils", "chat-utils.js"),
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "src", "Utils", "chat-utils.ts"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "lib", "Utils", "chat-utils.js"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "src", "Utils", "chat-utils.ts"),
  path.join(__dirname, "..", "node_modules", "baileys", "lib", "Utils", "chat-utils.js"),
  path.join(__dirname, "..", "node_modules", "baileys", "src", "Utils", "chat-utils.ts"),
];

const eventBufferPaths = [
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "lib", "Utils", "event-buffer.js"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "lib", "Utils", "event-buffer.js"),
  path.join(__dirname, "..", "node_modules", "baileys", "lib", "Utils", "event-buffer.js"),
];

const validateConnectionPaths = [
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "lib", "Utils", "validate-connection.js"),
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "src", "Utils", "validate-connection.ts"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "lib", "Utils", "validate-connection.js"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "src", "Utils", "validate-connection.ts"),
  path.join(__dirname, "..", "node_modules", "baileys", "lib", "Utils", "validate-connection.js"),
  path.join(__dirname, "..", "node_modules", "baileys", "src", "Utils", "validate-connection.ts"),
];

let patchedAnything = false;

for (const filePath of chatUtilsPaths) {
  patchedAnything =
    patchFile(
      filePath,
      [
        {
          search: /return\s+(?!await\s+)(mutationKeys\s*\()/g,
          replace: "return await $1",
          desc: "await mutationKeys"
        }
      ],
      "contacts.upsert fix"
    ) || patchedAnything;
}

for (const filePath of eventBufferPaths) {
  patchedAnything =
    patchFile(
      filePath,
      [
        {
          // Insere a função shouldIncrementChatUnread se ela não existir no arquivo
          // mas é referenciada em decrementChatReadCounterIfMsgDidUnread
          search: /\bshouldIncrementChatUnread\s*\(/g,
          replace: "((msg) => !msg?.key?.fromMe)(",
          desc: "inline shouldIncrementChatUnread"
        }
      ],
      "shouldIncrementChatUnread fix"
    ) || patchedAnything;
}

for (const filePath of validateConnectionPaths) {
  patchedAnything =
    patchFile(
      filePath,
      [
        {
          search: /(\bvalue\s*===\s*)14\b/g,
          replace: "$124",
          desc: "value === 24"
        },
        {
          search: /(\bvalue\s*!==\s*)14\b/g,
          replace: "$124",
          desc: "value !== 24"
        }
      ],
      "pairing-code validate-connection fix"
    ) || patchedAnything;
}

if (!patchedAnything) {
  console.log("⚠️  [PATCH-BAILEYS] Nenhum arquivo do Baileys encontrado para patch.");
  console.log("    Verifique se as dependências foram instaladas corretamente.");
} else {
  console.log("✅ [PATCH-BAILEYS] Rotina de patch concluída.");
}

// ─── Patch 3: handleMexNotification UPDATE undefined ─────────────────────────
const messagesRecvPaths = [
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "lib", "Socket", "messages-recv.js"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "lib", "Socket", "messages-recv.js"),
  path.join(__dirname, "..", "node_modules", "baileys", "lib", "Socket", "messages-recv.js"),
];

for (const filePath of messagesRecvPaths) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  // Fix 1: qualquer acesso a SyncdOperation.UPDATE sem optional chaining
  // Cobre: proto.SyncdMutation.SyncdOperation.UPDATE
  //        proto_1.proto.SyncdMutation.SyncdOperation.UPDATE
  //        WAProto.SyncdMutation.SyncdOperation.UPDATE  etc.
  const fix1 = content.replace(
    /(\w[\w_.]*SyncdOperation)\.UPDATE/g,
    "($1 && $1.UPDATE)"
  );
  if (fix1 !== content) {
    content = fix1;
    changed = true;
    console.log("✅ [PATCH-BAILEYS] SyncdOperation.UPDATE fix aplicado em: " + filePath);
  }

  // Fix 2: envolve qualquer chamada a handleMexNotification em try-catch
  // Cobre: await handleMexNotification(node)
  //        handleMexNotification(node)  (sem await)
  const fix2 = content.replace(
    /(await\s+handleMexNotification\s*\([^)]*\))/g,
    "await (async () => { try { $1; } catch(_mexErr) { console.warn('[MEX] handleMexNotification ignorado:', _mexErr && _mexErr.message); } })()"
  );
  if (fix2 !== content) {
    content = fix2;
    changed = true;
    console.log("✅ [PATCH-BAILEYS] handleMexNotification try-catch (await) aplicado em: " + filePath);
  }

  // Fix 3: fallback sem await
  const fix3 = content.replace(
    /(?<!await\s{0,10})\bhandleMexNotification\s*\([^)]*\)(?!\s*\))/g,
    (match) => {
      if (match.includes("_mexErr")) return match; // já patchado
      return `(function(){ try { ${match}; } catch(_mexErr){ console.warn('[MEX] handleMexNotification ignorado:', _mexErr && _mexErr.message); } })()`;
    }
  );
  if (fix3 !== content) {
    content = fix3;
    changed = true;
    console.log("✅ [PATCH-BAILEYS] handleMexNotification try-catch (sem await) aplicado em: " + filePath);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
  } else {
    // Verificar se o arquivo já contém o patch
    if (content.includes("_mexErr") || content.includes("SyncdOperation &&")) {
      console.log("✅ [PATCH-BAILEYS] handleMexNotification fix já estava aplicado em: " + filePath);
    } else {
      // Mostrar trecho ao redor de 'handleMexNotification' para diagnóstico
      const idx = content.indexOf("handleMexNotification");
      if (idx !== -1) {
        console.warn("⚠️  [PATCH-BAILEYS] Não foi possível aplicar o patch em: " + filePath);
        console.warn("    Trecho encontrado:", content.substring(Math.max(0, idx - 20), idx + 80).replace(/\n/g, " "));
      } else {
        console.log("ℹ️  [PATCH-BAILEYS] handleMexNotification não encontrado em: " + filePath);
      }
    }
  }
}

// ─── Patch 4: updateBlockStatus — formato correto do IQ stanza ───────────────
// O fork usa tag:'item' com attrs.action, mas o protocolo WA v7 espera
// tag:'block'|'unblock' diretamente, sem wrapper <list>.
// Formato correto: content: [{ tag: action, attrs: { jid } }]
const chatsPaths = [
  path.join(__dirname, "..", "node_modules", "@itsukichan", "baileys", "lib", "Socket", "chats.js"),
  path.join(__dirname, "..", "node_modules", "@whiskeysockets", "baileys", "lib", "Socket", "chats.js"),
  path.join(__dirname, "..", "node_modules", "baileys", "lib", "Socket", "chats.js"),
];

const badBlockIq = `content: [
                {
                    tag: 'item',
                    attrs: {
                        action,
                        jid
                    }
                }
            ]`;

const fixedBlockIq = `content: [
                {
                    tag: action,
                    attrs: {
                        jid
                    }
                }
            ]`;

for (const filePath of chatsPaths) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes(fixedBlockIq)) {
    console.log("✅ [PATCH-BAILEYS] updateBlockStatus fix já aplicado em: " + filePath);
    continue;
  }
  if (content.includes(badBlockIq)) {
    content = content.replace(badBlockIq, fixedBlockIq);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ [PATCH-BAILEYS] updateBlockStatus fix aplicado em: " + filePath);
  } else {
    console.warn("⚠️  [PATCH-BAILEYS] updateBlockStatus — padrão não encontrado em: " + filePath);
  }
}

// ─── Patch 5: fetchProps bad-request não fatal em executeInitQueries ──────────
// O WhatsApp às vezes rejeita a query fetchProps com bad-request.
// Promise.all derruba todas as init queries. Tornamos fetchProps não-fatal.
for (const filePath of chatsPaths) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf-8");

  const alreadyPatched = content.includes("fetchProps().catch(");
  if (alreadyPatched) {
    console.log("✅ [PATCH-BAILEYS] fetchProps non-fatal fix já aplicado em: " + filePath);
    continue;
  }

  // Substitui fetchProps() por fetchProps().catch(...)  dentro de Promise.all
  const patched = content.replace(
    /(\bawait\s+Promise\.all\s*\(\s*\[[\s\S]*?)(fetchProps\s*\(\s*\))([\s\S]*?\]\s*\))/g,
    (match, before, call, after) => {
      return before + `fetchProps().catch(e => { logger && logger.warn({ err: e }, '[PATCH5] fetchProps falhou, continuando init'); })` + after;
    }
  );

  if (patched !== content) {
    fs.writeFileSync(filePath, patched, "utf-8");
    console.log("✅ [PATCH-BAILEYS] fetchProps non-fatal fix aplicado em: " + filePath);
  } else {
    console.warn("⚠️  [PATCH-BAILEYS] fetchProps — padrão não encontrado em: " + filePath);
  }
}
