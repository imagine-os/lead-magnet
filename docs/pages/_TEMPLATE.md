---
title: <Page name>
code: <CODE>
route: /<path>
roles: <role, role>
status: stub | built
module: <module folder>
---

# <CODE> · <Page name>

## Purpose

One paragraph: who uses this page and what they achieve.

## Screenshots

| 390 | 1280 |
| --- | --- |
| ![390](../screenshots/<CODE>/390.jpg) | ![1280](../screenshots/<CODE>/1280.jpg) |

Dark: `../screenshots/<CODE>/390-dark.jpg`, `../screenshots/<CODE>/1280-dark.jpg` (key pages).

## Sections (layout order)

1. Section name - what it shows / does

## Data

| Table | Read / write | Notes |
| --- | --- | --- |
| `table` | read | |

## Actions

| id | intent | permission |
| --- | --- | --- |
| `module.verb` | "phrase a person would say" | `permission.string` |

## Rules

- `R-xxx` - how the page implements or displays it

## Logic

- Calculations, transitions, validations in plain words.

## Components

Library components used (must exist in `/#/dev/components`).

## Real vs mock

What is real today, what is mocked (image generation, LLM, booking provider, payments), what changes when Supabase lands.

## Responsive check (P-01)

Checked at: 360, 390, 768, 1280, 1920, 2560, 3840. Notes on degradation.

## Changelog

- `docs/changelog/NNNN-...md`
