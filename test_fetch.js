const bodyObj = { contacts: [{ companyName: "test", contactUrl: "http://test.com" }] };
const bodyStr = JSON.stringify(bodyObj);

fetch('http://127.0.0.1:8000/api/campaigns/cmp-e92a60f68e/contacts/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': '1',
    'X-Is-Admin': 'true'
  },
  body: bodyStr
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
