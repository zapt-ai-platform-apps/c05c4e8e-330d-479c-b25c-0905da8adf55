# Name My Pet

An app to help you find the perfect name for your pet and save your favorites.

## User Guide

### 1. Sign In

- Upon opening the app, you will see a "Sign in with ZAPT" prompt.
- Click on the social login options (Google, Facebook, Apple) or use the magic link to sign in.
- If you don't have an account, you can create one through the sign-in process.

### 2. Enter Pet Details

- After signing in, you will be taken to the home page.
- In the "Tell us about your pet" section:
  - **Type of pet**: Enter the species of your pet (e.g., dog, cat, bird).
  - **Characteristics**: Describe your pet's characteristics (e.g., playful, brown, small).

### 3. Generate Names

- Click the **Generate Names** button.
- The app will generate a list of unique names based on your pet's type and characteristics.
- The generated names will appear in the "Generated Names" section.

### 4. Save Your Favorite Names

- For each generated name, you have the option to save it.
- Click the **Save** button next to the name you like.
- The name will be saved to your personal list.

### 5. View Saved Names

- Scroll down to the "Your Saved Names" section to view all the names you've saved.
- This list is stored securely and will be available whenever you sign in.

### 6. Sign Out

- To sign out of the app, click the **Sign Out** button at the top right corner of the page.

## External Services Used

- **Supabase**: Used for user authentication.
- **ZAPT**: Used for event handling and AI requests.
- **OpenAI's ChatGPT**: Used to generate pet names based on your input.
- **Sentry**: Used for error logging and monitoring.

## Notes

- The app is responsive and works on all screen sizes.
- Loading states are displayed while generating names to enhance user experience.
- All saved names are associated with your account and are securely stored.
