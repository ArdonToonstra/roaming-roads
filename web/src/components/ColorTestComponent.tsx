import React from 'react';

/**
 * ColorTestComponent - A comprehensive component to test all semantic color utilities
 * This ensures our Tailwind color system works correctly and provides visual regression testing
 */
export default function ColorTestComponent() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
        Color System Test
      </h1>
      <p className="text-foreground mb-8">
        This component tests all semantic color utilities to ensure they compile and render correctly.
      </p>

      {/* Background Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Background Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-background p-4 border border-border rounded-lg">
            <span className="text-foreground font-medium">bg-background</span>
          </div>
          <div className="bg-card p-4 border border-border rounded-lg">
            <span className="text-card-foreground font-medium">bg-card</span>
          </div>
          <div className="bg-primary p-4 rounded-lg">
            <span className="text-primary-foreground font-medium">bg-primary</span>
          </div>
          <div className="bg-secondary p-4 rounded-lg">
            <span className="text-secondary-foreground font-medium">bg-secondary</span>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <span className="text-muted-foreground font-medium">bg-muted</span>
          </div>
          <div className="bg-accent p-4 rounded-lg">
            <span className="text-accent-foreground font-medium">bg-accent</span>
          </div>
        </div>
      </section>

      {/* Text Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Text Colors</h2>
        <div className="space-y-2">
          <p className="text-foreground">text-foreground - Main text color</p>
          <p className="text-muted-foreground">text-muted-foreground - Muted text</p>
          <p className="text-primary">text-primary - Primary brand color</p>
          <p className="text-secondary">text-secondary - Secondary brand color</p>
          <p className="text-destructive">text-destructive - Error/warning text</p>
        </div>
      </section>

      {/* Borders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Borders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <span className="text-foreground">border-border</span>
          </div>
          <div className="p-4 border border-input rounded-lg">
            <span className="text-foreground">border-input</span>
          </div>
          <div className="p-4 border-2 border-ring rounded-lg">
            <span className="text-foreground">border-ring (focus)</span>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Interactive Elements</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Primary Button
          </button>
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Secondary Button
          </button>
          <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Destructive Button
          </button>
          <input 
            type="text" 
            placeholder="Input field" 
            className="bg-background text-foreground border border-input px-3 py-2 rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none"
          />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
            <h3 className="font-heading font-bold mb-2">Default Card</h3>
            <p className="text-muted-foreground">This is a default card with proper semantic colors.</p>
          </div>
          <div className="bg-muted text-muted-foreground p-6 rounded-lg">
            <h3 className="font-heading font-bold mb-2 text-foreground">Muted Card</h3>
            <p>This card uses the muted background color.</p>
          </div>
          <div className="bg-popover text-popover-foreground p-6 rounded-lg border border-border shadow-lg">
            <h3 className="font-heading font-bold mb-2">Popover Card</h3>
            <p>This simulates a popover or dropdown content.</p>
          </div>
        </div>
      </section>

      {/* Brand Colors Showcase (Based on brandguide) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Brand Colors Showcase</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-full h-24 bg-primary rounded-lg mb-2"></div>
            <p className="font-medium text-foreground">Sunset Orange</p>
            <p className="text-sm text-muted-foreground">Primary</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-secondary rounded-lg mb-2"></div>
            <p className="font-medium text-foreground">Ocean Teal</p>
            <p className="text-sm text-muted-foreground">Secondary</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-muted rounded-lg mb-2 border border-border"></div>
            <p className="font-medium text-foreground">Warm Sand</p>
            <p className="text-sm text-muted-foreground">Muted</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-foreground rounded-lg mb-2"></div>
            <p className="font-medium text-foreground">Deep Charcoal</p>
            <p className="text-sm text-muted-foreground">Foreground</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 rounded-lg mb-2" style={{backgroundColor: 'hsl(255 35% 35%)'}}></div>
            <p className="font-medium text-foreground">Twilight Purple</p>
            <p className="text-sm text-muted-foreground">Muted Foreground</p>
          </div>
        </div>
      </section>

      {/* Typography Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">Typography Test</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">H1 Heading - Poppins Bold</h1>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">H2 Heading - Poppins Bold</h2>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-2">H3 Heading - Poppins Bold</h3>
          </div>
          <div>
            <p className="text-lg text-foreground mb-2">Large body text - Lato Regular</p>
            <p className="text-base text-foreground mb-2">Regular body text - Lato Regular</p>
            <p className="text-sm text-muted-foreground">Small muted text - Lato Regular</p>
          </div>
        </div>
      </section>

      {/* Status Indicator */}
      <section className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-2xl font-heading font-bold text-card-foreground mb-4">✅ Color System Status</h2>
        <p className="text-card-foreground">
          If you can see this component rendered properly with all colors displaying correctly, 
          then all semantic color utilities are working as expected! This serves as a visual 
          regression test for the design system.
        </p>
      </section>
    </div>
  );
}