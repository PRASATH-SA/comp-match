import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, RefreshCw, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Zap, Laptop, Monitor, Quote } from 'lucide-react';

const SLIDES = [
  {
    id: 'slide-1',
    badge: 'New & Certified Tech Deals',
    badgeIcon: Sparkles,
    badgeColor: '#F59E0B',
    titlePrefix: 'Find Your Perfect',
    rotatingWords: [
      'Computer Match',
      'Gaming Laptop',
      'Desktop Workstation',
      'Refurbished Mac',
      'Everyday PC',
    ],
    description: 'Premium laptops, desktops, and accessories — brand new and certified refurbished at prices that make sense.',
    primaryCta: { text: 'Browse New', link: '/category/new', icon: ArrowRight },
    secondaryCta: { text: 'Refurbished Deals', link: '/category/refurbished', icon: RefreshCw },
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    featurePills: ['Brand New & Sealed', 'Full Manufacturer Warranty', 'Instant Dispatch'],
  },
  {
    id: 'slide-2',
    badge: 'Certified Refurbished Deals',
    badgeIcon: ShieldCheck,
    badgeColor: '#10B981',
    titlePrefix: 'Save Big on Pro',
    rotatingWords: [
      'Laptops & PCs',
      'MacBook Pros',
      'Workstations',
      'Business Laptops',
      'Certified Deals',
    ],
    description: 'Enjoy flagship compute power without paying full retail price. Fully tested and certified for dependable performance.',
    primaryCta: { text: 'Shop Refurbished', link: '/category/refurbished', icon: ArrowRight },
    secondaryCta: { text: 'Browse Computers', link: '/category/refurbished-computers', icon: Monitor },
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    featurePills: ['Tested & Certified', 'Quality Assured', 'Warranty Included'],
  },
  {
    id: 'slide-3',
    badge: 'Mac PCs & MacBooks',
    badgeIcon: Zap,
    badgeColor: '#3B82F6',
    titlePrefix: 'Iconic Apple Design,',
    rotatingWords: [
      'Peak Productivity',
      'MacBook Air & Pro',
      'iMac 4K Desktops',
      'Creative Workflows',
      'Restored Macs',
    ],
    description: 'Refurbished MacBooks, iMacs, and Mac Minis in immaculate condition. Ready for professional creative workflows.',
    primaryCta: { text: 'Explore Mac PCs', link: '/category/refurbished-mac-pcs', icon: ArrowRight },
    secondaryCta: { text: 'All Refurbished', link: '/category/refurbished', icon: RefreshCw },
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    featurePills: ['Retina Displays', 'Factory Reset & Clean', 'Ready to Ship'],
  },
  {
    id: 'slide-4',
    badge: 'High-Performance Peripherals',
    badgeIcon: Laptop,
    badgeColor: '#8B5CF6',
    titlePrefix: 'Upgrade Your Desk',
    rotatingWords: [
      'Tech & Accessories',
      'Mechanical Keyboards',
      'Precision Mice',
      '4K Monitors',
      'Pro Peripherals',
    ],
    description: 'Mechanical keyboards, precision mice, monitors, and adapters engineered for effortless speed and comfort.',
    primaryCta: { text: 'Shop Accessories', link: '/category/new-accessories', icon: ArrowRight },
    secondaryCta: { text: 'View All Products', link: '/category/new', icon: ArrowRight },
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
    featurePills: ['Ergonomic Design', 'High Compatibility', 'Top Brands'],
  },
];

const AUTOPLAY_DELAY = 6000;

/**
 * Dynamic Typewriter & Word Cycler that starts immediately without layout shift or blank flashes
 */
