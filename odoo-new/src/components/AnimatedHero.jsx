import React, { useEffect, useRef } from 'react'

export default function AnimatedHero() {
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-surface-elev">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>
          <div className="w-4 h-4 bg-primary/20 rounded-full" />
        </div>
        <div className="floating-element" style={{ top: '60%', right: '15%', animationDelay: '2s' }}>
          <div className="w-6 h-6 bg-accent/20 rounded-full" />
        </div>
        <div className="floating-element" style={{ top: '30%', right: '30%', animationDelay: '4s' }}>
          <div className="w-3 h-3 bg-primary/30 rounded-full" />
        </div>
        <div className="floating-element" style={{ bottom: '30%', left: '20%', animationDelay: '6s' }}>
          <div className="w-5 h-5 bg-accent/30 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
        <div className="animate-on-scroll opacity-0 transform translate-y-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Smart Equipment
            </span>
            <br />
            <span className="text-white">Rental Platform</span>
          </h1>
        </div>

        <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            Streamline your rental business with our comprehensive platform. 
            From cameras to construction equipment, manage everything in one place.
          </p>
        </div>

        <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <button className="group relative px-6 py-3 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button className="group px-6 py-3 border-2 border-white/20 text-white rounded-lg font-semibold text-base hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center space-x-2">
                <span>Watch Demo</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <div className="text-white/70 text-xs md:text-sm">Happy Customers</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-white/70 text-xs md:text-sm">Equipment Items</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
                50+
              </div>
              <div className="text-white/70 text-xs md:text-sm">Cities Served</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
                99%
              </div>
              <div className="text-white/70 text-xs md:text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/60 rounded-full mt-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '0.8s' }}>
              <div className="card p-4 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors duration-300">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-1">Easy Booking</h3>
                <p className="text-white/70 text-xs">Book equipment in minutes with our streamlined process</p>
              </div>
            </div>
            
            <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '1s' }}>
              <div className="card p-4 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors duration-300">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-1">Real-time Tracking</h3>
                <p className="text-white/70 text-xs">Track your rentals and equipment status in real-time</p>
              </div>
            </div>
            
            <div className="animate-on-scroll opacity-0 transform translate-y-8" style={{ animationDelay: '1.2s' }}>
              <div className="card p-4 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/30 transition-colors duration-300">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-1">Secure Payments</h3>
                <p className="text-white/70 text-xs">Multiple payment options with bank-level security</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-element {
          position: absolute;
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        
        .animate-on-scroll {
          transition: all 0.8s ease-out;
        }
        
        .animate-on-scroll.animate-fadeInUp {
          opacity: 1;
          transform: translateY(0);
        }
        
        .card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
      `}</style>
    </section>
  )
}
