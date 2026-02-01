# Generate and Verify Pipeline

> Згенерувати зображення за запитом і перевірити результат (image-to-text / порівняння з очікуванням).

***

## Ідея

1. **Згенерувати**: користувач просить, наприклад, «реалістичні яблука на зеленій тканині» → будується txt2img воркфлоу → виконується → отримуємо зображення.
2. **Перевірити**: зображення з кроку 1 передається в інший воркфлоу з нодами image-to-text (BLIP / caption) → отримуємо текстовий опис → порівнюємо з очікуванням (яблука, зелена тканина) або перевіряємо логічно в асистенті.

Цей документ описує, як реалізувати такий pipeline за допомогою MCP ComfyUI Builder та ComfyUI.

***

## Потік з існуючими інструментами

### Крок 1: Генерація

- `build_workflow("txt2img", { prompt: "realistic apples on green fabric", ... })` → отримати workflow JSON.
- `execute_workflow(workflow)` → отримати `prompt_id`.
- Дочекатися завершення (наприклад, перевірка черги або повторні виклики статусу).
- `get_execution_status(prompt_id)` → переконатися, що є вихідні зображення та URL перегляду.

### Крок 2: Підготовка зображення для другого воркфлоу

Зображення з SaveImage зберігається в **output** ComfyUI, а LoadImage за замовчуванням читає з **input**. Щоб використати згенероване зображення у воркфлоу перевірки (наприклад, image-to-text):

- **prepare_image_for_workflow(prompt_id)** — завантажує перше вихідне зображення з `/view`, заливає його в `/upload/image` (input) і повертає ім’я файлу для LoadImage.

Після цього можна будувати другий воркфлоу з параметром `image: "<повернуте ім'я>"`.

### Крок 3: Воркфлоу перевірки (image → текст)

Варіанти:

- **Шаблон image_caption** (потрібні кастомні ноди):
  - `build_workflow("image_caption", { image: "<filename з prepare_image_for_workflow>" })` → workflow: LoadImage → BLIPCaption (або аналог).
  - Потрібно встановити один із паків: [ComfyUI-Blip](https://github.com/1038lab/ComfyUI-Blip), [comfyui-art-venture](https://github.com/cubiq/comfyui_art_venture) (BLIPCaption), або [img2txt-comfyui-nodes](https://github.com/christian-byrne/img2txt-comfyui-nodes) (BLIP / LLaVA / MiniCPM).
- **Власний воркфлоу**: якщо у вас інша назва ноди (наприклад, інший class_type), побудуйте воркфлоу вручну або через `suggest_nodes` / `get_node_info`.

Виконати: `execute_workflow(workflow_verify)` → отримати `prompt_id_verify` → `get_execution_status(prompt_id_verify)`. Якщо нода віддає текст, він з’явиться в статусі (поле `node X text: ...`).

### Крок 4: Порівняння з очікуванням

- Очікування: «яблука», «зелена тканина», «реалістичні».
- Опис з BLIP/caption: отриманий текст з `get_execution_status` для воркфлоу перевірки.
- Асистент або ваш код може перевірити наявність ключових слів або семантичну відповідність (наприклад, через LLM або прості ключові слова).

***

## Повний приклад (псевдокод)

```
1. workflow_gen = build_workflow("txt2img", { prompt: "realistic apples on green fabric", width: 512, height: 512 })
2. prompt_id_gen = execute_workflow(workflow_gen)
3. [чекати завершення]
4. get_execution_status(prompt_id_gen)  → переконатися, що є images
5. prepare_image_for_workflow(prompt_id_gen)  → filename, наприклад "ComfyUI_00001.png"
6. workflow_verify = build_workflow("image_caption", { image: "ComfyUI_00001.png" })
7. prompt_id_verify = execute_workflow(workflow_verify)
8. [чекати завершення]
9. get_execution_status(prompt_id_verify)  → node 2 text: "apples on green fabric ..."
10. Порівняти отриманий текст з очікуванням (яблука, зелена тканина).
```

***

## Альтернатива: зовнішній Vision API

Якщо не хочете ставити кастомні ноди в ComfyUI:

1. Після `get_execution_status(prompt_id)` використовуйте **view URL** згенерованого зображення.
2. Ваш сервіс або асистент може викликати зовнішній image-to-text (наприклад, OpenAI Vision, Google Vision) по цьому URL або після завантаження зображення.
3. Порівняння з очікуванням робити в коді або в діалозі.

У такому варіанті `prepare_image_for_workflow` і шаблон `image_caption` не обов’язкові; достатньо view URL та зовнішнього API.

***

## Підсумок

| Крок | Інструмент / дія |
|------|-------------------|
| Згенерувати | `build_workflow("txt2img", ...)` → `execute_workflow` |
| Отримати результат | `get_execution_status(prompt_id)` (images + view URLs) |
| Підготувати для другого воркфлоу | `prepare_image_for_workflow(prompt_id)` → filename для LoadImage |
| Перевірити (image→text у ComfyUI) | `build_workflow("image_caption", { image: filename })` → `execute_workflow` → `get_execution_status` (text) |
| Порівняти | Ключові слова або LLM по отриманому опису та очікуванню |

Шаблон **image_caption** потребує встановленого пакета з нодою типу BLIPCaption (або аналогом). Якщо у вас інший class_type — побудуйте воркфлоу вручну і використовуйте той самий підхід: LoadImage(файл з prepare_image_for_workflow) → ваша caption-нода.
