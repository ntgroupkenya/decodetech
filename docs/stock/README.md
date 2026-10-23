# Stock list

`decode-stock.csv` is the shop's catalogue built from the supplier price lists (about 1,100 products), in the admin import format: Admin → Products & Shop → Import.

- Prices are selling prices (supplier price + 20%, rounded to the nearest shilling).
- Out-of-stock and "expecting" items are included but hidden (`inShop` = no); switch them on in the admin when they arrive.
- Stock notes ("Limited stock", "Clearance price", bulk deals, "Boxed") are in the `hotFeature` column, shown under the product name.
- There are no photos yet. Until a photo is uploaded the shop draws the product type with its brand name.
- Supplier names, supplier prices and the notes on duplicates are kept out of this public repository on purpose.

The GitHub Pages preview shows this list.
