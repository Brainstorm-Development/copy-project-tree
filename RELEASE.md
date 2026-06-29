# Release Guide

This project publishes as `BrainstormDevelopment.copy-project-tree`.

Marketplace URL:

https://marketplace.visualstudio.com/items?itemName=BrainstormDevelopment.copy-project-tree

## 2.0.0 Checklist

1. Confirm the version in `package.json` is `2.0.0`.
2. Run the validation suite:

   ```sh
   npm install
   npm test
   npm audit
   ```

3. Confirm GitHub Actions passes on the release branch.
4. Build a local VSIX:

   ```sh
   npm run package
   ```

5. Install the generated VSIX locally in VS Code and test both commands from the Explorer context menu.
6. Publish to Visual Studio Marketplace:

   ```sh
   npm run publish:marketplace
   ```

7. Verify the Marketplace page, version, README rendering, icon, and install button.
8. Create the GitHub release:

   ```sh
   git tag v2.0.0
   git push origin master
   git push origin v2.0.0
   ```

9. Draft a GitHub release named `v2.0.0`, paste the `CHANGELOG.md` notes, and attach the generated VSIX if you want a downloadable artifact.

## Marketplace Notes

- The extension identity is based on `publisher` plus `name`: `BrainstormDevelopment.copy-project-tree`.
- Use the Visual Studio Marketplace publisher management page if you need to create or manage the publisher.
- For manual publishing, authenticate once with:

  ```sh
  npx vsce login BrainstormDevelopment
  ```

- For automated publishing, prefer Microsoft Entra ID based authentication rather than long-lived PATs.
- Do not run `vsce publish major` for this release because `package.json` is already set to `2.0.0`; that command would increment the version again.

## GitHub Polish

- Add the Marketplace URL to the repository About section.
- Keep the README badge link pointed at the Marketplace item.
- Use `CHANGELOG.md` as the source for release notes.
- Do not commit generated `.vsix` files; attach them to GitHub Releases instead.
