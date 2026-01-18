<div align="center">
    Yet another CRUD application - that was the university assignment. However, to make it less soul-crushing and actually learn something along the way, I've added real-time chat with hybrid RSA+AES E2E encryption over gRPC streams. Is it overkill for a "find a handyman" app? Absolutely. Will anyone ever send messages sensitive enough to need military-grade encryption? Probably not. But the server genuinely cannot read your conversations, and that's pretty cool. Also, I got to pretend I'm building Signal for a few weeks instead of another TODO LIST with extra steps ;p
</div>

<br><br>

<p align="center"> https://fuszerkomat.ovh </p>

<br><br>

<p align="center">
  <img src="https://fuszerkomat.ovh/tasks/react.png" width="90" />
  <img src="https://fuszerkomat.ovh/tasks/plus.png" width="60" />
  <img src="https://fuszerkomat.ovh/tasks/tailwind.png" width="90" />
  <img src="https://fuszerkomat.ovh/tasks/plus.png" width="60" />
  <img src="https://fuszerkomat.ovh/tasks/daisy.png" width="90" />
</p>
<p align="center">
  <img src="https://fuszerkomat.ovh/tasks/dotnet.png" width="90" />
  <img src="https://fuszerkomat.ovh/tasks/plus.png" width="60" />
  <img src="https://fuszerkomat.ovh/tasks/mongo.png" width="120" />
  <img src="https://fuszerkomat.ovh/tasks/plus.png" width="60" />
  <img src="https://fuszerkomat.ovh/tasks/mssql.png" width="90" />
</p>

<br><br>

<img src="https://fuszerkomat.ovh/tasks/encryption.png" width="240" />

<div align="center">
  <i>Messages stored in mongo. Private keys encrypted with user password (PBKDF2 + AES-GCM) and stored in SQL for cross-device retrieval. Real-time msgs delivery over gRPC streams</i>
</div>

```mermaid
flowchart TB
    A1["'HI HELLLO MSG'"]
    A2["<b>Sign with RSA-PSS</b><br/>(A private key)"]
    A3["<b>Create payload</b><br/>{ msg, signature }"]
    A4["<b>Generate AES-256 key + IV</b>"]
    A5["<b>Encrypt payload</b><br/>AES-GCM"]
    A6["<b>Encrypt AES key with RSA-OAEP</b><br/>B public key = keyForRecipient<br/> A public key = keyForSender"]
    P1[/"{ encryptedPayload, keyForRecipient, keyForSender, iv }"/]
    S1["SERVER"]
    B1["<b>Decrypt AES key</b><br/>with RSA-OAEP <br> (B private key)"]
    B2["<b>Decrypt payload</b><br/>with AES-GCM"]
    B3["<b>Verify signature</b><br/>with RSA-PSS <br> (A public key)"]
    B4["'HI HELLO MSG'"]

    A1 --> A2 --> A3 --> A4 --> A5 --> A6
    A6 --> P1 --> S1
    S1 --> B1 --> B2 --> B3 --> B4

    classDef userA fill:#4ade80,stroke:#16a34a,color:#000
    classDef server fill:#f87171,stroke:#dc2626,color:#000
    classDef userB fill:#60a5fa,stroke:#2563eb,color:#000
    classDef payload fill:#fbbf24,stroke:#d97706,color:#000

    class A1,A2,A3,A4,A5,A6 userA
    class S1 server
    class B1,B2,B3,B4 userB
    class P1 payload
```
