# UploadThing Setup Guide

This project uses UploadThing for handling image uploads in the item listing form.

## Getting Started

1. **Create an UploadThing account**
   - Go to https://uploadthing.com
   - Sign up for a free account

2. **Create a new app**
   - After signing in, create a new app
   - Copy your API keys

3. **Add environment variables**
   - Add this to your `.env` file:
   ```env
   UPLOADTHING_TOKEN=your-uploadthing-token
   ```
   
   **Note**: UploadThing may also use `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in some setups. If you have a token, use `UPLOADTHING_TOKEN`. If you have separate secret and app ID, use those instead.

4. **Get your API token**
   - Go to your UploadThing dashboard
   - Navigate to "API Keys" or "Settings" section
   - Copy your token (or Secret/App ID if provided separately)
   - Add it to your `.env` file

## Features

- **Multiple image uploads**: Users can upload up to 10 images per item
- **File size limit**: Each image can be up to 4MB
- **Image preview**: See uploaded images before submitting
- **Remove images**: Remove unwanted images before submitting
- **Authenticated uploads**: Only authenticated users can upload images

## Usage

1. Navigate to the Dashboard
2. Go to "List New Item" tab
3. Fill in the item details
4. Click "Upload Images" button
5. Select one or more images (up to 10)
6. Images will upload automatically
7. Preview uploaded images
8. Remove any images you don't want
9. Submit the form

## Configuration

The upload configuration is in `app/api/uploadthing/core.ts`:
- Max file size: 4MB
- Max file count: 10 files
- File types: Images only

You can modify these settings in the `imageUploader` configuration.

## Troubleshooting

### "Unauthorized" error
- Make sure you're logged in
- Check that your session is valid

### Upload fails
- Check your UploadThing API keys in `.env`
- Verify your UploadThing account is active
- Check file size (must be under 4MB)
- Check file type (images only)

### Images not showing
- Check browser console for errors
- Verify images uploaded successfully
- Check that image URLs are valid

## Alternative: Using URL Input

If you prefer to use image URLs instead of file uploads, you can modify the form to include a URL input field alongside or instead of the file upload.

