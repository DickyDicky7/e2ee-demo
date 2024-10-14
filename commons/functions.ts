import { encrypt } from "./encrypt";
import { decrypt } from "./decrypt";
import { EncryptedData } from "./shared";
// import WebSocket from "ws";

const sendMessageToServer = async  (webSocket: WebSocket, message: string, base64SecretKey: string) => {
    const encryptedMessage: EncryptedData = await encrypt(message,         base64SecretKey        );
    const obj             = {
        type                     : "sending-message"       ,
        encrypted_message_iv     : encryptedMessage.iv     ,
        encrypted_message_content: encryptedMessage.content,
    };
    webSocket.send(JSON.stringify(obj));
};

export
{
    sendMessageToServer
};
