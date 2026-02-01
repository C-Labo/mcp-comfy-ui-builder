# Add Node - Interactive Wizard Guide

> Гайд по інтерактивному wizard для додавання нод у базу знань

***

## Призначення

Команда `npm run add-node` запускає wizard, який:

1. Запитує class name ноди (або шлях до JSON з `/object_info`)
2. За потреби — дозволяє ввести/завантажити INPUT_TYPES, OUTPUT, author, repo
3. Формує промпт для Claude згідно з `knowledge/node-description-prompt-template.md`
4. Відправляє запит до Claude і отримує structured JSON
5. Показує згенерований JSON і пропонує підтвердити
6. Додає запис у `knowledge/base-nodes.json` (або custom-nodes.json) і оновлює `node-compatibility.json` та CHANGELOG

***

## Режими введення

### 1. З живим ComfyUI

- Вказати class name (наприклад `KSampler`).
- Wizard може сам викликати `GET /object_info` і взяти дані для цієї ноди (якщо реалізовано).

### 2. З файлу

- Шлях до JSON-файлу (наприклад вивід `curl ... | jq '.NodeName' > node.json`).
- Wizard читає файл і підставляє його в промпт для Claude.

### 3. Ручне введення

- Ввести або вставити JSON структури ноди вручну (наприклад скопійований з object_info).

***

## Після генерації

- Перевірити згенерований JSON (display_name, input_types, return_types, use_cases, priority).
- Підтвердити додавання → запис у відповідний JSON і оновлення compatibility/changelog.
- При потребі вручну підправити `knowledge/node-compatibility.json` (producers/consumers).

***

## Залежності

- **ANTHROPIC_API_KEY** — для виклику Claude.
- **knowledge/node-description-prompt-template.md** — шаблон промпту.
- **knowledge/base-nodes.json** / **knowledge/custom-nodes.json** — цільові файли для запису.

***

*Wizard Guide v1.0* | *2026-02-01*

**Повний опис системи**: NODE-DISCOVERY-README.md, node-discovery-system.md
