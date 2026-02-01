# 🚀 ComfyUI API Quick Reference
> Швидкий довідник по всіх endpoints, прикладам curl та найпоширенішим паттернам
## 📋 Endpoints Table
| Endpoint | Method | Мета | Параметри | Відповідь | Приклад curl | Use Case |
|----------|--------|------|-----------|-----------|-------------|----------|
| `/object_info` | **GET** | 🔍 Виявлення нод | None | JSON з усіма node definitions | `curl http://127.0.0.1:8188/object_info` | **Node Discovery** - отримати INPUT/OUTPUT типи |
| `/prompt` | **POST** | ▶️ Виконання workflow | JSON workflow | `{"prompt_id": "..."}` | `curl -X POST -d @workflow.json http://127.0.0.1:8188/prompt` | **Основний** - запустити генерацію |
| `/history` | **GET** | 📜 Історія | None | Масив завершених prompt | `curl http://127.0.0.1:8188/history` | Отримати результати минулих запусків |
| `/history/{prompt_id}` | **GET** | 📋 Деталі run | prompt_id | JSON з outputs | `curl http://127.0.0.1:8188/history/prompt_id` | Отримати зображення з конкретного run |
| `/ws` | **WebSocket** | 📡 Live monitoring | `clientId=unique` | Real-time updates | `wscat -c ws://127.0.0.1:8188/ws?clientId=test` | **Live progress** + images |
| `/system_stats` | **GET** | 🖥️ Системні метрики | None | GPU/VRAM/RAM | `curl http://127.0.0.1:8188/system_stats` | Моніторинг ресурсів |
| `/queue` | **GET** | ⏳ Черга | None | Queue length | `curl http://127.0.0.1:8188/queue` | Статус черги завдань |
| `/view` | **GET** | 🖼️ Зображення | `filename`, `type=output` | Image file | `curl "http://127.0.0.1:8188/view?filename=img.png&type=output"` | Отримати згенероване зображення |

***

## 💡 Найпоширеніші команди
### 🔍 **1. Перевірити що ComfyUI працює**
```bash
# Базовий health check
curl http://127.0.0.1:8188/system_stats

# Перевірити кількість нод
curl http://127.0.0.1:8188/object_info | jq 'keys | length'

# Статус черги
curl http://127.0.0.1:8188/queue
```

### 🕵️ **2. Node Discovery (для Node Discovery System)**
```bash
# Всі ноди (save to file)
curl http://127.0.0.1:8188/object_info > all-nodes.json

# Одна нода
curl http://127.0.0.1:8188/object_info | jq '."KSampler"'

# Custom nodes only
curl http://127.0.0.1:8188/object_info | jq 'keys | map(select(startswith("WAS_")))'

# По категорії
curl http://127.0.0.1:8188/object_info | jq '. | to_entries[] | select(.value.category == "sampling") | .key'
```

### ▶️ **3. Запустити workflow**
```bash
# З файлу
curl -X POST http://127.0.0.1:8188/prompt \
  -H "Content-Type: application/json" \
  -d @workflow.json

# Inline JSON (simple example)
curl -X POST http://127.0.0.1:8188/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "1": {
      "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"},
      "class_type": "CheckpointLoaderSimple"
    }
  }'
```

### 📡 **4. Live monitoring (WebSocket)**
```bash
# Install wscat
npm i -g wscat

# Connect (отримати clientId)
CLIENT_ID=$(uuidgen)
wscat -c "ws://127.0.0.1:8188/ws?clientId=$CLIENT_ID"

# Після підключення відправити prompt через /prompt
# Отримаємо live updates тут
```

### 🖼️ **5. Отримати зображення**
```bash
# З history спочатку отримати filenames
curl http://127.0.0.1:8188/history | jq '.[].outputs["7"]["images"]'

# Отримати конкретне зображення
curl "http://127.0.0.1:8188/view?filename=00001.png&type=output&subfolder=output" > image.png
```

***

## 🧩 **Workflow Patterns**
### Pattern 1: **Full Automation**
```bash
#!/bin/bash
# 1. Discover nodes
curl http://127.0.0.1:8188/object_info > nodes.json

# 2. Build workflow (your logic)
node build-workflow.js > workflow.json

# 3. Execute
curl -X POST -d @workflow.json http://127.0.0.1:8188/prompt

# 4. Monitor
wscat -c ws://127.0.0.1:8188/ws?clientId=batch-1
```

