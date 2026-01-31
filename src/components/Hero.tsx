import { type Component } from "solid-js";

export const Hero: Component = () => {
  return (
    <section class="min-h-[85vh] flex items-center">
      <div class="container-narrow">
        <div class="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 mb-8">
          <div class="shrink-0 animate-in">
            <img
              src="/profile.jpg"
              alt="Brandon Noskoviak"
              class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-border"
            />
          </div>
          <div>
            <h1 class="animate-in animate-in-delay-1 mb-4">
              Brandon Noskoviak
            </h1>
            <p class="animate-in animate-in-delay-2 text-xl md:text-2xl text-secondary max-w-2xl">
              Staff Engineering Product Manager
              <span class="block mt-1 text-lg md:text-xl">
                Product Analytics & In-App Content at Splunk (Cisco)
              </span>
            </p>
          </div>
        </div>
        <p class="animate-in animate-in-delay-3 text-lg text-secondary/80 max-w-xl leading-relaxed">
          I build clarity inside complex products.
        </p>
      </div>
    </section>
  );
};
