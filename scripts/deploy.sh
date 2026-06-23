#!/usr/bin/env bash
# Deploy do editor estático + writer pra VPS Wolf (orcamento.wolfpacks.com.br).
# Idempotente. Roda do Mac. Pré: `npm run build:viewer && npm run build` já feitos.
#
# Estrutura no host:
#   /opt/static/orcamento        -> dist (servido pelo Caddy, file_server)
#   /opt/static/orcamento/p      -> propostas publicadas (NÃO apagar no deploy)
#   /opt/apps/orcamento-publish  -> writer service (container node, loopback 8132)
set -euo pipefail

HOST="${HOST:-netto@2.25.186.194}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

[ -d "$HERE/dist" ] || { echo "dist/ ausente — rode: npm run build:viewer && npm run build"; exit 1; }

echo "→ enviando dist…"
rsync -az --delete "$HERE/dist/" "$HOST:/tmp/orcamento-dist/"

echo "→ enviando writer…"
scp -q "$HERE/scripts/publish-server.mjs" "$HOST:/tmp/publish-server.mjs"

ssh "$HOST" 'set -e
  # dist: preserva /p (propostas) e robots.txt
  sudo rsync -a --delete --exclude p --exclude robots.txt /tmp/orcamento-dist/ /opt/static/orcamento/
  sudo chown -R caddy:caddy /opt/static/orcamento
  sudo chmod -R a+rX /opt/static/orcamento
  # CRÍTICO: o chown -R acima reverte /p; sob userns-remap o container (uid 100000)
  # perde escrita -> publish dá EACCES. Re-chowna sempre.
  sudo chown -R 100000:100000 /opt/static/orcamento/p
  sudo chmod 755 /opt/static/orcamento/p
  # writer: atualiza código e recria se mudou
  sudo cp /tmp/publish-server.mjs /opt/apps/orcamento-publish/publish-server.mjs
  cd /opt/apps/orcamento-publish && sudo docker compose up -d
  echo "deploy OK"
  sudo docker ps --filter name=orcamento_publish --format "{{.Status}}"
'
echo "→ smoke"
curl -s -o /dev/null -w "site: %{http_code}\n" https://orcamento.wolfpacks.com.br/
curl -s -o /dev/null -w "health: %{http_code}\n" https://orcamento.wolfpacks.com.br/health
