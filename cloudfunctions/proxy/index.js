// 云函数代理：绕过云托管网关鉴权，直接调用后端服务
const http = require('http');

const SERVICE_HOST = process.env.SERVICE_HOST || 'springboot-ookp';
const SERVICE_PORT = process.env.SERVICE_PORT || 80;

exports.main = async (event) => {
  const { apiPath = '/api/report/generate/mock', method = 'POST', data = {} } = event;

  console.log('[proxy] 请求:', method, apiPath);

  const postData = JSON.stringify(data);

  const options = {
    hostname: SERVICE_HOST,
    port: SERVICE_PORT,
    path: apiPath,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 30000
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('[proxy] 状态:', res.statusCode);
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[proxy] 错误:', err.message);
      resolve({ code: 500, message: '代理请求失败: ' + err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ code: 504, message: '请求超时' });
    });

    req.write(postData);
    req.end();
  });
};