function DynamicAnimatedText({ words = [], isActive = false }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(() => (words[0] ? words[0].length : 0));
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Reset safely when becoming inactive or active
  useEffect(() => {
    if (isActive) {
      // Keep existing or start with first word without blank gap
      setWordIdx(0);
      setSubIdx(words[0] ? words[0].length : 0);
      setIsDeleting(false);
    }
  }, [isActive, words]);

  // Typing animation engine (only active when slide is focused)
  useEffect(() => {
    if (!isActive || !words || words.length === 0) return;

    const currentWord = words[wordIdx] || words[0] || '';

    // Finished typing full word -> pause before deleting
    if (subIdx === currentWord.length && !isDeleting) {
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2400);
      return () => clearTimeout(pauseTimeout);
    }

    // Finished deleting word -> switch to next word
    if (subIdx === 0 && isDeleting) {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? 30 : 60;
    const typeTimeout = setTimeout(() => {
      setSubIdx((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(typeTimeout);
  }, [subIdx, wordIdx, isDeleting, words, isActive]);

  const currentWord = words[wordIdx] || words[0] || '';
  const displayedText = currentWord.substring(0, subIdx);

  return (
    <span className="dynamic-animated-text-wrap">
      <span className="highlight-dynamic">{displayedText || currentWord}</span>
      <span className={`typing-cursor ${blink ? 'blink' : ''}`}>|</span>
    </span>
  );
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Preload all carousel images for zero delay
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrent(index);
    setProgressKey((prev) => prev + 1);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  // Autoplay management
  useEffect(() => {
    if (isPaused || isDragging) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDragging, nextSlide, current]);

  // Touch & Mouse Drag Handlers for Stuckless Swipe
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Apply rubber band dampening on bounds
    if ((current === 0 && diff > 0) || (current === SLIDES.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60; // minimum drag distance in px
    if (dragOffset < -threshold && current < SLIDES.length - 1) {
      nextSlide();
    } else if (dragOffset < -threshold && current === SLIDES.length - 1) {
      goToSlide(0);
    } else if (dragOffset > threshold && current > 0) {
      prevSlide();
    } else if (dragOffset > threshold && current === 0) {
      goToSlide(SLIDES.length - 1);
    }
    setDragOffset(0);
  };

  const handleMouseDown = (e) => {
    // Only left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if ((current === 0 && diff > 0) || (current === SLIDES.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    handleTouchEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd();
    }
    setIsPaused(false);
  };

  return (
    <section
      className="hero-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      aria-label="Featured Promotions Carousel"
    >
      {/* Background Slides with Silky Crossfade & Subtle Parallax Zoom */}
      <div className="hero-carousel-bg-container">
        {SLIDES.map((item, index) => (
          <div
            key={item.id}
            className={`hero-carousel-bg-slide ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className="hero-carousel-overlay-left" />
            <div className="hero-carousel-overlay-radial" />
          </div>
        ))}
      </div>

      {/* Main Sliding Viewport Container (GPU Hardware Accelerated) */}
      <div
        className={`hero-carousel-viewport ${isDragging ? 'is-dragging' : ''}`}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="hero-carousel-track"
          style={{
            transform: `translate3d(calc(-${current * 100}% + ${dragOffset}px), 0, 0)`,
            transition: isDragging ? 'none' : 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === current;
            const BadgeIcon = slide.badgeIcon;
            const PrimaryIcon = slide.primaryCta.icon;
            const SecondaryIcon = slide.secondaryCta.icon;

            return (
              <div
                key={slide.id}
                className={`hero-carousel-slide ${isActive ? 'slide-active' : ''}`}
                aria-hidden={!isActive}
              >
                <div className="container hero-carousel-content-wrapper">
                  <div className="hero-carousel-grid">
                    {/* Left: Dynamic Animated Text & CTAs */}
                    <div className="hero-carousel-text">
                      <div className="hero-badge hero-carousel-badge">
                        <BadgeIcon size={15} style={{ color: slide.badgeColor }} />
                        <span>{slide.badge}</span>
                      </div>

                      <h1 className="hero-carousel-title">
                        {slide.titlePrefix} <br />
                        <DynamicAnimatedText
                          words={slide.rotatingWords}
                          isActive={isActive}
                        />
                      </h1>

                      <p className="hero-carousel-desc">
                        {slide.description}
                      </p>

                      {/* Feature Highlights */}
                      <div className="hero-carousel-pills">
                        {slide.featurePills.map((pill, idx) => (
                          <span key={idx} className="hero-feature-pill">
                            <span className="pill-dot" />
                            {pill}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="hero-actions hero-carousel-actions">
                        <Link to={slide.primaryCta.link} className="btn btn-cta btn-lg">
                          {slide.primaryCta.text} <PrimaryIcon size={18} />
                        </Link>
                        <Link to={slide.secondaryCta.link} className="btn btn-secondary btn-lg">
                          <SecondaryIcon size={18} /> {slide.secondaryCta.text}
                        </Link>
                      </div>
                    </div>

                    {/* Right: Glass Floating Product Showcase Card */}
                    <div className="hero-carousel-card-col">
                      <div className="hero-floating-glass-card">
                        <div className="glass-card-img-wrap">
                          <img
                            src={slide.image}
                            alt={slide.rotatingWords[0]}
                            className="glass-card-img"
                            loading="eager"
                            draggable={false}
                          />
                        </div>
                        <div className="glass-card-footer">
                          <div className="glass-card-info">
                            <div className="glass-card-subtitle">Featured Selection</div>
                            <div className="glass-card-title">{slide.rotatingWords[0]}</div>
                          </div>
                          <Link to={slide.primaryCta.link} className="glass-card-btn">
                            View <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel Navigation Controls with Animated Progress Dots */}
      <div className="container hero-carousel-controls-container">
        <div className="hero-carousel-controls">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="hero-arrow-btn prev"
            aria-label="Previous Slide"
            title="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Indicators / Smooth Progress Bars */}
          <div className="hero-dots-container">
            {SLIDES.map((_, index) => {
              const isDotActive = index === current;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`hero-dot ${isDotActive ? 'active' : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {isDotActive && (
                    <span
                      key={`progress-${progressKey}`}
                      className={`dot-progress-fill ${isPaused ? 'paused' : ''}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="hero-arrow-btn next"
            aria-label="Next Slide"
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Prominent Hero Vision Quote Ribbon */}
      <div className="container hero-quote-container">
        <div className="hero-vision-quote-card">
          <div className="hero-quote-icon-wrap" aria-hidden="true">
            <Quote size={20} />
          </div>
          <div className="hero-quote-content">
            <span className="hero-quote-tag">Our Vision & Promise</span>
            <blockquote className="hero-quote-text">
              “We believe the right technology can <span className="hero-quote-highlight">change a life</span>. Our vision is to make powerful, reliable technology <span className="hero-quote-highlight">accessible to everyone at the right price</span>.”
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
