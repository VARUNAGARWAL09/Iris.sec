# 🚀 Quick Start Guide - IRIS.SEC v3.1.0

## ⚡ 5-Minute Quick Start

### Step 1: Start the Backend & Frontend Services

1. **Start the ML Microservice (Backend):**
   ```bash
   cd ml-service
   # Activate your virtual environment and run:
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   Wait for startup: `Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)`

2. **Start the React Frontend:**
   ```bash
   # In the root project directory:
   npm run dev
   ```
   Wait for: `Local: http://localhost:5173/` (or port standard dev port)

**Alternatively**, run both services with Docker:
```bash
# To run the integrated frontend container
docker-compose up -d
```

### Step 2: Access Log Ingestion
1. Open browser to the frontend dashboard URL (e.g. `http://localhost:5173`)
2. Log in to your IRIS-SOC dashboard
3. In the sidebar, click **"Log Ingestion"** (located between Evidence and Playbooks)

### Step 3: Generate Sample Log
1. Click the **"Download Sample Log"** button (top right)
2. A file `sample_security.log` will download
3. This file contains realistic security events designed to test all 10 engine rules

### Step 4: Upload and Analyze
1. Click the **"Select File"** button in the upload pane
2. Choose the downloaded `sample_security.log`
3. Review the preview showing the first 20 lines of the log file
4. Click **"Analyze Logs"**
5. Watch the real-time parser progress bar (should take 1-2 seconds)

### Step 5: Review Detections
You should see approximately **8-10 detections** showing the dynamic risk scoring output:

| Detection | Severity | What It Found |
|-----------|----------|---------------|
| SSH Brute Force | High | 5 failed login attempts |
| SQL Injection | Critical | 3 injection patterns |
| Malware Signature | Critical | 3 malware detections |
| Data Exfiltration | High | 2 large transfers (GB) |
| Privilege Escalation | Critical | 2 sudo/root attempts |
| Port Scanning | Medium | 2 nmap scans |
| Unauthorized Access | Medium | 3 denied access attempts |
| Credential Harvesting | Critical | 2 mimikatz/lsass events |

### Step 6: Generate Alerts
1. Click the **"Generate Alerts (X)"** button (where X is the total detection count)
2. Watch the progress bar as alerts are securely created via INSERT-only queries
3. See success message displaying the alert breakdown:
   - Critical alerts: ~4
   - High alerts: ~2
   - Medium alerts: ~2

### Step 7: Verify in Dashboard
1. Navigate to the **"Alerts"** page in the sidebar
2. You will see the newly generated alerts with a `[Log]` prefix
3. Example: `[Log] SQL Injection Attempt`
4. Click on any alert card to see rich details including:
   - Dynamic Risk score
   - Affected IP addresses and source info
   - Total occurrences and log lines
   - Sample log entries
   - Prescribed playbooks and recommended response steps

---

## ✅ Success Indicators

After completing the quick test, you should see:
- ✅ 8-10 new alerts generated in the Alerts feed
- ✅ All generated alerts have the source labeled: "Log Analysis: sample_security.log"
- ✅ Correct severity badges applied (red for Critical, orange for High, yellow for Medium)
- ✅ Zero errors in the browser console
- ✅ Real-time dashboard updates reflecting the new alerts immediately

---

## 🚀 Performance Features (v3.1.0)

### Fast Navigation
- **70% Faster Page Transitions**: Fluid page swaps with optimized Framer Motion tuning (0.2s duration)
- **Smart Pagination**: Paginated items rendered dynamically with instant load states
- **Real-time Timestamps**: Consistent, realistic virtual time offsets (e.g. "2 hours ago")

### Advanced Filtering
- **Multi-field Search**: Search across titles, case numbers, and tags simultaneously
- **Debounced Input**: 300ms input debouncing to prevent excessive React re-renders
- **Combined Filters**: Apply multiple filters (severity, status, type) concurrently with immediate updates
- **Reset Function**: One-click reset button to quickly restore unfiltered lists

### Performance Monitor
- **Real-time Metrics**: Track page transitions and search query latencies
- **Optimization Alerts**: Immediate visual indicator on slow-rendering components
- **Component Insights**: View metrics on memoization and render budgets

---

## 🧪 Testing With Your Own Logs

### Supported Log Formats

Any standard `.log` or `.txt` ASCII text file containing common patterns like:

**SSH/Auth Logs:**
```
Feb 12 10:15:23 server sshd[1234]: Failed password for admin from 10.0.0.1
Feb 12 10:15:25 server sshd[1234]: authentication failure for user root
```

**Web Server Logs:**
```
2024-02-12 10:20:15 [WEB] GET /search?q=' OR 1=1-- from 192.168.1.100
2024-02-12 10:20:18 [WEB] POST /login?username=admin' OR '1'='1
```

