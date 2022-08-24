import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { initApollo } from "./context/apollo";
import { ApolloProvider } from "@apollo/client";

function hydrate() {
  React.startTransition(() => {
    const client = initApollo(false);

    hydrateRoot(
      document,
      <React.StrictMode>
        <ApolloProvider client={client}>
          <RemixBrowser />
        </ApolloProvider>
      </React.StrictMode>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
