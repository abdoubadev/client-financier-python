
import os
from dotenv import load_dotenv

# Chargement des variables du fichier .env
load_dotenv()

# Paramètres de connexion à MariaDB
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Vérification des paramètres obligatoires
variables_manquantes = [
    nom
    for nom, valeur in {
        "DB_HOST": DB_HOST,
        "DB_NAME": DB_NAME,
        "DB_USER": DB_USER,
        "DB_PASSWORD": DB_PASSWORD,
    }.items()
    if not valeur or valeur == "CHANGE_ME"
]

if variables_manquantes:
    raise ValueError(
        "Variables manquantes ou non configurées dans .env : "
        + ", ".join(variables_manquantes)
    )
