export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, phone } = req.body;

    const message = `📝 Новая заявка!\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;
    const botToken = "7037879367:AAG0ISCCehaD3XKZT8K6Ka7D0Rk-w14gS_0";
    const chatId = "1152654889";

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    return res.status(200).json({ status: "ok" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
