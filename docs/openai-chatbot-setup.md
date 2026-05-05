# OpenAI Chatbot Setup

This repo now supports an LLM-backed chatbot function in your separate Supabase
project.

## Function

`supabase/functions/chatbot_assistant/index.ts`

It uses:

- OpenAI Responses API
- model default: `gpt-5.4-mini`
- live crypto price context from `pinkpenguin.anode.news` when the user asks a
  price question

## Required Supabase secret

Set this secret in your chatbot Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Optional model override:

```bash
supabase secrets set OPENAI_MODEL=gpt-5.4-mini
```

## Deploy

```bash
npm run supabase -- functions deploy chatbot_assistant --no-verify-jwt
```

## App behavior

[ChatBot.tsx](/c:/Users/renju/Anode-mobile-app/components/ChatBot.tsx) now sends
all chat messages to `chatbot_assistant` in your chatbot-only Supabase project.

Price questions are still grounded with live market data before the LLM answers.

## Why this API choice

OpenAI recommends the Responses API for new projects:

- https://platform.openai.com/docs/guides/migrate-to-responses
- https://platform.openai.com/docs/api-reference/responses/compact?api-mode=responses

For lower-latency workloads, the models guide recommends smaller variants such
as GPT-5.4 mini:

- https://developers.openai.com/api/docs/models
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
