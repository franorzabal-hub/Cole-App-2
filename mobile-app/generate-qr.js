const qr = require('qrcode');

const url = 'exp://192.168.0.29:8081';

qr.toString(url, { type: 'terminal' }, function (err, string) {
  if (err) throw err;
  console.log('\n📱 Escanea este código QR con Expo Go:\n');
  console.log(string);
  console.log('\nO ingresa manualmente esta URL:');
  console.log(url);
  console.log('\n');
});