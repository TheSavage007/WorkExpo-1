# STEM Study Builder

A generative AI application that turns a topic into a structured practice set with an answer key, built on the Anthropic API.

![Stack](https://img.shields.io/badge/Frontend-React-1f6feb)
![AI](https://img.shields.io/badge/Model-Claude%20(Anthropic%20API)-8a63d2)
![Focus](https://img.shields.io/badge/Focus-Generative%20AI-0f766e)

## Overview

Give the app a topic, a grade level, a difficulty, and a question mix. It returns a clean practice set with multiple choice and short answer questions, each with a hidden answer and a short explanation you can reveal. The point of the project is not the quiz. It is the engineering around the model that makes the output reliable enough to use.

## What it shows

This is a real LLM application, not a thin wrapper on an API call. It demonstrates the parts that matter for AI work.

- Prompt engineering for strict JSON output, so the model returns data the app can render instead of loose prose
- A defined output schema the response is validated against, with a fallback when the model returns something unreadable
- Grade level and difficulty controls that shape the generation
- Real loading, empty, and error states, so a failed call is handled instead of breaking the screen
- Clean rendering of structured model output into an interactive answer key

## How it works

1. The user sets a topic, level, difficulty, question count, and which question types to allow.
2. The app sends a system prompt that pins the model to a single JSON schema, plus a user prompt built from the controls.
3. The response is parsed, checked for the expected shape, and rendered as a practice set.
4. Answers stay hidden until the user reveals them. The whole set copies to the clipboard in one click.

## Tech stack

- React front end
- Anthropic Messages API for generation
- Structured JSON prompting and client side validation

## Running it

There are two ways to run this, and the difference is where the API key lives.

**Demo mode.** The included React component runs inside an environment that proxies the Anthropic API for you, so no key is needed to see it work.

**Production mode.** Do not ship an Anthropic API key in front end code. A key in the browser is a key anyone can read and spend. For a live deployment, put a small backend between the app and Anthropic. The browser calls your backend, your backend holds the key as an environment variable and calls Anthropic. A single serverless function is enough.

```
Browser -> your /api/generate -> Anthropic API
(key lives here, never in the browser)
```

Set the key as an environment variable on the server side.

```bash
ANTHROPIC_API_KEY=your_key_here
```

## Screenshots

`[ Drop a screenshot of a generated set with an answer revealed. This one demos well live, so a short screen recording is even better. ]`

## Why this project

I taught science for years across chemistry, biology, physics, and more, so I know what a fair practice question looks like. This project puts that judgment behind a working AI tool, and it shows I can engineer around a model, not just call one.
