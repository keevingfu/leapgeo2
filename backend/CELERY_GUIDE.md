# Celery 后台任务系统使用指南

## 概述

Leap GEO Platform 使用 Celery 进行后台任务处理和定时任务调度。

- **Broker**: Redis (localhost:6382)
- **Backend**: Redis (localhost:6382)
- **任务队列**: `citations`

## 已实现的任务

### 1. 单次 Prompt 扫描任务

**任务名称**: `scan_prompt_citations`

**用途**: 扫描单个 Prompt 在 AI 平台上的引用情况

**参数**:
- `prompt_text` (str): 要搜索的 Prompt 文本
- `project_id` (str): 项目 ID
- `platforms` (List[str], optional): 要扫描的平台列表（默认全部）

**示例**:
```python
from app.tasks.citation_tasks import scan_prompt_citations

result = scan_prompt_citations.delay(
    prompt_text="best mattress for hot sleepers",
    project_id="sweetnight",
    platforms=["you", "perplexity"]
)

print(f"Task ID: {result.id}")
task_result = result.get(timeout=60)  # 等待结果
print(f"Citations found: {task_result['total_citations']}")
```

### 2. 每日定时扫描

**任务名称**: `scheduled_citation_scan`

**调度**: 每天 2:00 AM UTC

**功能**:
- 自动扫描所有活跃项目
- 仅扫描高优先级 Prompt (P0 和 P1)
- 每个项目最多扫描 10 个 Prompt

### 3. 每周全面扫描

**任务名称**: `weekly_comprehensive_scan`

**调度**: 每周一 3:00 AM UTC

**功能**:
- 扫描所有活跃项目的所有 Prompt
- 包括低优先级 Prompt (P2)
- 每个项目最多扫描 50 个 Prompt

### 4. 更新 Citation Rate

**任务名称**: `update_citation_rates`

**功能**:
- 计算每个项目的 Citation Rate 指标
- 基于最近 30 天的数据
- 更新项目表中的 `citation_rate` 字段

## 启动 Celery

### 方式 1: 使用提供的启动脚本

```bash
# 终端 1: 启动 Celery Worker
cd /Users/cavin/Desktop/dev/leapgeo2/backend
./run_celery_worker.sh

# 终端 2: 启动 Celery Beat（定时任务调度器）
cd /Users/cavin/Desktop/dev/leapgeo2/backend
./run_celery_beat.sh
```

### 方式 2: 手动启动

```bash
# 启动 Worker
source venv/bin/activate
celery -A app.celery_app:celery_app worker \
  --loglevel=info \
  --concurrency=2 \
  --queues=citations \
  --hostname=worker@%h

# 启动 Beat（另一个终端）
source venv/bin/activate
celery -A app.celery_app:celery_app beat \
  --loglevel=info \
  --scheduler=celery.beat:PersistentScheduler
```

## 监控 Celery

### 查看任务状态

```bash
# 启动 Celery Flower (Web UI)
source venv/bin/activate
celery -A app.celery_app:celery_app flower

# 访问 http://localhost:5555 查看 Web 界面
```

### 查看定时任务

```bash
source venv/bin/activate
celery -A app.celery_app:celery_app inspect scheduled
```

### 查看活跃任务

```bash
celery -A app.celery_app:celery_app inspect active
```

### 查看已注册任务

```bash
celery -A app.celery_app:celery_app inspect registered
```

## 测试任务执行

使用提供的测试脚本：

```bash
source venv/bin/activate
python test_celery.py
```

## 配置说明

### Celery 配置文件

**文件**: `app/celery_app.py`

**主要配置**:
- `broker_url`: Redis 连接 URL
- `result_backend`: 结果存储 URL
- `beat_schedule`: 定时任务调度表
- `task_routes`: 任务队列路由规则

### 定时任务调度表

```python
beat_schedule = {
    "daily-citation-scan": {
        "task": "app.tasks.citation_tasks.scheduled_citation_scan",
        "schedule": crontab(hour=2, minute=0),  # 每天 2:00 AM
    },
    "weekly-full-scan": {
        "task": "app.tasks.citation_tasks.weekly_comprehensive_scan",
        "schedule": crontab(hour=3, minute=0, day_of_week=1),  # 周一 3:00 AM
    },
}
```

### 修改调度时间

编辑 `app/celery_app.py` 中的 `beat_schedule` 配置，重启 Celery Beat。

## 任务文件位置

- **Celery 应用**: `app/celery_app.py`
- **任务定义**: `app/tasks/citation_tasks.py`
- **启动脚本**: `run_celery_worker.sh`, `run_celery_beat.sh`
- **测试脚本**: `test_celery.py`

## 故障排查

### 1. Worker 无法连接到 Redis

```bash
# 检查 Redis 是否运行
docker ps | grep redis-claude-mcp

# 测试 Redis 连接
redis-cli -h localhost -p 6382 -a claude_redis_2025 ping
```

### 2. 任务一直处于 PENDING 状态

- 确认 Worker 正在运行
- 检查任务队列名称是否正确（默认 `citations`）
- 查看 Worker 日志

### 3. 定时任务未执行

- 确认 Celery Beat 正在运行
- 检查 Beat 日志
- 验证时间zone配置（默认 UTC）

## 生产环境部署建议

1. **使用 Supervisor 或 systemd 管理进程**
2. **配置 Celery Flower 进行监控**
3. **设置任务重试策略和超时**
4. **使用专用 Redis 实例作为 Broker**
5. **配置日志轮转**
6. **监控任务队列长度**

## 扩展任务

### 添加新任务

1. 在 `app/tasks/citation_tasks.py` 中定义任务函数
2. 使用 `@celery_app.task` 装饰器
3. 如需定时执行，在 `app/celery_app.py` 的 `beat_schedule` 中添加调度

示例：
```python
@celery_app.task(name="app.tasks.citation_tasks.my_new_task")
def my_new_task(param1, param2):
    # 任务逻辑
    return {"status": "completed"}
```

### 添加定时任务

在 `app/celery_app.py` 中添加：

```python
beat_schedule = {
    # ... existing tasks ...

    "my-daily-task": {
        "task": "app.tasks.citation_tasks.my_new_task",
        "schedule": crontab(hour=10, minute=30),  # 每天 10:30 AM
        "args": ("arg1", "arg2"),
    },
}
```

## 相关资源

- Celery 官方文档: https://docs.celeryproject.org/
- Redis 文档: https://redis.io/documentation
- Crontab 语法: https://crontab.guru/
