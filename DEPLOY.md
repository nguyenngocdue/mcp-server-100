# Hướng dẫn Deploy lên Render.com

## Phương pháp 1: Sử dụng render.yaml (Khuyến nghị)

### Bước 1: Chuẩn bị Repository
1. Push code lên GitHub repository
2. Đảm bảo có file `render.yaml` trong root directory

### Bước 2: Connect Repository trên Render
1. Vào https://dashboard.render.com/
2. Click "New +" → "Blueprint"
3. Connect GitHub repository của bạn
4. Render sẽ tự động đọc `render.yaml` và tạo service

### Bước 3: Configure Environment Variables
Render sẽ tự động tạo các environment variables từ `render.yaml`:
- `NODE_ENV`: production
- `PORT`: auto-generated
- `MCP_TOKEN`: auto-generated secure token
- `API_KEY`: auto-generated secure key

### Bước 4: Deploy
- Render sẽ tự động build và deploy
- Build command: `pnpm install && pnpm run build`
- Start command: `pnpm start`

## Phương pháp 2: Manual Setup

### Bước 1: Create Web Service
1. Vào https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub repository

### Bước 2: Configure Service
- **Name**: mcp-server-100
- **Runtime**: Node
- **Region**: Singapore (hoặc gần nhất)
- **Branch**: master/main
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `pnpm start`

### Bước 3: Set Environment Variables
Thêm các biến môi trường:
```
NODE_ENV=production
MCP_TOKEN=sk-your-secure-token-here
API_KEY=your-api-key-here
```

### Bước 4: Deploy
Click "Create Web Service"

## Phương pháp 3: Docker Deployment

### Bước 1: Enable Docker
- Trong service settings, chọn "Docker" làm runtime
- Render sẽ sử dụng `Dockerfile` có sẵn

### Bước 2: Same Environment Variables
Thiết lập environment variables như phương pháp 2

## Sau khi Deploy

### 1. Kiểm tra Health Check
- Truy cập: `https://your-app.onrender.com/health`
- Phải trả về: `{"ok": true}`

### 2. Test MCP Endpoint
```bash
curl -X POST https://your-app.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}},"id":1}'
```

### 3. Test REST API
```bash
curl https://your-app.onrender.com/mcp/tools \
  -H "x-api-key: YOUR_API_KEY"
```

## Domain và HTTPS

Render tự động cung cấp:
- Free subdomain: `your-app.onrender.com`
- SSL certificate (HTTPS)
- Custom domain support (paid plans)

## Monitoring

1. **Logs**: Render Dashboard → Service → Logs
2. **Metrics**: CPU, Memory usage trong dashboard
3. **Health checks**: Tự động ping `/health` endpoint

## Troubleshooting

### Build Failed
- Kiểm tra `pnpm-lock.yaml` có trong repo
- Đảm bảo Node.js version compatibility

### Start Failed
- Kiểm tra environment variables
- Xem logs trong Render dashboard

### 503 Service Unavailable
- Health check failed
- Kiểm tra `/health` endpoint hoạt động

## Free Tier Limitations

- **Sleep after 15 minutes** không hoạt động
- **750 hours/month** runtime
- **512MB RAM**
- **0.1 CPU**

Để tránh sleep, cần upgrade lên paid plan hoặc setup external monitoring.

## Next Steps

1. Setup monitoring/alerting
2. Configure custom domain
3. Add rate limiting cho production
4. Setup CI/CD pipeline
5. Add proper logging aggregation