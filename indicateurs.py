
from decimal import Decimal


def calculer_marge_nette(resultat_net, chiffre_affaires):
    """Calcule la marge nette en pourcentage."""
    if chiffre_affaires == 0:
        raise ValueError("Le chiffre d'affaires ne peut pas être nul.")

    return (resultat_net / chiffre_affaires) * Decimal("100")


def calculer_liquidite(actifs_courants, passifs_courants):
    """Calcule le ratio de liquidité générale."""
    if passifs_courants == 0:
        raise ValueError("Les passifs courants ne peuvent pas être nuls.")

    return actifs_courants / passifs_courants


def calculer_endettement(dettes_totales, capitaux_propres):
    """Calcule le ratio d'endettement."""
    if capitaux_propres == 0:
        raise ValueError("Les capitaux propres ne peuvent pas être nuls.")

    return dettes_totales / capitaux_propres


def calculer_rendement_boursier(cours_initial, cours_final):
    """Calcule le rendement boursier en pourcentage."""
    if cours_initial == 0:
        raise ValueError("Le cours initial ne peut pas être nul.")

    return ((cours_final - cours_initial) / cours_initial) * Decimal("100")


def calculer_moyenne_mobile(cours, periode):
    """Calcule la moyenne des derniers cours sur une période donnée."""
    if periode <= 0:
        raise ValueError("La période doit être supérieure à zéro.")

    if len(cours) < periode:
        raise ValueError("Nombre de cours insuffisant pour cette période.")

    derniers_cours = cours[-periode:]

    return sum(derniers_cours, Decimal("0")) / Decimal(periode)
