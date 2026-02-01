# Node Description Prompt Template (Claude)

> Шаблон для генерації structured JSON опису ComfyUI ноди через Claude

***

## Інструкція

1. Отримай RAW інфо про ноду з ComfyUI:
   ```bash
   curl http://127.0.0.1:8188/object_info | jq '.NodeClassName' > node.json
   ```

2. Нижче — промпт. Підстав замість `{{RAW_NODE_JSON}}` вміст з node.json (або встав його в чат окремо).

3. Попроси Claude повернути **тільки валідний JSON** без markdown-кодблоків на початку/кінці (або з одним блоком ` ```json ... ``` `).

4. Скопіюй результат у `knowledge/base-nodes.json` → об'єкт `nodes` → ключ `NodeClassName`.

***

## Промпт (шаблон)

```
Ти експерт по ComfyUI. Надай структурований опис ноди у вигляді JSON.

**Сирий вивід ноди з ComfyUI /object_info:**

{{RAW_NODE_JSON}}

**Вимоги до JSON:**

- display_name: людсько-читабельна назва
- category: одна з loaders, conditioning, sampling, latent, image, mask або підходяща
- description: 1-2 речення українською або англійською, що робить нода
- input_types.required: для кожного параметра з input.required — type, description, color (hex для MODEL/CLIP/LATENT/IMAGE/CONDITIONING/VAE/MASK), default/min/max/notes де є
- return_types, return_names, output_colors: з output/output_name; кольори для типів як у таблиці (MODEL #B22222, CLIP #FFD700, CONDITIONING #FFA931, LATENT #FF6E6E, IMAGE #64B5F6, MASK #81C784)
- use_cases: масив 3-5 коротких сценаріїв використання
- compatible_outputs: для кожного return type — масив назв нод, до яких можна підключати вихід
- example_values: приклад значень для ключових параметрів
- priority: "high" | "medium" | "low"

Поверни тільки один JSON-об'єкт, без пояснень до нього.
```

***

## Таблиця кольорів типів (для підстановки в prompt)

| Тип          | Hex     |
|-------------|---------|
| MODEL       | #B22222 |
| CLIP        | #FFD700 |
| VAE         | #FF6E6E |
| CONDITIONING| #FFA931 |
| LATENT      | #FF6E6E |
| IMAGE       | #64B5F6 |
| MASK        | #81C784 |

***

*Template v1.0* | *2026-02-01*
