import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import fs from "fs";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", alg: "RS256", ...publicKey }] });

const keysRust = await generateKeyPair("RS256", { extractable: true });
const privateKeyRust = await exportPKCS8(keysRust.privateKey);

fs.mkdirSync("./keys");
fs.writeFileSync("./keys/private.key", privateKey);
fs.writeFileSync("./keys/jwk.json", jwks);
fs.writeFileSync("./server/private.key", privateKeyRust);
