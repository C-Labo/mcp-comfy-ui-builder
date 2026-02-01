# 🚀 Quick Reference - Node Discovery System

> Швидкий довідник команд, структур, кольорів та прикладів

***

## ⚡ Найчастіші команди (Copy-Paste Ready)

### 🔍 Автоматичний скан нових нод

```bash
npm run scan
npm run scan:dry
npm run scan -- --host http://192.168.1.100:8188
ANTHROPIC_API_KEY=sk-ant-... npm run scan
```

### ➕ Додати одну ноду

```bash
npm run add-node
curl http://127.0.0.1:8188/object_info | jq '.NodeName' > node.json
npm run add-node  # В wizard: "file" → node.json
```

### 🔄 Синхронізація

```bash
npm run sync-manager
npm run analyze https://github.com/WASasquatch/was-node-suite-comfyui
```

### 🧪 Тести та MCP

```bash
npm test
npm run test:watch
npm run build && npm run mcp
```

**Змінні:** `COMFYUI_HOST`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` (для analyze), `DEBUG=1` (детальний лог).

***

## 📁 Швидкий огляд файлів

```
knowledge/
├── base-nodes.json
├── custom-nodes.json
├── node-compatibility.json
└── node-description-prompt-template.md

Документи: SUMMARY.md, QUICK-REFERENCE.md, GETTING-STARTED.md, SYSTEM-DIAGRAM.md
```

***

## 🎨 Кольори типів даних

| Тип | Hex | Producers | Consumers |
| :-- | :-- | :-- | :-- |
| MODEL | #B22222 | CheckpointLoader | KSampler |
| CLIP | #FFD700 | CheckpointLoader | CLIPTextEncode |
| CONDITIONING | #FFA931 | CLIPTextEncode | KSampler |
| LATENT | #FF6E6E | EmptyLatentImage | KSampler, VAEDecode |
| IMAGE | #64B5F6 | VAEDecode | SaveImage |
| MASK | #81C784 | ImageToMask | SetLatentNoiseMask |
| INT/FLOAT | #A9A9A9 | - | steps, cfg |
| STRING | #A9A9A9 | - | prompts |

***

## 📋 JSON структура ноди (мінімальна)

```json
{
  "display_name": "Node Name",
  "category": "image/processing",
  "description": "What it does in 1-2 sentences",
  "input_types": {
    "required": {
      "param1": {"type": "IMAGE", "color": "#64B5F6"},
      "strength": {"type": "FLOAT", "default": 1.0}
    }
  },
  "return_types": ["IMAGE"],
  "return_names": ["IMAGE"],
  "output_colors": ["#64B5F6"],
  "priority": "medium"
}
```

***

## 🔍 ComfyUI API Quick Commands

```bash
curl http://127.0.0.1:8188/system_stats | jq '.system.gpu_name'
curl http://127.0.0.1:8188/object_info | jq 'keys | length'
curl http://127.0.0.1:8188/object_info | jq '.KSampler.input.required | keys'
```

***

## 🐛 Troubleshooting (Top 5)

| Проблема | Рішення |
| :-- | :-- |
| Connection refused | python main.py --listen 0.0.0.0 --port 8188 |
| No ANTHROPIC_API_KEY | export ANTHROPIC_API_KEY=sk-ant-... |
| Invalid JSON from Claude | Перевірити prompt template |
| Node already exists | Нормально! Пропускається |
| Timeout scanning | Збільшити timeout або restart ComfyUI |

***

*Quick Reference v1.2.0* | *2026-02-01*
