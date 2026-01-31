import { type Component } from "solid-js";
import { Hero } from "~/components/Hero";
import { About } from "~/components/About";
import { Experience } from "~/components/Experience";
import { Skills } from "~/components/Skills";
import { Contact } from "~/components/Contact";
import { Separator } from "~/components/ui/separator";

const Home: Component = () => {
  return (
    <main class="min-h-screen">
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Contact />

      {/* Footer */}
      <footer class="py-12">
        <div class="container-narrow">
          <Separator class="mb-8" />
          <p class="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Brandon Noskoviak
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
