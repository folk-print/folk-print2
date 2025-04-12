import { Award, Clock, DollarSign, Gem } from "lucide-react"

const About = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Почему выбирают нас?</h2>
        <p className="text-gray-700 text-lg mb-12">
          Мы предлагаем лучшие решения для вашего бизнеса. Вот несколько причин, почему стоит выбрать именно нас:
        </p>

        <div className="flex flex-col gap-6 py-10">
          {/* Yellow cards row - visible on md+ screens */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Award className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Лучшие экспортные материалы</h2>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <DollarSign className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Выгодные цены</h2>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Clock className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Быстрый срок изготовления</h2>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Gem className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Высокое качество</h2>
              </div>
            </div>
          </div>

          {/* Images row - visible on md+ screens */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {/* Image Card 1 - Blue Polo with Logo */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%204-gigapixel-standard%20v2-2x.png-WQSnhQOCNVfXtL99UQnVx81hYTfF04.jpeg"
                  alt="Корпоративная одежда с логотипом"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Image Card 2 - Financial Document */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%202-gigapixel-low%20resolution-2x.png-RArEWLnwNDA8Z4GEGPCyMbIGHfp4Qc.jpeg"
                  alt="Финансовый документ"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Image Card 3 - Black Shirt with Logo */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%203-gigapixel-low%20resolution-2x.png-MRft8gxWaW6rfqFbbU3thvGy4mEAAb.jpeg"
                  alt="Черная футболка с логотипом"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Image Card 4 - Clothing Label */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%201-gigapixel-low%20resolution-2x.png-65u2o6uNKnY4Y8JgTOUgnJc5XOTyup.jpeg"
                  alt="Этикетка одежды"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* Mobile layout - alternating cards and images */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {/* Card 1 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Award className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Лучшие экспортные материалы</h2>
              </div>
            </div>

            {/* Image Card 1 - Blue Polo with Logo */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%204-gigapixel-standard%20v2-2x.png-WQSnhQOCNVfXtL99UQnVx81hYTfF04.jpeg"
                  alt="Корпоративная одежда с логотипом"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <DollarSign className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Выгодные цены</h2>
              </div>
            </div>

            {/* Image Card 2 - Financial Document */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%202-gigapixel-low%20resolution-2x.png-RArEWLnwNDA8Z4GEGPCyMbIGHfp4Qc.jpeg"
                  alt="Финансовый документ"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Clock className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Быстрый срок изготовления</h2>
              </div>
            </div>

            {/* Image Card 3 - Black Shirt with Logo */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%203-gigapixel-low%20resolution-2x.png-MRft8gxWaW6rfqFbbU3thvGy4mEAAb.jpeg"
                  alt="Черная футболка с логотипом"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-yellow-400 group">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4 group-hover:bg-yellow-400 group-hover:bg-opacity-20">
                  <Gem className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-semibold text-center">Высокое качество</h2>
              </div>
            </div>

            {/* Image Card 4 - Clothing Label */}
            <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
              <div className="h-72 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%201-gigapixel-low%20resolution-2x.png-65u2o6uNKnY4Y8JgTOUgnJc5XOTyup.jpeg"
                  alt="Этикетка одежды"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
