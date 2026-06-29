import { useEffect } from "react";
import { init } from "@botpress/webchat";

const BotpressChat = () => {
  useEffect(() => {
    init({
      clientId: "1ab0ea4f-4e0e-43e6-bb85-81aef071e049",

      configuration: {
        botName: "PCOS AI Assistant",
        botDescription:
          "Ask questions about PCOS symptoms, diet, exercise, and lifestyle recommendations.",
        color: "#7C3AED",
        themeMode: "light",
      },
    });
  }, []);

  return null;
};

export default BotpressChat;