# FlashFix AI Knowledge Base

## Introduction

This Knowledge Base contains deep technical insights, troubleshooting guides, and architectural explanations for the FlashFix AI project. It is designed to help developers and advanced users understand the inner workings of the system.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [AI Integration & Resilience](#ai-integration--resilience)
3. [Performance Optimization](#performance-optimization)
4. [State Management](#state-management)
5. [Troubleshooting](#troubleshooting)

---

## Core Architecture

FlashFix AI is built on a modular React architecture using Vite as the build tool. The project follows the **Clean Architecture** and **Single Responsibility Principle (SRP)**.

### Directory Structure

- `src/core`: Contains global services like API, State Management, and Logging.
- `src/features`: Domain-specific features like file processing, exams, and mastery.
- `src/shared`: Reusable components, hooks, constants, and utilities.

### Design System

The project uses a Design Token system defined in `src/shared/constants/tokens.ts` and mapped to CSS variables in `index.css`. This ensures consistency across the UI and supports both light and dark modes.

---

## AI Integration & Resilience

We use an `AIServiceOrchestrator` to manage AI calls across multiple providers (Anthropic, OpenAI, Gemini).

### Circuit Breaker Pattern

To ensure high availability, we've implemented a **Circuit Breaker** in `src/core/api/circuit-breaker.ts`. If an AI provider fails multiple times, the circuit opens, preventing further calls until the service is deemed healthy again.

### AI Caching

We implement a multi-layer caching strategy:

1. **Local State Cache**: For ultra-fast repeated calls within a session.
2. **Supabase AI Cache**: For persistent caching across devices and users (Requirement 11).

---

## Performance Optimization

Our goal is to keep the initial load time under 2 seconds.

### Strategies

- **Code Splitting**: We use `React.lazy` and `Suspense` for all feature modules.
- **Service Worker**: Using `vite-plugin-pwa` for offline support and asset caching.
- **Tree Shaking**: Minimizing bundle size by only including used code from libraries.
- **Image Optimization**: Serving responsive and modern image formats (WebP).

---

## State Management

We use **Zustand** with a slice-based pattern to manage global state. This makes the state predictable, testable, and scalable.

### Slices

- `UISlice`: Handles navigation, theme, and global UI states.
- `ConfigSlice`: Manages API keys and provider settings.
- `FileSlice`: Handles uploaded file data and summaries.
- `ExamSlice`: Manages exams, quizzes, and teach-back flows.
- `LearningSlice`: Tracks mastery, history, bookmarks, and streaks.

---

## Troubleshooting

### API Key Errors

- **Symptom**: "API Key is missing" error.
- **Solution**: Ensure the API key is set in the Settings modal. The key is stored in `localStorage` for privacy.

### AI Call Failures

- **Symptom**: Circuit breaker is OPEN.
- **Solution**: Wait for 30 seconds for the circuit to enter HALF_OPEN state. Check your internet connection and API quota.

### Math Rendering Issues

- **Symptom**: KaTeX formulas not appearing correctly.
- **Solution**: Ensure LaTeX strings are wrapped in `$` for inline or `$$` for block rendering. Check `src/shared/components/math/MathText.tsx` for parsing logic.

### State Resetting

- **Symptom**: History or mastery disappears.
- **Solution**: FlashFix uses `zustand/persist`. If the local storage is cleared or the storage version changes significantly, the state might reset.
