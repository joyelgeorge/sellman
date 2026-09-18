---
name: marketplace-listing
description: Create and maintain app marketplace listings (Stripe App Marketplace, TallyShop via partners, HubSpot, MCP registries) that pass review and convert browsers into installs. Use whenever preparing a marketplace submission, updating listing copy or screenshots, responding to review feedback, or choosing which marketplace to list on next.
---

# Marketplace listing

Marketplaces are Sellman's primary channel: buyers are already inside the money stream.

## Before writing a listing, check the platform's current rules
Rules change. Fetch the platform's current review requirements and changelog first and store a dated
summary in `insights`. Known points as of Sept 2026 (re-verify):

**Stripe App Marketplace**
- App name identical in listing and manifest
- Disclose obvious limitations (e.g. countries, billing types not supported)
- Clear path to unauthenticate/uninstall from inside the Stripe Dashboard
- External links use the external-link icon
- Declare sandbox install support in the manifest
- Payments KYC is no longer mandatory for app distribution (April 2026 change)

**TallyShop**
- Add-ons are published by authorised Tally Partners; try-before-buy supported
- Path: partner revenue-share or partner application; see Tally Developer Hub listing playbook

**HubSpot marketplace**
- Apps can include MCP server components; ecosystem review required before installed customers can use them

**MCP registries (Smithery, Glama, PulseMCP, official registry)**
- Mostly instant publish; quality and clear tool descriptions drive usage

## Listing structure
1. Name = product face name (plain, searchable: what it does + platform)
2. One-line value: outcome + mechanism
3. Description: problem → how it works (3 steps) → what you pay → limits → data access explained
4. Permissions: request the minimum; explain each in plain words
5. Screenshots: real audit report (demo data clearly labelled), install flow, settings/uninstall
6. Support and privacy links that actually work
7. Pricing: consistent with the website

## Review-proofing checklist
- [ ] Claims guard passed on all copy
- [ ] Limits disclosed
- [ ] Uninstall/unauthenticate path documented and tested
- [ ] Permissions minimal and justified
- [ ] Demo data labelled as demo
- [ ] No competitor names in listing copy unless platform allows

## After launch
- Track listing views → installs → audit completion weekly
- Answer every review publicly and factually; never incentivise reviews without disclosure
- Update listing within 24h of a capability status change (brain-sync opens the task)
