# Image Upload - Installation Guide

## Dependencies Required

Install UploadThing for cloud image storage:

```bash
npm install uploadthing @uploadthing/react
```

## Environment Variables

Add to your `.env.local`:

```env
UPLOADTHING_SECRET=your_secret_key_here
UPLOADTHING_APP_ID=your_app_id_here
```

### Getting UploadThing Keys:
1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up / Log in
3. Create a new app
4. Copy your API keys

## What Was Implemented

### New Files
- **`app/api/uploadthing/core.ts`** - UploadThing configuration
- **`app/api/uploadthing/route.ts`** - API route handler
- **`components/ImageUpload.tsx`** - Reusable upload component
- **`lib/uploadthing.ts`** - Utility helpers

### Features
- ✅ Drag & drop image upload
- ✅ Image preview with remove option
- ✅ Upload progress indicator
- ✅ Max file size: 4MB
- ✅ Cloud storage (UploadThing)
- ✅ Multiple image support for gallery
- ✅ Dark mode compatible

### Modified Files
- `app/admin/projects/new/page.tsx` - Replaced URL input with ImageUpload
- `app/admin/gallery/new/page.tsx` - Replaced URL input with ImageUpload

## Usage

```tsx
<ImageUpload
    value={formData.image}
    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
    endpoint="imageUploader"
/>
```

## Next Steps

1. Install dependencies
2. Add UploadThing keys to `.env.local`
3. Test image upload in admin panel
4. Images will be automatically hosted on UploadThing CDN
