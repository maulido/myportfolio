# 🔧 Troubleshooting: Repository Not Found Error

## ❌ Error Yang Terjadi

Workflow gagal dengan error:
```
fatal: repository 'https://github.com/maulido/depportfolio.git/' not found
Error: Process completed with exit code 128.
```

![Error Screenshot](file:///C:/Users/Egogohub/.gemini/antigravity/brain/eb99f749-70b6-4442-84a1-71eae17a5102/uploaded_media_1769232364516.png)

## 📊 Visual Setup Guide

![GitHub Token Setup Guide](file:///C:/Users/Egogohub/.gemini/antigravity/brain/eb99f749-70b6-4442-84a1-71eae17a5102/github_token_setup_1769232459841.png)

## ✅ Penyebab

Error ini terjadi karena **Personal Access Token belum di-setup**. Tanpa token, GitHub Actions tidak bisa mengakses private repository `depportfolio`.

## 🎯 Solusi: Setup Personal Access Token

Ikuti langkah-langkah berikut dengan **TELITI**:

---

### Step 1: Buat Personal Access Token

1. **Buka GitHub Settings**
   - Klik: https://github.com/settings/tokens
   - Atau: GitHub → Profile Picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Klik tombol **"Generate new token (classic)"**
   - Jika diminta password, masukkan password GitHub Anda

3. **Konfigurasi Token**
   - **Note**: `Auto-sync myportfolio to depportfolio`
   - **Expiration**: Pilih `No expiration` atau `1 year`
   - **Select scopes**: 
     - ✅ **CENTANG** `repo` (Full control of private repositories)
     - Ini akan otomatis centang semua sub-items di bawahnya
   
4. **Generate Token**
   - Scroll ke bawah
   - Klik tombol hijau **"Generate token"**

5. **Copy Token**
   - ⚠️ **PENTING**: Token hanya ditampilkan SEKALI
   - Klik icon copy atau select all dan copy
   - Token berbentuk: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Jangan tutup halaman ini dulu!**

---

### Step 2: Tambahkan Token sebagai Repository Secret

1. **Buka Repository Settings**
   - Klik: https://github.com/maulido/myportfolio/settings/secrets/actions
   - Atau: Repository → Settings → Secrets and variables → Actions

2. **Create New Secret**
   - Klik tombol **"New repository secret"**

3. **Isi Form**
   - **Name**: `DEPPORTFOLIO_PAT` (harus PERSIS seperti ini, case-sensitive!)
   - **Secret**: Paste token yang Anda copy dari Step 1
   
4. **Add Secret**
   - Klik tombol hijau **"Add secret"**
   - Secret akan tersimpan dan terenkripsi

---

### Step 3: Test Workflow

Setelah token di-add, test workflow dengan cara:

**Opsi A: Re-run Workflow yang Gagal**
1. Buka: https://github.com/maulido/myportfolio/actions
2. Klik pada workflow run yang gagal (yang ada di screenshot)
3. Klik tombol **"Re-run all jobs"**
4. Tunggu workflow selesai (sekitar 30 detik)

**Opsi B: Push Commit Baru**
```bash
# Buat perubahan kecil
echo "# Test auto-sync - $(date)" >> README.md
git add README.md
git commit -m "test: verify auto-sync after token setup"
git push origin fix/build-and-quality-issues
```

---

### Step 4: Verifikasi Success

1. **Check GitHub Actions**
   - Buka: https://github.com/maulido/myportfolio/actions
   - Workflow "Sync to depportfolio" harus menunjukkan ✅ (checkmark hijau)
   - Klik untuk melihat detail logs

2. **Check depportfolio Repository**
   - Buka: https://github.com/maulido/depportfolio
   - Verify commit terbaru sudah muncul
   - Timestamp harus sama dengan commit di myportfolio

3. **Check Vercel Deployment**
   - Buka Vercel dashboard
   - Harus ada deployment baru yang triggered dari depportfolio
   - Tunggu build selesai (2-5 menit)

4. **Check Production Site**
   - Buka production URL Anda
   - Verify perubahan sudah live

---

## 🔍 Checklist Troubleshooting

Jika masih error, cek:

- [ ] Token name **PERSIS** `DEPPORTFOLIO_PAT` (case-sensitive)
- [ ] Token scope memiliki centang pada `repo`
- [ ] Token belum expired
- [ ] Repository `depportfolio` benar-benar ada di GitHub
- [ ] Repository `depportfolio` adalah private repo milik user `maulido`
- [ ] Workflow file ada di `.github/workflows/sync-to-depportfolio.yml`

---

## 📝 Common Errors

### Error: "Bad credentials"
**Penyebab**: Token salah atau expired
**Solusi**: Generate token baru dan update secret

### Error: "Resource not accessible by integration"
**Penyebab**: Token tidak punya scope `repo`
**Solusi**: Generate token baru dengan scope `repo` yang benar

### Error: "Repository not found" (masih muncul)
**Penyebab**: 
1. Secret name salah (bukan `DEPPORTFOLIO_PAT`)
2. Repository URL salah
3. Repository tidak exist

**Solusi**: 
1. Verify secret name di repository settings
2. Verify repository `depportfolio` exist di https://github.com/maulido/depportfolio

---

## 🆘 Need Help?

Jika masih mengalami masalah:

1. Screenshot error dari GitHub Actions
2. Verify secret sudah di-add dengan benar
3. Check repository depportfolio masih exist
4. Pastikan token belum expired

---

## ✅ Expected Success Output

Ketika berhasil, workflow log akan menampilkan:

```
✓ Set up job
✓ Checkout myportfolio
✓ Push to depportfolio
  To https://github.com/maulido/depportfolio.git
     xxxxx..xxxxx  fix/build-and-quality-issues -> main
✓ Post Checkout myportfolio
✓ Complete job
```

Tidak ada error merah, semua hijau! 🎉
