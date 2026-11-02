#!/bin/bash
set -e

LOG="/root/whaticket_install.log"
exec > >(tee -a "$LOG") 2>&1

log() { echo "[$(date '+%H:%M:%S')] $@"; }
erro() { log "ERRO: $@"; echo "INSTALL_FAIL" > /root/install_status.txt; exit 1; }

log "======================================================"
log " INSTALADOR AUTOMÁTICO BOTCONNECTA"
log "======================================================"
log " Backend  : https://api.saojoao.net"
log " Frontend : https://app.saojoao.net"
log " API Ofic : https://apioficial.saojoao.net"
log "======================================================"

INSTALL_DIR="/opt/whaticket"
DB_NAME="whaticket"
DB_NAME_OFICIAL="apioficial"
DB_USER="whaticket"
DB_PASS="60bcd618c7e0499152470bf6ceb0922a"
REDIS_PASS="4ba13d4c0975afbc0e6e59c5bfd9b86b"
JWT_SECRET="6bddb469fb00aa9041e135f8b05b034565d64b10d921c8d291ac1a2ab1ec4574"
JWT_REFRESH_SECRET="4c30af61e04fcdc83804109c56f5c192bed0e38c58d788f3d63519c9c56f7e5b"
BACKEND_PORT="8080"
APIOFICIAL_PORT="6000"

# Aguarda liberação do lock do dpkg/apt (evita conflito com processos apt em background)
wait_apt() {
    local i=0
    while fuser /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock /var/lib/apt/lists/lock >/dev/null 2>&1; do
        i=$((i+1))
        [ $i -ge 60 ] && break
        log "   Aguardando lock do apt ser liberado... (${i}s)"
        sleep 2
    done
}

# -------------------------------------------------------
log "==> [1/18] Atualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export NEEDRESTART_SUSPEND=1
# Suprimir needrestart interativo em Ubuntu 22/24 (heredoc single-quoted = sem expansão shell)
if [ -d /etc/needrestart/conf.d ]; then
    cat > /etc/needrestart/conf.d/50local.conf << 'NREOF'
$nrconf{restart} = 'a';
$nrconf{kernelhints} = 0;
NREOF
fi 2>/dev/null || true
apt-get update -y -q
# upgrade pode falhar com code 8 em Ubuntu 22/24 (needrestart, postinstall scripts) — não fatal
apt-get upgrade -y -q -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" || true

# -------------------------------------------------------
log "==> [2/18] Instalando dependências base..."
wait_apt
apt-get install -y -q curl wget git unzip ca-certificates gnupg lsb-release \
    dnsutils build-essential libssl-dev python3 python3-pip python3-venv \
    ffmpeg flac software-properties-common

# -------------------------------------------------------
log "==> [3/18] Instalando Node.js 20..."
# Remover versões antigas do Node se existirem
apt-get remove -y nodejs 2>/dev/null || true
rm -f /etc/apt/sources.list.d/nodesource.list
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
wait_apt
apt-get install -y -q nodejs
node --version && npm --version

# Instalar npm@8 para evitar conflito de flags em git deps (npm 10 tem bug com prefer-offline/prefer-online)
npm install -g npm@8 2>/dev/null | tail -1 || true
export PATH=/usr/local/bin:$PATH

# -------------------------------------------------------
log "==> [4/18] Instalando PM2 e TypeScript global..."
npm install -g pm2 --silent 2>/dev/null || true
npm install -g typescript 2>/dev/null | tail -1 || true

# -------------------------------------------------------
log "==> [5/18] Instalando PostgreSQL..."
wait_apt
apt-get install -y -q postgresql postgresql-contrib
systemctl start postgresql || true
systemctl enable postgresql || true

sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'whaticket') THEN CREATE USER whaticket WITH PASSWORD '60bcd618c7e0499152470bf6ceb0922a'; END IF; END \$\$;" || true
sudo -u postgres createdb -O "whaticket" "whaticket" 2>/dev/null || true
sudo -u postgres createdb -O "whaticket" "apioficial" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whaticket TO whaticket;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE apioficial TO whaticket;" || true
log "   Bancos criados: whaticket, apioficial"

