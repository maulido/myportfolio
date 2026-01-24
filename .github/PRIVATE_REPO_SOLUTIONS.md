# 🔐 Solusi untuk Private Repository Issue

## ❌ Problem

Workflow masih gagal dengan "repository not found" meskipun Personal Access Token sudah di-setup. Ini umum terjadi dengan **private repositories**.

## ✅ Solusi: Gunakan Deploy Keys (RECOMMENDED)

Deploy Keys lebih reliable untuk private repositories karena:
- ✅ Tidak expire
- ✅ Lebih aman (SSH-based)
- ✅ Tidak perlu Personal Access Token
- ✅ Khusus untuk repository tertentu

---

## 🚀 Setup Deploy Keys (Pilihan 1 - RECOMMENDED)

### Step 1: Generate SSH Key Pair

Jalankan di terminal lokal Anda:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-sync" -f ~/.ssh/depportfolio_deploy_key -N ""

# Tampilkan private key (untuk GitHub Secret)
cat ~/.ssh/depportfolio_deploy_key

# Tampilkan public key (untuk Deploy Key)
cat ~/.ssh/depportfolio_deploy_key.pub
```

### Step 2: Add Public Key sebagai Deploy Key di depportfolio

1. Buka: https://github.com/maulido/depportfolio/settings/keys
2. Klik **"Add deploy key"**
3. Configure:
   - **Title**: `GitHub Actions Sync from myportfolio`
   - **Key**: Paste isi dari `depportfolio_deploy_key.pub`
   - ✅ **Check** "Allow write access" (PENTING!)
4. Klik **"Add key"**

### Step 3: Add Private Key sebagai Secret di myportfolio

1. Buka: https://github.com/maulido/myportfolio/settings/secrets/actions
2. Klik **"New repository secret"**
3. Configure:
   - **Name**: `DEPPORTFOLIO_DEPLOY_KEY`
   - **Secret**: Paste isi dari `depportfolio_deploy_key` (private key)
4. Klik **"Add secret"**

### Step 4: Update Workflow File

Update workflow untuk menggunakan SSH instead of HTTPS.

---

## 🔧 Solusi Alternatif: Fine-Grained Personal Access Token (Pilihan 2)

Jika Deploy Keys tidak berhasil, coba Fine-Grained Token:

### Step 1: Create Fine-Grained Token

1. Buka: https://github.com/settings/tokens?type=beta
2. Klik **"Generate new token"**
3. Configure:
   - **Token name**: `Auto-sync myportfolio to depportfolio`
   - **Expiration**: 1 year
   - **Repository access**: **Only select repositories**
     - Pilih: `maulido/depportfolio`
   - **Permissions**:
     - Repository permissions → Contents: **Read and write**
4. Klik **"Generate token"**
5. Copy token

### Step 2: Update Secret

1. Buka: https://github.com/maulido/myportfolio/settings/secrets/actions
2. Edit secret `DEPPORTFOLIO_PAT`
3. Paste token baru
4. Save

---

## 🎯 Solusi Paling Mudah: Buat depportfolio Public (Pilihan 3)

Jika tidak masalah code production terlihat publik:

### Step 1: Make depportfolio Public

1. Buka: https://github.com/maulido/depportfolio/settings
2. Scroll ke **"Danger Zone"**
3. Klik **"Change visibility"**
4. Pilih **"Make public"**
5. Confirm

### Step 2: Test Workflow

Workflow akan langsung bisa akses tanpa token!

---

## 📊 Comparison

| Method | Security | Complexity | Reliability | Expiration |
|--------|----------|------------|-------------|------------|
| **Deploy Keys** | ⭐⭐⭐⭐⭐ | Medium | ⭐⭐⭐⭐⭐ | Never |
| **Fine-Grained PAT** | ⭐⭐⭐⭐ | Low | ⭐⭐⭐⭐ | 1 year |
| **Classic PAT** | ⭐⭐⭐ | Low | ⭐⭐⭐ | Optional |
| **Public Repo** | ⭐⭐ | Very Low | ⭐⭐⭐⭐⭐ | Never |

**Recommendation**: 
- **Best**: Deploy Keys (Pilihan 1)
- **Easiest**: Public Repo (Pilihan 3)
- **Middle Ground**: Fine-Grained PAT (Pilihan 2)

---

## 🔍 Checklist Debugging

Jika masih error, cek:

### Token Issues
- [ ] Token name **PERSIS** `DEPPORTFOLIO_PAT` (case-sensitive)
- [ ] Token punya scope `repo` (Classic) atau `Contents: Read and write` (Fine-grained)
- [ ] Token belum expired
- [ ] Token dibuat untuk user yang benar (`maulido`)

### Repository Issues
- [ ] Repository `depportfolio` benar-benar exist
- [ ] Repository URL: `https://github.com/maulido/depportfolio` (bukan `.git`)
- [ ] User `maulido` punya write access ke `depportfolio`

### Workflow Issues
- [ ] Secret sudah di-add di repository `myportfolio` (bukan `depportfolio`)
- [ ] Workflow file ada di `.github/workflows/sync-to-depportfolio.yml`
- [ ] Branch name benar (`main` atau `fix/build-and-quality-issues`)

---

## 💡 Quick Test

Test apakah token bisa akses repository:

```bash
# Ganti YOUR_TOKEN dengan token Anda
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/maulido/depportfolio

# Jika berhasil, akan muncul info repository
# Jika gagal, akan muncul "Not Found" atau "Bad credentials"
```

---

## 🆘 Mana yang Harus Dipilih?

**Jika Anda ingin:**
- ✅ **Paling aman & reliable** → Pilihan 1 (Deploy Keys)
- ✅ **Paling mudah & cepat** → Pilihan 3 (Public Repo)
- ✅ **Balance security & ease** → Pilihan 2 (Fine-Grained PAT)

Saya recommend **Pilihan 1 (Deploy Keys)** untuk production use.
