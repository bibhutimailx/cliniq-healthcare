# ClinIQ

ClinIQ is a modern, AI-powered healthcare assistant for multilingual medical consultations, documentation, and analysis. It provides real-time speech recognition, medical entity extraction, and intelligent patient reports to streamline clinical workflows and improve patient care.

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended - Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts and your app will be live!
```

### Option 2: Netlify (Free)
```bash
# Build the project
npm run build

# Deploy to Netlify (drag and drop dist folder)
# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages (Free)
```bash
# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Project info

**URL**: https://lovable.dev/projects/ac201739-92b1-46c8-90cf-91725cb70b78

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ac201739-92b1-46c8-90cf-91725cb70b78) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ac201739-92b1-46c8-90cf-91725cb70b78) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Speech Recognition Providers

- **Reverie Language AI** (Recommended for Indian regional languages, healthcare/clinical use, real-time streaming)
- Google Cloud Speech-to-Text
- Azure Cognitive Services
- Browser Speech API (for development/testing)

To use Reverie, obtain API credentials from [Reverie](https://docs.reverieinc.com/) and select it in the app's speech provider settings.

## Environment Variables

To use Reverie in production, set your API credentials in a `.env` file or your deployment environment:

```
REVERIE_API_ID=dev.bibhutimailx
REVERIE_API_KEY=d269788c46c29e5b8c30d28486fdfc20288ba521
```

Make sure your deployment process injects these variables securely. The app will use these credentials when Reverie is selected as the speech provider.