### Pattern 2: **Batch Processing**
```bash
#!/bin/bash
# Submit 10 prompts
for i in {1..10}; do
  curl -X POST -d @workflow-$i.json http://127.0.0.1:8188/prompt &
done

# Monitor queue
watch -n 5 'curl http://127.0.0.1:8188/queue'
```

### Pattern 3: **Node Discovery для документації**
```bash
#!/bin/bash
# Для Node Discovery System
curl http://127.0.0.1:8188/object_info | \
  jq '. | to_entries[] | 
      select(.key | startswith("WAS_")) | 
      {class_name: .key, input_types: .value.input, category: .value.category}' > \
  new-nodes.json

# Кожна нода готова для Claude prompt
```

***

## 🔍 **JQ Cheatsheet для /object_info**
```bash
# Кількість нод
jq 'keys | length' object_info.json

# Список всіх нод
jq -r 'keys[]' object_info.json

# Ноди по категорії
jq -r '. | to_entries[] | select(.value.category == "image") | .key' object_info.json

# INPUT_TYPES для конкретної ноди
jq '."KSampler".input.required' object_info.json

# Пошук нод з конкретним input типом
jq '. | to_entries[] | 
    select(.value.input.required.model // empty) | 
    .key' object_info.json

# Custom nodes (по naming convention)
jq -r 'keys | map(select(startswith("WAS_") or startswith("Impact_")))[]' object_info.json
```

***

## 📡 **WebSocket Messages Reference**
### Вхідні (Client → Server)
```json
{"type": "status", "data": {"node_id": "6", "title": "KSampler"}}
```

### Вихідні (Server → Client)
```json
// Progress
{"type": "progress", "data": {"value": 0.5}}

// Node status
{"type": "status", "data": {
  "node_id": "6",
  "title": "KSampler",
  "status": {"title": "Progress", "value": 0.25}
}}

// Execution complete
{"type": "executed", "data": {
  "node_id": "7",
  "output": {
    "images": [{"filename": "00001.png", "subfolder": "output", "type": "output"}]
  }
}}

// Workflow complete
{"type": "execution_cached", "nodes": {...}}
```

***

## 🛠️ **Troubleshooting**
| Проблема | Рішення |
|----------|---------|
| `Connection refused` | `python main.py --listen` |
| `Empty /object_info` | Restart ComfyUI після custom nodes |
| `WebSocket: clientId required` | `?clientId=$(uuidgen)` |
| `Out of memory` | `curl /system_stats`, unload models |
| `Queue full` | `curl /queue`, wait or scale |
| `Filename not found` | Check `subfolder=output`, `type=output` |

***

## ⚙️ **Configuration**
### Запуск ComfyUI для API
```bash
# Local development
python main.py

# Network access
python main.py --listen 0.0.0.0 --port 8188

# High performance
python main.py --listen --force-fp16 --dont-upcast-attention

# With custom nodes
cd ComfyUI
pip install -r requirements.txt
python main.py --listen
```

### Docker
```bash
docker run -it --gpus all -p 8188:8188 comfyui:latest
```

***

## 🔗 **Пов'язані Resources**
| Resource | URL |
|----------|-----|
| ComfyUI GitHub | https://github.com/comfyanonymous/ComfyUI |
| ComfyUI Manager | https://github.com/ltdrdata/ComfyUI-Manager |
| API Docs (Swagger) | http://127.0.0.1:8188/docs |
| Custom Nodes List | https://github.com/Comfy-Org/ComfyUI-Manager/blob/main/custom-node-list.json |
| Node Registry | https://comfyregistry.org/ |

***

## 🎯 **Для Node Discovery System**
### Швидкий extract нових нод:
```bash
#!/bin/bash
# Save current nodes
curl http://127.0.0.1:8188/object_info | jq -r 'keys[]' > current-nodes.txt

# After installing new custom nodes + restart
curl http://127.0.0.1:8188/object_info | jq -r 'keys[]' > new-nodes.txt

# New nodes only
comm -13 current-nodes.txt new-nodes.txt

# Full info for new nodes
curl http://127.0.0.1:8188/object_info | jq '. | with_entries(select(.key | IN(["WAS_Image_Blend"])))'
```

***

**Quick Reference Complete! Copy-paste ready 🚀**

*Version: 1.0.0*  
*Updated: 2026-02-01*  
*Endpoints: 8 core APIs*  
*Ready for production use!*