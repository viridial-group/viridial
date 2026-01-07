# Fix: Domain Connection Issues

## Problem: `viridial.com refused to connect`

Based on diagnostic output, your server is configured correctly:
- ✅ DNS resolves to `148.230.112.148`
- ✅ Nginx is running and listening on port 80
- ✅ Firewall allows port 80
- ✅ Containers are running

## Most Common Causes

### 1. Browser/OS DNS Cache

Your browser or operating system may have cached an old DNS response.

**Fix:**
```bash
# On Mac:
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# On Windows:
ipconfig /flushdns

# On Linux:
sudo systemd-resolve --flush-caches
# OR
sudo /etc/init.d/nscd restart
```

Then:
1. Close all browser windows
2. Clear browser cache (Cmd+Shift+Delete / Ctrl+Shift+Delete)
3. Try accessing `http://viridial.com` again

### 2. Try Different Access Methods

Test these to narrow down the issue:

```bash
# From your local machine:
curl -I http://viridial.com
curl -I http://148.230.112.148

# From the VPS itself:
curl -I http://localhost
curl -I http://148.230.112.148

# Test with IP first (bypasses DNS):
# In browser: http://148.230.112.148
```

### 3. Check Browser Console

Open browser DevTools (F12) and check:
- **Network tab**: See if requests are being made and what response you get
- **Console tab**: Check for any JavaScript errors
- Look for CORS errors or connection refused errors

### 4. ISP/Network Issues

Some ISPs or networks block certain ports or domains.

**Test:**
- Try from a different network (mobile hotspot, different WiFi)
- Try from a different device
- Try using a VPN

### 5. Browser Security Settings

Some browsers block HTTP (non-HTTPS) connections or have strict security settings.

**Test:**
- Try a different browser (Chrome, Firefox, Safari)
- Check browser security settings
- Try in incognito/private mode

## Quick Diagnostic Commands

Run these on the VPS to verify everything works:

```bash
# 1. Test nginx locally
curl -v http://localhost

# 2. Test from external IP
curl -v http://148.230.112.148

# 3. Check if nginx is actually serving content
docker compose -f app-frontend.yml exec nginx wget -O- http://localhost

# 4. Check frontend is responding
docker compose -f app-frontend.yml exec frontend wget -O- http://localhost:3000

# 5. Test the full proxy chain
curl -v -H "Host: viridial.com" http://localhost
```

## Expected Responses

When working correctly, you should see:

```bash
$ curl -I http://viridial.com
HTTP/1.1 200 OK
# OR
HTTP/1.1 307 Temporary Redirect
# (redirect to login page is normal)

$ curl -I http://148.230.112.148
HTTP/1.1 200 OK
# OR  
HTTP/1.1 307 Temporary Redirect
```

If you get `Connection refused`:
- Check if there's a host-level firewall (not just UFW)
- Check if your VPS provider has a security group/firewall
- Verify the VPS allows incoming connections on port 80

## VPS Provider Firewall

Some VPS providers (like AWS, DigitalOcean, OVH) have their own firewall in addition to UFW:

- **OVH**: Check "Network" → "Firewall" in OVH manager
- **DigitalOcean**: Check "Networking" → "Firewalls" 
- **AWS**: Check Security Groups
- **Hetzner**: Check "Firewall" in Cloud Console

Ensure port 80 (and 443 for HTTPS) is open in the provider's firewall.

## Next Steps

1. **Try IP address first**: `http://148.230.112.148` 
   - If this works → DNS issue
   - If this doesn't work → Network/firewall issue

2. **Test from VPS itself**:
   ```bash
   curl http://localhost
   ```
   - If this works → External network/firewall issue
   - If this doesn't work → Nginx configuration issue

3. **Check nginx error logs**:
   ```bash
   docker compose -f app-frontend.yml logs nginx --tail=50
   ```

4. **Check frontend logs**:
   ```bash
   docker compose -f app-frontend.yml logs frontend --tail=50
   ```

## Additional Fix Applied

Also fixed the double `/auth` issue in API calls:
- Changed `NEXT_PUBLIC_AUTH_API_URL` from `http://viridial.com/auth` to `http://viridial.com`
- This fixes the `/auth/auth/login` 404 errors in nginx logs

You'll need to rebuild the frontend after this change:
```bash
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-frontend.yml build --no-cache frontend
docker compose -f app-frontend.yml up -d frontend
```

