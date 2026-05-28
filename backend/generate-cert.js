import selfsigned from "selfsigned";
import fs from "fs";

const attrs = [{ name: "commonName", value: "localhost" }];

const pems = await selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
});

console.log(pems);

fs.writeFileSync("cert.pem", pems.cert);
fs.writeFileSync("key.pem", pems.private);

console.log("cert.pem si key.pem create cu succes!");