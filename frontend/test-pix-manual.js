// Teste manual para verificar se o PIX foi pago
// TXID: 2a927727d4f148849363542716e7cc75
// Invoice ID: 1

const http = require('http');

const testData = JSON.stringify({
    txid: '2a927727d4f148849363542716e7cc75',
    invoiceId: 1
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/subscription/check-pix-status',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'Content-Length': testData.length,
    },
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', data);
        try {
            const parsed = JSON.parse(data);
            console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Unable to parse response as JSON');
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(testData);
req.end();

console.log('Teste enviado para verificar PIX:');
console.log('TXID:', '2a927727d4f148849363542716e7cc75');
console.log('Invoice ID:', 1);
console.log('Aguardando resposta...');