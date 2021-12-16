# Build the application
npm run build

# Commit and push the changes
git add .
git commit -m "initial gh-pages commit"
git push origin gh-pages -f

# Deploy the code with the gh-pages module
node ./gh-pages.js