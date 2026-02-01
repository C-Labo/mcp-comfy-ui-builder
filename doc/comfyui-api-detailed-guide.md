# 📖 ComfyUI API Detailed Guide

> Повний довідник по ComfyUI WebSocket та HTTP API для Node Discovery System

***

## 🔌 API Endpoints

### 1. **`/object_info`** ⭐ **Найважливіший для Node Discovery**

**GET** `http://127.0.0.1:8188/object_info`

**Повертає**: Повний список **всіх доступних нод** з їх структурою

**Структура відповіді**:
```json
{
  "NodeClassName": {
    "input": {
      "required": {
        "param_name": ["TYPE", {"default": value, "min": 0, "max": 100}],
        "another_param": ["STRING", {"multiline": true}]
      },
      "optional": {},
      "hidden": {}
    },
    "output": ["OUTPUT_TYPE"],
    "output_is_list": [false],
    "output_name": ["output_name"],
    "name": "NodeClassName",
    "display_name": "Human Readable Name",
    "description": "What the node does",
    "category": "category/subcategory",
    "output_node": false
  }
}
```

**Приклад**:
```bash
curl http://127.0.0.1:8188/object_info | jq '.KSampler'
```

### 2. **`/history/{prompt_id}`** - Workflow History

**GET** `http://127.0.0.1:8188/history/{prompt_id}`

### 3. **`/system_stats`** - Server Status

**GET** `http://127.0.0.1:8188/system_stats`

### 4. **WebSocket API** - Queue Management

```
ws://127.0.0.1:8188/ws?clientId={unique_id}
Messages: status, executed, executing
```

***

## 🛠️ Node Structure Deep Dive

### INPUT_TYPES Format

- `["STRING"]` - Text input
- `["INT", {options}]` - Integer number
- `["FLOAT", {options}]` - Float number
- `["COMBO", ["opt1", "opt2"]]` - Dropdown
- `["MODEL"]`, `["CLIP"]`, `["LATENT"]` - Node outputs

### RETURN_TYPES - Основні типи виходів

| Тип | Кольор | Приклади нод |
| :-- | :-- | :-- |
| MODEL | #B22222 | CheckpointLoader → KSampler |
| CLIP | #FFD700 | CheckpointLoader → CLIPTextEncode |
| VAE | #FF6E6E | CheckpointLoader → VAEDecode |
| CONDITIONING | #FFA931 | CLIPTextEncode → KSampler |
| LATENT | #FF6E6E | KSampler → VAEDecode |
| IMAGE | #64B5F6 | VAEDecode → SaveImage |
| MASK | #81C784 | ImageToMask → SetLatentNoiseMask |

***

## 🔍 API Usage Examples

```bash
# Повний список нод
curl -s http://127.0.0.1:8188/object_info | jq 'keys | length'

# Node Input/Output Analysis
curl -s http://127.0.0.1:8188/object_info | jq '.KSampler | {inputs: .input.required | keys, outputs: .output}'
```

***

## ⚙️ Configuration

```bash
export COMFYUI_HOST="http://127.0.0.1:8188"
export COMFYUI_TIMEOUT=30
export NODE_SCAN_BATCH_SIZE=5
```

***

## 🔧 Troubleshooting

- **Connection refused**: Запустіть ComfyUI `python main.py --listen`
- **Invalid JSON**: Перевірте ComfyUI logs, restart
- **Empty object_info**: Встановіть ComfyUI-Manager
- **Missing nodes**: Перезапустіть ComfyUI після установки custom nodes

***

## 🔗 Links & Resources

- ComfyUI GitHub: https://github.com/comfyanonymous/ComfyUI
- ComfyUI Manager: https://github.com/Comfy-Org/ComfyUI-Manager
- ComfyUI Docs: https://docs.comfy.org/
- Custom Nodes List: https://github.com/Comfy-Org/ComfyUI-Manager/blob/main/custom-node-list.json

***

*Last Updated: 2026-02-01*
