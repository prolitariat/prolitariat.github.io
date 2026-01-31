import { type Component } from "solid-js";
import { Separator } from "~/components/ui/separator";

export const About: Component = () => {
  return (
    <section id="about" class="section">
      <div class="container-narrow">
        <h2 class="mb-8">About</h2>
        <Separator class="mb-12" />
        <div class="space-y-6 text-secondary">
          <p class="text-lg leading-relaxed">
            My work brings analytics and design together to deliver in-app experiences
            that feel natural to users and actionable to product teams.
          </p>
          <p class="leading-relaxed">
            I create the systems that let teams self-serve insights at scale—and I
            jump in myself to analyze, teach, and guide when the situation calls for it.
          </p>
          <p class="leading-relaxed">
            At Splunk, I focus on bridging the gap between complex observability data
            and the humans who need to make sense of it. Every feature I ship is designed
            to reduce cognitive load and increase confidence in decision-making.
          </p>
        </div>
      </div>
    </section>
  );
};
