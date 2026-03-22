"use client";

import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";

interface Props {
  accessToken: string;
  embedUrl: string;
  reportId: string;
}

export default function PowerBIReport({ accessToken, embedUrl, reportId }: Props) {
  return (
    <PowerBIEmbed
      embedConfig={{
        type: "report",
        id: reportId,
        embedUrl,
        accessToken,
        tokenType: models.TokenType.Aad,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true }
          }
        }
      }}
      cssClassName="powerbi-frame"
      eventHandlers={
        new Map([
          ["loaded", () => console.log("Rapport chargé ✅")],
          ["rendered", () => console.log("Rapport affiché ✅")],
          ["error", (event) => console.error(event?.detail)]
        ])
      }
    />
  );
}