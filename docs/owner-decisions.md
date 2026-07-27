# BitGora — Owner Decisions Before Any Live Marketplace Release

The current source is technically deployable as a portfolio demonstration. The following decisions are not needed for the static Market Lab, but they are mandatory before any real public marketplace.

## Current approved release boundary

The release is:

```text
BitGora Market Lab
A non-custodial portfolio demonstration
with fictional listings and browser-local tools.
```

It is not:

- a live marketplace;
- a cryptocurrency exchange;
- a wallet;
- a payment processor;
- an escrow provider;
- a custody service;
- a financial-advice service;
- a verified user community.

## Identity and attribution

1. Confirm ownership and permitted use of the `BitGora` name.
2. Confirm the rights associated with the original repository.
3. The original package credited Angelica Mapeso and Ziyong He.
4. The README said MIT, but the uploaded archive had no `LICENSE`.
5. Obtain legal advice before redistributing the historical source or representing it as exclusively owned.
6. The clean-room rebuild should have an owner-approved licence before third-party redistribution.

## Catalogue and public positioning

1. Approve the twelve fictional listings and Canadian regions.
2. Approve the explicit “portfolio demonstration” wording.
3. Decide whether the Production site should be indexed publicly.
4. Approve the stable Production domain.
5. Do not replace fictional sellers with real people without a complete privacy and moderation programme.

## Market data

1. Confirm the intended use of the Coinbase Exchange public ticker against current provider terms and rate limits.
2. Treat CAD values as indicative estimates only.
3. Do not describe a cached estimate as a quote.
4. Do not imply that Coinbase endorses or operates BitGora.
5. Decide whether a future live product needs a regulated quote/payment provider.

## Live marketplace decision

Before enabling accounts, public listings or real chat, decide:

- permitted and prohibited goods;
- geographic scope;
- minimum user age;
- identity verification;
- seller verification;
- account recovery;
- fraud and spam response;
- moderation staffing;
- content retention;
- law-enforcement requests;
- privacy rights;
- terms of service;
- dispute policy;
- tax responsibility;
- insurance and liability;
- financial/cryptocurrency disclosures.

## Bitcoin/payment decision

Choose one:

1. **Communication-only marketplace**
   - BitGora never touches payment.
   - Users arrange payment independently.
   - The platform still needs strong anti-fraud guidance and terms.

2. **Payment coordination**
   - The platform displays an amount/address or payment status.
   - Requires legal, security, transaction and mistaken-payment design.

3. **Escrow/custody**
   - Funds or keys are controlled by BitGora or its provider.
   - Requires a dedicated regulated programme and must not be added casually.

The current release implements none of these payment paths.

## Moderation and safety

A live product needs named owners for:

- prohibited-listing review;
- user reports;
- harassment;
- scams;
- impersonation;
- stolen goods;
- dangerous goods;
- child safety;
- emergency escalation;
- account suspension;
- appeals;
- evidence preservation;
- privacy deletion.

## Data and retention

Approve:

- data inventory;
- lawful purpose;
- retention periods;
- deletion/export;
- backups;
- audit logs;
- message retention;
- image retention;
- abuse-report retention;
- incident response;
- vendor/subprocessor agreements.

## Release decision

The current Market Lab may be deployed after the quality and Preview gates pass.

Do not enable real public mutation by adding a database and authentication provider without completing the decisions above.
