---
title: "SIP Trunk Configuration Guide"
summary: "This document is based on real-world configuration, showing how to configure a SIP Trunk to enable server-to-server communication."
lang: en
translationKey: "homelab-services-asterisk-trunk"
slug: asterisk-trunk
track: homelab
stage: services
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/asterisk/trunk_config.md
---
This document is based on real-world configuration, showing how to configure a SIP Trunk to enable server-to-server communication.

## Understanding the Role of Trunk

A SIP Trunk allows your Asterisk server to communicate with other SIP servers. Common scenarios:
- **Outbound calls**: Place external calls through the trunk server
- **Inbound calls**: Receive calls from the trunk server, routed to your extensions
- **Server-to-server communication**: Allow other servers to call your server and use your extensions

## Receiving Trunk Configuration Information

When someone provides trunk configuration details, they typically include:
- **Trunk Server IP/Address**: The IP address of the trunk server
- **Extension/Username**: The extension number or username for authentication
- **Secret/Password**: The authentication password
- **Port** (optional): Usually 5060 (SIP) and RTP port range

## Actual Configuration Examples

### 1. Transport Configuration (pjsip.conf)

First, configure the transport layer:

```conf
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
```

### 2. Trunk Endpoint Configuration

Add trunk configuration to `/etc/asterisk/pjsip.conf`:

```conf
; ============================================
; Trunk Server Configuration - Connect to External Server
; ============================================
; Allow calls from trunk server
[trunk-server]
type=identify
endpoint=trunk-server-endpoint
match=192.168.x.x  ; Replace with actual trunk server IP

[trunk-server-endpoint]
type=endpoint
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
transport=transport-udp
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes
direct_media=no
```

### 3. Trunk Registration Configuration (If Required)

If the trunk server requires registration to receive calls:

```conf
; Register to trunk server
[trunk-registration]
type=registration
outbound_auth=trunk-registration-auth
server_uri=sip:192.168.x.x  ; Replace with trunk server IP
client_uri=sip:EXTENSION@192.168.x.x  ; Replace EXTENSION with actual extension
contact_user=EXTENSION
retry_interval=60
forbidden_retry_interval=300
expiration=3600
outbound_proxy=sip:192.168.x.x
transport=transport-udp

[trunk-registration-auth]
type=auth
auth_type=userpass
password=your_secret_here  ; Replace with actual password
username=EXTENSION  ; Replace with actual extension
```

**Note**: If the other party doesn't require registration, you can comment out the registration section.

### 4. Configure Corresponding Extension Endpoint

If the trunk server will dial your specific extension, you need to configure that extension:

```conf
; ============================================
; Extension Configuration (for trunk calls)
; ============================================
; Authentication configuration
[EXTENSION]
type=auth
auth_type=userpass
password=your_secret_here  ; Replace with actual password
username=EXTENSION  ; Replace with actual extension

; Address of Record (AOR)
[EXTENSION]
type=aor
max_contacts=1

; Endpoint configuration
[EXTENSION]
type=endpoint
context=internal
disallow=all
allow=ulaw
allow=alaw
auth=EXTENSION
aors=EXTENSION
transport=transport-udp
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes
dtmf_mode=rfc4733
```

### 5. Configure Inbound Routing (extensions.conf)

Configure how to handle calls from trunk in `/etc/asterisk/extensions.conf`:

```conf
; ============================================
; Call Routing Received from Trunk Server
; ============================================
[from-trunk]
; When trunk server dials a specific extension, route to internal extension to trigger smart call program
exten => TRUNK_EXTENSION,1,NoOp(Received call from trunk, extension: ${EXTEN}, caller: ${CALLERID(num)})
   same => n,Goto(internal,INTERNAL_EXTENSION,1)
   same => n,Hangup()

; Also support dialing internal extension directly
exten => INTERNAL_EXTENSION,1,NoOp(Received call from trunk, dialing internal extension directly)
   same => n,Goto(internal,INTERNAL_EXTENSION,1)
   same => n,Hangup()

; Default route: if dialing other numbers, can also route to specified extension
exten => _X.,1,NoOp(Received call from trunk, extension: ${EXTEN}, routing to internal extension)
   same => n,Goto(internal,INTERNAL_EXTENSION,1)
   same => n,Hangup()
```

**Configuration Notes**:
- `TRUNK_EXTENSION`: The extension number the trunk server dials (replace with actual value, e.g., 4112)
- `INTERNAL_EXTENSION`: Your internal extension number (replace with actual value, e.g., 1001)
- `[from-trunk]`: Context name, must match `context` in `pjsip.conf`

