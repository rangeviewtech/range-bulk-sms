# Incident Investigation Playbook

This document provides operational guidelines for utilizing the Forensic Audit System in the event of a security incident.

## 1. Initial Assessment & Querying

If anomalous behavior is detected (e.g., via the security monitoring cron), start by identifying the `traceId` or `actorId` involved.

```sql
-- Find all actions by a specific user across all modules
SELECT "recordedAt", "eventName", "outcome", "severity" 
FROM "AuditLog" 
WHERE "actorId" = 'user_uuid' 
ORDER BY "recordedAt" DESC;
```

## 2. Investigating Account Takeovers

If an account is suspected to be compromised, trace the session and password reset events:

```sql
SELECT * FROM "AuditLog"
WHERE "actorId" = 'user_uuid' 
AND "eventName" IN ('PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_SUCCESS', 'LOGIN_SUCCESS', 'LOGIN_FAILED')
ORDER BY "recordedAt" DESC;
```
*Look for:* Multiple `PASSWORD_RESET_REQUESTED` without successes, or a `PASSWORD_RESET_SUCCESS` followed immediately by unexpected IP logins or mass CRUD operations.

## 3. Investigating Data Destruction

If data has been deleted, identify the transaction that caused the deletion and look for the `transactionId` or `actorId`:

```sql
SELECT "actorId", "sourceIp", "resourceType", "resourceId", "changedFields"
FROM "AuditLog"
WHERE "action" = 'DELETE'
ORDER BY "recordedAt" DESC
LIMIT 100;
```

## 4. Verifying Cryptographic Integrity

To prove that the audit logs have not been tampered with since they were written, you can re-calculate the SHA-256 hashes of the sequence:

1. Retrieve the chain of logs.
2. For each log, compute: `SHA256(eventName + actorId + timestamp + previousHash)`
3. Compare the computed hash with the stored `hash`.
4. If a hash mismatch is found, all subsequent logs must be treated as potentially compromised or manipulated by an internal actor with direct DB access.

## 5. Escalation

If tampering is detected or an active breach is ongoing:
1. Revoke the suspected user's sessions immediately (`/admin/users`).
2. Suspend API keys if applicable.
3. Review firewall rules for anomalous IPs.
