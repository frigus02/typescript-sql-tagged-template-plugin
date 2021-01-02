# Release instructions

To release a new version, follow these steps:

1. Choose a version number:

   ```sh
   VERSION="0.0.16"
   ```

1. Update the [CHANGELOG.md](../CHANGELOG.md).

1. Update the version in the [package.json](../package.json).

1. Commit those changes:

   ```sh
   git commit -am "v$VERSION"
   ```

1. Tag the commit:

   ```sh
   git tag v$VERSION
   ```

1. Publish to npm:

   ```sh
   yarn publish
   ```

1. Push commit and tag:

   ```sh
   git push && git push --tags
   ```
