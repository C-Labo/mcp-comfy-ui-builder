# 📚 Node Discovery System - Документація Index

> Навігація по всій документації системи

***

## 🚀 Quick Start

**Якщо ви тут вперше - почніть звідси:**

1. 📖 **[SUMMARY.md](SUMMARY.md)** - огляд всієї системи за 5 хвилин
2. 🎯 **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - швидкі команди і приклади
3. 🏗️ **[SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md)** - візуальне розуміння архітектури

**Потім перейдіть до детальної документації:**

4. 📘 **[NODE-DISCOVERY-README.md](NODE-DISCOVERY-README.md)** - повний гайд по використанню
5. 🔧 **[node-discovery-system.md](node-discovery-system.md)** - технічна імплементація
6. 📖 **[comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md)** - ComfyUI API довідник

***

## 📁 Структура документації

### 🎯 Основні документи

| Документ | Призначення | Коли читати | Розмір |
| :-- | :-- | :-- | :-- |
| **[SUMMARY.md](SUMMARY.md)** | Підсумок всього проєкту, key features, статистика | Перше що читати для розуміння що є | 553 рядки |
| **[NODE-DISCOVERY-README.md](NODE-DISCOVERY-README.md)** | Повний гайд: установка, команди, use cases, troubleshooting | Коли плануєте використовувати систему | 741 рядок |
| **[node-discovery-system.md](node-discovery-system.md)** | Технічна архітектура, API, код, імплементація деталі | Коли розробляєте або інтегруєте | 948 рядків |
| **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** | Швидкий довідник команд, JSON структур, кольорів | Під час роботи, quick lookup | 449 рядків |
| **[SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md)** | Візуальні діаграми, flow charts, архітектура | Для розуміння потоку даних | 609 рядків |
| **[comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md)** | Повний довідник ComfyUI API для сканування | Для розуміння джерел даних | 450+ рядків |
| **[IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md)** | Покроковий план імплементації коду | Коли готові писати TypeScript | 639 рядків |

### 📋 Додаткові гайди

| Документ | Призначення | Розмір |
| :-- | :-- | :-- |
| **[GETTING-STARTED.md](GETTING-STARTED.md)** | Швидкий старт, практичні приклади | 410 рядків |
| **[knowledge/README.md](knowledge/README.md)** | Структура бази знань, формати даних | 581 рядок |
| **[knowledge/node-description-prompt-template.md](knowledge/node-description-prompt-template.md)** | Prompt template для Claude | 373 рядки |
| **[scripts/add-node-interactive.md](scripts/add-node-interactive.md)** | Гайд по інтерактивному wizard | 536 рядків |

### 📊 База знань (JSON)

| Файл | Вміст | Розмір |
| :-- | :-- | :-- |
| **[knowledge/base-nodes.json](knowledge/base-nodes.json)** | 50+ базових ComfyUI нод з повною інформацією | 713 рядків |
| **[knowledge/custom-nodes.json](knowledge/custom-nodes.json)** | 15+ кастомних node packs з метаданими | 487 рядків |
| **[knowledge/node-compatibility.json](knowledge/node-compatibility.json)** | Типи даних, producers/consumers, правила сумісності | 433 рядки |

***

## 🎓 Навчальні шляхи

### Шлях 1: "Швидкий старт" (15 хвилин)

```
1. SUMMARY.md (5 хв) → Розуміння що таке система
2. GETTING-STARTED.md (5 хв) → Практичні приклади
3. QUICK-REFERENCE.md (5 хв) → Основні команди
```

### Шлях 2: "Повне розуміння" (1 година)

```
1. SUMMARY.md (10 хв) → Загальний огляд
2. SYSTEM-DIAGRAM.md (15 хв) → Візуальна архітектура
3. comfyui-api-detailed-guide.md (15 хв) → Джерела даних
4. NODE-DISCOVERY-README.md (20 хв) → Детальні use cases
```

### Шлях 3: "Імплементація" (2-4 години)

```
1. SUMMARY.md (10 хв) → Контекст
2. IMPLEMENTATION-CHECKLIST.md (30 хв) → План дій
3. node-discovery-system.md (30 хв) → Архітектура і код
4. Написати код (2-3 год) → scanner.ts, ai-generator.ts, updater.ts
```

### Шлях 4: "Ручне використання" (30 хвилин)

```
1. GETTING-STARTED.md (10 хв) → Приклади
2. knowledge/node-description-prompt-template.md (10 хв) → Як писати prompt
3. Практика (10 хв) → Додати 1-2 ноди через Claude
```

***

## 🔍 Пошук по темах

**Хочу автоматично сканувати нові ноди:** → NODE-DISCOVERY-README.md, QUICK-REFERENCE.md  
**Хочу вручну додати ноду через wizard:** → GETTING-STARTED.md, scripts/add-node-interactive.md  
**Хочу використовувати Claude для опису:** → knowledge/node-description-prompt-template.md  
**Хочу зрозуміти структуру JSON:** → knowledge/README.md, QUICK-REFERENCE.md  
**Хочу інтегрувати з MCP сервером:** → node-discovery-system.md  
**Хочу зрозуміти ComfyUI API:** → comfyui-api-detailed-guide.md  

***

## 📖 Типові питання (FAQ)

### Q: З чого почати?
**A:** SUMMARY.md → GETTING-STARTED.md → QUICK-REFERENCE.md

### Q: Як додати нову ноду?
**A:** Автоматично: `npm run scan`. Інтерактивно: `npm run add-node`. Вручну: curl object_info + prompt template + додати JSON.

### Q: Як працює AI генерація?
**A:** Система збирає metadata з `/object_info`, генерує prompt для Claude, Claude повертає JSON, JSON додається в базу знань.

### Q: Яка структура JSON для ноди?
**A:** Мінімальна: display_name, category, description, input_types, return_types, priority.

### Q: Як інтегрувати з моїм проєктом?
**A:** Скопіювати knowledge/, імплементувати classes з node-discovery-system.md, налаштувати шляхи, додати CLI.

***

## 🎨 Візуальна навігація

```
Node Discovery System Documentation
│
├── 🎯 Core Documents (5 files)
│   ├── SUMMARY.md
│   ├── NODE-DISCOVERY-README.md
│   ├── node-discovery-system.md
│   ├── comfyui-api-detailed-guide.md
│   └── SYSTEM-DIAGRAM.md
│
├── 🚀 User Guides (3 files)
│   ├── GETTING-STARTED.md
│   ├── QUICK-REFERENCE.md
│   └── IMPLEMENTATION-CHECKLIST.md
│
├── 📦 Knowledge Base (3 JSON files)
│   ├── base-nodes.json
│   ├── custom-nodes.json
│   └── node-compatibility.json
│
└── 🤖 Templates & Guides (2 files)
    ├── node-description-prompt-template.md
    └── add-node-interactive.md
```

***

## 📊 Статистика документації

- Загальна кількість файлів: 13
- Загальна кількість рядків: 6,700+
- Documentation Coverage: 100%

***

*Navigation Guide Version: 1.1.0*  
*Last Updated: 2026-02-01*  
*Total Documentation: 6,700+ lines across 13 files*

**Почніть з [SUMMARY.md](SUMMARY.md) та користуйтесь цим INDEX для навігації!**
