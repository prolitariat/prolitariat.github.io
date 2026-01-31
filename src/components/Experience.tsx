import { type Component, For } from "solid-js";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string;
  current?: boolean;
}

const experiences: ExperienceItem[] = [
  {
    company: "Splunk (Cisco)",
    role: "Staff Engineering Product Manager",
    period: "2022 — Present",
    description:
      "Leading product strategy for analytics and in-app content experiences. Building systems that transform complex observability data into actionable insights for product teams and end users.",
    current: true,
  },
  {
    company: "Jamf",
    role: "Senior Product Manager",
    period: "2019 — 2022",
    description:
      "Drove product development for Apple device management solutions, helping organizations secure and manage their Apple ecosystem at enterprise scale.",
  },
];

export const Experience: Component = () => {
  return (
    <section id="experience" class="section">
      <div class="container-narrow">
        <h2 class="mb-8">Experience</h2>
        <Separator class="mb-12" />
        <div class="space-y-8">
          <For each={experiences}>
            {(exp) => (
              <Card class="border-0 bg-transparent">
                <CardContent class="p-0">
                  <div class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-4">
                    <div>
                      <h3 class="text-xl font-bold text-primary">{exp.role}</h3>
                      <p class="text-secondary font-medium">{exp.company}</p>
                    </div>
                    <span class="text-sm font-mono text-muted-foreground shrink-0">
                      {exp.period}
                    </span>
                  </div>
                  <p class="text-secondary leading-relaxed">{exp.description}</p>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};
