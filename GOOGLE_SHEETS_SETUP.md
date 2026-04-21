# Google Sheets Setup

Use this if you want the enquiry form in `index.html` to save submissions into Google Sheets.

## 1. Create the sheet

1. Create a new Google Sheet.
2. Copy the full Google Sheet URL from the browser.

## 2. Add the Apps Script

1. Open the sheet.
2. Go to `Extensions -> Apps Script`.
3. Replace the default code with the contents of [google-apps-script/Code.gs](C:/Users/mkrma/OneDrive/Desktop/ZR/google-apps-script/Code.gs).
4. In `Code.gs`, replace `PASTE_YOUR_GOOGLE_SHEET_URL_HERE` with your real Google Sheet URL.

## 3. Deploy it

1. Click `Deploy -> New deployment`.
2. Choose `Web app`.
3. Set access to `Anyone`.
4. Deploy and copy the web app URL.

## 4. Connect the website

In [index.html](C:/Users/mkrma/OneDrive/Desktop/ZR/index.html), find:

```html
window.ZIRUT_GOOGLE_SCRIPT_URL = window.ZIRUT_GOOGLE_SCRIPT_URL || '';
```

Replace it with:

```html
window.ZIRUT_GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
```

After that, form submissions will post to your Apps Script and be appended to the `Enquiries` sheet.
