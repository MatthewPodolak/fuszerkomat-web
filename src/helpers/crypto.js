

export async function generateKeys(password) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  const signatureKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await exportKey(keyPair.publicKey, "spki");
  const privateKey = await exportKey(keyPair.privateKey, "pkcs8");
  const publicSignKey = await exportKey(signatureKeyPair.publicKey, "spki");
  const privateSignKey = await exportKey(signatureKeyPair.privateKey, "pkcs8");
  const encryptedPrivateKey = await encryptWithPassword(privateKey, password);
  const encryptedPrivateSignKey = await encryptWithPassword(privateSignKey, password);

  return { publicKey, privateKey, encryptedPrivateKey, publicSignKey, privateSignKey, encryptedPrivateSignKey };
}

async function exportKey(key, format) {
  const exported = await crypto.subtle.exportKey(format, key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function importPublicKey(base64Key) {
  return crypto.subtle.importKey("spki", fromBase64(base64Key), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}

async function importPrivateKey(base64Key) {
  return crypto.subtle.importKey("pkcs8", fromBase64(base64Key), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}

async function importSignPrivateKey(base64Key) {
  return crypto.subtle.importKey("pkcs8", fromBase64(base64Key), { name: "RSA-PSS", hash: "SHA-256" }, false, ["sign"]);
}

async function importSignPublicKey(base64Key) {
  return crypto.subtle.importKey("spki", fromBase64(base64Key), { name: "RSA-PSS", hash: "SHA-256" }, false, ["verify"]);
}

async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptWithPassword(plaintext, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const derivedKey = await deriveKeyFromPassword(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, encoder.encode(plaintext));

  const result = new Uint8Array(16 + 12 + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encrypted), 28);

  return toBase64(result);
}

export async function getPrivateKeyWithPswd(password, encryptedKey) {
  const data = fromBase64(encryptedKey);

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const derivedKey = await deriveKeyFromPassword(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, derivedKey, ciphertext);

  return new TextDecoder().decode(decrypted);
}

export async function EncryptMsg(msg, recipientPublicKey, ownPublicKey, privateSignKey) {
  const encoder = new TextEncoder();
  const signature = await Sign(msg, privateSignKey);

  const payload = JSON.stringify({ msg, signature });

  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedPayload = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoder.encode(payload));
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

  const recipientRsaKey = await importPublicKey(recipientPublicKey);
  const ownRsaKey = await importPublicKey(ownPublicKey);

  const keyForRecipient = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientRsaKey, rawAesKey);
  const keyForSender = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, ownRsaKey, rawAesKey);

  return {
    encryptedPayload: toBase64(encryptedPayload),
    keyForRecipient: toBase64(keyForRecipient),
    keyForSender: toBase64(keyForSender),
    iv: toBase64(iv),
  };
}

export async function Sign(msg, privateSignKey) {
  const encoder = new TextEncoder();
  const key = await importSignPrivateKey(privateSignKey);
  const signature = await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, key, encoder.encode(msg));
  return toBase64(signature);
}

export async function DecryptMsg(encryptedPayload, encryptedAesKey, iv, ownPrivateKey) {
  const rsaKey = await importPrivateKey(ownPrivateKey);
  const rawAesKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, rsaKey, fromBase64(encryptedAesKey));
  const aesKey = await crypto.subtle.importKey("raw", rawAesKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv) }, aesKey, fromBase64(encryptedPayload));

  const { msg, signature } = JSON.parse(new TextDecoder().decode(decrypted));

  return { msg, signature };
}

export async function CheckSignature(msg, signature, senderPublicSignKey) {
  const encoder = new TextEncoder();
  const key = await importSignPublicKey(senderPublicSignKey);
  return crypto.subtle.verify({ name: "RSA-PSS", saltLength: 32 }, key, fromBase64(signature), encoder.encode(msg));
}

export async function DecryptAndVerify(message, myUserId, myPrivateKey, senderPublicSignKey) {
  const encryptedAesKey = message.senderId === myUserId ? message.keyForSender : message.keyForRecipient;

  const { msg, signature } = await DecryptMsg(message.encryptedPayload, encryptedAesKey, message.iv, myPrivateKey);

  const isValid = await CheckSignature(msg, signature, senderPublicSignKey);

  return { msg, isValid };
}