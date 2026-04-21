var SHEET_URL_OR_ID = 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE';
var SHEET_NAME = 'Enquiries';
var HEADERS = [
  'submittedAt',
  'firstName',
  'lastName',
  'companyName',
  'email',
  'phone',
  'partnershipType',
  'productsInterest',
  'selectedProduct',
  'message',
  'source',
  'pageTitle',
  'pageUrl',
  'userAgent'
];

function doGet() {
  return jsonResponse_({
    success: true,
    message: 'Apps Script is live. Use POST to save enquiries.'
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    var spreadsheet = openSpreadsheet_();
    var sheet = getOrCreateSheet_(spreadsheet, SHEET_NAME);
    ensureHeaders_(sheet, HEADERS);

    var payload = normalizePayload_(e);

    if (!payload.submittedAt) {
      payload.submittedAt = new Date();
    }

    var row = HEADERS.map(function(header) {
      return payload[header] || '';
    });

    sheet.appendRow(row);

    return jsonResponse_({
      success: true,
      message: 'Enquiry saved successfully.'
    });
  } catch (error) {
    Logger.log('doPost error: ' + error);

    return jsonResponse_({
      success: false,
      message: error.message || String(error)
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {}
  }
}

function openSpreadsheet_() {
  if (!SHEET_URL_OR_ID || SHEET_URL_OR_ID.indexOf('PASTE_YOUR_') === 0) {
    throw new Error('Please paste your Google Sheet URL or sheet ID into SHEET_URL_OR_ID.');
  }

  if (SHEET_URL_OR_ID.indexOf('https://docs.google.com/spreadsheets/') === 0) {
    return SpreadsheetApp.openByUrl(SHEET_URL_OR_ID);
  }

  return SpreadsheetApp.openById(SHEET_URL_OR_ID);
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  var existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var headersMatch = headers.every(function(header, index) {
    return existingHeaders[index] === header;
  });

  if (!headersMatch) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function normalizePayload_(e) {
  var payload = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function(key) {
      payload[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    var parsedBody = parsePayload_(e.postData.contents);
    Object.keys(parsedBody).forEach(function(key) {
      payload[key] = parsedBody[key];
    });
  }

  return payload;
}

function parsePayload_(contents) {
  if (!contents) return {};

  var trimmed = String(contents).trim();
  if (!trimmed) return {};

  if (trimmed.charAt(0) === '{') {
    return JSON.parse(trimmed);
  }

  var params = {};
  trimmed.split('&').forEach(function(pair) {
    if (!pair) return;

    var parts = pair.split('=');
    var key = decodeURIComponent((parts[0] || '').replace(/\+/g, ' '));
    var value = decodeURIComponent((parts.slice(1).join('=') || '').replace(/\+/g, ' '));

    if (key) {
      params[key] = value;
    }
  });

  return params;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
