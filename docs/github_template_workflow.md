# GitHub template publishing and team workflow

## Recommended repository model

Use one of these models deliberately:

### One shared product repository

Use this when five developers are jointly building the PrimeProperty frontend.

1. Publish this foundation as a template repository.
2. Create one repository from the template, for example `primeproperty-web`.
3. Add all five developers to `primeproperty-web`.
4. Each developer clones that same repository and works on short-lived branches.
5. Integrate through reviewed pull requests to protected `main`.

This is the recommended model because every developer shares one history and CI integration point.

### Five independent repositories

Use this only for five separate prototypes, vendor deliveries, regional variants, or experiments.

Each developer creates a new repository using **Use this template**. A template-generated repository begins with an independent history. It is not a fork and cannot be merged back to another generated repository as if it were a branch.

## Publish this local foundation as a GitHub template

The publisher needs admin permission for the destination repository and an authenticated GitHub CLI session.

```bash
gh auth login
gh auth status
```

From this project directory, create and push the repository. Replace `OWNER` with the personal account or organization and adjust visibility deliberately:

```bash
gh repo create OWNER/primeproperty-nextjs-template \
  --private \
  --source=. \
  --remote=origin \
  --push
```

Mark it as a template:

```bash
gh api \
  --method PATCH \
  repos/OWNER/primeproperty-nextjs-template \
  -F is_template=true
```

Confirm the setting:

```bash
gh repo view OWNER/primeproperty-nextjs-template --json nameWithOwner,isTemplate,defaultBranchRef
```

The same setting is available in GitHub under **Repository Settings → General → Template repository**.

## Create a product repository from the template

Through GitHub, open the template and choose **Use this template → Create a new repository**.

Or use the CLI:

```bash
gh repo create OWNER/primeproperty-web \
  --private \
  --template OWNER/primeproperty-nextjs-template \
  --clone
```

Then initialize the local project:

```bash
cd primeproperty-web
nvm use
npm ci
cp .env.example .env.local
npm run verify
npm run dev
```

The committed `.env.example` already points server-side requests to:

```env
PRIMEPROPERTY_API_URL=https://primeproperty.cfd/api/v1
PRIMEPROPERTY_SESSION_COOKIE=primeproperty_session
```

Do not create `NEXT_PUBLIC_API_URL`. Browser UI code calls the same-origin BFF routes under `/api`.

## Create five independent repositories

When five independent repositories are truly required, repeat the template command with unique names:

```bash
gh repo create OWNER/primeproperty-ui-1 --private --template OWNER/primeproperty-nextjs-template
gh repo create OWNER/primeproperty-ui-2 --private --template OWNER/primeproperty-nextjs-template
gh repo create OWNER/primeproperty-ui-3 --private --template OWNER/primeproperty-nextjs-template
gh repo create OWNER/primeproperty-ui-4 --private --template OWNER/primeproperty-nextjs-template
gh repo create OWNER/primeproperty-ui-5 --private --template OWNER/primeproperty-nextjs-template
```

Add the intended developer to each repository using GitHub's collaborator or organization-team settings. Do not add usernames to a committed `CODEOWNERS` file until the actual accounts and ownership boundaries are known.

## Settings that do not come from repository files

Configure these for the template and, where required, each generated repository:

- Collaborators and organization teams.
- Branch protection/rulesets for `main`.
- Required `Verify foundation` CI status check.
- Deployment environments and secrets.
- Repository visibility.
- Security settings and application installations.
- Issue labels referenced by issue templates, such as `ui`.

The template provides source files, CI workflow, issue/PR templates, and developer documentation. It must not be treated as a way to distribute GitHub permissions or secrets.

## Developer starting point

Developers should begin from `docs/ui_elements_guide.md`, then use the existing integration layer:

- Public Server Component reads: `src/lib/api/server-client.ts` plus `src/services`.
- Browser reads and mutations: same-origin route handlers in `src/app/api`.
- Domain types: `src/types`.
- Form/query validation: `src/schemas`.
- Client server-state query keys: `src/features`.
- API behavior examples: `tests`.

Before the first UI pull request, run:

```bash
npm run verify
```

Routine CI never runs production mutations or the opt-in live contract smoke tests.
