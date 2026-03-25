/**
 * In-memory store para códigos de verificação de e-mail no cadastro.
 * Cada entrada expira em 10 minutos. Após verificação, o token de confirmação
 * tem validade de 1 hora para concluir o cadastro.
 */

interface CodeEntry {
    code: string;
    name: string;
    expiresAt: number;
    verified: boolean;
    verificationToken?: string;
}

const store = new Map<string, CodeEntry>();

function generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export function setCode(email: string, name: string): string {
    const code = generateCode();
    store.set(email.toLowerCase(), {
        code,
        name,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
        verified: false
    });
    return code;
}

export function verifyCode(email: string, code: string): string | null {
    const entry = store.get(email.toLowerCase());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(email.toLowerCase());
        return null;
    }
    if (entry.code !== code) return null;
    const token =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
    entry.verified = true;
    entry.verificationToken = token;
    // Estender validade por mais 1h para concluir o cadastro
    entry.expiresAt = Date.now() + 60 * 60 * 1000;
    store.set(email.toLowerCase(), entry);
    return token;
}

export function checkVerification(email: string, token: string): boolean {
    const entry = store.get(email.toLowerCase());
    if (!entry || !entry.verified || entry.verificationToken !== token)
        return false;
    if (Date.now() > entry.expiresAt) {
        store.delete(email.toLowerCase());
        return false;
    }
    return true;
}

export function clearVerification(email: string): void {
    store.delete(email.toLowerCase());
}
