# Sigil

TypeScript-first Node.js HTTP framework offering schema-driven routing, modifier-based middleware, plugin
extensibility, and flexible response templating for both server and serverless deployments.

> The current documentation is mostly just a stub and does not provide
> even half of the necessary information. The README file will be rewritten
> soon, but in the meantime you can get the information you need from the
> in-code documentation

## Table of Contents

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Core Concepts](#core-concepts)
    * [Routes & Handlers](#routes--handlers)
    * [Modifiers & Middleware](#modifiers--middleware)
    * [Plugins](#plugins)
    * [Schema Validation](#schema-validation)
    * [Response Templating](#response-templating)
* [API Overview](#api-overview)
* [Configuration Options](#configuration-options)
* [Contributing](#contributing)
* [License](#license)

## Installation

Install via npm:

```bash
npm install @sigiljs/sigil
```

Or using yarn:

```bash
yarn add @sigiljs/sigil
```

## Quick Start

```typescript
import { Sigil, seal } from "@sigiljs/sigil"

const app = new Sigil()

// Define a route with body validation
const userSchema = Sigil.defineSchema({
  id: seal.string().uuid(),
  name: seal.string().min(1)
})

app.route("/users").body(...userSchema).post(async (req, res) => {
  const body = req.body.json()
  // handle user creation...
  return res.response({ userId: body.id }, 201)
})

// Start the server
app.listen(3000, "0.0.0.0")
```

## Core Concepts

### Routes & Handlers

* **Declarative routing** using HTTP methods (`get`, `post`, `put`, etc.)
* Handlers receive a typed `ClientRequest` and a `SigilResponsesList` helper

### Modifiers & Middleware

* **Modifiers** attach to routes to transform or enrich the request before handlers
* **Global middleware** via `addMiddleware` intercepts requests framework-wide

### Plugins

#### Plugin Development Guide

Sigil plugins allow you to extend framework behavior through lifecycle hooks and internal APIs. Follow these steps to
create and use a plugin:

**Define the plugin class**

```ts
import { SigilPlugin } from "@sigiljs/sigil"

export class MyPlugin extends SigilPlugin<{ greeting: string }> {
  constructor(config: { greeting: string }) {
    super()
    // access config via this.$pluginConfig.greeting
  }

  // called once on initialization
  public onInitialize() {
    this.logger({ level: "info", message: `MyPlugin initialized with greeting: ${ this.$pluginConfig.greeting }` })
  }

  // called on each request in order
  public onRequestReceived(req) {
    this.logger({ level: "debug", message: `Incoming request: ${ req.method } ${ req.path }` })
  }

  // called before sending each response
  public onBeforeResponseSent(req, res) {
    this.logger({ level: "debug", message: `Sending ${ res.code } for ${ req.method } ${ req.url }` })
  }
}
```

**Register the plugin**

```ts
import Sigil from '@sigiljs/core';
import { MyPlugin } from './plugins/my-plugin';

const app = new Sigil({ serverless: false });
app.addPlugin(MyPlugin, { greeting: 'Hello, world!' });
```

**Use internal APIs**

Within your plugin methods, access routing or middleware APIs:

```ts
this.$routes.forEach(([path, route]) => {
  this.logger({ level: "info", message: `Route mounted: ${ path }` })
})

this.sigil.addMiddleware((req, res) => {
  // custom logic before handlers
})
```

This guide helps you scaffold a Sigil plugin, log internal events, and leverage built-in APIs for middleware and
routing.

* Extensible via `addPlugin`, with lifecycle hooks:

    * `onInitialize`, `onRequestReceived`, `onBeforeResponseSent`, etc.
* Access framework internals through injected context

### Schema Validation

* **First-class integration** with `@sigiljs/seal` for request schemas
* Automatic type derivation: path params, query, headers, body
* Validation is performed before handler execution

### Response Templating

* Customizable response templates via `responseTemplate` option
* Built-in response helpers: `SigilResponse`, `RawResponse`, `FileResponse`, and HTTP exceptions

## API Overview

### `new Sigil(options)`

Instantiate the framework. Key options:

* `serverless`: boolean to skip internal HTTP server
* `server.https`: HTTPS server options
* `responseTemplate`: custom formatting function
* `debug`: validation and logging settings

### Routing

```ts
app.route('/path', { modifiers: [MyModifier] })
  .get((req, res) => res.response({ hello: 'world' }));
```

### Schema Definition

```ts
const [schema, meta] = Sigil.defineSchema({ id: seal.string() }, { name: 'IDSchema' });
app.route('/items').query(schema).get(handler);
```

### Plugins & Middleware

```ts
app.addPlugin(MyAuthPlugin, { secret: '...' });
app.addMiddleware((req, res) => { /* ... */ });
```

## Configuration Options

See `SigilOptions` and `DebugOptions` for all available settings:

* `codeOnlyResponse`: HTTP codes without body
* `serverless`, `server.https`
* `debug.validation.skip`
* `debug.fancyOutput`, `debug.logger`, `debug.moduleLogger`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: \`git commit -m 'Add YourFeature'
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

Please follow the code style guidelines and add tests for new behavior.

## License

[MIT](LICENSE)