**Security Event Logs:**
```
[2024-02-12 10:25:00] [AV] Detected ransomware signature in file.exe
[2024-02-12 10:25:05] [EDR] Trojan.Generic found on WORKSTATION-05
```

**Firewall/Network Logs:**
```
2024-02-12 10:30:00 [FIREWALL] Outbound: 5.2 GB transferred to 104.24.104.24
2024-02-12 10:40:00 [IDS] Port scan detected from 192.0.2.100
```

### Upload Process
1. **Navigate** to `/log-ingestion`
2. **Select** your log file (maximum size is 10MB)
3. **Preview** first 20 lines to verify the file was read correctly
4. Click **"Analyze Logs"**
5. **Review** detections before generating database entries
6. Click **"Generate Alerts"**

### Best Practices

✅ **DO:**
- Start with small log files (< 1MB) to verify your pattern structure.
- Review and verify detections before converting them into database alerts.
- Check the Alerts tab immediately after to observe real-time WebSockets synchronization.

❌ **DON'T:**
- Upload files exceeding 10MB (these will be automatically rejected).
- Upload the exact same file repeatedly (duplicate prevention blocks identical files within 24 hours).
- Attempt to parse completely raw non-UTF8 binary files.

---

## 🎯 What Each Detection Rule Finds

| Rule | Pattern Example | Risk Score |
|------|-----------------|------------|
| **SSH Brute Force** | "failed password", "authentication failure" | 75-85 |
| **SQL Injection** | `' OR 1=1`, `UNION SELECT`, `DROP TABLE` | 95-100 |
| **Malware Signature** | "malware", "virus", "trojan", "ransomware" | 98-100 |
| **Data Exfiltration** | "5.2 GB transferred", "3500 MB sent" | 70-80 |
| **Privilege Escalation** | "sudo su root", "privilege escalation" | 90-100 |
| **Port Scanning** | "port scan", "nmap", "reconnaissance" | 65-75 |
| **Credential Harvesting** | "mimikatz", "lsass", "hashdump" | 92-100 |
| **Unauthorized Access** | "403 forbidden", "401 unauthorized" | 50-60 |
| **Suspicious IP** | Patterns matching known bad IP ranges | 60-70 |
| **Excessive Requests** | Multiple HTTP requests from same IP | 55-65 |

*Note: Risk scores automatically scale upwards based on trigger frequency, time density, and unique target IP diversity.*

---

## 🔧 Troubleshooting

### File Upload Issues
- **"Invalid file type"**: Ensure your file extension is strictly `.log` or `.txt`.
- **"File too large"**: Ensure the file is under 10MB. Trim or split large server logs if necessary.
- **"File is empty"**: Verify that the log contains text lines.

### Parsing Issues
- **No detections found**: The uploaded log may not contain matching threat indicators. Try downloading and analyzing the sample log first to ensure the parser engine is active.
- **Console Warnings**: Check developer tools console logs if processing hangs.

### Alert Generation Issues
- **"Database connection failed"**: Check that Supabase is connected and that your `.env` contains valid credentials.
- **Duplicate alerts suppressed**: If the same file was analyzed within the past 24 hours, the service suppresses duplicate alerts to avoid flooding.

---

## 📊 Understanding Results

### Statistics Cards
- **Total Lines**: Count of processed lines.
- **Detections**: Count of unique rules triggered.
- **Critical Threats**: Total alerts scoring $\ge 90$ risk level.
- **Processing Time**: Duration in milliseconds for parsing execution.

### Detection Details
- **Occurrences**: Total line hits for a specific category.
- **Unique IPs**: Count of distinct source IPs found.
- **MITRE ATT&CK**: Maps triggers directly to standard adversarial technique numbers.
- **Recommended Action**: Provides step-by-step containment instructions.

---

## 🎓 Next Steps

1. ✅ **Connect live logs**: Test ingestion using real system auth logs.
2. ✅ **Add custom rules**: Add domain patterns inside `src/utils/logParser.ts`.
3. ✅ **Try ML Predictions**: Run the Python ML service and inspect predicted playbooks on live incidents.

---

## 📚 Additional Resources
- **Parser Core**: `src/utils/logParser.ts`
- **Full Architecture Details**: `LOG_INGESTION_README.md`
- **System Diagrams**: `ARCHITECTURE_DIAGRAMS.md`
- **ML Microservice Docs**: `ml-service/README.md`

---

**Quick Reference**:
- **Ingestion Route**: `/log-ingestion`
- **Max size**: 10MB
- **Formats**: `.log`, `.txt`
- **Engine Rules**: 10 distinct rules
- **Ensemble ML Endpoint**: `http://localhost:8000`
- **Real-time Sync**: Enabled 🚀
