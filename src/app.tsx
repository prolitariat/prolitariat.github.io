import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import "./app.css";

export default function App() {
  return (
    <Router
      base={import.meta.env.SERVER_BASE_URL}
      root={(props) => (
        <MetaProvider>
          <Title>Brandon Noskoviak | Staff Engineering Product Manager</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta
            name="description"
            content="Staff Engineering Product Manager specializing in Product Analytics & In-App Content at Splunk (Cisco). Building clarity inside complex products."
          />
          <Meta name="theme-color" content="#0a0a0a" />
          <Meta property="og:title" content="Brandon Noskoviak | Staff Engineering Product Manager" />
          <Meta
            property="og:description"
            content="Building clarity inside complex products. Product Analytics & In-App Content at Splunk (Cisco)."
          />
          <Meta property="og:type" content="website" />
          <Meta name="twitter:card" content="summary" />
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
          <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <Link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
