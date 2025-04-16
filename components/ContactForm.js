import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/sendTelegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    setName('');
    setPhone('');
    alert('Спасибо! Мы скоро свяжемся с вами.');
  };

  return (
    <div className="flex justify-center items-center py-6 bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Оставьте заявку
        </h2>
        <input
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 mb-4 border rounded-md"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full p-3 mb-4 border rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 text-white font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
