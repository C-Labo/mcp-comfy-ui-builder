# Knowledge Base - Node Discovery System

> Структура бази знань, формати даних, як розширювати

***

## 📁 Структура файлів

```
knowledge/
├── base-nodes.json          # Базові ноди ComfyUI (KSampler, CheckpointLoader, ...)
├── custom-nodes.json       # Кастомні node packs (ComfyUI-Manager, WAS Suite, ...)
├── node-compatibility.json # Типи даних, producers/consumers, правила сумісності
├── README.md               # Цей файл
├── node-description-prompt-template.md  # Prompt для Claude (опис нод)
└── CHANGELOG.md            # Історія змін (auto-generated при scan)
```

***

## Формат даних

### base-nodes.json

- **metadata**: version, last_updated, total_nodes, categories
- **nodes**: об'єкт `{ "NodeClassName": { ... } }`

Кожна нода містить:

- `display_name`, `category`, `description`
- `input_types`: `{ required: { param: { type, description, color?, default?, notes? } }, optional? }`
- `return_types`, `return_names`, `output_colors`
- `use_cases`, `compatible_outputs`, `example_values`
- `priority`: "high" | "medium" | "low"

### custom-nodes.json

- Список node packs з полями: name, repo, priority, key_nodes, use_cases, models

### node-compatibility.json

- **data_types**: для кожного типу (MODEL, CLIP, LATENT, IMAGE, ...): color, producers[], consumers[]
- Може містити workflow_patterns, validation_rules

***

## Як додати нову ноду

1. **Вручну**: додати об'єкт у `base-nodes.json` → nodes.NodeClassName (або у custom-nodes як pack).
2. **Через Claude**: використати `node-description-prompt-template.md` + JSON з `/object_info` → вставити результат у base-nodes.json.
3. **Автоматично** (після імплементації): `npm run scan` або `npm run add-node`.

Після додавання ноди варто оновити `node-compatibility.json` (producers/consumers для типів).

***

## TypeScript integration

```typescript
import baseNodes from './knowledge/base-nodes.json';
import compatibility from './knowledge/node-compatibility.json';

const nodeNames = Object.keys(baseNodes.nodes);
const nodeInfo = baseNodes.nodes['KSampler'];
const modelProducers = compatibility.data_types?.MODEL?.producers ?? [];
```

***

*Knowledge Base README v1.0* | *2026-02-01*
