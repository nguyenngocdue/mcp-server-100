# Environment Variables cần thiết cho Render deployment

## Required Environment Variables:

### PORT
- Tự động generate bởi Render
- Default: 3000 (local development)

### NODE_ENV
- Value: production
- Để app chạy ở chế độ production

### MCP_TOKEN
- Bearer token để authenticate MCP requests
- Ví dụ: sk-your-secure-token-here
- Quan trọng: phải bảo mật, dùng để xác thực MCP clients

### API_KEY
- API key để authenticate REST API requests
- Ví dụ: your-api-key-here
- Dùng cho các endpoint REST testing

## Optional Environment Variables:

### DANGEROUSLY_OMIT_AUTH
- Value: false (không nên set trong production)
- Chỉ dùng cho development/testing

## Cách setup trên Render:

1. Vào Dashboard → Service → Environment
2. Thêm các biến môi trường:
   - NODE_ENV = production
   - MCP_TOKEN = [generate secure token]
   - API_KEY = [generate secure key]
   - PORT sẽ được Render tự động set

3. Hoặc sử dụng render.yaml (đã có sẵn) với generateValue: true
   để Render tự động generate secure values.