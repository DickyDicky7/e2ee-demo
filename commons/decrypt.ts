import     crypto        from   "crypto";
import { EncryptedData } from "./shared";
import SimpleCrypto from "simple-crypto-js"

const decrypt = async (encryptionData: EncryptedData, base64SecretKey: string): Promise<string> => new Promise((resolve) => {
    // const algorithm             : string          =      "aes-256-ctr";
    // const shortenBase64SecretKey: string          = crypto.createHash      ("sha256").update(String(base64SecretKey)).digest("base64").slice(0, 32);
    // const               decipher: crypto.Decipher = crypto.createDecipheriv(algorithm,       shortenBase64SecretKey  , Buffer.from(encryptionData.iv     , "hex"   ));
    // const   decrypted           : Buffer          = Buffer.          concat([decipher.update(                          Buffer.from(encryptionData.content, "base64")), decipher.final(), ]);
    const simpleCrypto = new SimpleCrypto(base64SecretKey)
    const decipherText = simpleCrypto.decrypt(encryptionData.content)
    resolve(decipherText.toString());
});

export
{
    decrypt
};
