import     crypto        from   "crypto";
import { EncryptedData } from "./shared";
import SimpleCrypto from "simple-crypto-js"

const encrypt = async (text: string, base64SecretKey: string): Promise<EncryptedData> => {
    return new Promise((resolve) =>
    {
        const simpleCrypto = new SimpleCrypto(base64SecretKey)
    const cipherText = simpleCrypto.encrypt(text)
    
        resolve({
            iv: "",
            content: cipherText
        });
    });
};

export
{
    encrypt
};
