"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function CalInitializer() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"booking"});
      cal("ui", {
        "theme":"dark", 
        "styles":{"branding":{"brandColor":"#B3A261"}}, // Твій фірмовий золотий колір
        "hideEventTypeDetails":true,
        "layout":"month_view"
      });
    })();
  }, []);

  return null; // Цей компонент нічого не малює, він просто запускає скрипт
}