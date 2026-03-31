/**
 * Google Apps Script — append registration rows to your sheet.
 *
 * CRITICAL: .env.local must use the **Web app** URL only:
 *   https://script.google.com/macros/s/XXXXXXXX/exec
 * Do NOT use script editor links (/macros/edit?...) — those return 403.
 *
 * Setup:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste this file, Save
 * 3. Deploy → New deployment → Select type: Web app
 *    - Execute as: Me
 *    - Who has access: **Anyone** (required for your Next.js server to POST)
 * 4. Copy the **Web app** URL (ends with /exec) → GOOGLE_SHEETS_WEBHOOK_URL
 * 5. After code changes: Deploy → Manage deployments → Edit → New version → Deploy
 *
 * Verify: open the /exec URL in a browser — you should see "Register webhook OK"
 */

var SHEET_ID = '1UO4R2I3KO-zF14GQ5uNeFiQ0GL78KuohwveaZLzqJfo';

function doGet() {
  return ContentService.createTextOutput('Register webhook OK').setMimeType(
    ContentService.MimeType.TEXT
  );
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var raw = e.postData && e.postData.contents;
    if (!raw) {
      return jsonResponse({ ok: false, error: 'No body' });
    }
    var data = JSON.parse(raw);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full name',
        'Email',
        'Phone',
        'Payment (id)',
        'Payment (label)',
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.payment || '',
      data.paymentLabel || data.payment || '',
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
