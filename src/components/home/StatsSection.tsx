import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Users, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatItemProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
}

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  isVisible: boolean;
}

const Counter: React.FC<CounterProps> = ({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
  isVisible,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    // Check prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setCount(target);
      return;
    }

    let startTime: number | null = null;
    const duration = 1800; // ms

    // Ease out expo curve for smooth, premium deceleration
    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentVal = easedProgress * target;
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, target]);

  const formattedValue = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString();

  return (
    <span className="tabular-nums tracking-tight font-extrabold text-slate-900 dark:text-white">
      {prefix}
      {formattedValue}
      <span className="text-blue-600 dark:text-blue-400 font-bold ml-0.5">{suffix}</span>
    </span>
  );
};

const statsData: StatItemProps[] = [
  {
    value: 150,
    suffix: '+',
    label: 'Projects Completed',
    description: 'Custom web apps, Android applications, and enterprise software successfully shipped.',
    icon: CheckCircle2,
  },
  {
    value: 120,
    suffix: '+',
    label: 'Happy Clients',
    description: 'Founders, SMEs, and digital leaders worldwide trusting our technology engineering.',
    icon: Users,
  },
  {
    value: 8,
    suffix: '+',
    label: 'Years of Experience',
    description: 'Continuous expertise in full-stack architecture, cloud systems, and AI integration.',
    icon: Award,
  },
  {
    value: 99.4,
    decimals: 1,
    suffix: '%',
    label: 'Client Satisfaction',
    description: 'Consistently high rating with rigorous code reviews, test coverage, and ongoing support.',
    icon: ShieldCheck,
  },
];

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Fire animation once
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="SS TECHWORKS track record and key performance metrics"
      className="relative py-16 sm:py-20 bg-slate-50/70 dark:bg-[#070b14] border-b border-slate-200/90 dark:border-slate-800/80 transition-colors"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-transparent to-indigo-500/[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-200/70 dark:border-slate-850">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Proven Track Record</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Measurable Impact in Software Engineering
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real results delivered for businesses that demand robust architectures, fast delivery cycles, and zero downtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>Explore Verified Case Studies</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statsData.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0a0e1a] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 shadow-xs hover:shadow-md dark:shadow-none flex flex-col justify-between"
              >
                {/* Top bar with icon & subtle order tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    METRIC 0{idx + 1}
                  </span>
                </div>

                {/* Counter value */}
                <div className="my-2">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                    <Counter
                      target={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      decimals={stat.decimals}
                      isVisible={isVisible}
                    />
                  </div>
                  <h3 className="mt-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                    {stat.label}
                  </h3>
                </div>

                {/* Micro-copy describing the metric */}
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-3">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Social Proof Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-850 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Active Project Capacity:
            </span>
            <span>Now taking client onboarding for Q2 & Q3</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 dark:text-slate-500">
            <span>SaaS Platforms</span>
            <span aria-hidden="true">·</span>
            <span>Mobile Apps</span>
            <span aria-hidden="true">·</span>
            <span>AI Integrations</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise Cloud</span>
          </div>
        </div>
      </div>
    </section>
  );
};
