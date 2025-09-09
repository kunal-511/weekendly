import { Button } from "@/components/ui/button"

export default function HeroSection() {
  const scrollToActivities = () => {
    const activitiesSection = document.getElementById("activities")
    activitiesSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary overflow-hidden py-8 sm:py-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/90" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
            <span className="text-2xl sm:text-4xl">🌟</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">Weekendly</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium px-4 sm:px-0">Design Your Perfect Weekend</p>
        </div>

        <Button
          onClick={scrollToActivities}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer mx-4 sm:mx-0"
        >
          Start Planning
        </Button>

        <div className="hidden md:block absolute top-20 left-10 animate-bounce delay-1000">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
        </div>
        <div className="hidden lg:block absolute top-32 right-16 animate-bounce delay-2000">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">🚀</span>
          </div>
        </div>
        <div className="hidden md:block absolute bottom-32 left-20 animate-bounce delay-500">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
        </div>
      </div>
    </section>
  )
}