### 6. Internal Extension Configuration (extensions.conf)

Ensure internal extensions have correct routing:

```conf
[internal]
; Internal extension routing
exten => INTERNAL_EXTENSION,1,Goto(internal,INTERNAL_EXTENSION,1)
   same => n,Hangup()

[default]
; Default context can also route to internal extension
exten => INTERNAL_EXTENSION,1,Goto(internal,INTERNAL_EXTENSION,1)
   same => n,Hangup()
```

## Testing Trunk Connection

### 1. Check Trunk Registration Status

In the Asterisk console:

```bash
# View all endpoint statuses
pjsip show endpoints

# View registration status (if trunk requires registration)
pjsip show registrations

# View authentication info
pjsip show auths
```

### 2. Check Trunk Connectivity

```bash
# View all channels
core show channels verbose

# Enable PJSIP debugging
pjsip set logger on
```

### 3. Test Inbound Calls

Have the trunk server dial your server, verify calls route correctly to your extension.

Observe logs:
```bash
tail -f /var/log/asterisk/full
```

### 4. Test Outbound Calls (If Outbound Routing Configured)

Dial an external number from your extension, verify the call routes through the trunk.

## Common Troubleshooting

### Trunk Fails to Register

1. **Check authentication info**:
   ```bash
   pjsip show auths
   ```
   Ensure username and password are correct

2. **Check network connectivity**:
   ```bash
   ping trunk_server_ip
   ```

3. **Check firewall**:
   - SIP port (usually 5060 UDP)
   - RTP port range (usually 10000-20000 UDP)

4. **Check logs**:
   ```bash
   tail -f /var/log/asterisk/full
   ```

### Calls Fail to Establish

1. **Check codec compatibility**:
   - Ensure both sides support matching codecs (e.g., ulaw, alaw)
   - Explicitly specify `allow` and `disallow` in trunk configuration

2. **Check routing configuration**:
   - Verify routing rules in `extensions.conf`
   - Ensure context configuration is correct
   - Check that `[from-trunk]` context exists

3. **Check NAT settings** (if trunk server is behind NAT):
   ```conf
   # May need to add to pjsip.conf endpoint configuration
   rtp_symmetric=yes
   force_rport=yes
   rewrite_contact=yes
   direct_media=no
   ```

### Inbound Calls Fail to Reach Extension

1. **Check DID routing**:
   - If trunk server sends a specific DID number, configure matching rules in `extensions.conf`
   - Verify `exten => TRUNK_EXTENSION` is correct

2. **Check context configuration**:
   - Ensure trunk endpoint has `context=from-trunk` set correctly
   - Verify `[from-trunk]` context exists in `extensions.conf`
   - Check internal extension context is correct

3. **Check if extension exists**:
   ```bash
   pjsip show endpoints
   ```
   Ensure target extension is configured

## Complete Configuration Workflow

1. **Configure Transport**: Add transport configuration in `pjsip.conf`
2. **Configure Trunk Endpoint**: Add `identify` and `endpoint` configuration
3. **Configure Registration** (if needed): Add `registration` configuration
4. **Configure Extensions**: Add corresponding extension endpoint configuration
5. **Configure Routing**: Add `[from-trunk]` context in `extensions.conf`
6. **Reload Configuration**:
   ```bash
   pjsip reload
   dialplan reload
   ```
7. **Verify Connection**: Use `pjsip show endpoints` and `pjsip show registrations` to check status
8. **Test Inbound**: Have trunk server dial your server
9. **Check Logs**: Observe complete call flow

## Security Considerations

- **Protect authentication info**: Secret/password should be kept confidential, not exposed in logs or documentation
- **Firewall configuration**: Only open necessary ports (SIP: 5060 UDP, RTP: 10000-20000 UDP)
- **Access control**: Use `identify` configuration to limit which IPs can connect to your trunk
- **Encryption** (optional): For production environments, consider using TLS to encrypt SIP communication

## Real-World Work Scenario Example

**Scenario**: Someone gives you trunk configuration info, asking you to create a trunk so that when others dial their server, they can reach your server and use your extensions.

**Solution**:
1. Configure trunk endpoint in `pjsip.conf`, allowing connections from the other party's server
2. Configure registration (if needed) to connect to the other party's server
3. Configure `[from-trunk]` context in `extensions.conf`, routing inbound calls to your internal extensions
4. Ensure your internal extensions have correct routing configuration

This way, when someone dials your configured extension through the other party's server, the call routes to your server and ultimately reaches your internal extension, triggering your smart call program.