import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const NotificationSocketContext = createContext(null);

export const useNotificationSocket = () => {
  const context = useContext(NotificationSocketContext);
  if (!context) {
    throw new Error("useNotificationSocket must be used within a NotificationSocketProvider");
  }
  return context;
};

export const NotificationSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const [notificationsWebsocket, setNotificationsWebsocket] = useState([]);
  
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS("http://localhost:8080/api/ws-notification");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("✅ Socket connected notification");

      client.subscribe(`/topic/notify-${userId}`, (msg) => {
        const body = JSON.parse(msg.body);
        console.log("📩 Received notification:", body);
        setNotificationsWebsocket((prev) => [body, ...prev]); // Lưu vào state
      });
    });

    stompClient.current = client;

    return () => {
      stompClient.current?.disconnect(() => {
        console.log("🔌 Socket disconnected notification");
      });
    };
  }, [userId]);

  return (
    <NotificationSocketContext.Provider
      value={{ stompClient, notificationsWebsocket, setNotificationsWebsocket }}
    >
      {children}
    </NotificationSocketContext.Provider>
  );
};