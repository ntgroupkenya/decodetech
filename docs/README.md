# Documents

- `how-to-order.html` is the source of the customer ordering sheet. The website serves its printed copy as `public/how-to-order.pdf` (linked from the Shop's "How to Order" section, the footer and the cart panel).
- Hosting instructions are in `deploy-templates/README-DEPLOY.txt` (copied into each upload package).

To rebuild a PDF after editing its HTML, print it with Microsoft Edge (page size A4, no headers or footers):

    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="C:\path\to\output.pdf" "file:///C:/path/to/docs/how-to-order.html"

If Edge prints nothing, an Edge window may already be running with the same profile: close it, or add `--user-data-dir=C:\temp\edge-print`. Then copy the new ordering sheet over `public/how-to-order.pdf` and run `npm run package`. The sheet shows the shop and website addresses, the opening hours and the phone numbers, so update it when any of those change.
