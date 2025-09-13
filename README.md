```md
# MCP Node/TS Server


### Install & Run
```bash
pnpm i
cp .env.example .env
pnpm dev
```


### Endpoints
- `GET /health`
- `GET /mcp/tools`
- `POST /mcp/invoke` → body `{ "tool": "ping", "arguments": { "name": "Due" } }`


### Notes
- Add `x-api-key: <API_KEY>` if API key is set in `.env`.
- Add new tools in `src/mcp/tools/*` and register in `src/mcp/registry.ts`.
```
```


---


## 17) Cách chạy & test nhanh
```bash
# 1) Cài deps
pnpm i


# 2) Tạo file .env
cp .env.example .env
# (chỉnh PORT/API_KEY nếu muốn)


# 3) Chạy dev
pnpm dev
# hoặc build & start
pnpm build && pnpm start


# 4) Test
curl -s http://localhost:3000/mcp/tools | jq
curl -s -X POST http://localhost:3000/mcp/invoke \
-H "content-type: application/json" \
-d '{"tool":"ping","arguments":{"name":"Due"}}' | jq
```


> Sẵn sàng để expose qua ngrok/cloud & tích hợp vào app chính. Khi cần chuẩn MCP đầy đủ, có thể thay lớp router này bằng SDK MCP chính thức mà vẫn giữ nguyên `registry` + hợp đồng `{tool, arguments}` để refactor mượt.