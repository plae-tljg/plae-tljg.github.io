---
title: "HTTPS Configuration"
summary: "How I set up HTTPS."
lang: en
translationKey: "ubuntu-net-local-https"
slug: local-https
track: ubuntu
stage: net
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/https.md
aiTranslated: true
---
How I set up HTTPS.

## Server Setup

Prepare these `conf` files first:  

<!--code:title=Root Certificate Config (CA Config) · /lib/https/ca.conf-->
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

<!--code:title=Server Certificate Config · /lib/https/server.conf-->
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

Then run the following commands to generate the root certificate and the server certificate:  

```bash
mkdir certs && cd certs
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt -config ca.conf    # generate the CA root certificate

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -config server.conf
    -out server.crt -days 365 -sha256 \
    -extensions v3_req -extfile server.conf
```

```bash
# on the server
sudo cp ca.crt /usr/local/share/ca-certificates/localdev-ca.crt
sudo update-ca-certificates
```

In code I use the certificate like this (using `js` code as an example):  

```javascript
const sslOptions = {
    key: fs.readFileSync('/home/ubuntu/certs/server.key'),
    cert: fs.readFileSync('/home/ubuntu/certs/server.crt')
};
```

Or I can add the related scripts to `package.json`, and install `serve` to support `npm` operations:  

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

## Client Machine

On the client machine, I open the browser I normally use (such as Firefox or Chrome), go to the security/certificate section in its settings, and import the root CA certificate I just generated (do not import the server certificate, or it may throw an error).

If I need to add the local CA certificate on Ubuntu, I do it like this:

```bash
sudo cp ca.crt /usr/local/share/ca-certificates/localdev-ca.crt
sudo update-ca-certificates
```

Or I add the CA certificate for Chrome (or any browser that uses the NSS database) like this:

```bash
certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Local Dev CA" -i /usr/local/share/ca-certificates/localdev-ca.crt
# if it fails, import it manually in Chrome's trusted root certificate management
```

### DNS Resolution

For local DNS resolution, I add the following content to the `/etc/hosts` file:  

```bash
# add:
192.0.2.107 lkmbugjournal.local
```
