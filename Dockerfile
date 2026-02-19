# 1. Koristimo zvanični Node.js image (verzija 18)
FROM node:20

# 2. Postavljamo radni direktorijum unutar kontejnera
WORKDIR /app

# 3. Kopiramo package.json i package-lock.json
COPY package*.json ./

# 4. Instaliramo zavisnosti
RUN npm install

# 5. Kopiramo ostatak koda aplikacije
COPY . .

# 6. Generišemo Prisma klijent (OBAVEZNO ZA BAZU)
RUN npx prisma generate

# 7. Pravimo produkcioni build aplikacije
RUN npm run build

# 8. Otvaramo port 3000
EXPOSE 3000

# 9. Komanda koja pokreće aplikaciju
CMD ["npm", "run", "start"]