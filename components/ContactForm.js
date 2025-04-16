import { useState } from "react";

export default function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // send to Telegram Bot API (replace with your actual token/chat_id)
    const message = `Новая заявка:\n👤 Имя: ${formData.name}\n📞 Телефон: ${formData.phone}`;
    await fetch(`https://api.telegram.org/bot7037879367:AAG0ISCCehaD3XKZT8K6Ka7D0Rk-w14gS_0/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "1152654889",
        text: message,
      }),
    });

    alert("Спасибо! Мы скоро с вами свяжемся.");
    setFormData({ name: "", phone: "" });
    if (onClose) onClose();
  };

  return (
    <div className="relative bg-white shadow-xl p-6 rounded-xl max-w-md mx-auto my-10">
      {onClose && (
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          ×
        </button>
      )}

      <h2 className="text-2xl font-semibold text-center mb-4">Оставьте заявку</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Ваше имя"
          onChange={handleChange}
          required
          className="border border-gray-300 px-4 py-2 rounded"
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          placeholder="Телефон"
          onChange={handleChange}
          required
          className="border border-gray-300 px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
