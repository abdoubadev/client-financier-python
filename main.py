from datetime import date
from decimal import Decimal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

import depot
from modeles import Societe


app = FastAPI(
    title="API Client Financier",
    description="API de gestion des sociétés, bilans et cours boursiers",
    version="1.0.0"
)

# Autoriser les requêtes provenant du front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modèle de réception des données d'une société

class SocieteSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nom: str = Field(min_length=1, max_length=150)
    symbole_boursier: str = Field(min_length=1, max_length=10)
    secteur: str = Field(min_length=1, max_length=100)
    pays: str = Field(min_length=1, max_length=100)


# Vérification de fonctionnement
@app.get("/")
def accueil():
    return {"message": "API Client Financier opérationnelle"}


# Lister les sociétés
@app.get("/api/societes")
def lister_societes(secteur: str | None = None):
    return depot.lister_societes(secteur)


# Consulter une société
@app.get("/api/societes/{societe_id}")
def obtenir_societe(societe_id: int):
    societe = depot.obtenir_societe(societe_id)

    if societe is None:
        raise HTTPException(status_code=404, detail="Société introuvable")

    return societe


# Ajouter une société
@app.post("/api/societes", status_code=201)
def ajouter_societe(donnees: SocieteSchema):
    societe = Societe(**donnees.model_dump())
    societe_id = depot.ajouter_societe(societe)

    return {
        "message": "Société ajoutée avec succès",
        "id": societe_id
    }


# Modifier une société
@app.put("/api/societes/{societe_id}")
def modifier_societe(societe_id: int, donnees: SocieteSchema):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(status_code=404, detail="Société introuvable")

    societe = Societe(**donnees.model_dump())
    resultat = depot.modifier_societe(societe_id, societe)

    return {"message": "Société modifiée avec succès"}


# Supprimer une société
@app.delete("/api/societes/{societe_id}")
def supprimer_societe(societe_id: int):
    resultat = depot.supprimer_societe(societe_id)

    if not resultat:
        raise HTTPException(status_code=404, detail="Société introuvable")

    return {"message": "Société supprimée avec succès"}


# Consulter les bilans d'une société
@app.get("/api/societes/{societe_id}/bilans")
def lister_bilans(societe_id: int):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(status_code=404, detail="Société introuvable")

    return depot.lister_bilans(societe_id)


# Consulter les cours boursiers d'une société
@app.get("/api/societes/{societe_id}/cours")
def lister_cours(
    societe_id: int,
    date_debut: date | None = None,
    date_fin: date | None = None
):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(status_code=404, detail="Société introuvable")

    if date_debut and date_fin and date_debut > date_fin:
        raise HTTPException(
            status_code=400,
            detail="La date de début doit précéder la date de fin"
        )

    return depot.lister_cours(societe_id, date_debut, date_fin)
