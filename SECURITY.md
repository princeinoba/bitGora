# Security Policy

## Supported release

The current supported release is BitGora Market Lab 2.x.

It is a static portfolio demonstration with one read-only public market-reference Function.

## Reporting

Report a suspected vulnerability privately to:

```text
royceinoba@gmail.com
```

Do not include seed phrases, private keys, wallet credentials, payment proofs or identity documents in a report.

## Current security boundary

The release has:

- no account database;
- no password;
- no session;
- no public listing mutation;
- no upload;
- no live chat;
- no wallet connection;
- no payment;
- no escrow;
- no custody;
- no analytics.

Browser-local demonstration state is not considered a secure vault. Do not enter sensitive information.

## Market-reference Function

`GET /api/btc-rate` returns a normalized public BTC/CAD reference.

It:

- uses no secret;
- accepts no user data;
- is not a quote;
- is not a payment request;
- validates the provider response;
- times out;
- returns bounded errors;
- can be cached.

## Historical source warning

The uploaded historical project contained unsafe public-marketplace patterns including a hard-coded session secret, open Socket.IO origin, unauthenticated chat reads/writes, client-supplied message identity, missing post ownership enforcement, broad multipart upload handling and raw internal errors.

Those components are not part of this release.

Any historical credentials must be treated as compromised and rotated/revoked by their owner.

## Future live product

A live marketplace requires a separate security programme covering:

- identity and recovery;
- server authorization;
- moderation;
- fraud;
- messaging safety;
- audit logs;
- retention;
- incident response;
- secret management;
- backup/recovery;
- legal/financial review;
- threat modelling;
- penetration testing.

Do not add live mutations to this static application without that programme.