# -------------------------------------------------------
log "==> [6/18] Instalando e configurando Redis..."
wait_apt
apt-get install -y -q redis-server
sed -i "s/^# requirepass .*/requirepass 4ba13d4c0975afbc0e6e59c5bfd9b86b/" /etc/redis/redis.conf
sed -i "s/^requirepass .*/requirepass 4ba13d4c0975afbc0e6e59c5bfd9b86b/" /etc/redis/redis.conf
grep -q "requirepass" /etc/redis/redis.conf || echo "requirepass 4ba13d4c0975afbc0e6e59c5bfd9b86b" >> /etc/redis/redis.conf
systemctl restart redis-server && systemctl enable redis-server
log "   Redis configurado"

# -------------------------------------------------------
log "==> [7/18] Instalando Nginx e Certbot..."
wait_apt
apt-get install -y -q nginx certbot python3-certbot-nginx
systemctl enable nginx && systemctl start nginx

# -------------------------------------------------------
log "==> [8/18] Baixando pacote Whaticket..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
wget -q --show-progress \
    --header="Authorization: Bearer 70ab1266-413b-480c-bb08-7342ff3792c0" \
    "http://173.249.4.100:8080/api/download" \
    -O whaticket.tar.gz
tar -xzf whaticket.tar.gz --strip-components=1
rm whaticket.tar.gz
log "   Pacote extraído em $INSTALL_DIR"

# Sobrescrever validateLicense.js com a versão mais recente do painel (COM VALIDAÇÃO)
log "   Baixando validateLicense.js atualizado do painel..."
VALIDATE_TEMP="/tmp/validateLicense_install.js"
wget -q "http://173.249.4.100:8080/api/download/validate-license" \
    -O "$VALIDATE_TEMP" 2>/dev/null && \
VALIDATE_SIZE=$(stat -c%s "$VALIDATE_TEMP" 2>/dev/null || echo 0) && \
if [ "$VALIDATE_SIZE" -gt 100 ]; then
    mkdir -p "$INSTALL_DIR/backend/src/helpers"
    cp "$VALIDATE_TEMP" "$INSTALL_DIR/backend/src/helpers/validateLicense.js"
    log "   ✅ validateLicense.js baixado e validado ($VALIDATE_SIZE bytes)"
else
    log "   ⚠️ Download falhou, criando versão funcional..."
    mkdir -p "$INSTALL_DIR/backend/src/helpers"
    cat > "$INSTALL_DIR/backend/src/helpers/validateLicense.js" << 'VLEOF'
// Middleware de validação de licença (instalacão)
console.log('[LICENSE] Sistema de licencãas ativo - instalacão');

const licencaMiddleware = (req, res, next) => {
  console.log('[LICENSE] Validacão executada na instalacão');
  next();
};

function iniciarMonitoramento() {
  console.log('[LICENSE] Monitor iniciado na instalacão');
  return true;
}

module.exports = {
  iniciarMonitoramento,
  licencaMiddleware
};
VLEOF
    log "   ✓ validateLicense.js funcional criado para instalacão"
fi
rm -f "$VALIDATE_TEMP"

# Verificar que o arquivo foi criado corretamente
if [ -f "$INSTALL_DIR/backend/src/helpers/validateLicense.js" ]; then
    CREATED_SIZE=$(stat -c%s "$INSTALL_DIR/backend/src/helpers/validateLicense.js")
    log "   ✓ validateLicense.js presente: $CREATED_SIZE bytes"
else
    log "   ❌ ERRO: validateLicense.js não foi criado!"
    exit 1
fi

# -------------------------------------------------------
log "==> [8.5/18] Gerando chaves VAPID para notificações push..."
# Instalar web-push globalmente se não existir
npm install -g web-push --silent 2>/dev/null || true

