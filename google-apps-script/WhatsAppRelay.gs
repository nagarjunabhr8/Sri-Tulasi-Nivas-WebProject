/**
 * Sri Tulasi Nivas – WhatsApp Notification Relay
 * ─────────────────────────────────────────────
 * HOW TO DEPLOY (one-time, ~5 minutes):
 *   1. Go to https://script.google.com  →  New project
 *   2. Paste this entire file (replace the default code)
 *   3. Click  Deploy  →  New deployment
 *   4. Type: Web app
 *   5. Execute as: Me
 *   6. Who has access: Anyone
 *   7. Click Deploy, copy the Web App URL
 *   8. Paste that URL into application-local.yml:
 *        google.apps-script.whatsapp-url: <paste here>
 *
 * HOW EACH RESIDENT GETS THEIR CALLMEBOT API KEY (one-time):
 *   1. Save the number  +34 623 78 64 49  in WhatsApp contacts
 *   2. Send the message:  I allow callmebot to send me messages
 *   3. CallMeBot replies with a 6-digit API key
 *   4. Give that key to the admin to enter in the Residents page
 *
 * PAYLOAD the Spring backend sends:
 *   POST  <web-app-url>
 *   Content-Type: application/json
 *   {
 *     "messages": [
 *       { "phone": "+919876543210", "apiKey": "123456", "text": "Hello!" },
 *       ...
 *     ]
 *   }
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var messages = payload.messages || [];
    var results  = [];

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];

      if (!msg.phone || !msg.apiKey || !msg.text) {
        results.push({ phone: msg.phone, ok: false, error: "Missing phone/apiKey/text" });
        continue;
      }

      var url = "https://api.callmebot.com/whatsapp.php"
              + "?phone="  + encodeURIComponent(msg.phone)
              + "&text="   + encodeURIComponent(msg.text)
              + "&apikey=" + encodeURIComponent(msg.apiKey);

      try {
        var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        results.push({
          phone:      msg.phone,
          statusCode: resp.getResponseCode(),
          ok:         resp.getResponseCode() === 200
        });
      } catch (err) {
        results.push({ phone: msg.phone, ok: false, error: err.toString() });
      }

      // CallMeBot rate-limit: be polite, 500 ms between messages
      if (i < messages.length - 1) {
        Utilities.sleep(500);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, results: results }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Quick health-check: open the Web App URL in a browser to confirm it's live. */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Sri Tulasi Nivas WhatsApp Service is running ✅" }))
    .setMimeType(ContentService.MimeType.JSON);
}
