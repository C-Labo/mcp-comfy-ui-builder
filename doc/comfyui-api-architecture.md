# 🏗️ ComfyUI API Architecture
> Повний технічний огляд ComfyUI API, endpoints, data flow та інтеграція custom nodes
ComfyUI надає потужний REST API + WebSocket для програмного керування workflows. Архітектура дозволяє динамічне виявлення нод, виконання workflow та моніторинг у real-time.

## 📋 Основні Endpoints
### 1. **`/object_info`** - Node Discovery (GET)
**Найважливіший endpoint для Node Discovery System**

```bash
curl http://127.0.0.1:8188/object_info
```

**Структура відповіді**:
```json
{
  "KSampler": {
    "input": {
      "required": {
        "model": ["MODEL"],
        "seed": ["INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff}],
        "steps": ["INT", {"default": 20, "min": 1, "max": 10000}],
        "cfg": ["FLOAT", {"default": 8.0, "min": 1e-08, "max": 1e+08}],
        "sampler_name": [
          [
            "euler",
            "euler_ancestral",
            "heun",
            "dpm_2",
            "dpm_2_ancestral",
            "lms",
            "dpm_fast",
            "dpm_adaptive",
            "dpmpp_2s_ancestral",
            "dpmpp_sde",
            "dpmpp_sde_gpu",
            "dpmpp_2m",
            "dpmpp_2m_sde",
            "dpmpp_2m_sde_gpu",
            "dpmpp_2m_karras",
            "restart",
            "ddim",
            "uni_pc",
            "ddpm"
          ]
        ],
        "scheduler": [
          [
            "normal",
            "karras",
            "exponential",
            "sgm_uniform",
            "simple",
            "ddim_uniform"
          ]
        ],
        "positive": ["CONDITIONING"],
        "negative": ["CONDITIONING"],
        "latent_image": ["LATENT"],
        "denoise": ["FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0}]
      }
    },
    "output": ["LATENT"],
    "output_name": ["LATENT"],
    "name": "KSampler",
    "display_name": "KSampler",
    "description": "Samples latent images using diffusion",
    "category": "sampling",
    "output_node": false,
    "node_class": "KSampler"
  },
  // ... 50+ інших нод
}
```

**Ключові поля для Node Discovery**:
- `input.required` - обов'язкові параметри з типами та constraints
- `input.optional` - опціональні параметри
- `output` - типи виходів
- `output_name` - назви виходів
- `category` - категорія для групування
- `display_name` - human-readable назва

***

