# 🔍 ComfyUI Node Discovery System

> Автоматична система для виявлення, аналізу та документування ComfyUI нод з AI-powered описами

***

## 🎯 Огляд

**Проблема**: Новий custom node pack = десятки нод без документації для AI.

**Рішення**: Система яка **автоматично**:

1. **Виявляє** нові ноди з ComfyUI API
2. **Аналізує** їх структуру (INPUT/OUTPUT types)
3. **Генерує** детальні описи через Claude AI
4. **Оновлює** базу знань у structured JSON

**Результат**: Повна база знань для MCP сервера за 25 хвилин замість 25 годин ручної роботи.

***

## 🚀 Quick Start

### Встановлення (5 хвилин)

```bash
git clone <your-repo>
cd comfyui-node-discovery
npm install
export ANTHROPIC_API_KEY="sk-ant-your-key"
cd ComfyUI && python main.py --listen
```

### Перший запуск (2 хвилини)

```bash
npm run scan
```

***

## 📦 Встановлення

### Prerequisites

- Node.js 18+
- ComfyUI на http://127.0.0.1:8188
- Claude API key (Anthropic)
- ComfyUI-Manager (рекомендовано)

### Full Setup

```bash
mkdir comfyui-node-discovery && cd comfyui-node-discovery
npm init -y
npm install @anthropic-ai/sdk @octokit/rest commander node-fetch
npm install -D typescript @types/node tsx
echo 'ANTHROPIC_API_KEY=your-key-here' > .env
echo 'COMFYUI_HOST=http://127.0.0.1:8188' >> .env
cp -r knowledge/ .
```

***

## 🛠️ CLI Commands

| Команда | Опис |
| :-- | :-- |
| `npm run scan` | Автоматичний скан нових нод, Claude описи, оновлення JSON |
| `npm run scan:dry` | Dry run без змін |
| `npm run sync-manager` | Оновлює список custom node packs з ComfyUI Manager |
| `npm run analyze <repo-url>` | Аналізує GitHub репозиторій і додає ноди |
| `npm run add-node` | Інтерактивний wizard для ручного додавання |

***

## 📊 База знань

### Структура файлів

```
knowledge/
├── base-nodes.json          # 52 базові ноди (KSampler, ...)
├── custom-nodes.json        # 15 custom packs (WAS Suite, ...)
├── node-compatibility.json  # 11 типів даних + 150+ зв'язків
├── README.md
└── CHANGELOG.md             # auto-generated
```

### Node Format (JSON Schema)

```json
{
  "display_name": "KSampler",
  "category": "sampling",
  "description": "Core diffusion sampling node",
  "input_types": {
    "required": {
      "model": {"type": "MODEL", "color": "#B22222"},
      "steps": {"type": "INT", "default": 20}
    }
  },
  "return_types": ["LATENT"],
  "use_cases": ["txt2img", "img2img"],
  "priority": "high"
}
```

***

## 🎨 Type System

| Тип | Кольор | Producers | Consumers |
| :-- | :-- | :-- | :-- |
| MODEL | #B22222 | CheckpointLoader | KSampler |
| CLIP | #FFD700 | CheckpointLoader | CLIPTextEncode |
| CONDITIONING | #FFA931 | CLIPTextEncode | KSampler |
| LATENT | #FF6E6E | EmptyLatentImage | KSampler, VAEDecode |
| IMAGE | #64B5F6 | VAEDecode | SaveImage |

***

## 🤖 AI Generation Pipeline

ComfyUI /object_info → NodeScanner → Claude Prompt → JSON Description → Knowledge Base

**Prompt Template**: knowledge/node-description-prompt-template.md

***

## 🧪 Use Cases

### Use Case 1: Щотижневе оновлення

```bash
npm run scan
npm run sync-manager
git add knowledge/ && git commit -m "Weekly node update"
```

### Use Case 2: Новий node pack

Встановити в ComfyUI custom_nodes, перезапустити ComfyUI, потім `npm run scan`.

### Use Case 3: Ручне додавання

```bash
npm run add-node
```

***

## 🏗️ Architecture

ComfyUI /object_info → NodeScanner → AI Generator (Claude) → KnowledgeBaseUpdater → JSON Files → MCP Server

**Деталі**: node-discovery-system.md

***

## 🐛 Troubleshooting

| Проблема | Рішення |
| :-- | :-- |
| Connection refused | python main.py --listen 0.0.0.0 --port 8188 |
| Invalid JSON | Перезапустити ComfyUI, перевірити logs |
| Claude API error | Перевірити ANTHROPIC_API_KEY |
| Rate limit exceeded | Зменшити NODE_BATCH_SIZE |

**Деталі**: comfyui-api-detailed-guide.md

***

*Version: 1.1.0* | *Updated: 2026-02-01*
