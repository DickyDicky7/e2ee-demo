var          WebSocket = require("ws");
var ws = new WebSocket("wss://e2ee-demo-server-websocket.onrender.com");

var { secp256k1 } = require('@noble/curves/secp256k1');

// var EC = require( "elliptic" ).ec;
// var ec = new  EC("curve25519")   ;

var priKey = null;
var pubKey = null;
var sharedSecret = null;

ws.onerror = (e) => console.log(e);

ws.onopen = () => {
    priKey =  secp256k1.utils.randomPrivateKey(      );
    pubKey =  secp256k1.          getPublicKey(priKey);
    console.log(`my private key: ${Buffer.from(priKey).toString("hex")}`);
    console.log(`my public@ key: ${Buffer.from(pubKey).toString("hex")}`);
    // console.log(priKey);
    // console.log(pubKey);
    // connection opened
    ws.send(JSON.stringify({ type: "something" })); // send a message
};

ws.onmessage = async (e) => {
    const 
        obj  = JSON.parse(e.data);
    if (obj.type === "receive-message") {
        const encryptedData =
        {
            content: obj.encrypted_message_content,
            iv     : obj.encrypted_message_iv     ,
        };
        const       decryptedData = decrypt(encryptedData, Buffer.from(sharedSecret).toString("hex"));
        console.log(decryptedData);
        //   rd     decryptedData
        return;
    }
    if (obj.type === "user-01-connected") {

        return;
    }
    if (obj.type === "user-02-connected") {
        ws.send(JSON.stringify({
            publicKey: Buffer.from(pubKey).toString("hex"),
            type     :      "exchange-key"                ,
        }));
        return;
    }
    if (obj.type === "another-user-not-connected") {
        return;
    }
    if (obj.type === "exchange-key") {

        try {

                                                     sharedSecret = secp256k1.getSharedSecret(priKey, Uint8Array.from(Buffer.from(obj.publicKey, "hex")));
//          console.log(sharedSecret);
            console.log(`my @@secret : ${Buffer.from(sharedSecret).toString("hex")}`);



            ws.send(JSON.stringify({
                publicKey: Buffer.from(pubKey).toString("hex"),
                type     :      "exchange-key-back"           ,
            })
            );


        }
        catch (err) {
            console.log(err);
        }
        return;
    }
    if (obj.type === "exchange-key-back") {
        sharedSecret = secp256k1.getSharedSecret(priKey, Uint8Array.from(Buffer.from(obj.publicKey, "hex")));
        console.log(`my secret: ${Buffer.from(sharedSecret).toString("hex")}`);
        // console.log(sharedSecret);
        console.log("ok @to message");
        console.log("@ send message");
        console.log("i send @@Hello");
        sendMessage(ws, "Hello",  Buffer.from(sharedSecret).toString("hex")  );
        return;
    }
};








var SimpleCrypto = require("simple-crypto-js").default;
const encrypt = (text, secretKey) => {
    const simpleCrypto = new SimpleCrypto        (secretKey);
    const  cipherText  =     simpleCrypto.encrypt(  text   );
    return {
        iv     : ""        ,
        content: cipherText,
    };
};

const decrypt = (decryptedData, secretKey) => {
    const  simpleCrypto = new SimpleCrypto(secretKey);
    const  decipherText =     simpleCrypto.decrypt(decryptedData.content);
    return decipherText;
};

// var crypto = require("node:crypto")
// const encrypt = async (text, secretKey) => {
//     return new Promise((resolve) => {
//         const algorithm = "aes-256-ctr"; // Name algorithm
//         const iv = crypto.randomBytes(16); // initial vector
//         const keyy = crypto.createHash('sha256').update(String(secretKey)).digest('base64').slice(0, 32)

//         const cipher = crypto.createCipheriv(algorithm, keyy, iv);

//         const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

//         resolve({
//             iv: iv.toString("hex"),
//             content: encrypted.toString("base64")
//         });
//     });
// };

// const decrypt = async (hash, secretKey) => new Promise((resolve) => {
//     const algorithm = "aes-256-ctr";

//     const keyy = crypto.createHash('sha256').update(String(secretKey)).digest('base64').slice(0, 32)

//     const decipher = crypto.createDecipheriv(
//         algorithm,
//         keyy,
//         Buffer.from(hash.iv, "hex")
//     );

//     const decrypted = Buffer.concat([
//         decipher.update(Buffer.from(hash.content, "base64")),
//         decipher.final()
//     ]);

//     resolve(decrypted.toString());
// })







//trigger an event and send anew encrypted message
const sendMessage =  async      (ws, message, secretKey) => {
    const encryptedMessage = encrypt(message, secretKey/*.toString("base64")*/);
    const obj              =
    {
        type: "sending-message",
        encrypted_message_iv     : encryptedMessage.iv     ,
        encrypted_message_content: encryptedMessage.content,
    }
    ws.send(JSON.stringify(obj));
};


