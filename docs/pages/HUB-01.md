---
title: Testing hub
code: HUB-01
route: /
roles: super_admin, strategist, analyst, prospect, guest
status: built
module: hub
---

# HUB-01 · Testing hub

## Purpose

Start here: switch language, theme, dev mode and role; open every surface (prospect landing pages, OS demo live in a phone, studio, analytics, plan, proposal, website, docs, manual, dev tools) and see the build counts.

## Screenshots

| 390 | 1280 |
| --- | --- |
| ![390](../screenshots/HUB-01/390.jpg) | ![1280](../screenshots/HUB-01/1280.jpg) |

Dark: `../screenshots/HUB-01/390-dark.jpg`, `../screenshots/HUB-01/1280-dark.jpg` (key pages).

## Sections (layout order)

1. header (brand, EN/ES, theme, dev mode)
2. role switcher
3. prospects: landing pages per archetype + demo
4. OS demo in PhoneFrame
5. surface cards
6. dev tools D-01..D-09
7. counts footer

## Data

| Table | Read / write | Notes |
| --- | --- | --- |
| `prospects` | read | |
| `pages` | read | |
| `tasks` | read | |
| `feedback` | read | |

## Actions

| id | intent | permission |
| --- | --- | --- |
| `hub.setLang` | "switch language to {lang}" | any |
| `hub.toggleTheme` | "switch to dark mode" | any |
| `hub.toggleDevMode` | "turn dev mode on" | `dev.tools` |
| `hub.switchUser` | "sign in as {role}" | any |
| `hub.openSurface` | "open {surface}" | any |
| `hub.resetDemoData` | "reset the demo database" | `dev.tools` |

## Rules

- `R-P01`
- `R-P02`

## Logic

- counts = routes / built / stubs / tables / rules / components from registries
- prospect cards read live pages and the savings from the composed model

## Components

LangToggle, IconButton, Toggle, RoleSwitcher, PhoneFrame, Card, Badge, Stat, Button, Avatar, DeviceMockup

## Real vs mock

Built on the MockProvider (localStorage). Real data lands with Supabase (T44).

## Responsive check (P-01)

Checked at: 390, 1280.

## Changelog

- `docs/changelog/0001-foundation.md`
