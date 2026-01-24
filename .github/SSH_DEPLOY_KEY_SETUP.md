# 🔑 SSH Deploy Key Setup - Step by Step

## ✅ Step 1: SSH Key Generated!

SSH key pair sudah berhasil di-generate di komputer Anda:
- **Private Key**: `C:\Users\Egogohub\.ssh\depportfolio_deploy_key`
- **Public Key**: `C:\Users\Egogohub\.ssh\depportfolio_deploy_key.pub`

---

## 📋 Step 2: Add Public Key ke depportfolio Repository

### Public Key Anda:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN6Jhxo3B8qHRdfDqXXVeriZTCQgimSWpTkVVJV4c16L github-actions-sync-depportfolio
```

### Langkah-langkah:

1. **Buka Deploy Keys Settings**
   - Kunjungi: https://github.com/maulido/depportfolio/settings/keys
   - Atau: Repository depportfolio → Settings → Deploy keys

2. **Add Deploy Key**
   - Klik tombol **"Add deploy key"**

3. **Isi Form**
   - **Title**: `GitHub Actions Sync from myportfolio`
   - **Key**: Copy-paste public key di atas (seluruh baris mulai dari `ssh-ed25519...`)
   - ✅ **PENTING**: Centang **"Allow write access"**

4. **Add Key**
   - Klik tombol hijau **"Add key"**
   - Konfirmasi dengan password GitHub jika diminta

---

## 🔐 Step 3: Add Private Key ke myportfolio Secrets

### Private Key Anda:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDeiYcaNwfKh0XXw6l11Xq4mUwkIIpklqU5FVSVeHNeiwAAAKjo5ljj6OZY
4wAAAAtzc2gtZWQyNTUxOQAAACDeiYcaNwfKh0XXw6l11Xq4mUwkIIpklqU5FVSVeHNeiw
AAED1cYYKTMy//aG/boSHCROnOHX+EzNRsaMys2AaIziMDN6Jhxo3B8qHRdfDqXXVeriZ
TCQgimSWpTkVVJV4c16LAAAAIGdpdGh1Yi1hY3Rpb25zLXN5bmMtZGVwcG9ydGZvbGlvAQ
IDBAU=
-----END OPENSSH PRIVATE KEY-----
```

### Langkah-langkah:

1. **Buka Repository Secrets**
   - Kunjungi: https://github.com/maulido/myportfolio/settings/secrets/actions
   - Atau: Repository myportfolio → Settings → Secrets and variables → Actions

2. **Create New Secret**
   - Klik **"New repository secret"**

3. **Isi Form**
   - **Name**: `DEPPORTFOLIO_DEPLOY_KEY`
   - **Secret**: Copy-paste private key di atas (seluruh blok termasuk `-----BEGIN` dan `-----END`)

4. **Add Secret**
   - Klik **"Add secret"**

---

## 🔄 Step 4: Update Workflow File

Workflow SSH sudah siap, tinggal aktifkan:

### Option A: Rename File (Recommended)

```bash
# Backup workflow lama
git mv .github/workflows/sync-to-depportfolio.yml .github/workflows/sync-to-depportfolio-old.yml

# Aktifkan workflow SSH
git mv .github/workflows/sync-to-depportfolio-ssh.yml .github/workflows/sync-to-depportfolio.yml

# Commit
git add .github/workflows/
git commit -m "feat: switch to SSH deploy keys for private repo access"
git push origin fix/build-and-quality-issues
```

### Option B: Manual Edit

Atau edit file `.github/workflows/sync-to-depportfolio.yml` secara manual sesuai dengan isi file `sync-to-depportfolio-ssh.yml`.

---

## ✅ Step 5: Test Deployment

Setelah semua setup selesai, test workflow:

```bash
# Buat test commit
echo "# SSH Deploy Key Test - $(date)" >> README.md
git add README.md
git commit -m "test: verify SSH deploy key workflow"
git push origin fix/build-and-quality-issues
```

### Verify Success:

1. **GitHub Actions**: https://github.com/maulido/myportfolio/actions
   - Workflow harus sukses ✅ (tidak ada error merah)

2. **depportfolio Repository**: https://github.com/maulido/depportfolio
   - Commit terbaru harus muncul

3. **Vercel Dashboard**
   - Deployment baru harus triggered

---

## 🎉 Expected Result

Ketika berhasil, workflow log akan menampilkan:

```
✓ Set up job
✓ Checkout myportfolio
✓ Setup SSH Key
✓ Push to depportfolio
  To github.com:maulido/depportfolio.git
     xxxxx..xxxxx  fix/build-and-quality-issues -> main
✓ Complete job
```

---

## 🔍 Troubleshooting

### Error: "Permission denied (publickey)"
- **Penyebab**: Public key belum di-add atau "Allow write access" tidak dicentang
- **Solusi**: Cek deploy key di depportfolio settings, pastikan ada dan write access enabled

### Error: "Host key verification failed"
- **Penyebab**: GitHub host key belum di-trust
- **Solusi**: Workflow sudah handle ini dengan `ssh-keyscan`, seharusnya tidak terjadi

### Workflow masih pakai PAT
- **Penyebab**: Workflow file belum di-update
- **Solusi**: Pastikan file `.github/workflows/sync-to-depportfolio.yml` menggunakan SSH (bukan HTTPS)

---

## 📝 Summary

**Yang sudah dilakukan:**
- ✅ Generate SSH key pair
- ⏳ Menunggu Anda add public key ke depportfolio
- ⏳ Menunggu Anda add private key ke myportfolio secrets
- ⏳ Menunggu Anda update workflow file

**Next Steps:**
1. Add public key ke depportfolio (Step 2)
2. Add private key ke myportfolio (Step 3)
3. Update workflow file (Step 4)
4. Test! (Step 5)

Setelah semua selesai, auto-deployment akan berjalan sempurna! 🚀
