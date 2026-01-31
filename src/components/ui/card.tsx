import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export const Card: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn(
        "rounded-lg border border-border bg-surface text-primary",
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

export const CardHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn("flex flex-col space-y-1.5 p-6", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <h3
      class={cn("font-serif text-xl font-bold leading-none tracking-tight", local.class)}
      {...others}
    >
      {local.children}
    </h3>
  );
};

export const CardDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <p class={cn("text-sm text-secondary", local.class)} {...others}>
      {local.children}
    </p>
  );
};

export const CardContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn("p-6 pt-0", local.class)} {...others}>
      {local.children}
    </div>
  );
};
