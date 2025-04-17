import { useState } from "react";

export default function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const formatUzbekPhone = (value) => {
    const digits = value.replace(/[^\d]/g, "");

    let formatted = "+998";

    if (digits.startsWith("998")) {
      const raw = digits.slice(3); // after 998
      if (raw.length > 0) formatted += " " + raw.substring(0, 2);
      if (raw.length >= 3) formatted += " " + raw.substring(2, 5);
      if (raw.length >= 6) formatted += " " + raw.substring(5, 7);
      if (raw.length >= 8) formatted += " " + raw.substring(7, 9);
    }

    return formatted;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatUzbekPhone(input);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = `Новая заявка:\n👤 Имя: ${formData.name}\n📞 Телефон: ${formData.phone}`;
    try {
      await fetch(`https://api.telegram.org/bot7240602303:AAFUOBY-9rF-Ny4V-2qL5xJdLocFnYBwWZE/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "5061986357",
          text: message,
        }),
      });

      setFormData({ name: "", phone: "" });
      setSubmitted(true);

      if (onClose) onClose();
    } catch (error) {
      console.error("Ошибка при отправке:", error);
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
        onChange={handlePhoneChange}
        placeholder="+998 XX XXX XX XX"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      <button
        type="submit"
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-full transition-all duration-200 active:scale-95"
      >
        Отправить заявку
      </button>

      {submitted && (
        <p className="text-green-600 text-center font-medium pt-2">
          Спасибо! Мы скоро с вами свяжемся.
        </p>
      )}
    </form>
  );
}
