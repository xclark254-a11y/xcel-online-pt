// Progress photo storage config, powered by ImageKit (free tier: no credit
// card required, 20GB+ bandwidth and several GB of storage per month —
// plenty for a personal training business's progress photos).
//
// 1. Go to https://imagekit.io and create a free account.
// 2. In your ImageKit dashboard, go to Developer Options.
// 3. Copy your "Public Key" and "URL-endpoint" and paste them below.
// 4. Your "Private Key" does NOT go here — it goes as an environment
//    variable in Vercel instead (IMAGEKIT_PRIVATE_KEY), since this file
//    ships to everyone's browser and the private key must stay secret.
//
// Until real values are entered here, the "Add photo" button will show
// an error instead of uploading.
export const IMAGEKIT_PUBLIC_KEY = "YOUR_IMAGEKIT_PUBLIC_KEY";
export const IMAGEKIT_URL_ENDPOINT = "YOUR_IMAGEKIT_URL_ENDPOINT";
