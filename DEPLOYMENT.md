# 部署说明

## 构建项目

```bash
npm run build
```

## 部署方式

### 方式一：使用Hash路由（推荐，已配置）
- 生产环境自动使用hash路由模式
- 直接将 `dist` 文件夹内容上传到服务器
- 无需特殊服务器配置

### 方式二：如果使用History路由
需要配置服务器支持SPA：

#### Nginx 配置
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache 配置
在 `dist` 目录下创建 `.htaccess` 文件：
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 常见问题

1. **页面空白**：检查控制台错误，可能是资源路径问题
2. **刷新404**：服务器未配置SPA支持，使用hash路由或配置服务器
3. **API请求失败**：检查API地址配置，确保服务器可以访问API

## 检查清单

- [ ] 构建成功无错误
- [ ] dist文件夹包含 index.html 和 assets 文件夹
- [ ] 服务器可以访问API地址：http://47.119.138.66:15000
- [ ] 浏览器控制台无错误信息 