# Stop the dev server first, then run:
#   npx prisma generate
#   npx prisma db push
Write-Host "Stopping may be required if dev server locks Prisma files."
npx prisma db push
npx prisma generate
Write-Host "Done. Restart: npm run dev"
