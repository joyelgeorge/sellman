# Sellman skills

Playbooks the Sellman agents load. Each follows the SKILL.md format (YAML frontmatter with `name` and
`description`, then instructions). Agents list the skills they use in `agents/*.md`; the runner injects the
matching SKILL.md bodies into the agent's context.

| Skill | Used by |
|---|---|
| icp-and-segmentation | market-researcher, signal-scout, strategist |
| offer-design | offer-architect |
| outcome-pricing | offer-architect, strategist |
| positioning-and-messaging | content-strategist, listing-manager, outbound-writer |
| audit-led-selling | offer-architect, content-strategist, lifecycle-writer |
| marketplace-listing | listing-manager |
| geo-content | content-strategist |
| compliant-outbound | outbound-writer |
| community-selling | community-listener |
| competitor-intel | competitor-analyst, market-researcher |
| self-serve-conversion | lifecycle-writer, content-strategist |
| attribution-and-experiments | strategist |
| claims-and-compliance | every agent that drafts customer-facing text |
| partner-channel | strategist, content-strategist, partner-manager |
| brand-and-voice | content-strategist, listing-manager, outbound-writer, community-listener, brand-strategist |
| persuasive-copywriting | content-strategist, listing-manager, outbound-writer |
| storytelling-and-case-studies | content-strategist, listing-manager, brand-strategist |
| growth-loops-and-virality | content-strategist, strategist |
| founder-led-selling | strategist, brand-strategist |
| voice-of-customer-research | market-researcher, brand-strategist |

The last six are the "different brain" set (`docs/architecture.md` § Two brains, not one) — judged on
voice and resonance, not on provability, though every agent that loads them also loads
claims-and-compliance and is bound by it just the same.

These are also valid Claude skills — zip a folder to use it in Claude directly.
