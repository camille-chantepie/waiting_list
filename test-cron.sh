#!/bin/bash

# Script de test pour le cron job de prélèvement mensuel
# Usage: ./test-cron.sh [local|production]

set -e

CRON_SECRET="QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA="

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Test du Cron Job - Prélèvements Mensuels${NC}\n"

# Déterminer l'environnement
ENV=${1:-local}

if [ "$ENV" == "local" ]; then
    URL="http://localhost:3000"
    echo -e "${YELLOW}📍 Environnement : LOCAL${NC}"
    echo -e "${YELLOW}🔗 URL : $URL${NC}\n"
elif [ "$ENV" == "production" ]; then
    read -p "Entrez l'URL de production (ex: https://akademos.vercel.app): " PROD_URL
    URL=$PROD_URL
    echo -e "${YELLOW}📍 Environnement : PRODUCTION${NC}"
    echo -e "${YELLOW}🔗 URL : $URL${NC}\n"
else
    echo -e "${RED}❌ Usage: ./test-cron.sh [local|production]${NC}"
    exit 1
fi

# Test 1 : Vérification de l'authentification (sans token)
echo -e "${YELLOW}Test 1: Vérification authentification (devrait échouer)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$URL/api/stripe/monthly-charge" \
    -H "Content-Type: application/json")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" == "401" ]; then
    echo -e "${GREEN}✅ L'authentification est bien requise${NC}\n"
else
    echo -e "${RED}❌ Erreur : Devrait retourner 401, mais retourne $http_code${NC}\n"
fi

# Test 2 : Appel avec le token correct
echo -e "${YELLOW}Test 2: Exécution du prélèvement mensuel${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$URL/api/stripe/monthly-charge" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ Prélèvement effectué avec succès${NC}"
    echo -e "${GREEN}📊 Réponse :${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
else
    echo -e "${RED}❌ Erreur HTTP $http_code${NC}"
    echo "$body"
    echo ""
fi

# Test 3 : Vérification d'un utilisateur spécifique (si fourni)
read -p "Voulez-vous vérifier un utilisateur spécifique ? (ID utilisateur ou N pour ignorer): " USER_ID

if [ "$USER_ID" != "N" ] && [ "$USER_ID" != "n" ] && [ "$USER_ID" != "" ]; then
    echo -e "\n${YELLOW}Test 3: Vérification de l'utilisateur $USER_ID${NC}"
    response=$(curl -s -w "\n%{http_code}" -X GET "$URL/api/stripe/monthly-charge?userId=$USER_ID")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✅ Données récupérées${NC}"
        echo -e "${GREEN}📊 État de l'abonnement :${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
    else
        echo -e "${RED}❌ Erreur HTTP $http_code${NC}"
        echo "$body"
        echo ""
    fi
fi

echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes :${NC}"
echo "   1. Vérifier les données dans Supabase"
echo "   2. Consulter les logs dans Vercel (si production)"
echo "   3. Vérifier que les soldes ont bien été mis à jour"
