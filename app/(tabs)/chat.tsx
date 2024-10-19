import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { sendMessageToServer } from "@/commons/functions";
import { EncryptedData } from "@/commons/shared";
import { decrypt } from "@/commons/decrypt";
import { secp256k1 } from "@noble/curves/secp256k1";
import useWebSocket from "react-native-use-websocket";
import { encrypt } from "@/commons/encrypt";
// import * as Aes from "react-native-aes-crypto"

var Buffer = require("buffer/").Buffer
let i = 0;
let privateKey: Uint8Array;
let public_Key: Uint8Array;
let sharedSecretKey: Uint8Array;
// const decryptNative = async (encryptionData: EncryptedData, base64SecretKey: string): Promise<string> => {

//     return await Aes.decrypt(encryptionData.content, base64SecretKey, encryptionData.iv, "aes-256-ctr");
//     }

//     const encryptNative = async (text: string, base64SecretKey: string): Promise<EncryptedData> => {
//         const iv: string = await Aes.randomKey(16);
//         const cipher = await Aes.encrypt(text, base64SecretKey, iv, "aes-256-ctr");
//         return {
//             iv: iv,
//             content: cipher
//         }
//     }

import * as Crypto from 'expo-crypto';

interface Message {
    id: string;
    text: string;
    sender: "me" | "other";
}

const ChatComponent: React.FC = () => {

    const socketUrl = "wss://e2ee-demo-server-websocket.onrender.com";
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    } = useWebSocket(socketUrl, {
        onOpen: () => {
            privateKey = Crypto.getRandomBytes(32);
            // privateKey=(secp256k1.utils.randomPrivateKey())
            public_Key = (secp256k1.getPublicKey(privateKey))
            console.log(`my private key: ${Buffer.from(privateKey).toString("hex")}`)
            console.log(`my public key: ${Buffer.from(public_Key).toString("hex")}`)
            // console.log(priKey)
            // console.log(pubKey)
            // connection opened
            sendMessage(JSON.stringify({ type: "something" })); // send a message
        },
        onMessage: async (e) => {

            const obj = JSON.parse(e.data.toString())
            if (obj.type === "receive-message") {
                const encryptedData =
                {
                    content: obj.encrypted_message_content,
                    iv: obj.encrypted_message_iv,
                }
                const decryptedData = await decrypt(encryptedData, Buffer.from(sharedSecretKey).toString("hex"))
                console.log(decryptedData);
                // rd decryptedData

                // signal.onEncryptedDataReceived(encryptedData)
                setLstMessage(prevMessages => [

                    { id: /*Math.random().toString()*/ `${i++}`, text: decryptedData, sender: "other" }
                    , ...prevMessages,
                ]);


                return
            }
            if (obj.type === "user-01-connected") {

                return
            }
            if (obj.type === "user-02-connected") {
                sendMessage(JSON.stringify({
                    publicKey: Buffer.from(public_Key).toString("hex"),
                    type: "exchange-key",
                }))
                return
            }
            if (obj.type === "another-user-not-connected") {
                return
            }
            if (obj.type === "exchange-key") {

                try {
                    // Buffer.from()
                    sharedSecretKey = (secp256k1.getSharedSecret(privateKey, Uint8Array.from(Buffer.from(obj.publicKey, "hex"))))
                    // console.log(sharedSecret)
                    console.log(`my secret: ${Buffer.from(sharedSecretKey).toString("hex")}`)



                    sendMessage(JSON.stringify({
                        publicKey: Buffer.from(public_Key).toString("hex"),
                        type: "exchange-key-back",
                    })
                    );


                }
                catch (err) {
                    console.log(err)
                }
                return
            }
            if (obj.type === "exchange-key-back") {
                sharedSecretKey = (secp256k1.getSharedSecret(privateKey, Uint8Array.from(Buffer.from(obj.publicKey, "hex"))))
                console.log(`my secret: ${Buffer.from(sharedSecretKey).toString("hex")}`)
                // console.log(sharedSecret)
                console.log("ok to message")
                console.log("send message")
                console.log("i send Hello")

                const a = await encrypt("Hello", Buffer.from(sharedSecretKey).toString("hex"))
                sendMessage(JSON.stringify({
                    encrypted_message_iv: a.iv,
                    encrypted_message_content: a.content,
                    type: "sending-message"
                }))
                // sendMessageToServer(ws, "Hello", Buffer.from(sharedSecretKey).toString("base64"))
                return
            }


        },
        onError: async (e) => console.log(e),
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
    });











    // const [privateKey, setPrivateKey] = useState<Uint8Array>();
    // const [public_Key, setPublic_Key] = useState<Uint8Array>();
    // const [sharedSecretKey, setSharedSecretKey] = useState<Uint8Array>();
    const [newMessage, setNewMessage] = useState<string>("");
    const [lstMessage, setLstMessage] = useState<Message[]>([
        { id: `${i++}`, text: "Hello!", sender: "me" },
        { id: `${i++}`, text: "Hi! How are you!", sender: "other" },
    ]);

    const sendMessage_ = async (sharedSecret: Uint8Array) => {
        if (newMessage.trim()) {
            setLstMessage(prevMessages => [

                { id: /*Math.random().toString()*/ `${i++}`, text: newMessage, sender: "me" }
                , ...prevMessages,
            ]);
            setNewMessage("");

            // sendMessageToServer(ws, newMessage, Buffer.from(sharedSecret).toString("base64"))
            console.log(sharedSecretKey)
            const a = await encrypt(newMessage, Buffer.from(sharedSecret).toString("hex"))
            sendMessage(JSON.stringify({
                // ...a,
                encrypted_message_iv: a.iv,
                encrypted_message_content: a.content,
                type: "sending-message",
            }))
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageContainer, item.sender === "me" ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={lstMessage}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.chatList}
                inverted
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage_(sharedSecretKey)}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 10,
    },
    chatList: {
        flex: 1,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: "70%",
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#DCF8C6",
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    input: {
        flex: 1,
        padding: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 20,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});

export default ChatComponent;
