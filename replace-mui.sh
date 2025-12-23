#!/bin/bash

# Script to replace Material UI with shadcn/ui components
# Run this from the frontend directory: bash replace-mui.sh

echo "🔄 Replacing Material UI with shadcn/ui..."

# Find all TypeScript files with MUI imports
files=$(grep -r "from '@mui" src --include="*.tsx" --include="*.ts" -l)

for file in $files; do
  echo "Processing: $file"

  # Remove MUI imports
  sed -i "s/import.*from '@mui\/material\/styles';*//g" "$file"
  sed -i "s/import.*from '@mui\/material';*//g" "$file"
  sed -i "/from '@mui\/material'/d" "$file"
  sed -i "/from '@mui\/icons-material'/d" "$file"

  # Replace MUI components with shadcn/Tailwind equivalents
  sed -i 's/<Box/<div/g' "$file"
  sed -i 's/<\/Box>/<\/div>/g' "$file"
  sed -i 's/<Container/<div className="container mx-auto px-4"/g' "$file"
  sed -i 's/<\/Container>/<\/div>/g' "$file"
  sed -i 's/<Paper/<Card/g' "$file"
  sed -i 's/<\/Paper>/<\/Card>/g' "$file"

  # Replace MUI sx props with Tailwind classes
  sed -i 's/sx={{[^}]*}}//g' "$file"
  sed -i 's/elevation={[0-9]*}//g' "$file"
  sed -i 's/maxWidth="[^"]*"//g' "$file"
  sed -i 's/variant="[^"]*"//g' "$file"
  sed -i 's/component="[^"]*"//g' "$file"
  sed -i 's/gutterBottom//g' "$file"
  sed -i 's/align="[^"]*"//g' "$file"
  sed -i 's/color="[^"]*"//g' "$file"

  # Clean up empty lines
  sed -i '/^$/N;/^\n$/D' "$file"
done

echo "✅ Done! Please review the changes and add proper shadcn imports where needed."
echo ""
echo "Common replacements needed:"
echo "  - Typography → <h1>, <h2>, <p> with Tailwind classes"
echo "  - TextField → <Input> from '@/components/ui/input'"
echo "  - Button → <Button> from '@/components/ui/button'"
echo "  - CircularProgress → <Loader2 className='animate-spin' /> from 'lucide-react'"
echo "  - MUI Icons → lucide-react icons"
