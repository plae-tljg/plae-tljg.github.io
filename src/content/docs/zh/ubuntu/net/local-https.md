---
title: "HTTPS 配置"
summary: "在这里记录 HTTPS 的配置方法。"
lang: zh
translationKey: "ubuntu-net-local-https"
slug: local-https
track: ubuntu
stage: net
order: 2
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/dev/https.md
---
在这里记录 HTTPS 的配置方法。

## 服务器设置

请先准备如下 `conf` 配置文件：  

**根证书配置（CA 配置）**（`/lib/https/ca.conf`）

```conf
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_ca

[dn]
C = CN
ST = State
L = City
O = Local Development CA
OU = Development
CN = Local Dev Root CA

[v3_ca]
basicConstraints = critical, CA:TRUE
keyUsage = critical, digitalSignature, keyCertSign, cRLSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
```

**服务器证书配置**（`/lib/https/server.conf`）

```conf
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = CN
ST = State
L = City
O = Local Development
OU = Development
CN = 192.0.2.237

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = lkm.local
IP.1 = 192.0.2.237
IP.2 = 192.0.2.150
```

然后运行以下命令生成根证书和服务器证书：  

```bash
mkdir certs && cd certs
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt -config ca.conf    # 生成 CA 根证书

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -config server.conf
    -out server.crt -days 365 -sha256 \
    -extensions v3_req -extfile server.conf
```

```bash
# 在服务器上
sudo cp ca.crt /usr/local/share/ca-certificates/localdev-ca.crt
sudo update-ca-certificates
```

在代码中可以这样使用证书（以 `js` 代码为例）：  

```javascript
const sslOptions = {
    key: fs.readFileSync('/home/ubuntu/certs/server.key'),
    cert: fs.readFileSync('/home/ubuntu/certs/server.crt')
};
```

或者也可以在 `package.json` 里添加相关脚本，并安装 `serve` 以支持 `npm` 操作：  

```javascript
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "serve-https": "vue-cli-service serve --https --host lkmbugjournal.local --port 443",
    "start": "serve dist --ssl-cert certs/server.crt --ssl-key certs/server.key -l 443"
  }
}
```

## 客户端机器

在客户端机器上，打开你常用的浏览器（如 Firefox 或 Chrome），进入设置中的安全/证书相关部分，将生成的根 CA 证书导入（不要导入服务器证书，否则可能报错）。

如需在 Ubuntu 系统下添加本地 CA 证书，可按如下操作：

```bash
sudo cp ca.crt /usr/local/share/ca-certificates/localdev-ca.crt
sudo update-ca-certificates
```

或通过如下方式为 Chrome （或使用 NSS 数据库的浏览器）添加 CA 证书：

```bash
certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Local Dev CA" -i /usr/local/share/ca-certificates/localdev-ca.crt
# 如果失败，请手动在 Chrome 信任根证书管理中导入
```

### DNS 解析

本地 DNS 解析，可在 `/etc/hosts` 文件中添加如下内容：  

```bash
# 添加：
192.0.2.107 lkmbugjournal.local
```
