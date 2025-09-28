#!/usr/bin/env bash
set -euo pipefail

# ====== KONFIG ======
GRPC_HOST="38.96.255.34:51001"   # jika lewat TLS/Nginx: "da.example.com:443" (hapus -plaintext)
PLAIN="-plaintext"               # jika TLS, set PLAIN=""

MSG="remote-ok-$(date +%s)"
echo "ORIG=$MSG"

DATA_B64=$(printf '%s' "$MSG" | base64 -w0)
REQ_ID=$(grpcurl $PLAIN -d "{\"data\":\"$DATA_B64\"}" "$GRPC_HOST" disperser.Disperser.DisperseBlob | jq -r .requestId)
echo "requestId=$REQ_ID"

REQ=$(jq -n --arg id "$REQ_ID" '{requestId:$id}')
while true; do
  OUT=$(grpcurl $PLAIN -d "$REQ" "$GRPC_HOST" disperser.Disperser.GetBlobStatus")
  STATUS=$(echo "$OUT" | jq -r .status)
  ROOT=$(echo "$OUT"  | jq -r '.info.storage_root // .info.blobHeader.storageRoot // .info.storageRoot // empty')
  EPOCH=$(echo "$OUT" | jq -r '.info.epoch // .info.blobHeader.epoch // empty')
  QID=$(echo "$OUT"   | jq -r '.info.quorum_id // .info.blobHeader.quorumId // .info.quorumId // empty')
  echo "status=$STATUS root=${ROOT:-} epoch=${EPOCH:-} qid=${QID:-}"
  [[ -n "$ROOT" && -n "$EPOCH" && -n "$QID" ]] && break
  sleep 2
done

RREQ=$(jq -n --arg root "$ROOT" --argjson epoch "$EPOCH" --argjson qid "$QID" \
  '{storageRoot:$root, epoch:$epoch, quorumId:$qid}')
RET=$(grpcurl $PLAIN -d "$RREQ" "$GRPC_HOST" disperser.Disperser.RetrieveBlob | jq -r .data | base64 -d)
echo "GOT=$RET"
[[ "$RET" == "$MSG" ]] && echo "OK ✅" || { echo "MISMATCH ❌"; exit 1; }
