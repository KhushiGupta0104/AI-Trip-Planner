# AI Trip Planner - Codebase Documentation

Welcome to the comprehensive documentation for the AI Trip Planner project. This documentation provides a complete overview of the codebase architecture, components, flows, and design decisions.

## Table of Contents

1. **[Project Overview](overview.md)** - High-level summary of the project's purpose, technologies, and main functionality
2. **[Component Breakdown](components.md)** - Detailed analysis of all key components, their responsibilities, and interactions
3. **[Entry Point and Initialization](entry_point.md)** - Understanding how the application starts and initializes
4. **[Execution Flow](execution_flow.md)** - Step-by-step journey through typical user operations
5. **[Architecture and Design Patterns](architecture.md)** - Architectural principles and design patterns used
6. **[Flow Diagrams](flow_diagrams.md)** - Visual representations of all major workflows

## Quick Start Guide

If you're new to this codebase:

1. Start with **[Project Overview](overview.md)** to understand what the application does
2. Read **[Entry Point and Initialization](entry_point.md)** to see how the app starts
3. Review **[Component Breakdown](components.md)** to understand the structure
4. Follow **[Execution Flow](execution_flow.md)** to trace typical user journeys
5. Check **[Flow Diagrams](flow_diagrams.md)** for visual representations
6. Study **[Architecture and Design Patterns](architecture.md)** for deeper understanding

## Project Summary

The AI Trip Planner is a full-stack React application that uses Google Gemini AI to generate personalized travel itineraries. Users can:

- Authenticate via Google OAuth
- Input trip parameters (destination, duration, budget, travelers)
- Receive AI-generated itineraries with hotel and activity recommendations
- Save trips to their profile
- View detailed trip information with photos and maps

**Tech Stack**: React 18, Vite, TailwindCSS, Firebase Firestore, Google Gemini AI, Google Places API

## Environment Setup

Required environment variables:
```
VITE_GOOGLE_PLACES_API_KEY       # Google Places API key
VITE_GOOGLE_AUTH_CLIENT_ID       # Google OAuth client ID
VITE_GOOGLE_GEMINI_AI_API_KEY   # Google Gemini AI API key
```

## Contributing to Documentation

This documentation is generated to help developers understand the codebase quickly. If you find areas that need clarification or updates, please maintain the same structure and format.

---

**Last Updated**: December 2025
**Codebase Version**: Latest commit in AI-Trip-Planner-main
