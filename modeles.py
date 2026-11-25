from dataclasses import dataclass
from datetime import date
from decimal import Decimal


@dataclass
class Societe:
    nom: str
    symbole_boursier: str
    secteur: str
    pays: str
    id: int | None = None


@dataclass
class BilanAnnuel:
    societe_id: int
    annee: int
    chiffre_affaires: Decimal
    resultat_net: Decimal
    actifs_courants: Decimal
    passifs_courants: Decimal
    dettes_totales: Decimal
    capitaux_propres: Decimal
    total_actifs: Decimal
    id: int | None = None


@dataclass
class CoursBourse:
    societe_id: int
    date_cours: date
    cours_cloture: Decimal
    volume_echange: int
    id: int | None = None
