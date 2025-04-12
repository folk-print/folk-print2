"use client"

import { Award, Clock, DollarSign, Gem } from "lucide-react"

export default function About() {
  return (
    <div className="py-16 w-full" >
      <div className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto">
        <h1 className="text-center font-semibold text-4xl md:text-5xl py-8 leading-tight">Почему Folk Print?</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
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

        {/* New Row with Image Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
          {/* Image Card 1 - Blue Polo with Logo */}
          <div className="bg-yellow-400 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-black group">
            <div className="h-72 overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer%204-gigapixel-standard%20v2-2x.png-WQSnhQOCNVfXtL99UQnVx81hYTfF04.jpeg"
                alt="Корпоративная одежда с логотипом"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* <div className="p-4">
              <h2 className="text-xl font-semibold text-center group-hover:text-yellow-400">Вышивка логотипа</h2>
            </div> */}
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
            {/* <div className="p-4">
              <h2 className="text-xl font-semibold text-center group-hover:text-yellow-400">
                Прозрачное ценообразование
              </h2>
            </div> */}
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
            {/* <div className="p-4">
              <h2 className="text-xl font-semibold text-center group-hover:text-yellow-400">Разнообразие моделей</h2>
            </div> */}
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
            {/* <div className="p-4">
              <h2 className="text-xl font-semibold text-center group-hover:text-yellow-400">Качественные материалы</h2>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
