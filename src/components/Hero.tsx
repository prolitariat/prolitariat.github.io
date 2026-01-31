import { type Component } from "solid-js";

export const Hero: Component = () => {
  return (
    <section class="min-h-[85vh] flex items-center">
      <div class="container-narrow">
        <h1 class="animate-in mb-6">
          Brandon Noskoviak
        </h1>
        <p class="animate-in animate-in-delay-1 text-xl md:text-2xl text-secondary mb-8 max-w-2xl">
          Staff Engineering Product Manager
          <span class="block mt-1 text-lg md:text-xl">
            Product Analytics & In-App Content at Splunk (Cisco)
          </span>
        </p>
        <p class="animate-in animate-in-delay-2 text-lg text-secondary/80 max-w-xl leading-relaxed">
          I build clarity inside complex products.
        </p>
      </div>
    </section>
  );
};
