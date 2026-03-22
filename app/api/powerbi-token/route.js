import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Étape 1 — Récupérer le token AAD avec le compte stage-data@pedago.ai
    const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      grant_type: "password",
      client_id: process.env.AZURE_AD_CLIENT_ID,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET,
      scope: "https://analysis.windows.net/powerbi/api/.default",
      username: process.env.POWERBI_USERNAME,
      password: process.env.POWERBI_PASSWORD,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Erreur token AAD:", tokenData);
      return NextResponse.json({ error: "Erreur token AAD" }, { status: 500 });
    }

    const aadToken = tokenData.access_token;

    // Étape 2 — Générer l'Embed Token
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWERBI_WORKSPACE_ID}/reports/${process.env.POWERBI_REPORT_ID}/GenerateToken`;

    const embedResponse = await fetch(embedTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${aadToken}`
      },
      body: JSON.stringify({ accessLevel: "View" })
    });

    const embedData = await embedResponse.json();

    if (!embedResponse.ok) {
      console.error("Erreur embed token:", embedData);
      return NextResponse.json({ error: "Erreur embed token" }, { status: 500 });
    }

    return NextResponse.json({ 
      accessToken: embedData.token,
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${process.env.POWERBI_REPORT_ID}&groupId=${process.env.POWERBI_WORKSPACE_ID}`
    });

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}