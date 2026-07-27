import React from 'react';
import { Hero } from './Hero';
import { AboutUs } from './AboutUs';
import { TargetAudience } from './TargetAudience';
import { Impact } from './Impact';
import { Experience } from './Experience';

export const HomeSection: React.FC = () => {
  return (
    // <main> con layout de flexbox, gap-16 para separación y padding vertical
    <main className="flex flex-col gap-16 py-16">
      <Hero />
      <AboutUs />
      <TargetAudience />
      <Impact />
      <Experience />
    </main>
  );
};
