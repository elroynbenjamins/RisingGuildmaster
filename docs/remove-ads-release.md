# Remove Ads release setup

Create and activate the one-time Google Play product `guildmaster_remove_ads` for `com.elroybenjamins.risingguildmaster`. Configure its purchase option, regions and base price in Play Console. The app displays Google's localized price without a hardcoded price fallback.

This is non-consumable: persist delivery before acknowledgment; never consume it. Gem packs remain consumable. Pending purchases grant nothing. Restore Purchases in Gems & Support retrieves owned purchases through Google Play.

Remove Ads disables voluntary rewarded ads and 20-day milestone prompts across local saves. It also adds +5 gems to the existing daily login claim and grants one free Temple revive per real-world calendar day. The revive is use-it-or-lose-it and does not accumulate. It does not automatically grant other ad-viewing rewards. Reinstalling or changing devices requires restoration with the same Google Play account. This is not a separate Guildmaster cloud-account system.

Before release, use a Play internal-testing installation and a license tester to check localized pricing, purchase, canceled/pending payment, restore after reinstall, and no ads in new saves or on Day 20. Check gem packs still consume correctly. These native billing flows cannot be verified in Expo Go or the web demo.

Existing gem balances and purchase records remain save-based. A production server receipt-validation/account-ledger service is not added by this change.

