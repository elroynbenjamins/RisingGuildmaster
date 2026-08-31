# Google Play gem products

Guildmaster treats every gem pack as a **consumable one-time product**. Create these exact product IDs in Google Play Console after uploading an AAB that contains the Billing permission.

| Product ID | Play Console name | Gems delivered | Suggested base price (EUR) |
| --- | --- | ---: | ---: |
| `guildmaster_gems_50` | Spark Pouch | 50 | €0.99 |
| `guildmaster_gems_120` | Adventurer Satchel | 120 | €1.99 |
| `guildmaster_gems_260` | Guild Coffer | 260 | €3.99 |
| `guildmaster_gems_550` | Royal Vault | 550 | €7.99 |
| `guildmaster_gems_1200` | Dragon Hoard | 1,200 | €14.99 |

## Play Console setup

1. Upload the billing-enabled production AAB to an internal testing track.
2. Open **Monetize → Products → One-time products**.
3. Create each product using the exact ID above.
4. Add a purchase option and mark the product as consumable where the current Play Console flow requests it.
5. Set the EUR base price, let Google calculate local prices, review regional adjustments, and activate the product.
6. Add tester accounts under **Settings → License testing** and install Guildmaster from the Play internal-testing link.

The app never hardcodes a currency string. It queries Google Play and displays each product's localized `displayPrice`, including the currency and regional formatting supplied for the signed-in Play account.

## Purchase lifecycle

- Only allow-listed product IDs can grant gems.
- Pending payments do not grant gems.
- The local gem transaction ledger rejects duplicate transaction credits.
- The updated guild save is written before the purchase is consumed.
- Completed purchases are consumed so the same pack can be purchased again.
- Unfinished consumables are queried when the store reconnects.

For stronger fraud protection before a large public launch, move purchase-token verification to a secure backend using the Google Play Developer API. Never embed a Google service-account key or OAuth access token in the app.
