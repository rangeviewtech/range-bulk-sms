# Starting a New Project

When cloning this template to start a completely new product:

1. **Clone the Repo:**
   ```bash
   git clone <repo-url> my-awesome-app
   cd my-awesome-app
   ```
2. **Reset Git:**
   ```bash
   rm -rf .git
   git init
   ```
3. **Update Details:**
   - Change `name`, `version`, `author` in `package.json`.
   - Update `src/config/app.ts` with your company name, app name, and description.
4. **Customize Branding:**
   - Change the primary color tokens in `src/app/globals.css`.
   - Replace favicon and logo files in `public/`.
5. **Install & Run:**
   ```bash
   npm install
   npm run dev
   ```