### 2. **`/prompt`** - Workflow Execution (POST)
```bash
curl -X POST http://127.0.0.1:8188/prompt \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

**Workflow структура**:
```json
{
  "1": {
    "inputs": {
      "ckpt_name": "sd_xl_base_1.0.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "3": {
    "inputs": {
      "text": "portrait of a girl",
      "clip": ["1", 1]
    },
    "class_type": "CLIPTextEncode",
    "links": [[1, 2, 0, 0]]
  },
  "4": {
    "inputs": {
      "text": "blurry, low quality",
      "clip": ["1", 1]
    },
    "class_type": "CLIPTextEncode",
    "links": [[1, 2, 0, 1]]
  },
  // ... повний workflow
  "prompt": {
    "3": {...},
    "4": {...}
  }
}
```

***

### 3. **`/ws`** - WebSocket Live Execution
```
wscat -c ws://127.0.0.1:8188/ws?clientId=unique-client-id
```

**Live execution stream**:
```json
{
  "type": "status",
  "data": {
    "node_id": "6",
    "title": "KSampler",
    "status": {
      "title": "Progress",
      "value": 0.25
    }
  }
}
{
  "type": "executed",
  "data": {
    "node_id": "7",
    "output": {
      "images": ["data:image/png;base64,iVBORw0KGgo..."]
    }
  }
}
{
  "type": "progress",
  "data": {
    "value": 0.75
  }
}
```

***

### 4. **Допоміжні Endpoints**
| Endpoint | Method | Опис | Використання |
|----------|--------|------|--------------|
| `/history` | GET | Історія виконань | Отримати результати минулих workflow |
| `/history/{prompt_id}` | GET | Деталі конкретного виконання | Отримати output конкретного run |
| `/system_stats` | GET | Системні метрики | VRAM, RAM, GPU usage |
| `/queue` | GET | Статус черги | Кількість завдань у черзі |
| `/view` | GET | Отримати зображення | `/view?filename=...&type=output` |

***

## 🔄 Data Flow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   ComfyUI API    │    │   Backend       │
│   (React/Vue)   │    │                  │    │  (Node/Python)  │
└─────────┬───────┘    └──────────┬───────┘    └───────┬────────┘
          │                      │                      │
          │ 1. GET /object_info  │                      │
          └─────────────────────▶│                      │
                                 │                      │
          │ 2. POST /prompt      │                      │
          └─────────────────────▶│                      │
                                 │                      │
          │ 3. WS connect        │                      │
          └─────────────────────▶│                      │
                                 │ 4. Execute workflow  │
                                 │     ↓                │
                                 │  ┌───────────────┐   │
                                 │  │ Node Graph    │   │
                                 │  │ Execution     │   │
                                 │  │ Engine        │   │
                                 │  └─────┬────────┘   │
                                 │        │            │
                                 │        ▼            │
                                 │ ┌───────────────┐  │
                                 │ │  Custom Nodes │  │
                                 │ │  Extensions   │  │
                                 │ └──────────────┘  │
                                 │        │            │
                                 │        ▼            │
                                 │ ┌───────────────┐  │
                                 │ │  PyTorch      │  │
                                 │ │  Inference    │  │
                                 │ └──────────────┘  │
                                 │                    │
          │                      │ 5. Stream updates  │
          ◀─────────────────────│                    │
          │                      │                    │
          │                      │                    │
          └─────────────────────◀────────────────────┘
```

***

## 🧩 Custom Nodes Integration
### Як custom nodes з'являються в `/object_info`
```
custom_nodes/
├── was-node-suite/
│   ├── __init__.py          # NODE_CLASS_MAPPINGS
│   ├── nodes.py             # WAS_Image_Blend class
│   └── requirements.txt
└── impact-pack/
    ├── __init__.py
    └── nodes.py
```

**`__init__.py` в custom node**:
```python
NODE_CLASS_MAPPINGS = {
    "WAS_Image_Blend": WAS_Image_Blend,
    "WAS_Text_Concatenate": WAS_Text_Concatenate,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "WAS_Image_Blend": "Image Blend (WAS)",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
```

**Результат в `/object_info`**:
```json
{
  "WAS_Image_Blend": {
    "input": {
      "required": {
        "image_a": ["IMAGE"],
        "image_b": ["IMAGE"],
        "blend_mode": [["multiply", "screen", "overlay"]]
      }
    },
    "output": ["IMAGE"],
    "category": "image/processing"
  }
}
```

***

## 🔐 Authentication & Rate Limits
### За замовчуванням:
- ✅ **No authentication** - open API
- ✅ **No rate limits** - unlimited requests
- ⚠️ **Localhost only** за замовчуванням

### Production setup:
```bash
# Запуск з network access
python main.py --listen 0.0.0.0 --port 8188

# З authentication (custom extensions)
# Потребує custom auth middleware
```

### Rate limiting (рекомендація):
```
Local development: unlimited
Production: 10 req/s per IP
Batch processing: 1 req/s + queue management
```

***

## 📊 Real-time Capabilities
### WebSocket Protocol
```
Client ── WS ──> Server: {"type": "status", "data": {...}}
Server ── WS ──> Client: {
  "type": "progress",
  "data": {"value": 0.5}
}
Server ── WS ──> Client: {
  "type": "executed", 
  "data": {
    "node_id": "7",
    "output": {"images": ["base64_image"]}
  }
}
```

### Use cases:
- ✅ Live progress tracking
- ✅ Real-time image preview
- ✅ Dynamic workflow modification
- ✅ Multi-client collaboration

***

## 🛠️ API Usage Patterns
### Pattern 1: Node Discovery → Workflow Building
```javascript
// 1. Discover nodes
const objectInfo = await fetch('/object_info').then(r => r.json());

// 2. Build workflow dynamically
const workflow = buildWorkflowFromTemplate(objectInfo);

// 3. Execute
const promptId = await fetch('/prompt', {
  method: 'POST',
  body: JSON.stringify({prompt: workflow})
});

// 4. Monitor via WebSocket
const ws = new WebSocket('ws://127.0.0.1:8188/ws');
```

### Pattern 2: Batch Processing
```javascript
// 1. Get queue status
const queue = await fetch('/queue').then(r => r.json());

// 2. Submit multiple prompts
for (const prompt of prompts) {
  await fetch('/prompt', {method: 'POST', body: JSON.stringify(prompt)});
}

// 3. Poll history
setInterval(async () => {
  const history = await fetch('/history').then(r => r.json());
}, 5000);
```

***

## 🔍 Advanced Features
### 1. **Dynamic Node Registration**
```python
# ComfyUI автоматично сканує:
# custom_nodes/*/__init__.py
# NODE_CLASS_MAPPINGS
# NODE_DISPLAY_NAME_MAPPINGS

# Restart ComfyUI = new nodes appear in /object_info
```

### 2. **Extension Points**
```
ComfyUI/
├── nodes.py              # Base nodes
├── custom_nodes/         # Custom nodes (dynamic)
├── extensions/           # UI extensions
└── server.py             # API server
```

### 3. **Memory Management**
```bash
# /system_stats показує:
{
  "system": {
    "gpu": {"vram": "12.0 GB", "used": "8.2 GB"},
    "ram": {"total": "32.0 GB", "used": "16.5 GB"}
  },
  "models": {
    "loaded": ["sd_xl_base_1.0.safetensors"]
  }
}
```

***

## 🎯 Node Discovery Integration
**Як використовувати з Node Discovery System**:

```bash
# 1. Отримати всі ноди
curl http://127.0.0.1:8188/object_info > all-nodes.json

# 2. Вибрати нові ноди
jq 'keys | map(select(. | startswith("WAS_")))' all-nodes.json

# 3. Для кожної ноди:
curl http://127.0.0.1:8188/object_info | jq '."WAS_Image_Blend"'

# 4. Згенерувати опис через Claude
# 5. Додати в knowledge base
```

**Автоматизація** (після імплементації):
```bash
npm run scan  # Автоматично все вище
```

***

## 🧪 Testing & Validation
### Validate API
```bash
# Перевірити що API працює
curl http://127.0.0.1:8188/system_stats

# Перевірити node discovery
curl http://127.0.0.1:8188/object_info | jq 'keys | length'

# Перевірити WebSocket
wscat -c ws://127.0.0.1:8188/ws
```

### Common Issues
```
❌ "Connection refused" → ComfyUI не запущений
❌ "Empty object_info" → No custom nodes or restart needed
❌ "WebSocket closed" → clientId required
❌ "Out of memory" → Monitor /system_stats
```

***

## 📈 Production Recommendations
### Scaling
```
Single Instance (Development):
- 1x RTX 4090 / A100
- Unlimited local requests

Multi-Instance (Production):
- Load balancer → Multiple ComfyUI instances
- Redis queue for prompt distribution
- Centralized /history storage
```

### Monitoring
```
✅ /system_stats → GPU/VRAM usage
✅ /queue → Pending jobs
✅ WebSocket → Execution progress
✅ /history → Success/failure rates
```

***

## 🎨 Color Coding Reference
| Тип | Hex | Назва | Приклади |
|-----|-----|-------|----------|
| MODEL | #B22222 | 🔴 Model | Checkpoint, LoRA |
| CLIP | #FFD700 | 🟡 CLIP | Text encoders |
| VAE | #FF6E6E | 🔴 VAE | Image encode/decode |
| CONDITIONING | #FFA931 | 🟠 Conditioning | Encoded prompts |
| LATENT | #FF6E6E | 🔴 Latent | Diffusion tensors |
| IMAGE | #64B5F6 | 🔵 Image | RGB/RGBA pixels |
| MASK | #81C784 | 🟢 Mask | Binary masks |

***

**API Architecture Complete! Ready for Node Discovery integration 🚀**

*Version: 1.0.0*  
*Updated: 2026-02-01*  
*Endpoints: 6 core + WebSocket*  
*Custom Node Support: Full dynamic loading*