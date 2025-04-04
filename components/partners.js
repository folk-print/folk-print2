import partnersJson from "./APi/partners.json";

function Partners() {
  const partners = partnersJson.map((partner) => {
    return (
      <div key={partner.id} className="flex items-center justify-center p-4 h-24">
        <img 
          src={partner.img || "/placeholder.svg"} 
          alt={`${partner.name} logo`} 
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  });

  return (
    <section id="partners" className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 uppercase mb-2">
            Помогаем компаниям
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#333333] uppercase">
            становиться узнаваемыми
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
          {partners}
        </div>
      </div>
    </section>
  );
}

export default Partners;