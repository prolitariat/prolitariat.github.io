import { type Component, For } from "solid-js";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

const skills = [
  "Product Strategy",
  "Product Analytics",
  "Observability",
  "In-App Experiences",
  "Data Visualization",
  "Enterprise Software",
  "Cross-functional Leadership",
  "User Research",
  "Agile / Scrum",
  "Technical Communication",
];

export const Skills: Component = () => {
  return (
    <section id="skills" class="section">
      <div class="container-narrow">
        <h2 class="mb-8">Expertise</h2>
        <Separator class="mb-12" />
        <p class="text-secondary mb-8 leading-relaxed">
          I specialize in translating complex technical capabilities into intuitive
          user experiences. My work sits at the intersection of data, design, and
          product strategy.
        </p>
        <div class="flex flex-wrap gap-3">
          <For each={skills}>
            {(skill) => (
              <Badge variant="outline" class="text-sm py-1.5 px-4">
                {skill}
              </Badge>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};
