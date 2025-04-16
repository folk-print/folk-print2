import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    setSent(true);
    setName("");
    setPhone("");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-sm mx-auto">
      {sent ? (
        <p className="text-green-600">Спасибо! Мы скоро свяжемся с вами.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            Отправить
          </button>
        </form>
      )}
    </div>
  );
}