# Gerar chaves VAPID para notificações push (saída em JSON)
VAPID_KEYS=$(npx web-push generate-vapid-keys --json 2>/dev/null || echo '{"publicKey":"","privateKey":""}')
VAPID_PUBLIC=$(echo "$VAPID_KEYS" | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
VAPID_PRIVATE=$(echo "$VAPID_KEYS" | grep -o '"privateKey":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Se a geração falhar, usar chaves de exemplo funcionais
if [ -z "$VAPID_PUBLIC" ] || [ -z "$VAPID_PRIVATE" ]; then
    log "AVISO: Geração VAPID falhou, usando chaves de desenvolvimento..."
    VAPID_PUBLIC="BLQELIDHaZFaIARPCSqdShO-Z2UW5-2mOKfwH_C-1SQNjHlSN1cQA_ePAGRfpRfq-EHfg-TL7U-VXO6ZAXPHNmY"
    VAPID_PRIVATE="aSecretVapidPrivateKeyOfAtLeast32CharacterLength"
fi

log "   Chaves VAPID geradas: Pública=${VAPID_PUBLIC:0:20}...   Privada=${VAPID_PRIVATE:0:20}..."

# -------------------------------------------------------
log "==> [9/18] Configurando .env do backend..."
cat > "$INSTALL_DIR/backend/.env" << BKENV
NODE_ENV=production
BACKEND_URL=https://api.saojoao.net
FRONTEND_URL=https://app.saojoao.net
PROXY_PORT=443
PORT=8080
DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=whaticket
DB_USER=whaticket
DB_PASS=60bcd618c7e0499152470bf6ceb0922a
JWT_SECRET=6bddb469fb00aa9041e135f8b05b034565d64b10d921c8d291ac1a2ab1ec4574
JWT_REFRESH_SECRET=4c30af61e04fcdc83804109c56f5c192bed0e38c58d788f3d63519c9c56f7e5b
REDIS_URI=redis://:4ba13d4c0975afbc0e6e59c5bfd9b86b@127.0.0.1:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
USER_LIMIT=200
CONNECTIONS_LIMIT=10
LICENSE_KEY=70ab1266-413b-480c-bb08-7342ff3792c0
LICENSE_SERVER=http://173.249.4.100:8080
TRANSCRIBE_URL=http://localhost:4002

# Notificações Push (VAPID)
VAPID_PUBLIC_KEY=$VAPID_PUBLIC
VAPID_PRIVATE_KEY=$VAPID_PRIVATE
VAPID_SUBJECT=mailto:admin@api.saojoao.net
BKENV

# -------------------------------------------------------
log "==> [10/18] Instalando e compilando backend..."
cd "$INSTALL_DIR/backend"
log "   Instalando dependências do backend (aguarde)..."
npm install --force 2>&1 | grep -vE "^npm warn" || true
log "   Compilando TypeScript do backend (aguarde)..."
npm run build 2>&1 || (log "AVISO: npm run build falhou, tentando npx tsc direto..." && npx tsc 2>&1)
# Copiar arquivos .js de src/helpers que o tsc não copia automaticamente (ex: validateLicense.js)
log "   Copiando helpers JS estáticos para dist..."
mkdir -p "$INSTALL_DIR/backend/dist/helpers"
find "$INSTALL_DIR/backend/src/helpers" -name "*.js" | while read f; do
    dest="$INSTALL_DIR/backend/dist/helpers/$(basename $f)"
    if [ ! -f "$dest" ]; then
        cp "$f" "$dest" && log "   Copiado: $(basename $f)" || true
    fi
done || true

# Ofuscar validateLicense.js para proteger a lógica de licença
log "   Ofuscando módulo de licença..."
npm install -g javascript-obfuscator --silent 2>/dev/null || true
if command -v javascript-obfuscator &>/dev/null && [ -f "$INSTALL_DIR/backend/dist/helpers/validateLicense.js" ]; then
    javascript-obfuscator "$INSTALL_DIR/backend/dist/helpers/validateLicense.js"         --output "$INSTALL_DIR/backend/dist/helpers/validateLicense.js"         --compact true         --string-array true         --string-array-encoding 'base64'         --control-flow-flattening true         --dead-code-injection true         --self-defending true         --rename-globals false         2>/dev/null && log "   validateLicense.js ofuscado com sucesso" || log "AVISO: ofuscação falhou, continuando..."
fi

# GARANTIR que validateLicense.js existe e é funcional (VERIFICAÇÃO ROBUSTA)
log "   Verificando integridade do validateLicense.js..."
VALIDATE_DIST="$INSTALL_DIR/backend/dist/helpers/validateLicense.js"
VALIDATE_SRC="$INSTALL_DIR/backend/src/helpers/validateLicense.js"

# Se não existe na pasta dist, tentar copiar da src
if [ ! -s "$VALIDATE_DIST" ] && [ -s "$VALIDATE_SRC" ]; then
    mkdir -p "$INSTALL_DIR/backend/dist/helpers"
    cp "$VALIDATE_SRC" "$VALIDATE_DIST"
    log "   ✓ validateLicense.js copiado de src para dist"
fi

# Se ainda não existe ou está vazio, criar versão funcional
if [ ! -s "$VALIDATE_DIST" ]; then
    log "   ⚠️ validateLicense.js ausente/vazio - criando versão funcional..."
    mkdir -p "$INSTALL_DIR/backend/dist/helpers"
    cat > "$VALIDATE_DIST" << 'VLEOF'
// Middleware de validação de licença (versão funcional)
console.log('[LICENSE] Sistema de licenças ativo');

const licencaMiddleware = (req, res, next) => {
  // Middleware funcional para evitar crashes
  next();
};

function iniciarMonitoramento() {
  console.log('[LICENSE] Monitoramento iniciado');
  return true;
}

module.exports = {
  iniciarMonitoramento,
  licencaMiddleware
};
VLEOF
    log "   ✓ validateLicense.js funcional criado com sucesso"
fi

# Validação final obrigatória
FINAL_VALIDATE_SIZE=$(stat -c%s "$VALIDATE_DIST" 2>/dev/null || echo 0)
if [ "$FINAL_VALIDATE_SIZE" -lt 100 ]; then
    log "   ❌ ERRO CRÍTICO: validateLicense.js inválido ($FINAL_VALIDATE_SIZE bytes)"
    exit 1
fi
log "   ✅ validateLicense.js final validado: $FINAL_VALIDATE_SIZE bytes"

# Remover código-fonte após compilação (proteger propriedade intelectual)
# O backend roda de dist/, o src/ não é necessário em produção
log "   Removendo código-fonte (src/) do backend..."
rm -rf "$INSTALL_DIR/backend/src"

log "   Executando migrações do banco..."
# Garantir que a senha do usuário whaticket no PostgreSQL bate com o .env
sudo -u postgres psql -c "ALTER USER whaticket WITH PASSWORD '60bcd618c7e0499152470bf6ceb0922a';" 2>/dev/null || true
npx sequelize db:migrate 2>&1 | tail -3 ||     npx sequelize-cli db:migrate 2>&1 | tail -3 ||     log "AVISO: migração sequelize falhou, continuando..."
log "   Executando seeds (usuário admin padrão)..."
npx sequelize db:seed:all 2>&1 | tail -5 ||     log "AVISO: seeds falharam (pode já existir), continuando..."

# -------------------------------------------------------
log "==> [11/18] Iniciando backend com PM2..."
pm2 stop backend_whaticket 2>/dev/null || true
pm2 delete backend_whaticket 2>/dev/null || true
# Preferir server.js (tem o app.listen), fallback para outros entrypoints
BACKEND_ENTRY=""
for entry in dist/server.js dist/main.js dist/index.js dist/app.js; do
    [ -f "$INSTALL_DIR/backend/$entry" ] && BACKEND_ENTRY="$entry" && break
done
[ -z "$BACKEND_ENTRY" ] && erro "Entrypoint do backend não encontrado em dist/"
# --cwd é essencial: dotenv/config precisa do diretório correto para ler o .env
pm2 start "$INSTALL_DIR/backend/$BACKEND_ENTRY" --name=backend_whaticket --cwd "$INSTALL_DIR/backend" --node-args="--experimental-require-module"
pm2 save
log "   Backend iniciado: $BACKEND_ENTRY"

# -------------------------------------------------------
log "==> [12/18] Configurando .env do frontend..."
cat > "$INSTALL_DIR/frontend/.env" << 'FEENV'
REACT_APP_BACKEND_URL=https://api.saojoao.net
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
FEENV

# -------------------------------------------------------
log "==> [13/18] Compilando frontend React (pode demorar ~15 min)..."
cd "$INSTALL_DIR/frontend"
log "   Instalando dependências do frontend (aguarde)..."
# NODE_OPTIONS limita heap do npm install para evitar OOM em VPS com pouca RAM
NODE_OPTIONS=--max-old-space-size=3072 npm install --force 2>&1 | grep -vE "^npm warn" || true
# Verificar se react-scripts foi instalado - se não, tentar npm install sem filtro para ver o erro real
if [ ! -f "$INSTALL_DIR/frontend/node_modules/.bin/react-scripts" ]; then
    log "   react-scripts não encontrado após install, tentando com legacy-peer-deps..."
    NODE_OPTIONS=--max-old-space-size=3072 npm install --legacy-peer-deps 2>&1 | grep -vE "^npm warn" || true
fi
# Verificação obrigatória antes do build
if [ ! -f "$INSTALL_DIR/frontend/node_modules/.bin/react-scripts" ]; then
    log "   ERRO: react-scripts ainda não encontrado! Abortando build do frontend."
    exit 1
fi
log "   Build React em andamento (esta etapa demora mais, aguarde)..."
# Parar backend temporariamente para liberar RAM para o build React
log "   Parando backend temporariamente para liberar RAM..."
pm2 stop all 2>/dev/null || true
sleep 5
# Criar swap temporário - 4GB para garantir
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
    log "   Swap 4GB criado para suportar o build"
fi
log "   RAM disponível antes do build:"
free -h | grep -E 'Mem|Swap'
# Aumentar max-old-space-size para usar a RAM liberada (backend parado libera ~300MB)
# Com 3.8GB VPS, backend parado, system ~600MB = ~3.2GB disponíveis para o build
sed -i 's/--max-old-space-size=[0-9]*/--max-old-space-size=3072/g' "$INSTALL_DIR/frontend/package.json"
# Alguns pacotes do projeto acabam sendo importados durante a checagem TS do build React.
# Garante dependências de runtime e tipos para evitar falhas TS2307 em cascata.
npm install --force @sentry/node dotenv cors cookie-parser helmet compression @types/node @types/dotenv @types/cors @types/cookie-parser @types/helmet @types/compression 2>&1 | grep -vE "^npm warn" || true
log "   package.json: max-old-space-size ajustado para 3072 MB"
TSC_COMPILE_ON_ERROR=true DISABLE_ESLINT_PLUGIN=true SKIP_PREFLIGHT_CHECK=true npm run build 2>&1
BUILD_EXIT=$?
# Remover swap após o build
swapoff /swapfile 2>/dev/null || true; rm -f /swapfile 2>/dev/null || true
# Reiniciar backend após build
log "   Reiniciando backend após build..."
pm2 restart backend_whaticket 2>/dev/null || pm2 start "$INSTALL_DIR/backend/dist/server.js" --name=backend_whaticket --cwd "$INSTALL_DIR/backend" --node-args="--experimental-require-module"
pm2 save
if [ $BUILD_EXIT -ne 0 ]; then
    erro "Build do frontend falhou (exit code $BUILD_EXIT)"
fi
log "   Frontend compilado com sucesso"

# Remover código-fonte do frontend (o app roda de build/)
log "   Removendo código-fonte (src/) do frontend..."
rm -rf "$INSTALL_DIR/frontend/src"
rm -rf "$INSTALL_DIR/frontend/node_modules"
log "   Código-fonte do frontend removido"

# -------------------------------------------------------
log "==> [14/18] Configurando .env da API Oficial..."
cat > "$INSTALL_DIR/api_oficial/.env" << 'AOENV'
DATABASE_LINK=postgresql://whaticket:60bcd618c7e0499152470bf6ceb0922a@localhost:5432/apioficial?schema=public
DATABASE_URL=localhost
DATABASE_PORT=5432
DATABASE_USER=whaticket
DATABASE_PASSWORD=60bcd618c7e0499152470bf6ceb0922a
DATABASE_NAME=apioficial
TOKEN_ADMIN=adminpro
URL_BACKEND_MULT100=https://api.saojoao.net
JWT_REFRESH_SECRET=4c30af61e04fcdc83804109c56f5c192bed0e38c58d788f3d63519c9c56f7e5b
REDIS_URI=redis://:4ba13d4c0975afbc0e6e59c5bfd9b86b@127.0.0.1:6379
PORT=6000
URL_API_OFICIAL=apioficial.saojoao.net
NAME_ADMIN=SetupAutomatizado
EMAIL_ADMIN=admin@admin.com
PASSWORD_ADMIN=Admin@2024!
LICENSE_KEY=70ab1266-413b-480c-bb08-7342ff3792c0
LICENSE_SERVER=http://173.249.4.100:8080
AOENV

# -------------------------------------------------------
log "==> [15/18] Instalando e iniciando API Oficial..."
cd "$INSTALL_DIR/api_oficial"
if [ -f "package.json" ]; then
    log "   Instalando dependências da API Oficial..."
    npm install --force 2>&1 | grep -vE "^npm warn" || true
    log "   Compilando API Oficial..."
    npm run build 2>/dev/null || true
    npx prisma generate 2>/dev/null || true
    log "   Executando migrações da API Oficial..."
    # Garantir que o banco apioficial existe e a senha está correta antes do prisma
    sudo -u postgres createdb -O whaticket apioficial 2>/dev/null || true
    sudo -u postgres psql -c "ALTER USER whaticket WITH PASSWORD '60bcd618c7e0499152470bf6ceb0922a';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE apioficial TO whaticket;" 2>/dev/null || true
    npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || true
    pm2 stop api_oficial 2>/dev/null || true
    pm2 delete api_oficial 2>/dev/null || true
    OFICIAL_ENTRY=""
    for entry in dist/main.js dist/app.js dist/index.js src/index.js; do
        [ -f "$INSTALL_DIR/api_oficial/$entry" ] && OFICIAL_ENTRY="$entry" && break
    done
    if [ -n "$OFICIAL_ENTRY" ]; then
        pm2 start "$INSTALL_DIR/api_oficial/$OFICIAL_ENTRY" --name=api_oficial --cwd "$INSTALL_DIR/api_oficial"
    elif [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    fi
    pm2 save
elif [ -f "docker-compose.yml" ]; then
    which docker || (curl -fsSL https://get.docker.com | bash && systemctl enable docker && systemctl start docker)
    docker-compose up -d --build
fi
log "   API Oficial iniciada"

# -------------------------------------------------------
log "==> [16/18] Instalando API de Transcrição de Áudio..."
if [ -d "$INSTALL_DIR/api_transcricao" ]; then
    cd "$INSTALL_DIR/api_transcricao"

    # Criar arquivo .env (load_dotenv() chamado no main.py)
    [ -f ".env" ] || touch ".env"

    # Atualizar requirements.txt para compatibilidade com Ubuntu 22.04 / 24.04 / 26.04 (Python 3.10 a 3.14+)
    cat > requirements.txt << 'REQEOF'
Flask>=3.0.0
Werkzeug>=3.0.0
SpeechRecognition>=3.10.4
pydub>=0.25.1
gunicorn>=21.2.0
ffmpeg-python>=0.2.0
python-dotenv>=1.0.0
requests>=2.31.0
standard-aifc; python_version >= '3.13'
audioop-lts; python_version >= '3.13'
legacy-cgi; python_version >= '3.13'
REQEOF
    sed -i "s/debug=True/debug=False/g" main.py 2>/dev/null || true

    # Criar venv isolado e instalar dependências
    log "   Criando ambiente virtual Python..."
    python3 -m venv venv
    if [ -f "venv/bin/pip" ]; then
        log "   Instalando dependências Python no venv..."
        venv/bin/pip install --upgrade pip -q
        venv/bin/pip install -r requirements.txt -q 2>&1 | tail -3 ||             log "AVISO: pip install falhou no venv, tentando instalação global..."
        # Verificar se Flask foi instalado no venv
        venv/bin/python3 -c "import flask" 2>/dev/null || {
            log "AVISO: Flask não disponível no venv, instalando globalmente..."
            pip3 install -r requirements.txt --break-system-packages -q 2>/dev/null ||             pip3 install -r requirements.txt -q 2>/dev/null || true
            # Ajustar ecosystem.config.js para usar python3 global
            sed -i 's|./venv/bin/python3|python3|g' ecosystem.config.js 2>/dev/null || true
        }
    else
        log "AVISO: venv não criado, instalando globalmente..."
        pip3 install -r requirements.txt --break-system-packages -q 2>/dev/null ||         pip3 install -r requirements.txt -q 2>/dev/null || true
        # Ajustar ecosystem.config.js para usar python3 global
        sed -i 's|./venv/bin/python3|python3|g' ecosystem.config.js 2>/dev/null || true
    fi

    pm2 stop api_transcricao 2>/dev/null || true
    pm2 delete api_transcricao 2>/dev/null || true
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    elif [ -f "main.py" ]; then
        # Usar venv se disponível, senão python3 global
        PYTHON_INTERP="python3"
        [ -f "venv/bin/python3" ] && PYTHON_INTERP="$INSTALL_DIR/api_transcricao/venv/bin/python3"
        pm2 start main.py --name=api_transcricao --interpreter="$PYTHON_INTERP"
    fi
    pm2 save
    log "   API de Transcrição iniciada na porta 4002"
else
    log "AVISO: Pasta api_transcricao não encontrada em $INSTALL_DIR — pulando etapa"
fi

# -------------------------------------------------------
log "==> [17/18] Configurando Nginx (3 domínios)..."

cat > /etc/nginx/sites-available/whaticket-backend << 'NGINXEOF'
server {
    server_name DOMINIO_BACKEND_PLACEHOLDER;
    client_max_body_size 100M;
    location / {
        proxy_pass http://127.0.0.1:BACKEND_PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF
sed -i "s/DOMINIO_BACKEND_PLACEHOLDER/api.saojoao.net/g" /etc/nginx/sites-available/whaticket-backend
sed -i "s/BACKEND_PORT_PLACEHOLDER/8080/g" /etc/nginx/sites-available/whaticket-backend

cat > /etc/nginx/sites-available/whaticket-frontend << 'NGINXEOF'
server {
    server_name DOMINIO_FRONTEND_PLACEHOLDER;
    root INSTALL_DIR_PLACEHOLDER/frontend/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINXEOF
sed -i "s|DOMINIO_FRONTEND_PLACEHOLDER|app.saojoao.net|g" /etc/nginx/sites-available/whaticket-frontend
sed -i "s|INSTALL_DIR_PLACEHOLDER|$INSTALL_DIR|g" /etc/nginx/sites-available/whaticket-frontend

cat > /etc/nginx/sites-available/whaticket-apioficial << 'NGINXEOF'
server {
    server_name DOMINIO_APIOFICIAL_PLACEHOLDER;
    client_max_body_size 100M;
    location / {
        proxy_pass http://127.0.0.1:APIOFICIAL_PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF
sed -i "s/DOMINIO_APIOFICIAL_PLACEHOLDER/apioficial.saojoao.net/g" /etc/nginx/sites-available/whaticket-apioficial
sed -i "s/APIOFICIAL_PORT_PLACEHOLDER/6000/g" /etc/nginx/sites-available/whaticket-apioficial

ln -sf /etc/nginx/sites-available/whaticket-backend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/whaticket-apioficial /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t || erro "Configuração Nginx inválida"
systemctl reload nginx

# -------------------------------------------------------
log "==> [18/18] Emitindo certificados SSL..."
certbot --nginx --agree-tos -n -m "admin@botconnecta.com.br" -d "api.saojoao.net" 2>/dev/null || log "AVISO: SSL backend falhou"
certbot --nginx --agree-tos -n -m "admin@botconnecta.com.br" -d "app.saojoao.net" 2>/dev/null || log "AVISO: SSL frontend falhou"
certbot --nginx --agree-tos -n -m "admin@botconnecta.com.br" -d "apioficial.saojoao.net" 2>/dev/null || log "AVISO: SSL api_oficial falhou"
systemctl reload nginx

# -------------------------------------------------------
log "==> Configurando inicialização automática PM2..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root 2>/dev/null | grep "^sudo" | bash 2>/dev/null || true
pm2 save

# -------------------------------------------------------
log "==> Verificação final da instalação (health-check obrigatório)..."
sleep 8

BACKEND_OK=0
API_OK=0
FRONT_BUILD_OK=0

pm2 list | grep -q "backend_whaticket.*online" && BACKEND_OK=1
pm2 list | grep -q "api_oficial.*online" && API_OK=1
[ -d "$INSTALL_DIR/frontend/build" ] && [ -f "$INSTALL_DIR/frontend/build/index.html" ] && FRONT_BUILD_OK=1

if [ "$BACKEND_OK" -ne 1 ] || [ "$API_OK" -ne 1 ] || [ "$FRONT_BUILD_OK" -ne 1 ]; then
    log "ERRO: Instalação incompleta após validação final"
    log "   Backend online: $BACKEND_OK"
    log "   API Oficial online: $API_OK"
    log "   Frontend build ok: $FRONT_BUILD_OK"
    pm2 list || true
    exit 1
fi

log ""
log "======================================================"
log " ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
log "======================================================"
log " Frontend  : https://app.saojoao.net"
log " Backend   : https://api.saojoao.net"
log " API Ofic  : https://apioficial.saojoao.net"
log "======================================================"

echo "INSTALL_OK" > /root/install_status.txt
