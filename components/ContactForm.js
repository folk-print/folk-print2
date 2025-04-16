import { useState } from "react";

export default function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = `Новая заявка:\n👤 Имя: ${formData.name}\n📞 Телефон: ${formData.phone}`;
    try {
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
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      alert("Произошла ошибка. Попробуйте еще раз.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">Оставьте заявку</h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ваше имя"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Телефон"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      <button
        type="submit"
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-full transition-all duration-200 active:scale-95"
      >
        Отправить заявку
      </button>
    </form>
  );
}
