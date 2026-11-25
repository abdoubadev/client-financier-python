
import logging
from datetime import date
from typing import Annotated

import pymysql
from fastapi import FastAPI, HTTPException, Path, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

import depot
from modeles import Societe


# ======================================================
# CONFIGURATION ET JOURNALISATION
# ======================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="API Client Financier",
    description=(
        "API REST de gestion des sociétés, des bilans annuels "
        "et des cours boursiers."
    ),
    version="1.0.0",
    openapi_tags=[
        {
            "name": "Sociétés",
            "description": "Gestion des sociétés.",
        },
        {
            "name": "Bilans",
            "description": "Consultation des bilans annuels.",
        },
        {
            "name": "Cours boursiers",
            "description": "Consultation des cours de bourse.",
        },
    ],
)


# ======================================================
# CONFIGURATION CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


# ======================================================
# GESTION DES ERREURS INATTENDUES
# ======================================================

@app.exception_handler(Exception)
async def gerer_erreur_inattendue(
    request: Request,
    exc: Exception
):
    logger.exception(
        "Erreur inattendue pendant %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Une erreur interne est survenue."
        },
    )


# ======================================================
# MODELE DE VALIDATION
# ======================================================

class SocieteSchema(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
    )

    nom: str = Field(
        min_length=1,
        max_length=150,
        description="Nom de la société.",
    )

    symbole_boursier: str = Field(
        min_length=1,
        max_length=10,
        description="Symbole boursier unique.",
    )

    secteur: str = Field(
        min_length=1,
        max_length=100,
        description="Secteur d'activité.",
    )

    pays: str = Field(
        min_length=1,
        max_length=100,
        description="Pays de la société.",
    )


# ======================================================
# ROUTE D'ACCUEIL
# ======================================================

@app.get(
    "/",
    summary="Vérifier le fonctionnement de l'API",
    tags=["Sociétés"],
)
def accueil():
    return {
        "message": "API Client Financier opérationnelle"
    }


# ======================================================
# 1. LISTER LES SOCIETES
# ======================================================

@app.get(
    "/api/societes",
    summary="Lister les sociétés",
    description="Retourne les sociétés, avec un filtre facultatif par secteur.",
    tags=["Sociétés"],
)
def lister_societes(
    secteur: Annotated[
        str | None,
        Query(max_length=100)
    ] = None,
):
    return depot.lister_societes(secteur)


# ======================================================
# 2. CONSULTER UNE SOCIETE
# ======================================================

@app.get(
    "/api/societes/{societe_id}",
    summary="Consulter une société",
    description="Retourne les informations d'une société à partir de son identifiant.",
    tags=["Sociétés"],
)
def obtenir_societe(
    societe_id: Annotated[int, Path(gt=0)],
):
    societe = depot.obtenir_societe(societe_id)

    if societe is None:
        raise HTTPException(
            status_code=404,
            detail="Société introuvable.",
        )

    return societe


# ======================================================
# 3. AJOUTER UNE SOCIETE
# ======================================================

@app.post(
    "/api/societes",
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une société",
    description="Crée une société après validation des données reçues.",
    tags=["Sociétés"],
)
def ajouter_societe(donnees: SocieteSchema):
    societe = Societe(**donnees.model_dump())

    try:
        societe_id = depot.ajouter_societe(societe)

    except pymysql.err.IntegrityError as exc:
        logger.warning("Conflit lors de la création d'une société.")

        raise HTTPException(
            status_code=409,
            detail="Ce symbole boursier est déjà utilisé.",
        ) from exc

    return {
        "message": "Société ajoutée avec succès.",
        "id": societe_id,
    }


# ======================================================
# 4. MODIFIER UNE SOCIETE
# ======================================================

@app.put(
    "/api/societes/{societe_id}",
    summary="Modifier une société",
    description="Remplace les informations d'une société existante.",
    tags=["Sociétés"],
)
def modifier_societe(
    societe_id: Annotated[int, Path(gt=0)],
    donnees: SocieteSchema,
):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Société introuvable.",
        )

    societe = Societe(**donnees.model_dump())

    try:
        depot.modifier_societe(societe_id, societe)

    except pymysql.err.IntegrityError as exc:
        logger.warning("Conflit lors de la modification d'une société.")

        raise HTTPException(
            status_code=409,
            detail="Ce symbole boursier est déjà utilisé.",
        ) from exc

    return {
        "message": "Société modifiée avec succès."
    }


# ======================================================
# 5. SUPPRIMER UNE SOCIETE
# ======================================================

@app.delete(
    "/api/societes/{societe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Supprimer une société",
    description="Supprime une société si aucune contrainte ne l'empêche.",
    tags=["Sociétés"],
)
def supprimer_societe(
    societe_id: Annotated[int, Path(gt=0)],
):
    try:
        resultat = depot.supprimer_societe(societe_id)

    except pymysql.err.IntegrityError as exc:
        logger.warning(
            "Conflit lors de la suppression de la société %s.",
            societe_id,
        )

        raise HTTPException(
            status_code=409,
            detail="Cette société est encore liée à des données financières.",
        ) from exc

    if not resultat:
        raise HTTPException(
            status_code=404,
            detail="Société introuvable.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ======================================================
# 6. CONSULTER LES BILANS D'UNE SOCIETE
# ======================================================

@app.get(
    "/api/societes/{societe_id}/bilans",
    summary="Lister les bilans annuels",
    description="Retourne les bilans annuels d'une société.",
    tags=["Bilans"],
)
def lister_bilans(
    societe_id: Annotated[int, Path(gt=0)],
):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Société introuvable.",
        )

    return depot.lister_bilans(societe_id)


# ======================================================
# 7. CONSULTER LES COURS BOURSIERS
# ======================================================

@app.get(
    "/api/societes/{societe_id}/cours",
    summary="Lister les cours boursiers",
    description="Retourne les cours de bourse sur une période facultative.",
    tags=["Cours boursiers"],
)
def lister_cours(
    societe_id: Annotated[int, Path(gt=0)],
    date_debut: date | None = None,
    date_fin: date | None = None,
):
    if depot.obtenir_societe(societe_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Société introuvable.",
        )

    if date_debut and date_fin and date_debut > date_fin:
        raise HTTPException(
            status_code=422,
            detail="La date de début doit être antérieure ou égale à la date de fin.",
        )

    return depot.lister_cours(
        societe_id,
        date_debut,
        date_fin,
    )
